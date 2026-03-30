from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User
from .models import CheckIn


class CheckInTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com', password='StrongPass123!'
        )
        self.other_user = User.objects.create_user(
            username='other', email='other@example.com', password='StrongPass123!'
        )
        self.list_url = reverse('checkin_list_create')
        self._authenticate(self.user)

    def _authenticate(self, user):
        response = self.client.post(
            reverse('auth_login'),
            {'username': user.username, 'password': 'StrongPass123!'},
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {response.data["access"]}')

    # --- Create ---

    def test_create_valid_checkin_returns_201(self):
        payload = {'mood': 7, 'energy': 6, 'anxiety': 4, 'notes': 'Feeling okay today.'}
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['mood'], 7)
        self.assertIsNone(response.data['crisis_resources'])

    def test_create_checkin_mood_out_of_range_returns_400(self):
        payload = {'mood': 11, 'energy': 5, 'anxiety': 5}
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_checkin_mood_zero_returns_400(self):
        payload = {'mood': 0, 'energy': 5, 'anxiety': 5}
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_low_mood_triggers_crisis_resources(self):
        payload = {'mood': 2, 'energy': 2, 'anxiety': 9, 'notes': 'Really struggling.'}
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data['crisis_resources'])
        self.assertIn('resources', response.data['crisis_resources'])

    def test_mood_threshold_3_triggers_crisis(self):
        payload = {'mood': 3, 'energy': 3, 'anxiety': 8}
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data['crisis_resources'])

    def test_mood_4_does_not_trigger_crisis(self):
        payload = {'mood': 4, 'energy': 5, 'anxiety': 5}
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data['crisis_resources'])

    # --- List ---

    def test_list_checkins_returns_only_own(self):
        CheckIn.objects.create(user=self.user, mood=7, energy=6, anxiety=4)
        CheckIn.objects.create(user=self.other_user, mood=5, energy=5, anxiety=5)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Only the current user's checkin should appear
        self.assertEqual(len(response.data), 1)

    # --- Auth ---

    def test_checkin_unauthenticated_returns_401(self):
        self.client.credentials()
        response = self.client.post(
            self.list_url, {'mood': 7, 'energy': 6, 'anxiety': 4}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- Detail ---

    def test_retrieve_own_checkin_returns_200(self):
        checkin = CheckIn.objects.create(user=self.user, mood=7, energy=6, anxiety=4)
        url = reverse('checkin_detail', args=[checkin.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['mood'], 7)

    def test_retrieve_other_users_checkin_returns_404(self):
        checkin = CheckIn.objects.create(user=self.other_user, mood=5, energy=5, anxiety=5)
        url = reverse('checkin_detail', args=[checkin.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
