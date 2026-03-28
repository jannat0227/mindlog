from django.urls import path
from .views import CheckInListCreateView, CheckInDetailView

urlpatterns = [
    path('checkins/', CheckInListCreateView.as_view(), name='checkin_list_create'),
    path('checkins/<int:pk>/', CheckInDetailView.as_view(), name='checkin_detail'),
]
