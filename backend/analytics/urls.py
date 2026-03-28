from django.urls import path
from .views import AnalyticsTrendView

urlpatterns = [
    path('analytics/trends/', AnalyticsTrendView.as_view(), name='analytics_trends'),
]
