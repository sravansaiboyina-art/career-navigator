# Career Navigator — Project Guide

This document has been updated to match the full repository structure, including the backend.

## What the project includes

- Student landing page, sign-in, sign-up, and onboarding for Class 6 through graduation.
- Career explorer and detail pages, including future-stage career planning for younger students.
- Personalized dashboard and next-step panel.
- Stage-based roadmaps, milestone completion, personal notes, and progress statistics.
- Exam tracker with details, eligibility context, track/untrack state, and official links.
- Opportunities, scholarships, internships, government-job and study-abroad listings, saved items, and detail pages.
- Profile editing and logout.
- AI assistant with offline guidance and optional server-managed Gemini integration.
- Express backend, persistent SQLite database, hashed credentials, server-managed HttpOnly sessions, profile/progress APIs, password-reset endpoints, and optional SMTP email delivery.
- Automated API, project-integrity, dependency-audit, production-build, and Chromium browser tests.

## Run the full-stack app

From the **repository root** (not just the `career navigator` folder):

1. Install Node.js 22.12 or newer.
2. Run `npm run setup`.
3. Copy `backend/.env.example` to `backend/.env`.
4. Optionally configure `GEMINI_API_KEY` and SMTP settings in `backend/.env`. Keep secrets out of Git and never put production keys in `VITE_*` variables.
5. Run `npm run dev`.
6. Open http://127.0.0.1:5173.

The frontend runs through Vite and proxies `/api` to the backend on port 8787. SQLite persists to `backend/data/career-navigator.sqlite` by default.

## Validation commands

Run from the repository root:

```bash
npm test
npm run build
```

The test command includes backend API/database tests, frontend audit tests, and dependency vulnerability audits. GitHub Actions additionally runs Chromium browser smoke tests.

## Data and production notes

- Exam and opportunity windows are estimates/reference data, not live availability checks. Confirm current details with official portals.
- If SMTP is not configured, the password-reset request page shows an account-safe generic response, but no email can be delivered.
- If `GEMINI_API_KEY` is not configured on the server, the assistant uses offline demo advice.
- The SQLite backend is suitable for local development and a small demo. A public production deployment needs persistent hosting storage or a managed database, HTTPS, environment secrets, an email provider, monitoring, backups, and a deployment plan.
