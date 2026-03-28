from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User
from .models import JournalEntry


class JournalEntryTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com', password='StrongPass123!'
        )
        self.other_user = User.objects.create_user(
            username='other', email='other@example.com', password='StrongPass123!'
        )
        self.list_url = reverse('journal_list_create')
        self._authenticate(self.user)

    def _authenticate(self, user):
        response = self.client.post(
            reverse('auth_login'),
            {'username': user.username, 'password': 'StrongPass123!'},
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {response.data["access"]}')

    def _create_entry(self, user=None, title='Test Entry', body='Some thoughts.'):
        u = user or self.user
        return JournalEntry.objects.create(user=u, title=title, body=body)

    # --- Create ---

    def test_create_journal_entry_returns_201(self):
        payload = {'title': 'My Day', 'body': 'Today was interesting.'}
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'My Day')

    def test_create_entry_missing_title_returns_400(self):
        payload = {'body': 'Some thoughts.'}
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_entry_missing_body_returns_400(self):
        payload = {'title': 'Missing body'}
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # --- List ---

    def test_list_entries_returns_only_own(self):
        self._create_entry(self.user)
        self._create_entry(self.other_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)

    # --- Retrieve ---

    def test_retrieve_own_entry_returns_200(self):
        entry = self._create_entry()
        url = reverse('journal_detail', args=[entry.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], entry.title)

    def test_retrieve_other_users_entry_returns_404(self):
        entry = self._create_entry(self.other_user)
        url = reverse('journal_detail', args=[entry.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # --- Update ---

    def test_update_own_entry_returns_200(self):
        entry = self._create_entry()
        url = reverse('journal_detail', args=[entry.pk])
        payload = {'title': 'Updated Title', 'body': 'Updated body text.'}
        response = self.client.put(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Title')

    def test_partial_update_own_entry_returns_200(self):
        entry = self._create_entry()
        url = reverse('journal_detail', args=[entry.pk])
        response = self.client.patch(url, {'title': 'Patched Title'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Patched Title')

    def test_update_other_users_entry_returns_404(self):
        entry = self._create_entry(self.other_user)
        url = reverse('journal_detail', args=[entry.pk])
        response = self.client.put(url, {'title': 'x', 'body': 'x'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # --- Delete ---

    def test_delete_own_entry_returns_204(self):
        entry = self._create_entry()
        url = reverse('journal_detail', args=[entry.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(JournalEntry.objects.filter(pk=entry.pk).exists())

    def test_delete_other_users_entry_returns_404(self):
        entry = self._create_entry(self.other_user)
        url = reverse('journal_detail', args=[entry.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # --- Auth ---

    def test_unauthenticated_request_returns_401(self):
        self.client.credentials()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
