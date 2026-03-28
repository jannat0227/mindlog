from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Avg, Count
from django.db.models.functions import TruncDate, TruncWeek
from checkins.models import CheckIn


class AnalyticsTrendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = CheckIn.objects.filter(user=request.user)

        # Daily mood/energy/anxiety averages
        daily_trends = list(
            queryset
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(
                avg_mood=Avg('mood'),
                avg_energy=Avg('energy'),
                avg_anxiety=Avg('anxiety'),
                count=Count('id'),
            )
            .order_by('date')
        )

        # Weekly averages
        weekly_trends = list(
            queryset
            .annotate(week=TruncWeek('created_at'))
            .values('week')
            .annotate(
                avg_mood=Avg('mood'),
                avg_energy=Avg('energy'),
                avg_anxiety=Avg('anxiety'),
                count=Count('id'),
            )
            .order_by('week')
        )

        # Overall stats
        overall = queryset.aggregate(
            avg_mood=Avg('mood'),
            avg_energy=Avg('energy'),
            avg_anxiety=Avg('anxiety'),
            total=Count('id'),
        )

        # Mood frequency distribution (1–10)
        mood_distribution = [
            {'mood': i, 'count': queryset.filter(mood=i).count()}
            for i in range(1, 11)
        ]

        return Response({
            'daily_trends': daily_trends,
            'weekly_trends': weekly_trends,
            'overall': overall,
            'mood_distribution': mood_distribution,
            'total_checkins': queryset.count(),
            'total_journal_entries': request.user.journal_entries.count(),
        })
