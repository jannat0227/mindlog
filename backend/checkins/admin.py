from django.contrib import admin
from .models import CheckIn


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    list_display = ('user', 'mood', 'energy', 'anxiety', 'created_at')
    list_filter = ('user', 'mood')
    ordering = ('-created_at',)
