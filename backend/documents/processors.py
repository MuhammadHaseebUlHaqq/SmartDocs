import os
from typing import List, Dict, Any
import PyPDF2
from docx import Document as DocxDocument
import numpy as np
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from django.conf import settings
from .models import Document, DocumentChunk

class DocumentProcessor:
    def __init__(self, document: Document):
        self.document = document
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

    def extract_text(self) -> str:
        """Extract text content from different file types."""
        file_path = self.document.file.path
        file_type = self.document.file_type.lower()

        if file_type == 'pdf':
            return self._extract_from_pdf(file_path)
        elif file_type in ['docx', 'doc']:
            return self._extract_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF files."""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text

    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX files."""
        doc = DocxDocument(file_path)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])

    def process_document(self) -> None:
        """Process the document: extract text, chunk it, and generate embeddings."""
        # Extract text
        text_content = self.extract_text()
        self.document.content = text_content
        self.document.save()

        # Split into chunks
        chunks = self.text_splitter.split_text(text_content)
        
        # Delete existing chunks
        self.document.chunks.all().delete()
        
        # Create new chunks with embeddings
        for i, chunk_text in enumerate(chunks):
            # Generate embedding
            embedding = self.embeddings.embed_query(chunk_text)
            
            # Create chunk
            DocumentChunk.objects.create(
                document=self.document,
                content=chunk_text,
                chunk_index=i,
                embedding=embedding
            )

def process_document(document_id: int) -> None:
    """Process a document by its ID."""
    try:
        document = Document.objects.get(id=document_id)
        processor = DocumentProcessor(document)
        processor.process_document()
    except Document.DoesNotExist:
        raise ValueError(f"Document with ID {document_id} does not exist")
    except Exception as e:
        raise Exception(f"Error processing document: {str(e)}") 