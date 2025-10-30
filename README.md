# PodSquad

Local-first starter for a kid-friendly voice reply app.

Environment
- NEXT_PUBLIC_SUPABASE_URL - your Supabase URL (required for upload/transcribe UI)
- NEXT_PUBLIC_SUPABASE_ANON_KEY - public anon key for Supabase (required for upload)
- SUPABASE_SERVICE_ROLE - service role key (required for server-side downloads/transcribe)
- OPENAI_API_KEY - OpenAI API key (optional; if not set, reply endpoint returns a dev-stub)

Run locally
- Install: `npm install`
- Dev: `npm run dev` (runs on port 3001 by default)
- Build: `npm run build`
- Start production server: `npm run start`

Tests & smoke
- Unit tests: `npm test` (Jest)
- Smoke tests (against a running dev server):
  - `npm run smoke:root`
  - `npm run smoke:reply`

CI
- A GitHub Actions workflow is configured in `.github/workflows/ci.yml` to run build, tests, and smoke checks.

Notes
- The upload page (`/upload`) provides a client-side audio preview and upload progress.
- Server routes expect Supabase env vars when interacting with storage. See the README above for which keys are required.
# PodSquad Starter (Next.js + Supabase + AI)

A minimal, production-leaning starter to build **PodSquad**: a kids' AI podcast app with voice recording,
age-tiered AI co-hosts (Zoie • Ari • Soni), safe replies, and episode storage.

## What you get

- **Next.js (App Router)** web app
- **Supabase** (Auth, DB, Storage) ready
- **Audio Recorder** React component (browser MediaRecorder API)
- **API routes** to:
  - upload audio to Supabase Storage
  - transcribe with Whisper (OpenAI)
  - generate a safe LLM reply (age-tiered safety + tone)
  - synthesize voice (OpenAI TTS or ElevenLabs)
- Simple **Episode** flow: record → upload → transcribe → reply → play TTS
- Guardrails via moderation + age prompts
- Ready for Vercel deploy

## Quickstart

1) Clone and install
```bash
pnpm i   # or: npm i / yarn
cp .env.example .env.local
```

2) Create a **Supabase** project, then set:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`

3) Create the tables and buckets (SQL in `supabase/schema.sql`).

4) Add your **OPENAI_API_KEY** (and ELEVENLABS_API_KEY if you prefer ElevenLabs).

5) Run locally
```bash
pnpm dev
```

Open http://localhost:3000

## Deploy

- Push to GitHub and import in **Vercel**
- Set all environment variables in Vercel
- Set build command automatically (`next build`) and start (`next start`)

## Notes

- This starter uses a simple **turn-based** conversational flow (record → transcribe → reply → TTS).
  You can upgrade to real-time later.
- Mobile app: add an Expo client that hits the same API routes and Supabase backend.
