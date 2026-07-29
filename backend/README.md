# Backend API (Django + DRF)

This folder contains the backend API for the notes-taking app.
It creates users, assigns default categories and links note data to their user.

Allows to expand category functionality to create new ones, assign specific colors and link them to specific users beyond the default ones.

## Basic functionality

- User authentication with JWT tokens (register, login, refresh, logout, verify, me).
- CSRF token endpoint for frontend integration.
- Per-user categories and notes.
- Notes CRUD with optional filtering by category.
- Default categories are created for each user.

## Tech stack

- Django 6
- Django REST Framework
- Simple JWT (+ token blacklist)
- SQLite (default local database)

## Project structure

- `manage.py`: Django management entrypoint.
- `backend/settings.py`: base settings loaded by all environments.
- `backend/settings_development.py`: development settings (`DEBUG=True`).
- `backend/settings_production.py`: production settings (`DEBUG=False`, requires secure secret environmental variable).
- `backend/urls.py`: project URLs (mounts API under `/api/`).
- `notes/`: main app with models, serializers, views, URLs, and tests.
- `notes/test_cases/`: focused API and flow test modules.

## API base URL

All endpoints are mounted under:

- `/api/`

## Endpoints

### Auth endpoints

- `GET /api/auth/csrf/`
  - Returns a CSRF token payload.
- `POST /api/auth/register/`
  - Creates a user and returns `access`, `refresh`, and `user`.
- `POST /api/auth/login/`
  - Returns `access`, `refresh`, and `user` for valid credentials.
- `POST /api/auth/refresh/`
  - Receives a refresh token and returns a new access token.
- `POST /api/auth/logout/`
  - Blacklists the provided refresh token.
  - Requires authentication.
- `GET /api/auth/me/`
  - Returns current authenticated user.
  - Requires authentication.
- `POST /api/auth/verify/`
  - Verifies a token payload.

### Categories endpoints

Read-only viewset:

- `GET /api/categories/`
- `GET /api/categories/{id}/`

Behavior:

- Returns only categories owned by the authenticated user.

### Notes endpoints

Model viewset:

- `GET /api/notes/`
- `POST /api/notes/`
- `GET /api/notes/{id}/`
- `PUT /api/notes/{id}/`
- `PATCH /api/notes/{id}/`
- `DELETE /api/notes/{id}/`

Filtering:

- `GET /api/notes/?category={category_id}`

Behavior:

- Returns only notes owned by the authenticated user.

## Local setup

From this folder (`backend/`):

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
```

Run development server:

```bash
python manage.py runserver
```

## Environment variables

Base settings load `.env.local` if present.

Common variables:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS` (comma separated)
- `FRONTEND_ORIGIN`
- `CSRF_TRUSTED_ORIGINS` (comma separated)
- `REQUEST_LOG_LEVEL`
- `DEFAULT_CATEGORY_NAMES` (comma separated)

## Settings module selection

Default in this repo is development settings.

Use production settings explicitly when needed:

```bash
set DJANGO_SETTINGS_MODULE=backend.settings_production
python manage.py runserver
```

PowerShell equivalent:

```powershell
$env:DJANGO_SETTINGS_MODULE = "backend.settings_production"
python manage.py runserver
```

Note:

- Production settings raise an error if `DJANGO_SECRET_KEY` is still the default development value only, it doesn't verify the source for the value.

## Authentication usage notes

- Authenticated endpoints expect:
  - `Authorization: Bearer <access_token>`
- Logout requires a refresh token in the request body.

## Tests

### Where tests live

- `notes/test_cases/test_auth.py`: auth scenarios.
- `notes/test_cases/test_notes_categories_endpoints.py`: notes/categories endpoint coverage.
- `notes/test_cases/test_note_flow.py`: note flow behavior.
- `notes/test_cases/test_django_basics.py`: baseline Django checks.

### Run tests

Run all tests:

```bash
python manage.py test
```

Run notes app tests only:

```bash
python manage.py test notes
```

Run focused test modules:

```bash
python manage.py test notes.tests
python manage.py test notes.test_cases
python manage.py test notes.test_cases.test_notes_categories_endpoints
```

Consider code coverage with - "coverage" -
Lib not included in the requirements

```bash
coverage run manage.py test
coverage report
coverage html
```



## Common development commands

Apply new migrations after model changes:

```bash
python manage.py makemigrations
python manage.py migrate
```

Create admin user:

```bash
python manage.py createsuperuser
```

Open Django admin:

- `http://127.0.0.1:8000/admin/`
