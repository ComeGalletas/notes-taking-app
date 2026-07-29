# Sticky Notes Prototype (Django REST + Next.js)

Basic full-stack prototype for a post-it style notes app.

## Project structure

- `backend/`: Django backend
- `frontend/`: Next.js frontend

## Quick start

### 1) Backend

From the repository root:

```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`.

### 2) Frontend

In a new terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Environment

If needed, set frontend environment values in `frontend/.env.local`.
