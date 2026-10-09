# Career Navigator — Updated Prototype

## What changed in this update

1. Added a personalized **What Should I Do Now?** panel to the dashboard. It uses the student's selected career, education stage, and incomplete roadmap milestones.
2. The next-step panel supports marking milestones complete and links to the full roadmap.
3. Fixed opportunity category filtering so category tabs continue to show only opportunities relevant to the current student.
4. Protected opportunity detail pages and kept them inside the signed-in app layout.
5. Added the graduate banking demo persona to the sidebar selector.
6. Added a light-theme finishing pass for the navbar, sidebar, dashboard hero, roadmap panels, modal, and mobile dashboard layout.

## Run locally

1. Install Node.js (a current LTS version is recommended).
2. Extract this ZIP.
3. Open a terminal in the `career navigator` folder.
4. Run `npm install`.
5. If needed, copy `.env.example` to `.env` and adjust local settings. Do not put private API keys in client-exposed `VITE_` variables.
6. Run `npm run dev` and open the local URL Vite prints.
7. Before presenting, run `npm run build` to check the production bundle.

## Notes

- Opportunity/exam dates in the prototype are informational sample data; always verify current details on official portals.
- The app currently stores the profile and progress locally in the browser. It is a prototype, not a production multi-user backend.
- The original `.env` was intentionally not included in this ZIP. Use `.env.example` to recreate local configuration without accidentally sharing secrets.
