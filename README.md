# Sticky Notes Prototype (Django REST + Next.js)

Basic full-stack prototype for a post-it style notes app.

## Features implemented

- Login screen (auto-creates account on first login)
- Dashboard with:
  - Category list on the left
  - "New Note" button on the top-right
  - Open note board in the center with clickable notes
- Dedicated note screen for creating/editing/deleting a note
- Django REST backend with JWT auth and user-scoped data

## Project structure

- `backend/`: Django REST API
- `frontend/`: Next.js client

## Backend setup

1. Create/activate a Python environment (optional if using existing `.venv`).
2. Install dependencies:
   - `pip install -r backend/requirements.txt`
3. Run migrations:
   - `cd backend`
   - `python manage.py makemigrations`
   - `python manage.py migrate`
4. Start backend server:
   - `python manage.py runserver`

Backend runs at `http://127.0.0.1:8000`.

## Frontend setup

1. Install dependencies:
   - `cd frontend`
   - `npm install`
2. Ensure `frontend/.env` (or `.env.local`) has:
   - `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`
3. Start frontend:
   - `npm run dev`

Frontend runs at `http://localhost:3000`.

## API summary

- `POST /api/auth/login/`
  - body: `{ "username": "...", "password": "..." }`
  - returns access/refresh JWT tokens
- `GET /api/auth/csrf/`
   - bootstraps CSRF cookie/token for unsafe request flows
- `POST /api/auth/refresh/`
   - body: `{ "refresh": "..." }`
   - returns a new access token and rotated refresh token when rotation is enabled
- `POST /api/auth/logout/`
   - body: `{ "refresh": "..." }`
   - blacklists the refresh token
- `GET /api/auth/me/`
   - returns current authenticated user profile
- `POST /api/auth/verify/`
   - body: `{ "token": "..." }`
   - verifies token validity
- `GET /api/categories/`
- `GET /api/notes/` (optional `?category=<id>`)
- `POST /api/notes/`
- `GET /api/notes/<id>/`
- `PUT /api/notes/<id>/`
- `DELETE /api/notes/<id>/`

## Notes

- Login endpoint auto-creates a user if username does not exist yet.
- Default categories are configurable via `DEFAULT_CATEGORY_NAMES` (comma-separated) and default to `Random Thoughts, School, Personal`.
- Frontend Phase 2 uses Next.js internal API routes and HttpOnly cookie auth flow.
- Backend integration tests now cover login, me, refresh rotation, and logout blacklisting.
- Django now logs each request with propagated `X-Request-ID` for cross-service traceability.
