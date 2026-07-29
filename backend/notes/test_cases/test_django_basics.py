from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from ..models import Category, Note

User = get_user_model()


class DjangoBasicChecksTests(TestCase):
    def test_named_routes_exist(self):
        self.assertEqual(reverse("register"), "/api/auth/register/")
        self.assertEqual(reverse("login"), "/api/auth/login/")
        self.assertEqual(reverse("refresh"), "/api/auth/refresh/")
        self.assertEqual(reverse("logout"), "/api/auth/logout/")
        self.assertEqual(reverse("me"), "/api/auth/me/")
        self.assertEqual(reverse("csrf"), "/api/auth/csrf/")
        self.assertEqual(reverse("category-list"), "/api/categories/")
        self.assertEqual(reverse("note-list"), "/api/notes/")

    def test_model_meta_ordering(self):
        self.assertEqual(Category._meta.ordering, ["id"])
        self.assertEqual(Note._meta.ordering, ["-updated_at"])

    def test_model_string_representations(self):
        user = User.objects.create_user(username="meta-user", password="1234")
        category = Category.objects.create(user=user, name="General", color="#FCDC94")
        note = Note.objects.create(
            user=user,
            category=category,
            title="First note",
            content="hello",
        )

        self.assertIn("General", str(category))
        self.assertIn("First note", str(note))
