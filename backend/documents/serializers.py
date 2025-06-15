from rest_framework import serializers
from .models import Document, DocumentChunk, Query

class DocumentChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentChunk
        fields = ['id', 'content', 'chunk_index', 'embedding']
        read_only_fields = ['embedding']

class DocumentSerializer(serializers.ModelSerializer):
    chunks = DocumentChunkSerializer(many=True, read_only=True)
    uploaded_by = serializers.ReadOnlyField(source='uploaded_by.username')
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'file', 'file_type', 'uploaded_at', 
            'updated_at', 'uploaded_by', 'content', 'embedding', 'chunks'
        ]
        read_only_fields = ['file_type', 'uploaded_at', 'updated_at', 
                           'uploaded_by', 'content', 'embedding', 'chunks']
        extra_kwargs = {
            'file': {'required': False, 'allow_null': True},
            'title': {'required': False, 'allow_blank': True},
        } 

class QuerySerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source='document.title', read_only=True)

    class Meta:
        model = Query
        fields = ['id', 'document', 'document_title', 'question', 'answer', 'created_at'] 