from django.urls import path
from .views import JournalEntryListCreateView, JournalEntryDetailView

urlpatterns = [
    path('journal/', JournalEntryListCreateView.as_view(), name='journal_list_create'),
    path('journal/<int:pk>/', JournalEntryDetailView.as_view(), name='journal_detail'),
]
