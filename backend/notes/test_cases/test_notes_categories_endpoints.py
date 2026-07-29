from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class NotesAndCategoriesEndpointTests(APITestCase):
    def authenticate(self, username="api-user", password="secure1234"):
        register_response = self.client.post(
            reverse("register"),
            {"username": username, "password": password},
            format="json",
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

        login_response = self.client.post(
            reverse("login"),
            {"username": username, "password": password},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        token = login_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_categories_endpoint_requires_authentication(self):
        response = self.client.get(reverse("category-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_notes_endpoint_requires_authentication(self):
        response = self.client.get(reverse("note-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_categories_list_returns_defaults_for_authenticated_user(self):
        self.authenticate("cat-user")

        response = self.client.get(reverse("category-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 3)
        self.assertEqual(
            [item["name"] for item in response.data],
            ["Random Thoughts", "School", "Personal"],
        )

    def test_notes_create_list_update_delete_flow(self):
        self.authenticate("notes-user")

        categories = self.client.get(reverse("category-list"))
        self.assertEqual(categories.status_code, status.HTTP_200_OK)
        category_id = categories.data[0]["id"]

        create_response = self.client.post(
            reverse("note-list"),
            {
                "title": "My first note",
                "content": "base coverage",
                "category": category_id,
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        note_id = create_response.data["id"]

        list_response = self.client.get(reverse("note-list"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["title"], "My first note")

        update_response = self.client.put(
            reverse("note-detail", args=[note_id]),
            {
                "title": "Updated note",
                "content": "updated",
                "category": category_id,
            },
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["title"], "Updated note")

        delete_response = self.client.delete(reverse("note-detail", args=[note_id]))
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        list_after_delete = self.client.get(reverse("note-list"))
        self.assertEqual(list_after_delete.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_after_delete.data), 0)

    def test_notes_filter_by_category_query_param(self):
        self.authenticate("filter-user")

        categories = self.client.get(reverse("category-list"))
        self.assertEqual(categories.status_code, status.HTTP_200_OK)
        first_category = categories.data[0]["id"]
        second_category = categories.data[1]["id"]

        create_first = self.client.post(
            reverse("note-list"),
            {
                "title": "First category note",
                "content": "A",
                "category": first_category,
            },
            format="json",
        )
        self.assertEqual(create_first.status_code, status.HTTP_201_CREATED)

        create_second = self.client.post(
            reverse("note-list"),
            {
                "title": "Second category note",
                "content": "B",
                "category": second_category,
            },
            format="json",
        )
        self.assertEqual(create_second.status_code, status.HTTP_201_CREATED)

        filtered_response = self.client.get(
            reverse("note-list"),
            {"category": first_category},
        )

        self.assertEqual(filtered_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(filtered_response.data), 1)
        self.assertEqual(filtered_response.data[0]["title"], "First category note")
