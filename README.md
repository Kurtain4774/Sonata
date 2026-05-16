# Sonata

AI-powered Spotify playlist builder. Describe a mood or vibe, get song recommendations matched to real Spotify tracks, refine the result, and save it as a playlist.

## Stack

Next.js 14 App Router, React 18, NextAuth v4 with Spotify OAuth, MongoDB/Mongoose, Google Gemini, Spotify Web API, Deezer preview fallback, Tailwind CSS, Vitest, and Playwright.

## Setup

1. Run `npm install`.
2. Copy `.env.local.example` to `.env.local` and fill in:
   - **Spotify**: register an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard). Add redirect URI `http://127.0.0.1:3000/api/auth/callback/spotify`.
   - **NextAuth**: generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`.
   - **Token encryption**: generate `TOKEN_ENCRYPTION_KEY` with `openssl rand -base64 32`.
   - **Gemini**: create a key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
   - **MongoDB**: use local `mongod` or an Atlas connection string.
3. Run `npm run dev`.
4. Open `http://127.0.0.1:3000`.

## Pages

| Path | Purpose |
| --- | --- |
| `/` | Landing page with Spotify login |
| `/dashboard` | Prompt generation, streaming recommendations, widgets, playback controls |
| `/explore` | Public/shared playlist discovery |
| `/your-music` | User generated playlists and current Spotify playlists |
| `/your-music/[id]` | Playlist detail, refine/similar/history tools |
| `/stats` | Top tracks/artists, recently played, listening summary |
| `/share/[id]` | Public shared playlist view |
| `/privacy`, `/terms` | Static policy pages |

## API Routes

| Route | Purpose |
| --- | --- |
| `/api/auth/[...nextauth]` | Spotify OAuth via NextAuth |
| `/api/recommend` | `POST`: prompt to Gemini recommendations to Spotify matches, streamed as NDJSON |
| `/api/recommend/refine` | `POST`: refine an existing track list |
| `/api/recommend/similar` | `POST`: find similar tracks for an existing playlist |
| `/api/recommend/swap` | `POST`: replace one track with a matched alternative |
| `/api/playlist` | `POST`: create a Spotify playlist and persist save state |
| `/api/playlist/[id]` | `PATCH`, `DELETE`: update or delete generated playlist metadata |
| `/api/playlist/[id]/tracks` | `PATCH`: edit generated playlist tracks and sync saved Spotify playlist |
| `/api/history`, `/api/history/[id]` | `GET` user prompt history, `DELETE /api/history` clears it |
| `/api/dashboard` | `GET`: aggregated dashboard widgets |
| `/api/settings`, `/api/settings/export` | User preferences and data export |
| `/api/spotify/playlists` | User Spotify playlists and liked songs summary |
| `/api/now-playing`, `/api/queue`, `/api/playback/*` | Playback state, queue, and controls |
| `/api/stats/*` | Listening stats, top tracks/artists, previews |
| `/api/explore`, `/api/explore/share`, `/api/share/[id]` | Public sharing and discovery |
| `/api/landing-tracks` | Real track art for landing visuals |

## Recommendation Flow

Prompt -> Gemini JSON song candidates -> Spotify track search/mapping -> Deezer preview enrichment when needed -> streamed result frames -> optional Spotify playlist creation -> MongoDB prompt history.

The `POST /api/recommend` contract is intentionally streaming NDJSON:

- `{ "type": "meta", "playlistName": string, "prompt": string, "total": number }`
- `{ "type": "track", "track": object }`
- `{ "type": "done", "promptId": string | null }`
- `{ "type": "error", "status": number, "message": string }`

## Scripts

- `npm run dev`: start Next.js locally.
- `npm run build`: production build and route validation.
- `npm test`: run Vitest tests.
- `npm run test:watch`: run Vitest in watch mode.

## Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel, import the repo as a Next.js project.
3. Add every variable from `.env.local.example` in Project Settings.
4. Set `NEXTAUTH_URL` to the production URL.
5. Add the production redirect URI in the Spotify dashboard: `https://<your-domain>/api/auth/callback/spotify`.
6. Deploy, then verify login -> dashboard -> generate -> save playlist.

Rotating `TOKEN_ENCRYPTION_KEY` invalidates previously stored encrypted Spotify tokens, so users will need to log in again.

## Known Security Notes

- This repo is pinned to Next.js 14.2.35. Upgrading to Next.js 16 and React 19 is a separate migration task because it involves framework and runtime behavior changes.
- Spotify access and refresh tokens persisted in MongoDB are encrypted with AES-256-GCM via `TOKEN_ENCRYPTION_KEY`. The NextAuth JWT cookie is protected by `NEXTAUTH_SECRET`.
