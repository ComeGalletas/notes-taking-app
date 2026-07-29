from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, Note

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=4)


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=4)


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "color"]


class NoteSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "content",
            "color",
            "category",
            "category_name",
            "created_at",
            "updated_at",
        ]

    def validate_category(self, value):
        request = self.context.get("request")
        if value is not None and value.user_id != request.user.id:
            raise serializers.ValidationError("Invalid category for this user.")
        return value
