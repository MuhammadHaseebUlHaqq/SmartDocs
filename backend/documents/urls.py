from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, QueryViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'queries', QueryViewSet, basename='query')

urlpatterns = [
    path('', include(router.urls)),
] 