from django.shortcuts import render
from rest_framework import viewsets, permissions, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json
import threading
import logging
from django.core.exceptions import ValidationError
from rest_framework.exceptions import APIException
from django.conf import settings
import numpy as np
import os
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline
from langchain_community.llms import HuggingFacePipeline
from langchain_community.embeddings import HuggingFaceEmbeddings
from .models import Document, DocumentChunk, Query
from .serializers import DocumentSerializer, DocumentChunkSerializer, QuerySerializer
from .processors import process_document
from .throttling import DocumentUploadRateThrottle, QueryRateThrottle, AnonQueryRateThrottle
from langchain.memory import ConversationBufferMemory
from langchain.schema import BaseRetriever, Document as LCDocument
from typing import List, Any
from pydantic import Field
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

logger = logging.getLogger(__name__)

ALLOWED_FILE_TYPES = ['PDF', 'DOCX', 'DOC']
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

class APIKeyError(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'OpenAI API key is not configured properly.'
    default_code = 'api_key_error'

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [DocumentUploadRateThrottle]
    
    def get_throttles(self):
        """Return throttle instances depending on the current action.

        • ``create`` (POST /documents/)  → limit uploads via
          ``DocumentUploadRateThrottle``.
        • ``query``  → stricter limits, with different caps for authenticated vs
          anonymous users.
        • All other actions (e.g. ``status`` or ``retrieve``)  → *no* rate-limit
          so the frontend can poll freely without hitting 429 errors while a
          document is processing.
        """
        if self.action == 'create':
            return [DocumentUploadRateThrottle()]

        if self.action == 'query':
            if self.request.user.is_authenticated:
                return [QueryRateThrottle()]
            return [AnonQueryRateThrottle()]

        # No throttling for other actions such as `status`.
        return []
    
    def get_queryset(self):
        """Return documents depending on authentication status.

        When a user is authenticated we show only their documents.  When the
        request is anonymous we instead return documents that were uploaded
        without an owner (``uploaded_by`` is NULL).  This prevents Django from
        trying to compare the ForeignKey to an ``AnonymousUser`` instance,
        which was raising the *Field 'id' expected a number* error.
        """
        if self.request.user.is_authenticated:
            return Document.objects.filter(uploaded_by=self.request.user)
        # Anonymous – return documents that were uploaded without a user
        return Document.objects.filter(uploaded_by__isnull=True)
    
    def validate_file(self, file):
        """Validate uploaded file."""
        if not file:
            raise ValidationError('No file provided')
        
        # Check file size
        if file.size > MAX_FILE_SIZE:
            raise ValidationError(f'File size exceeds maximum limit of {MAX_FILE_SIZE/1024/1024}MB')
        
        # Check file type
        file_type = file.name.split('.')[-1].upper()
        if file_type not in ALLOWED_FILE_TYPES:
            raise ValidationError(f'File type {file_type} not supported. Allowed types: {", ".join(ALLOWED_FILE_TYPES)}')
        
        return file_type
    
    def validate_api_key(self):
        """No-op: we are using local HuggingFace models, no API key needed."""
        return
    
    def perform_create(self, serializer):
        try:
            file = self.request.FILES.get('file')
            file_type = self.validate_file(file)
            self.validate_api_key()
            
            user = self.request.user if self.request.user.is_authenticated else None
            # Save the document
            document = serializer.save(
                uploaded_by=user,
                file=file,
                file_type=file_type,
                title=file.name
            )
            
            # Start processing in background
            def process_in_background():
                try:
                    process_document(document.id)
                    # Notify user through WebSocket when processing is complete
                    channel_layer = get_channel_layer()
                    if channel_layer is not None and document.uploaded_by:
                        async_to_sync(channel_layer.group_send)(
                            f"user_{document.uploaded_by.id}",
                            {
                                "type": "document.processed",
                                "document_id": document.id,
                                "status": "completed"
                            }
                        )
                except Exception as e:
                    logger.error(f"Error processing document {document.id}: {str(e)}")
                    channel_layer = get_channel_layer()
                    if channel_layer is not None and document.uploaded_by:
                        async_to_sync(channel_layer.group_send)(
                            f"user_{document.uploaded_by.id}",
                            {
                                "type": "document.processed",
                                "document_id": document.id,
                                "status": "error",
                                "error": str(e)
                            }
                        )
            
            # Start background processing
            thread = threading.Thread(target=process_in_background)
            thread.start()
            
            return Response(DocumentSerializer(document).data, status=status.HTTP_201_CREATED)
            
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except APIKeyError as e:
            return Response({'error': str(e)}, status=e.status_code)
        except Exception as e:
            logger.error(f"Unexpected error in document upload: {str(e)}")
            return Response(
                {'error': 'An unexpected error occurred'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def chunks(self, request, pk=None):
        document = self.get_object()
        chunks = document.chunks.all()
        serializer = DocumentChunkSerializer(chunks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """Get the processing status of a document."""
        document = self.get_object()
        status_key = f"document_processing_{document.id}"
        processing_status = cache.get(status_key, "pending")
        
        return Response({
            'document_id': document.id,
            'status': processing_status,
            'has_chunks': document.chunks.exists()
        })
    
    @action(detail=True, methods=['post'])
    def query(self, request, pk=None):
        try:
            # No API key validation needed for local models
            
            document = self.get_object()
            query = request.data.get('query')
            chat_history = request.data.get('chat_history', [])
            
            if not query:
                return Response(
                    {'error': 'No query provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not document.chunks.exists():
                return Response(
                    {'error': 'Document is still being processed'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check cache for this query
            cache_key = f"query_{document.id}_{hash(query)}"
            cached_result = cache.get(cache_key)
            if cached_result:
                return Response(cached_result)
            
            # Choose LLM: prefer Gemini if GOOGLE_API_KEY is configured, otherwise fallback to local Flan-T5
            google_api_key = os.environ.get("GOOGLE_API_KEY")

            if google_api_key:
                if "GEMINI_LLM" not in globals():
                    gemini_model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
                    GEMINI_LLM = ChatGoogleGenerativeAI(
                        model=gemini_model_name,
                        temperature=0.2,
                        max_output_tokens=512,
                        n=1,
                        verbose=False,
                    )
                llm = GEMINI_LLM
            else:
                if "HF_LLM" not in globals():
                    model_name = "google/flan-t5-base"
                    tokenizer = AutoTokenizer.from_pretrained(model_name)
                    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
                    hf_pipeline = pipeline(
                        "text2text-generation",
                        model=model,
                        tokenizer=tokenizer,
                        max_length=512,
                    )
                    HF_LLM = HuggingFacePipeline(pipeline=hf_pipeline)
                llm = HF_LLM
            
            # Create a memory object for conversation history
            memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
            
            # Convert chat history to the format expected by LangChain
            for message in chat_history:
                if message.get("role") == "user":
                    memory.chat_memory.add_user_message(message.get("content", ""))
                elif message.get("role") == "assistant":
                    memory.chat_memory.add_ai_message(message.get("content", ""))
            
            # Create a list of document chunks with their embeddings
            chunks = document.chunks.all().order_by('chunk_index')
            texts = [chunk.content for chunk in chunks]
            embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
            embeddings = [chunk.embedding if chunk.embedding else embeddings_model.embed_query(chunk.content) for chunk in chunks]
            
            # Define a custom retriever compatible with LangChain
            
            class DocumentRetriever(BaseRetriever):
                """Pydantic-compatible retriever that performs naive cosine-similarity search in memory."""

                texts: List[str]
                embeddings: List[List[float]]
                embedding_fn: Any = Field(repr=False)  # Callable; excluded from repr for brevity
                k: int = 5

                # Allow arbitrary (non-pydantic) types like callables, numpy arrays, etc.
                class Config:
                    arbitrary_types_allowed = True
                    extra = "allow"

                def _similarities(self, query_embedding):
                    sims: List[float] = []
                    for emb in self.embeddings:
                        sim = float(np.dot(query_embedding, emb) / (np.linalg.norm(query_embedding) * np.linalg.norm(emb)))
                        sims.append(sim)
                    return sims

                def get_relevant_documents(self, query: str):  # type: ignore[override]
                    query_embedding = self.embedding_fn(query)
                    sims = self._similarities(query_embedding)
                    top_idx = np.argsort(sims)[-self.k:][::-1]
                    return [LCDocument(page_content=self.texts[i], metadata={}) for i in top_idx]

                async def aget_relevant_documents(self, query: str):  # type: ignore[override]
                    return self.get_relevant_documents(query)
            
            # Custom prompt to ground the LLM in the retrieved context only
            QA_PROMPT = PromptTemplate(
                template="""You are an AI assistant that answers questions strictly based on the provided context. Do not invent information. If the answer is not contained in the context, say you do not know.\n\nContext:\n{context}\n\nQuestion: {question}\nHelpful answer (use complete sentences):""",
                input_variables=["context", "question"],
            )

            # Build a retriever instance
            retriever_instance = DocumentRetriever(
                texts=texts,
                embeddings=embeddings,
                embedding_fn=embeddings_model.embed_query,
            )

            def answer_with_llm(current_llm):
                """Retrieve relevant context and query the LLM directly (no chain)."""
                relevant_docs = retriever_instance.get_relevant_documents(query)
                context = "\n\n".join(doc.page_content for doc in relevant_docs)

                prompt_text = QA_PROMPT.format(context=context, question=query)

                if hasattr(current_llm, "invoke"):
                    response = current_llm.invoke(prompt_text)
                    answer_text = (
                        response.content if hasattr(response, "content") else str(response)
                    )
                else:
                    # HuggingFacePipeline is callable and returns str
                    answer_text = current_llm(prompt_text)

                # Store assistant answer in memory so it gets returned to the client
                memory.chat_memory.add_ai_message(answer_text)

                return {"answer": answer_text}

            # Try the preferred LLM first; gracefully fall back on failure
            try:
                result_raw = answer_with_llm(llm)
            except Exception as primary_err:
                logger.warning(
                    f"Primary LLM ({llm.__class__.__name__}) failed: {primary_err}. Falling back to local HuggingFace model."
                )

                # Ensure HF_LLM is initialised
                if "HF_LLM" not in globals():
                    model_name = "google/flan-t5-base"
                    tokenizer = AutoTokenizer.from_pretrained(model_name)
                    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
                    hf_pipeline = pipeline(
                        "text2text-generation",
                        model=model,
                        tokenizer=tokenizer,
                        max_length=512,
                    )
                    HF_LLM = HuggingFacePipeline(pipeline=hf_pipeline)

                result_raw = answer_with_llm(HF_LLM)

            # Normalise result variable name
            result = result_raw
            
            # Cache the result
            formatted_history = [
                {
                    "role": "user" if msg.type == "human" else "assistant",
                    "content": msg.content,
                }
                for msg in memory.chat_memory.messages
            ]

            result = {
                "answer": result["answer"],
                "chat_history": formatted_history,
            }
            cache.set(cache_key, result, timeout=3600)  # Cache for 1 hour
            
            # Persist query history
            try:
                Query.objects.create(
                    document=document,
                    user=self.request.user if self.request.user.is_authenticated else None,
                    question=query,
                    answer=result["answer"],
                )
            except Exception as e:
                logger.warning(f"Failed to save query history: {e}")
            
            return Response(result)
            
        except APIKeyError as e:
            return Response({'error': str(e)}, status=e.status_code)
        except Exception as e:
            logger.error(f"Error processing query for document {pk}: {str(e)}")
            return Response(
                {'error': 'An error occurred while processing your query'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def chats(self, request, pk=None):
        """Return full chat history for this document for the current user."""
        document = self.get_object()
        qs = document.queries.filter(user=request.user).order_by('created_at')
        serializer = QuerySerializer(qs, many=True)
        return Response(serializer.data)

class QueryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = QuerySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Query.objects.filter(user=self.request.user).select_related('document')
