from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'created_at', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('MindLog', {'fields': ('created_at',)}),
    )
    readonly_fields = ('created_at',)
