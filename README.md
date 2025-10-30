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
