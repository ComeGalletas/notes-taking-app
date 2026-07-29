import os

from django.contrib.auth import authenticate, get_user_model
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status, viewsets
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenVerifyView

from .models import Category, Note
from .serializers import (
	CategorySerializer,
	LoginSerializer,
	LogoutSerializer,
	NoteSerializer,
	RegisterSerializer,
	RefreshSerializer,
	UserSerializer,
)

User = get_user_model()


DEFAULT_CATEGORY_NAMES = ["Random Thoughts", "School", "Personal"]
DEFAULT_CATEGORY_COLORS = ["#EF9C66", "#FCDC94", "#78ABA8"]


def get_default_category_names():
	names_from_env = os.getenv("DEFAULT_CATEGORY_NAMES", "")
	parsed_names = [name.strip() for name in names_from_env.split(",") if name.strip()]
	return parsed_names or DEFAULT_CATEGORY_NAMES


def get_default_categories():
	default_names = get_default_category_names()
	default_categories = []
	for index, name in enumerate(default_names):
		color = (
			DEFAULT_CATEGORY_COLORS[index]
			if index < len(DEFAULT_CATEGORY_COLORS)
			else DEFAULT_CATEGORY_COLORS[-1]
		)
		default_categories.append({"name": name, "color": color})
	return default_categories


def ensure_default_categories(user):
	for category in get_default_categories():
		instance, _ = Category.objects.get_or_create(
			user=user,
			name=category["name"],
			defaults={"color": category["color"]},
		)
		if instance.color != category["color"]:
			instance.color = category["color"]
			instance.save(update_fields=["color"])


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
	serializer = RegisterSerializer(data=request.data)
	serializer.is_valid(raise_exception=True)

	username = serializer.validated_data["username"]
	password = serializer.validated_data["password"]

	if User.objects.filter(username=username).exists():
		return Response(
			{"detail": "A user with this username already exists."},
			status=status.HTTP_400_BAD_REQUEST,
		)

	user = User.objects.create_user(username=username, password=password)
	ensure_default_categories(user)
	refresh = RefreshToken.for_user(user)
	return Response(
		{
			"access": str(refresh.access_token),
			"refresh": str(refresh),
			"user": UserSerializer(user).data,
		},
		status=status.HTTP_201_CREATED,
	)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
	serializer = LoginSerializer(data=request.data)
	serializer.is_valid(raise_exception=True)

	username = serializer.validated_data["username"]
	password = serializer.validated_data["password"]

	user = authenticate(username=username, password=password)
	if user is None:
		return Response(
			{"detail": "Invalid username or password."},
			status=status.HTTP_400_BAD_REQUEST,
		)

	ensure_default_categories(user)
	refresh = RefreshToken.for_user(user)
	return Response(
		{
			"access": str(refresh.access_token),
			"refresh": str(refresh),
			"user": UserSerializer(user).data,
		}
	)


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_view(request):
	serializer = RefreshSerializer(data=request.data)
	serializer.is_valid(raise_exception=True)

	jwt_serializer = TokenRefreshSerializer(data=serializer.validated_data)
	try:
		jwt_serializer.is_valid(raise_exception=True)
	except TokenError as exc:
		raise AuthenticationFailed(str(exc)) from exc

	response_payload = {
		"access": jwt_serializer.validated_data["access"],
	}
	if "refresh" in jwt_serializer.validated_data:
		response_payload["refresh"] = jwt_serializer.validated_data["refresh"]

	return Response(response_payload, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
	serializer = LogoutSerializer(data=request.data)
	serializer.is_valid(raise_exception=True)

	try:
		RefreshToken(serializer.validated_data["refresh"]).blacklist()
	except TokenError:
		return Response(
			{"detail": "Invalid refresh token."},
			status=status.HTTP_400_BAD_REQUEST,
		)

	return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
	ensure_default_categories(request.user)
	return Response({"user": UserSerializer(request.user).data}, status=status.HTTP_200_OK)


class VerifyTokenView(TokenVerifyView):
	permission_classes = [AllowAny]


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_view(request):
	return Response({"csrfToken": get_token(request)}, status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
	serializer_class = CategorySerializer

	def get_queryset(self):
		ensure_default_categories(self.request.user)
		return Category.objects.filter(user=self.request.user).order_by("id")


class NoteViewSet(viewsets.ModelViewSet):
	serializer_class = NoteSerializer

	def get_queryset(self):
		queryset = Note.objects.filter(user=self.request.user)
		category_id = self.request.query_params.get("category")
		if category_id:
			queryset = queryset.filter(category_id=category_id)
		return queryset

	def perform_create(self, serializer):
		ensure_default_categories(self.request.user)
		serializer.save(user=self.request.user)
