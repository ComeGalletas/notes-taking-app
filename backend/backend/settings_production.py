from django.core.exceptions import ImproperlyConfigured

from .settings import *

DEBUG = False

if SECRET_KEY == "dev-only-change-me":  # noqa: F405
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY must be set to a secure value in production."
    )
