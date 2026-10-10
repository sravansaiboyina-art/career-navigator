# Career Navigator

Career Navigator is a stage-aware career guidance web prototype for Indian students from Class 6 through graduation. It combines career exploration, a student dashboard, stage-based roadmaps, milestone progress, exam tracking, scholarships/opportunities, and an optional AI career assistant.

## Current status

This repository is the **demo/prototype phase**. The frontend, routes, example datasets, client-side persistence, and local demo authentication are included. It is **not yet a production multi-user service**: profile and progress data live in the browser's IndexedDB/LocalStorage, registration and password verification happen in the browser, and the optional Gemini key is used directly from the browser session.

Do not use real sensitive student data or treat browser-side authentication as production security. A production release needs a server-side API, managed database, server-side authentication/session controls, rate limiting, and secret management.

## Features

- Student onboarding by class/stage, stream, interests, and career goals.
- Career explorer and career detail pages.
- Stage-by-stage roadmap with milestone completion and personal notes.
- Exam tracker with details, eligibility context, saved/tracked exams, and official links.
- Opportunities and scholarship list, detail views, and saved opportunities.
- Progress dashboard with a stage-level chart.
- AI assistant with offline demo responses and optional Gemini integration.
- Demo personas for viewing different education stages.
- Browser-local persistence for demo profiles and progress.

Application months are reference estimates, not live deadline checks. Students must confirm current eligibility and application status on the official portal.

## Run locally

Use Node.js 22 or a compatible current Node.js release.

```bash
cd "career navigator"
npm ci
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

To build the production bundle and run the project audit:

```bash
npm test
npm run build
npm run preview
```

GitHub Actions runs the Node.js project-audit tests, Vite production build, and a Chromium browser smoke test for the main student flows when the app/workflow changes. The browser-test runtime is installed temporarily in CI and is not added to the app's production dependencies.

## Demo login

The auth screen includes one-click demo personas, which is the easiest way to explore the different student stages. A new account can also be created from the sign-up form.

For local seed accounts, set `VITE_DEMO_SEED="true"` in `career navigator/.env` before the first run. Seeded demo users use the shared demo password `password123`; these credentials are public demo data, not real accounts. The app stores new demo account password verifiers as salted PBKDF2 hashes, but this client-side mechanism is not a replacement for server-side authentication.

## Data and structure

- `career navigator/src/main.js`: app bootstrap, data loading, shared layout, and route registrations.
- `career navigator/src/router.js`: hash-based SPA router.
- `career navigator/src/pages/`: landing, auth, onboarding, dashboard, careers, roadmap, exams, opportunities, progress, profile, and AI assistant.
- `career navigator/src/components/`: navbar, sidebar, modal, toast, and loading components.
- `career navigator/src/db/`: prototype IndexedDB/LocalStorage adapter and demo seed records.
- `career navigator/src/store.js`: active student session, profile, milestones, tracked exams, saved opportunities, and notes.
- `career navigator/src/data/roadmapData.js`: canonical stage-based roadmap data.
- `career navigator/data/` and `career navigator/public/data/`: career, exam, and opportunity JSON datasets. The audit tests confirm that the public copies match the source copies.
- `career navigator/tests/project-audit.test.js`: automated route, data, storage, authentication, and project integrity checks.
- `career navigator/tests/e2e-smoke.mjs`: Chromium end-to-end smoke checks for login, onboarding/career selection, dashboard, roadmap/progress, exams, opportunities, AI offline mode, profile editing, invalid routes, and protected routes.

## AI configuration

The AI assistant works in offline demo mode without an API key. For a local experiment, provide a Gemini key through the assistant's key dialog. It is stored in the browser's session storage and sent to Google directly. **Do not use this client-side key flow for a deployed production app**; production calls should go through a server-side endpoint backed by environment secrets.

## Production upgrade checklist

1. Replace the browser-only user/profile/progress store with a server API and managed database.
2. Move password handling and session issuance to the server or an established identity provider.
3. Move Gemini requests to the backend; enforce quotas and keep API keys out of the browser.
4. Add server-side validation, authorization, rate limiting, audit logging, and recovery workflows.
5. Verify official exam/opportunity links and deadlines on a schedule; show a last-verified date and avoid implying live availability.
6. Expand the current Chromium smoke test into cross-browser/device coverage, including full registration/login validation, mobile navigation, accessibility, and visual regression.
