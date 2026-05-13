# Sonata — AI Spotify Playlist Builder

Next.js 14 (App Router) + Tailwind CSS + MongoDB (Mongoose) + Google Gemini API + Spotify Web API + NextAuth.js + Vercel

## Routes
- `/` — Landing page, login CTA, server component
- `/dashboard` — Prompt input → Gemini recs → Spotify track matching → save playlist. Client component. Protected.
- `/history` — Past prompts list with album art thumbnails. Protected.
- `/history/[id]` — Playlist detail view, save/open in Spotify. Protected.

## API Routes
- `/api/auth/[...nextauth]` — Spotify OAuth via NextAuth.js
- `POST /api/recommend` — Prompt → Gemini → Spotify search → return matched tracks
- `POST /api/playlist` — Create Spotify playlist + add tracks + save to MongoDB
- `GET /api/history` — User's past prompts
- `GET /api/history/[id]` — Single prompt detail

## Flow
Prompt → Gemini returns JSON `[{title, artist}]` (15 songs) → search Spotify `/v1/search` per song → return track objects (id, albumArt, previewUrl) → user saves → create playlist via Spotify API → store in MongoDB

## Gemini System Prompt
Return exactly 15 songs as JSON array with "title" and "artist" fields only. No explanation. Mix popular + deep cuts, span decades.

## DB Models
**User**: spotifyId, displayName, email, profileImage, accessToken (encrypted), refreshToken (encrypted), tokenExpiry
**Prompt**: userId (ref User), promptText, recommendations[{spotifyTrackId, title, artist, albumArt, previewUrl}], savedAsPlaylist, spotifyPlaylistId, spotifyPlaylistUrl, createdAt

## Key Components
Navbar, PromptInput, VibeChips, TrackCard, TrackList, AudioPreview, PlaylistSaveButton, HistoryCard, AuthButton

## Lib Helpers
`lib/auth.js` (NextAuth config), `lib/mongodb.js` (DB connection), `lib/gemini.js` (Gemini API), `lib/spotify.js` (Spotify API)

## Spotify Scopes
user-read-private, user-read-email, playlist-modify-public, playlist-modify-private

## Packages
next, next-auth, mongoose, @google/generative-ai, tailwindcss, react-icons, framer-motion

## Env
SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, NEXTAUTH_URL, NEXTAUTH_SECRET, GEMINI_API_KEY, MONGODB_URI