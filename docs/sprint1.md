# Sprint 1 — Episode Library & Auth (MVP core)

This Sprint implements the minimal backend and UI to persist episodes and provide a private episode library with permalinks. It also scaffolds email + guardian confirmation flows.

Tasks

- DB schema additions (profiles.guardian_email, guardian_confirmed; episodes: transcript, audio_url, visibility, permalink)
- `lib/supabase.ts` helper `getServiceSupabase()` for server-only operations
- API `POST /api/episodes` and `GET /api/episodes`
- Auth scaffolding (register page + guardian confirm endpoint)
- Update `app/upload/page.tsx` to collect metadata and call episodes POST
- Episode library pages and components
- Unit tests + Playwright happy-path

Acceptance criteria

- Episodes are saved to DB with required fields
- Episode library lists and plays saved episodes
- Guardian confirmation flow exists (dev-mode token printed to logs)

Notes

- OpenAI moderation will be stubbed if `OPENAI_API_KEY` is missing
- Email sending for guardian confirmation will use dev-mode tokens by default; integrate a mail provider in Sprint 2
