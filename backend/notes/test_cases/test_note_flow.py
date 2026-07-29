from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from ..models import Category, Note

User = get_user_model()


class NoteFlowTests(APITestCase):
    def authenticate_user(self, username):
        register_response = self.client.post(
            reverse("register"),
            {"username": username, "password": "secure1234"},
            format="json",
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

        login_response = self.client.post(
            reverse("login"),
            {"username": username, "password": "secure1234"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        access_token = login_response.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        return User.objects.get(username=username)

    def test_note_list_returns_only_authenticated_users_notes(self):
        owner = self.authenticate_user("owner")
        create_owner_note = self.client.post(
            reverse("note-list"),
            {"title": "Owner note", "content": "Private"},
            format="json",
        )
        self.assertEqual(create_owner_note.status_code, status.HTTP_201_CREATED)

        self.client.credentials()
        self.authenticate_user("other")
        create_other_note = self.client.post(
            reverse("note-list"),
            {"title": "Other note", "content": "Not visible to owner"},
            format="json",
        )
        self.assertEqual(create_other_note.status_code, status.HTTP_201_CREATED)

        self.client.credentials()
        login_owner = self.client.post(
            reverse("login"),
            {"username": owner.username, "password": "secure1234"},
            format="json",
        )
        self.assertEqual(login_owner.status_code, status.HTTP_200_OK)
        owner_token = login_owner.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {owner_token}")

        list_response = self.client.get(reverse("note-list"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["title"], "Owner note")

    def test_note_create_rejects_foreign_category(self):
        self.authenticate_user("owner2")
        self.client.credentials()
        other_user = self.authenticate_user("other2")
        foreign_category = Category.objects.filter(user=other_user).first()

        self.client.credentials()
        login_owner = self.client.post(
            reverse("login"),
            {"username": "owner2", "password": "secure1234"},
            format="json",
        )
        self.assertEqual(login_owner.status_code, status.HTTP_200_OK)
        owner_token = login_owner.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {owner_token}")

        create_response = self.client.post(
            reverse("note-list"),
            {
                "title": "Invalid category note",
                "content": "Should fail",
                "category": foreign_category.id,
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("category", create_response.data)

    def test_note_update_rejects_other_users_note(self):
        self.authenticate_user("owner3")
        create_owner_note = self.client.post(
            reverse("note-list"),
            {"title": "Original", "content": "Owned note"},
            format="json",
        )
        self.assertEqual(create_owner_note.status_code, status.HTTP_201_CREATED)
        note_id = create_owner_note.data["id"]

        self.client.credentials()
        self.authenticate_user("other3")

        update_response = self.client.put(
            reverse("note-detail", args=[note_id]),
            {"title": "Hacked", "content": "No access"},
            format="json",
        )

        self.assertEqual(update_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Note.objects.get(id=note_id).title, "Original")
