# Refactor Baseline

Captured on 2026-05-14 before the first behavior-preserving refactor pass.

## Validation Status

- `npm test`: passing, 16 test files and 128 tests.
- `npm run build`: passing on Next.js 14.2.35.

## App Routes

Build output currently reports these routes:

| Route | Rendering |
| --- | --- |
| `/` | static |
| `/_not-found` | static |
| `/dashboard` | dynamic |
| `/explore` | dynamic |
| `/icon.svg` | static |
| `/privacy` | static |
| `/screenshots/sonata` | dynamic |
| `/share/[id]` | dynamic |
| `/stats` | dynamic |
| `/terms` | static |
| `/your-music` | dynamic |
| `/your-music/[id]` | dynamic |

## API Routes

Build output currently reports these API routes:

| Route | Methods in code |
| --- | --- |
| `/api/auth/[...nextauth]` | NextAuth `GET`, `POST` handlers |
| `/api/dashboard` | `GET` |
| `/api/explore` | `GET` |
| `/api/explore/share` | `PATCH` |
| `/api/history` | `GET`, `DELETE` |
| `/api/history/[id]` | `GET` |
| `/api/landing-tracks` | `GET` |
| `/api/now-playing` | `GET` |
| `/api/playback/next` | `POST` |
| `/api/playback/play` | `PUT` |
| `/api/playback/previous` | `POST` |
| `/api/playback/seek` | `PUT` |
| `/api/playback/volume` | `PUT` |
| `/api/playlist` | `POST` |
| `/api/playlist/[id]` | `PATCH`, `DELETE` |
| `/api/playlist/[id]/tracks` | `PATCH` |
| `/api/queue` | `POST` |
| `/api/recommend` | `POST` |
| `/api/recommend/refine` | `POST` |
| `/api/recommend/similar` | `POST` |
| `/api/recommend/swap` | `POST` |
| `/api/settings` | `GET`, `PUT` |
| `/api/settings/export` | `GET` |
| `/api/share/[id]` | `POST` |
| `/api/share/[id]/og` | `GET` |
| `/api/spotify/playlists` | `GET` |
| `/api/stats/preview` | `GET` |
| `/api/stats/recently-played` | `GET` |
| `/api/stats/summary` | `GET` |
| `/api/stats/top-artists` | `GET` |
| `/api/stats/top-tracks` | `GET` |

## Stable Response Contracts

These shapes should stay stable during refactors unless a later task explicitly changes them.

### `POST /api/recommend`

- Unauthenticated: JSON `{ "error": "Not authenticated" }`, status `401`.
- Invalid JSON: JSON `{ "error": "Invalid JSON" }`, status `400`.
- Missing prompt: JSON `{ "error": "Prompt is required" }`, status `400`.
- Prompt over 500 chars: JSON `{ "error": "Prompt too long (max 500 chars)" }`, status `400`.
- Rate limited: JSON `{ "error": string }` message beginning with `Slow down`, status `429`, `Retry-After` header.
- Success: NDJSON stream with `Content-Type: application/x-ndjson; charset=utf-8`.
- Stream frames:
  - `{ "type": "meta", "playlistName": string, "prompt": string, "total": number }`
  - `{ "type": "track", "track": object }`
  - `{ "type": "done", "promptId": string | null }`
  - `{ "type": "error", "status": number, "message": string }`

### `POST /api/playlist`

- Unauthenticated: JSON `{ "error": "Not authenticated" }`, status `401`.
- Invalid JSON: JSON `{ "error": "Invalid JSON" }`, status `400`.
- Missing playlist name or tracks: JSON `{ "error": "Missing playlist name or tracks" }`, status `400`.
- Unknown user: JSON `{ "error": "User not found" }`, status `404`.
- Unknown prompt: JSON `{ "error": "Prompt not found" }`, status `404`.
- Success: JSON `{ "playlistId": string, "playlistUrl": string | undefined }`.

### `GET /api/history`

- Unauthenticated: JSON `{ "error": "Not authenticated" }`, status `401`.
- Success: JSON `{ "prompts": PromptSummary[] }`.

### `DELETE /api/history`

- Unauthenticated: JSON `{ "error": "Not authenticated" }`, status `401`.
- Missing user: JSON `{ "deleted": 0 }`.
- Success: JSON `{ "deleted": number }`.

### `GET /api/settings`

- Unauthenticated: JSON `{ "error": "Not authenticated" }`, status `401`.
- Success: JSON settings object merged with defaults.

### `PUT /api/settings`

- Unauthenticated: JSON `{ "error": "Not authenticated" }`, status `401`.
- Invalid JSON: JSON `{ "error": "Invalid JSON" }`, status `400`.
- Success: JSON settings object merged with defaults.

## Refactor Guardrails

- Preserve public route URLs and response shapes.
- Keep `/api/recommend` as streaming NDJSON until a separate migration task changes the client contract.
- Keep Next.js 14, React 18, NextAuth v4, Mongoose, Gemini, and Spotify API versions unchanged in this refactor pass.
- Treat Next.js 16, Auth.js, TypeScript conversion, and route renames as separate migrations.
