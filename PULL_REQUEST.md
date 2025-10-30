Title: Finish reply/OpenAI cleanup, add upload UX, tests, and CI E2E

Summary
-------
This pull request finishes the work on the reply/OpenAI cleanup and continues the feature work across the app: centralizes Supabase client creation, hardens API routes, adds a nicer upload UI with progress, TTS playback and retry controls, adds unit and E2E tests (Jest + Playwright), and configures CI to run build, unit tests, smoke tests and Playwright E2E in a production `next start` environment.

Key changes
-----------
- app/api/reply/route.ts: more robust JSON parsing, request timeout, safer error handling and flexible OpenAI response extraction.
- lib/supabase.ts: centralized `getSupabaseClient`, `createSupabaseForRequest`, and env checks; supports service-role usage.
- app/api/transcribe/route.ts and app/api/upload/route.ts: switched to use `getSupabaseClient` and clearer errors when env vars are missing.
- app/upload/page.tsx: improved client UI with upload progress, preview, Play TTS button, Reset and Retry actions, and better status messages.
- tests: Jest unit tests for reply, transcribe and upload routes under `__tests__`.
- Playwright E2E tests under `playwright/tests/` that exercise the upload page; network requests are stubbed in the test to avoid depending on external services.
- CI: `.github/workflows/ci.yml` updated to run build, Jest, start a production `next start` server for E2E, poll for readiness, run smoke and Playwright tests, then stop the server.
- README.md and smoke scripts added/updated.

Testing notes
-------------
Local unit tests:
- `npm test` — runs Jest tests (passes locally).

Playwright E2E (local):
- `npm run test:e2e` — runs Playwright tests against a running dev server (useful for local debugging).
- `npm run test:e2e:ci` — helper that starts the dev server, runs Playwright, then kills the server.

CI behavior
-----------
The CI workflow now:
1. Installs dependencies and builds the Next app.
2. Runs unit tests.
3. Starts the app in production using `npm run start` (so E2E runs against a production server).
4. Waits for server readiness, runs smoke tests and Playwright E2E, then stops the server.

Security and envs
-----------------
- The workflow assumes no secrets are exposed in logs. Keep `SUPABASE_SERVICE_ROLE` as a GitHub secret and do not print it.
- The Playwright tests included here mock backend API calls to avoid requiring real credentials for the main flow. If you want E2E to exercise real Supabase/OpenAI, set up secure secrets and update the tests accordingly.

Files changed (high-level)
- app/api/reply/route.ts
- app/api/transcribe/route.ts
- app/api/upload/route.ts
- app/api/voice/route.ts
- lib/supabase.ts
- app/upload/page.tsx
- package.json (scripts + devDependencies)
- jest.config.cjs
- playwright.config.ts
- playwright/tests/*
- __tests__/*
- .github/workflows/ci.yml
- README.md
- scripts/smoke-*.js

How to review
-------------
- Run `npm ci`, `npm run build`, and `npm test` locally to validate unit tests and build.
- Optionally run `npm run test:e2e` after `npm run dev` to exercise Playwright tests locally.

Notes
-----
If you want me to open the PR on GitHub, tell me which branch name to use and I can prepare a patch branch locally and provide the exact git commands you should run (or I can open the PR if you give me permissions to push). This repo-level change set is intentionally conservative (no secrets committed) and adds tests to make further changes safer.
