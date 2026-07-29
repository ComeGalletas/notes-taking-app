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

## Design and creation process


### Build flow with AI

Initially I started with a basic Django REST + React base as reference and stability. Added simple server functionalities manually for the backend and visual elements with copilot for the front for a basic notes app, that naturally, it won't look very appropiate but it provides a good start. Also made the basic CRUD functionalities for the backend, create user, note, category (with specific names and colors), delete notes and read the categories for each user. At this point it only used basic authentication without cookies.

```bash
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt
django-admin startproject backend .
```
```bash
npm create vite@latest frontend -- --template react-ts
```

Later, I used the massive prompt in "prompt.txt" to start redesigning the app and adding the functionalities that I require while verifying its functions, added code, tests, and overall confidence in the result. This meant having several steps to implement the changes proposed by the AI while making sure it stayed in scope and everything was accounted for. It also involved creating a smoke test script to keep testing stability. All of the generated code was heavily verified to make sure it was clear and easily upgradable.

Making sure that Django default libs were used in the process to save code and complexity, and for the front it used simple styling. At the same time, I focused on the functionalities specified by the test instructions, especially the visual elements, to follow Figma's design and replicate the backend behavior as it is shown.

When the AI finished the major changes, I started testing the flows for the core functions and fixing or improving them as I went, specifically for the backend and then the frontend, respectively, to make sure every step was done correctly. If I needed to change previous code, I did it using manual code as a reference for the AI, or I asked it to check and provide findings that I could verify individually.

After the core functions had been tested manually, I focused on the visual elements exclusively to match the design document specifications as precisely as possible, testing compatibility and responsiveness. At this point there weren't any backend changes left.

Finally, I performed some general automated tests with Playwright, trying to stress the app, and then, adding functional and unit tests, then finalized the remaining folder and file structure along with the respective README files containing the details.

I used GitHub Copilot on the Auto model for code generation and free tools such as ChatGPT, Grok, and Claude to ask questions and verify changes outside the repository for clean answers. For Copilot, I spent around 1.1k tokens.


## Clear flow for development

1. Create a backend starter
	- Start from a default Django project with Django REST Framework.
	- Add a `notes` app with basic models for categories and notes.
	- Add user authentication with JWT (SimpleJWT).

2. Create a frontend starter
	- Start from a plain React app (Vite + React).
	- Build initial screens for login, dashboard, and note editor.
	- Connect to backend endpoints using Axios.

3. Make the first version work end-to-end
	- Implement register/login and keep a temporary client-side auth state.
	- Add CRUD actions for notes and category filtering.
	- Validate that users only see their own notes and categories.

4. Use prompt.txt as an architecture guide
	- Open [prompt.txt](prompt.txt) and use it as the checklist for what to improve next.
	- Follow it to redesign authentication into a more robust, production-oriented flow.
	- Use the prompt to drive decisions around token refresh, logout, route protection, and session handling.
   - Verify step by step the requirements are being set.

5. Migrate from plain React to Next.js App Router
	- Move the frontend into Next.js when the basic flows are stable.
	- Replace ad-hoc client-only auth checks with a cleaner server-aware approach and browser handled cookies.
	- Introduce internal API routes for proxying to Django and centralizing auth behavior.

6. Harden the project for maintainability, clean code leftovers and add tests for core functionalities and code coverage of at least 80% for the main files.
	- Split backend settings into development and production modules.
	- Add structured tests for auth and notes workflows.
	- Document run commands and project structure in backend and frontend README files.


