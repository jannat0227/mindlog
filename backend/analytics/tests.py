from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User
from checkins.models import CheckIn
from journal.models import JournalEntry


class AnalyticsTrendViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com', password='StrongPass123!'
        )
        self.other_user = User.objects.create_user(
            username='other', email='other@example.com', password='StrongPass123!'
        )
        self.url = reverse('analytics_trends')
        self._authenticate(self.user)

    def _authenticate(self, user):
        response = self.client.post(
            reverse('auth_login'),
            {'username': user.username, 'password': 'StrongPass123!'},
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {response.data["access"]}')

    def _create_checkins(self):
        CheckIn.objects.create(user=self.user, mood=8, energy=7, anxiety=3)
        CheckIn.objects.create(user=self.user, mood=5, energy=6, anxiety=5)
        CheckIn.objects.create(user=self.user, mood=3, energy=4, anxiety=8)
        # Other user's checkin — should not appear
        CheckIn.objects.create(user=self.other_user, mood=9, energy=9, anxiety=1)

    def test_analytics_returns_200(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_analytics_unauthenticated_returns_401(self):
        self.client.credentials()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_analytics_response_structure(self):
        response = self.client.get(self.url)
        self.assertIn('daily_trends', response.data)
        self.assertIn('weekly_trends', response.data)
        self.assertIn('overall', response.data)
        self.assertIn('mood_distribution', response.data)
        self.assertIn('total_checkins', response.data)
        self.assertIn('total_journal_entries', response.data)

    def test_analytics_counts_only_own_checkins(self):
        self._create_checkins()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_checkins'], 3)

    def test_analytics_mood_distribution_has_10_entries(self):
        self._create_checkins()
        response = self.client.get(self.url)
        self.assertEqual(len(response.data['mood_distribution']), 10)

    def test_analytics_overall_averages_are_correct(self):
        self._create_checkins()
        response = self.client.get(self.url)
        overall = response.data['overall']
        # avg mood = (8+5+3)/3 = 5.33...
        self.assertAlmostEqual(float(overall['avg_mood']), 5.333, places=1)

    def test_analytics_counts_own_journal_entries(self):
        JournalEntry.objects.create(user=self.user, title='Entry 1', body='...')
        JournalEntry.objects.create(user=self.user, title='Entry 2', body='...')
        JournalEntry.objects.create(user=self.other_user, title='Other', body='...')
        response = self.client.get(self.url)
        self.assertEqual(response.data['total_journal_entries'], 2)

    def test_analytics_empty_data_returns_nulls(self):
        response = self.client.get(self.url)
        self.assertEqual(response.data['total_checkins'], 0)
        self.assertIsNone(response.data['overall']['avg_mood'])


class IntegrationTest(APITestCase):
    """
    End-to-end: register → login → check-in → journal → analytics
    """

    def test_full_user_journey(self):
        # 1. Register
        reg_response = self.client.post(
            reverse('auth_register'),
            {
                'username': 'journeyuser',
                'email': 'journey@example.com',
                'password': 'StrongPass123!',
                'password2': 'StrongPass123!',
            },
            format='json',
        )
        self.assertEqual(reg_response.status_code, status.HTTP_201_CREATED)

        # 2. Login
        login_response = self.client.post(
            reverse('auth_login'),
            {'username': 'journeyuser', 'password': 'StrongPass123!'},
            format='json',
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # 3. Create a check-in
        checkin_response = self.client.post(
            reverse('checkin_list_create'),
            {'mood': 7, 'energy': 8, 'anxiety': 3, 'notes': 'Good day!'},
            format='json',
        )
        self.assertEqual(checkin_response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(checkin_response.data['crisis_resources'])

        # 4. Create a journal entry
        journal_response = self.client.post(
            reverse('journal_list_create'),
            {'title': 'Day 1', 'body': 'Had a productive day.'},
            format='json',
        )
        self.assertEqual(journal_response.status_code, status.HTTP_201_CREATED)

        # 5. Fetch analytics
        analytics_response = self.client.get(reverse('analytics_trends'))
        self.assertEqual(analytics_response.status_code, status.HTTP_200_OK)
        self.assertEqual(analytics_response.data['total_checkins'], 1)
        self.assertEqual(analytics_response.data['total_journal_entries'], 1)
