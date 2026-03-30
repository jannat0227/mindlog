from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Avg, Count
from django.db.models.functions import TruncDate, TruncWeek, ExtractWeekDay
from checkins.models import CheckIn

# Django ExtractWeekDay: 1=Sunday, 2=Monday, ..., 7=Saturday
# Reorder to Monday-first: Mon=2, Tue=3, Wed=4, Thu=5, Fri=6, Sat=7, Sun=1
DOW_ORDER  = [2, 3, 4, 5, 6, 7, 1]
DOW_LABELS = {1: 'Sun', 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat'}


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

        # Day-of-week averages (Monday-first, always 7 entries)
        dow_raw = {
            row['dow']: row
            for row in queryset
            .annotate(dow=ExtractWeekDay('created_at'))
            .values('dow')
            .annotate(
                avg_mood=Avg('mood'),
                avg_energy=Avg('energy'),
                avg_anxiety=Avg('anxiety'),
                count=Count('id'),
            )
        }
        day_of_week_trends = [
            {
                'day':         DOW_LABELS[dow],
                'avg_mood':    round(float(dow_raw[dow]['avg_mood']),    2) if dow in dow_raw else None,
                'avg_energy':  round(float(dow_raw[dow]['avg_energy']),  2) if dow in dow_raw else None,
                'avg_anxiety': round(float(dow_raw[dow]['avg_anxiety']), 2) if dow in dow_raw else None,
                'count':       dow_raw[dow]['count'] if dow in dow_raw else 0,
            }
            for dow in DOW_ORDER
        ]

        # Raw scatter data points (mood vs anxiety, coloured by energy)
        checkin_points = list(
            queryset.values('mood', 'anxiety', 'energy').order_by('created_at')
        )

        return Response({
            'daily_trends':          daily_trends,
            'weekly_trends':         weekly_trends,
            'overall':               overall,
            'mood_distribution':     mood_distribution,
            'day_of_week_trends':    day_of_week_trends,
            'checkin_points':        checkin_points,
            'total_checkins':        queryset.count(),
            'total_journal_entries': request.user.journal_entries.count(),
        })
