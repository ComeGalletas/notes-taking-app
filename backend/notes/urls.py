from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    NoteViewSet,
    VerifyTokenView,
    csrf_view,
    login_view,
    logout_view,
    me_view,
    register_view,
    refresh_view,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"notes", NoteViewSet, basename="note")

urlpatterns = [
    path("auth/csrf/", csrf_view, name="csrf"),
    path("auth/register/", register_view, name="register"),
    path("auth/login/", login_view, name="login"),
    path("auth/refresh/", refresh_view, name="refresh"),
    path("auth/logout/", logout_view, name="logout"),
    path("auth/me/", me_view, name="me"),
    path("auth/verify/", VerifyTokenView.as_view(), name="verify"),
    path("", include(router.urls)),
]
