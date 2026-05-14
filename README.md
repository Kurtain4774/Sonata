# Sonata

AI-powered Spotify playlist builder. Describe a mood or vibe, get 15 song recommendations matched to real Spotify tracks, save as a playlist in one click.

## Stack

Next.js 14 (App Router) · NextAuth (Spotify OAuth) · MongoDB / Mongoose · Google Gemini · Tailwind CSS

## Setup

1. `npm install`
2. Copy `.env.local.example` → `.env.local` and fill in:
   - **Spotify** — register an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard). Add redirect URI `http://127.0.0.1:3000/api/auth/callback/spotify`.
   - **NextAuth** — generate a secret with `openssl rand -base64 32`.
   - **Gemini** — grab a key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
   - **MongoDB** — local `mongod` or an Atlas connection string.
3. `npm run dev` → http://127.0.0.1:3000

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing page with Spotify login |
| `/dashboard` | Generate recommendations from a prompt |
| `/history` | List past prompts |
| `/history/[id]` | Detail view of a single generated playlist |
| `/api/recommend` | `POST` — Gemini → Spotify search chain |
| `/api/playlist` | `POST` — create playlist on Spotify and persist save state |
| `/api/history`, `/api/history/[id]` | `GET` — user history |

## Promo screenshots

Run `npm run screenshots:sonata` to capture the six deterministic Sonata promo frames as PNGs in `screenshots/sonata-frames`.

The workflow uses the screenshot-only fixture route at `/screenshots/sonata`, starts `next dev` on port 3000 if needed, and captures a 1440x900 desktop viewport with Playwright.

## Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel, **New Project → Import** your repo. Framework auto-detects as Next.js.
3. **Project Settings → Environment Variables** — add every var from `.env.local.example`:
   - `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
   - `NEXTAUTH_URL` → your production URL (`https://sonata-liart.vercel.app`)
   - `NEXTAUTH_SECRET` → fresh `openssl rand -base64 32` (don't reuse the dev one)
   - `TOKEN_ENCRYPTION_KEY` → fresh `openssl rand -base64 32`
   - `GEMINI_API_KEY`
   - `MONGODB_URI` (Atlas, with the deployment IP allow-listed — `0.0.0.0/0` for simplicity)
4. **Spotify dashboard** → add the production redirect URI: `https://<your-domain>/api/auth/callback/spotify`.
5. Deploy. First visit `/` and verify login → dashboard works end-to-end.

> Note: rotating `TOKEN_ENCRYPTION_KEY` invalidates previously stored encrypted tokens — users will need to log in again. That's fine since fresh tokens are issued on sign-in.

## Known security notes

- Pinned to Next.js 14.2.35 (latest 14.2.x patch). Several open advisories for Next 14 require upgrading to Next 16, which is a breaking-change migration left out of scope for this build.
- Spotify access/refresh tokens persisted in MongoDB are encrypted with AES-256-GCM via `TOKEN_ENCRYPTION_KEY`. The copy NextAuth keeps in the JWT cookie is signed/encrypted by `NEXTAUTH_SECRET`.
