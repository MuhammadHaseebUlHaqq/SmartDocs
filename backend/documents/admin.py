from django.contrib import admin
from .models import Document, DocumentChunk

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'file_type', 'uploaded_by', 'uploaded_at', 'updated_at')
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('title', 'content')
    readonly_fields = ('uploaded_at', 'updated_at')

@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ('document', 'chunk_index')
    list_filter = ('document',)
    search_fields = ('content',)
    ordering = ('document', 'chunk_index')
