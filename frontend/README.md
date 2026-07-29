# Frontend (Next.js App Router)

This folder contains the Next.js frontend for the notes-taking app.
It contains separate screens for login and sign-up, but it also supports functionality for both with a single button.

## What it does

- Renders auth pages, dashboard, and note editor UI.
- Uses internal Next.js API routes under `/api/*` as a backend-for-frontend layer.
- Proxies requests to the Django backend and manages auth with HttpOnly cookies.
- Bootstraps auth state globally through `AuthProvider` using `/api/auth/session`.

## Stack

- Next.js 15 (App Router)
- React 19
- Axios client for browser-side API calls
- Vitest + Testing Library for tests

## Prerequisites

- Node.js 18+
- Backend running locally (default expected backend API: `http://127.0.0.1:8000/api`)

## Setup

From this `frontend/` folder:

```bash
npm install
```

Env file needed, default at:

```bash
.env.local
```


## Run commands

Start dev server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

Default frontend URL: `http://localhost:3000`

## App routes

- `/login`
- `/signup`
- `/dashboard`
- `/notes/new`
- `/notes/[noteId]`

## Internal API routes (frontend)

Auth:

- `/api/auth/csrf`
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/refresh`
- `/api/auth/logout`
- `/api/auth/session`

Notes and categories:

- `/api/categories`
- `/api/notes`
- `/api/notes/[noteId]`

## Environment variables

Frontend API proxy/auth config supports:

- `BACKEND_API_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL` (fallback)

If none are set, default backend API base URL is:

- `http://127.0.0.1:8000/api`

Smoke test options:

- `SMOKE_BASE_URL` (default: `http://localhost:3000`)
- `SMOKE_TIMEOUT_MS` (default: `10000`)

## Test commands

Run all unit/integration tests:

```bash
npm run test
```

Run code coverage (requires vitest):

```bash
npx vitest --coverage
```

Run auth smoke flow (requires frontend and backend running):

```bash
npm run test:smoke
```

Windows PowerShell examples for smoke overrides:

```powershell
$env:SMOKE_BASE_URL = "http://localhost:3000"
$env:SMOKE_TIMEOUT_MS = "15000"
npm run test:smoke
```

## Current test files

Centralized test cases live in `src/test/cases/`, including:

- API client behavior
- Auth provider behavior
- Dashboard flow
- Login page
- Signup page
- Note editor page
- Proxy response helpers
