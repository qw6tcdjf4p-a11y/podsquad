# PodSquad — Full Concept Specification

(Children’s AI Podcast Studio & Classroom Platform)

## Textual Concept

### Goals

PodSquad empowers kids, teens, and classrooms to create, host, and publish safe, educational podcasts with the help of AI companions who act as friendly co-hosts, mentors, and creative partners.

It teaches storytelling, speaking skills, and creativity while keeping every interaction COPPA-compliant, parent-safe, and age-appropriate.
For teachers, it introduces an interactive “Classroom Edition” where podcasting becomes a learning activity that builds communication, collaboration, and confidence.

## Target Users

1. Kids (Ages 5–8)
2. Tweens (Ages 9–12)
3. Teens (Ages 13–17)
4. Teachers & Schools
5. Parents

## Primary Problems the App Solves

• Kids want to express creativity through media but lack safe, guided tools.
• Parents & educators need an age-appropriate environment for creation and sharing.
• Teachers want an engaging way to teach communication and storytelling.
• Youth creators need structured mentorship and publishing tools without exposure to unsafe social spaces.

## Capabilities / Feature List

### Core Must-Haves

- Age-tiered AI companions (Zoie, Ari, Soni)
- Record & Transcribe
- AI Co-Host & Mentor System
- Script & Episode Builder
- Audio Editing & Enhancement
- Episode Library
- Publishing Flow
- Classroom Edition
- Parent Dashboard
- Subscription & Payments
- Social Sharing

### Nice-to-Haves / Future Upgrades

- Custom AI Voices
- Cross-Class Collaboration
- Community Hub
- Parent Analytics
- Gamified Rewards
- Language Support

## Integrations

| Category | Service | Purpose |
|---|---|---|
| AI Models | OpenAI GPT-4o, Whisper, TTS | Chat, transcription, voice |
| Database/Auth | Supabase | User data, episodes, permissions |
| Payments | Stripe | Subscription & school licensing |
| Storage | Supabase Storage / Vercel Blob | Audio + transcripts |
| Publishing | Spotify, Apple Podcasts, YouTube | Auto episode publishing |
| Moderation | OpenAI Moderation API | Content safety |
| Notifications | Firebase Cloud Messaging (optional) | Publish & reminder alerts |
| Analytics | PostHog / Vercel Analytics | Engagement tracking |

## Data & Flows

Suggested Supabase tables: users, episodes, classes, schools, subscriptions, feedback

Primary Flows:
1. record_audio → transcribe → moderate → ai_reply → save_episode
2. publish_episode → choose_visibility → upload_to_integrations
3. teacher_dashboard → assign_project → student_submit → ai_feedback + grade

## Interaction Notes

See provided user journeys for Young Creator, Classroom Project, Teen Creator in original spec.

## Visuals / Design Direction

Place design assets in `/designs` if added:
- logo_podsquad.svg
- color_palette.png
- ui_mockups.pdf

Design language: Rounded, soft shapes; playful motion; responsive grid.

## Branding

Primary Colors: #1A73E8 (Sky Blue), #FFD54F (Sunbeam), #FF6F61 (Coral), #0B1220 (Deep Navy)
Fonts: Poppins (UI), Nunito Sans (Body)

## Constraints

Timeline: Phase 1 (Full MVP): 3 months. Full App w/ School Edition: 6–8 months.
Hosting: Vercel (Edge), Supabase backend, Stripe billing.
Secrets available: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE, STRIPE_SECRET_KEY.
Avoid: Non-COPPA compliant analytics or ad networks.

## How to provide

If uploading to the repo, place brand files in `/designs` and this spec is saved to `/docs/full_concept_spec.md`.

## Summary Mission

Build the world’s safest, smartest, and most inspiring podcast studio for kids and classrooms — where every young voice has the confidence, creativity, and mentorship to be heard.
