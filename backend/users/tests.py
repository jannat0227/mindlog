from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import User


class RegisterViewTests(APITestCase):
    def setUp(self):
        self.url = reverse('auth_register')
        self.valid_payload = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
        }

    def test_register_valid_user_returns_201(self):
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)

    def test_register_duplicate_email_returns_400(self):
        User.objects.create_user(
            username='existing', email='testuser@example.com', password='Pass123!'
        )
        response = self.client.post(self.url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_mismatched_passwords_returns_400(self):
        payload = {**self.valid_payload, 'password2': 'WrongPass123!'}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_fields_returns_400(self):
        response = self.client.post(self.url, {'username': 'user'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginViewTests(APITestCase):
    def setUp(self):
        self.url = reverse('auth_login')
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com', password='StrongPass123!'
        )

    def test_login_valid_credentials_returns_jwt(self):
        response = self.client.post(
            self.url,
            {'username': 'testuser', 'password': 'StrongPass123!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_wrong_password_returns_401(self):
        response = self.client.post(
            self.url,
            {'username': 'testuser', 'password': 'WrongPassword!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user_returns_401(self):
        response = self.client.post(
            self.url,
            {'username': 'nobody', 'password': 'Pass123!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com', password='StrongPass123!'
        )
        self.url = reverse('auth_profile')

    def _get_token(self):
        response = self.client.post(
            reverse('auth_login'),
            {'username': 'testuser', 'password': 'StrongPass123!'},
            format='json',
        )
        return response.data['access']

    def test_profile_with_valid_token_returns_200(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self._get_token()}')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_profile_without_token_returns_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
