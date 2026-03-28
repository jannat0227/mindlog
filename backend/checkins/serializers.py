from rest_framework import serializers
from .models import CheckIn

CRISIS_RESOURCES = {
    'message': "We noticed you're having a really tough time. You're not alone — please reach out.",
    'resources': [
        {
            'name': 'Samaritans',
            'description': '24/7 emotional support',
            'phone': '116 123',
            'url': 'https://www.samaritans.org',
        },
        {
            'name': 'Mind',
            'description': 'Mental health information and support',
            'phone': '0300 123 3393',
            'url': 'https://www.mind.org.uk',
        },
        {
            'name': 'Crisis Text Line',
            'description': 'Free, confidential text support',
            'text': 'Text HELLO to 85258',
            'url': 'https://www.crisistextline.uk',
        },
        {
            'name': 'NHS Mental Health',
            'description': 'NHS urgent mental health support',
            'phone': '111 (option 2)',
            'url': 'https://www.nhs.uk/mental-health/',
        },
    ],
}


class CheckInSerializer(serializers.ModelSerializer):
    crisis_resources = serializers.SerializerMethodField()

    class Meta:
        model = CheckIn
        fields = ('id', 'mood', 'energy', 'anxiety', 'notes', 'created_at', 'crisis_resources')
        read_only_fields = ('id', 'created_at', 'crisis_resources')

    def validate_mood(self, value):
        if not 1 <= value <= 10:
            raise serializers.ValidationError('Mood must be between 1 and 10.')
        return value

    def validate_energy(self, value):
        if not 1 <= value <= 10:
            raise serializers.ValidationError('Energy must be between 1 and 10.')
        return value

    def validate_anxiety(self, value):
        if not 1 <= value <= 10:
            raise serializers.ValidationError('Anxiety must be between 1 and 10.')
        return value

    def get_crisis_resources(self, obj):
        if obj.mood <= 3:
            return CRISIS_RESOURCES
        return None
