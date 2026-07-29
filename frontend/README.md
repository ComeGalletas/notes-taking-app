# Frontend (Next.js)

This frontend is implemented with Next.js and connects to the Django REST backend.

Authentication is handled with HttpOnly cookies via Next.js route handlers (`/api/*`) that proxy to Django.

The client auth state is bootstrapped globally via an auth provider that calls `/api/auth/session` once on startup.
Proxy routes include `x-request-id` on responses and normalize upstream errors into a consistent `error` object.

## Run

1. Install dependencies:
	- npm install
2. Configure environment:
	- copy .env.example to .env.local
3. Start development server:
	- npm run dev

Default URL: http://localhost:3000

## Routes

- /login
- /dashboard
- /notes/new
- /notes/[noteId]

## Internal API routes

- /api/auth/csrf
- /api/auth/login
- /api/auth/refresh
- /api/auth/logout
- /api/auth/session
- /api/categories
- /api/notes
- /api/notes/[noteId]

## Tests

- Run unit/integration tests with:
	- npm run test
- Run auth end-to-end smoke (requires running backend + frontend):
	- npm run test:smoke
	- optional base URL override: `SMOKE_BASE_URL=http://localhost:3000 npm run test:smoke`
	- optional timeout override: `SMOKE_TIMEOUT_MS=15000 npm run test:smoke`
