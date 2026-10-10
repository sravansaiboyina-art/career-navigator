# Career Navigator

Career Navigator is a full-stack career-guidance project for Indian students from Class 6 through graduation. It supports career exploration, guided onboarding, education-stage roadmaps, milestone tracking, exams, scholarships and opportunities, student profiles, and an AI career assistant.

## Project structure

```text
career-navigator/
├── backend/
│   ├── server.js              # Express API, auth, sessions, AI proxy
│   ├── database.js            # SQLite schema and persistence
│   ├── test/
│   │   └── server.test.js     # API/auth/database tests
│   ├── .env.example           # Backend environment template
│   └── package.json
├── career navigator/
│   ├── src/
│   │   ├── api/client.js      # Browser-to-server API client
│   │   ├── components/        # Navigation, modal, toast, loading UI
│   │   ├── pages/             # Landing, auth, onboarding, careers, roadmap, etc.
│   │   ├── db/                # Browser-only demo fallback and demo personas
│   │   ├── data/              # Roadmap content
│   │   ├── utils/
│   │   └── main.js
│   ├── data/                  # Careers, exams, and opportunities source datasets
│   ├── public/data/           # Static copies consumed by the frontend
│   ├── tests/                 # Audit and browser smoke tests
│   ├── vite.config.js         # Vite dev/preview proxy to the API
│   └── package.json
├── scripts/
│   ├── setup.mjs              # Install all dependencies
│   ├── dev-fullstack.mjs      # Start frontend and backend together
│   └── test-all.mjs           # Run tests and dependency audits
├── package.json               # Root workflow commands
└── .github/workflows/         # Continuous integration checks
```

## Requirements

- Node.js **22.12+**
- npm
- Internet access during the first dependency installation
- An optional Google Gemini API key if live AI responses are required

## Install and run the full-stack app

Run these commands from the repository root:

```bash
npm run setup
```

Create the backend environment file:
- macOS/Linux: `cp backend/.env.example backend/.env`
- Windows PowerShell: `Copy-Item backend/.env.example backend/.env`

Then start both services:

```bash
npm run dev
```

Open **http://127.0.0.1:5173**. The frontend proxies `/api` requests to the backend at **http://127.0.0.1:8787**. SQLite creates its database at `backend/data/career-navigator.sqlite` by default. The database is persistent on disk and is ignored by Git.

To use live AI, add your private key to `backend/.env`:

```dotenv
GEMINI_API_KEY=your_private_key
GEMINI_MODEL=gemini-2.5-flash
```

Keep the key in the backend environment. Do not put production secrets in Vite `VITE_*` variables or commit `.env` files. Without a server key, the assistant falls back to offline demo guidance.

## Useful commands

Run from the repository root:

```bash
npm run setup     # Install frontend and backend dependencies
npm run dev       # Start API + Vite frontend
npm test          # Backend + frontend tests and dependency audits
npm run build     # Build the Vite production bundle
```

You can also run services individually:

```bash
npm run dev --prefix backend
npm run dev --prefix "career navigator"
npm test --prefix backend
npm test --prefix "career navigator"
npm run build --prefix "career navigator"
```

## Backend API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Health/status |
| POST | `/api/auth/register` | Create account, profile, and progress |
| POST | `/api/auth/login` | Verify credentials and create a session |
| GET | `/api/auth/me` | Restore current session/account |
| POST | `/api/auth/logout` | Revoke session |
| POST | `/api/auth/password-reset/request` | Request a password-reset email (generic response) |
| POST | `/api/auth/password-reset/confirm` | Set a new password using a single-use token |
| GET/PUT | `/api/profile` | Read/update the authenticated student's profile |
| GET/PUT | `/api/progress` | Read/update milestones, notes, tracked exams, and saved opportunities |
| POST | `/api/ai/chat` | Server-side Gemini proxy when configured |

Authentication uses a random server-managed session token in an HttpOnly, SameSite=Lax cookie. Passwords are stored as salted scrypt verifiers, not plaintext. Registration and protected profile/progress routes are covered by automated API tests. The backend also includes request size limits, validation, and rate limiting for authentication attempts.

The existing browser IndexedDB/LocalStorage implementation remains as a standalone/demo fallback when the API is not reachable. When server authentication is active, profile and progress writes also sync to SQLite. Avoid treating local demo mode as secure authentication.

## Tests and CI

GitHub Actions checks:
- Backend API tests (registration, duplicate emails, login, session cookies, authorization, profile/progress persistence, logout, and offline AI fallback).
- Frontend project-integrity tests.
- Dependency audits (CI fails on high/critical advisories).
- Vite production build.
- Chromium browser smoke tests for sign-in, sign-up/onboarding, future-stage career selection, dashboard, roadmaps/progress, exam tracking persistence, saved opportunities, profile editing, offline AI, invalid detail routes, and protected-route redirects.

## What still requires deployment configuration

This repository now contains an actual backend and local persistent SQLite database. To run it locally, no hosted database credential is required. For a public deployment, configure HTTPS, persistent storage for SQLite or migrate to a managed database, set a trusted frontend origin, configure `GEMINI_API_KEY` privately if desired, and run the backend behind a same-origin reverse proxy (recommended for cookie sessions). Password reset is implemented with expiring single-use tokens, session revocation, and a generic response that avoids account enumeration; email is sent only when SMTP settings are configured. Email verification, monitoring, and a managed production identity solution are not configured yet.

Exam and scholarship windows in the datasets are informational estimates, not live government-portal availability checks. Always confirm the current official notification before applying.
