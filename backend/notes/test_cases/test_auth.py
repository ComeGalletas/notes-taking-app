from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from ..models import Category

User = get_user_model()


class AuthFlowTests(APITestCase):
	def test_register_returns_tokens_and_creates_user(self):
		response = self.client.post(
			reverse("register"),
			{"username": "alice", "password": "secure1234"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertIn("access", response.data)
		self.assertIn("refresh", response.data)
		self.assertEqual(response.data["user"]["username"], "alice")
		self.assertTrue(User.objects.filter(username="alice").exists())

		categories = list(
			Category.objects.filter(user__username="alice").values("name", "color")
		)
		self.assertCountEqual(
			categories,
			[
				{"name": "Random Thoughts", "color": "#EF9C66"},
				{"name": "School", "color": "#FCDC94"},
				{"name": "Personal", "color": "#78ABA8"},
			],
		)

	def test_login_rejects_unknown_user(self):
		response = self.client.post(
			reverse("login"),
			{"username": "ghost", "password": "secure1234"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
		self.assertEqual(response.data["detail"], "Invalid username or password.")

	def test_me_endpoint_requires_and_returns_authenticated_user(self):
		register_response = self.client.post(
			reverse("register"),
			{"username": "bob", "password": "secure1234"},
			format="json",
		)
		self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

		login_response = self.client.post(
			reverse("login"),
			{"username": "bob", "password": "secure1234"},
			format="json",
		)
		self.assertEqual(login_response.status_code, status.HTTP_200_OK)
		access_token = login_response.data["access"]

		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
		me_response = self.client.get(reverse("me"))

		self.assertEqual(me_response.status_code, status.HTTP_200_OK)
		self.assertEqual(me_response.data["user"]["username"], "bob")

	def test_categories_endpoint_returns_in_creation_order(self):
		register_response = self.client.post(
			reverse("register"),
			{"username": "erin", "password": "secure1234"},
			format="json",
		)
		self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

		login_response = self.client.post(
			reverse("login"),
			{"username": "erin", "password": "secure1234"},
			format="json",
		)
		self.assertEqual(login_response.status_code, status.HTTP_200_OK)
		access_token = login_response.data["access"]

		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
		categories_response = self.client.get(reverse("category-list"))

		self.assertEqual(categories_response.status_code, status.HTTP_200_OK)
		self.assertEqual(
			[item["name"] for item in categories_response.data],
			["Random Thoughts", "School", "Personal"],
		)

	def test_refresh_returns_new_access_and_rotated_refresh(self):
		register_response = self.client.post(
			reverse("register"),
			{"username": "carol", "password": "secure1234"},
			format="json",
		)
		self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

		login_response = self.client.post(
			reverse("login"),
			{"username": "carol", "password": "secure1234"},
			format="json",
		)
		self.assertEqual(login_response.status_code, status.HTTP_200_OK)
		refresh_token = login_response.data["refresh"]

		refresh_response = self.client.post(
			reverse("refresh"),
			{"refresh": refresh_token},
			format="json",
		)

		self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
		self.assertIn("access", refresh_response.data)
		self.assertIn("refresh", refresh_response.data)
		self.assertNotEqual(refresh_response.data["refresh"], refresh_token)

	def test_logout_blacklists_refresh_token(self):
		register_response = self.client.post(
			reverse("register"),
			{"username": "dana", "password": "secure1234"},
			format="json",
		)
		self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

		login_response = self.client.post(
			reverse("login"),
			{"username": "dana", "password": "secure1234"},
			format="json",
		)
		self.assertEqual(login_response.status_code, status.HTTP_200_OK)
		access_token = login_response.data["access"]
		refresh_token = login_response.data["refresh"]

		self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
		logout_response = self.client.post(
			reverse("logout"),
			{"refresh": refresh_token},
			format="json",
		)
		self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)

		refresh_response = self.client.post(
			reverse("refresh"),
			{"refresh": refresh_token},
			format="json",
		)
		self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)
