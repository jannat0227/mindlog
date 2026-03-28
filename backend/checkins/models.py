from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User


class CheckIn(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='checkins')
    mood = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    energy = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    anxiety = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} — mood {self.mood} ({self.created_at.date()})'
