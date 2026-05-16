# Sonata — AI Spotify Playlist Builder

Always use the --frontend-design skill when working on the frontend.

Next.js 14 (App Router, JS) + Tailwind + MongoDB (Mongoose) + Google Gemini + Spotify Web API + Deezer (preview fallback) + NextAuth + Vercel. Tests with Vitest; E2E with Playwright.

## Pages
- `/` — Landing (hero, demo, features, FAQ, floating albums). Server component.
- `/dashboard` — Prompt → recs flow, plus widgets: NowPlaying, ListeningInsights, RecentHistory, TrendingMoods, StatTiles, TasteProfile. Protected.
- `/explore` — Browse public/shared playlists. Protected.
- `/your-music` — User's saved playlists + history. Protected.
- `/stats` — Top tracks/artists, recently played, summary. Protected.
- `/share/[id]` — Public shared prompt/playlist view.
- `/privacy`, `/terms` — Static.

## API Routes
- `auth/[...nextauth]` — Spotify OAuth (NextAuth)
- `recommend` (POST) + `recommend/refine`, `similar`, `swap` — Gemini → Spotify match. Streamed, rate-limited.
- `playlist` (POST, [id]) — Create Spotify playlist + persist Prompt doc
- `history` (GET, [id]) — User prompt history
- `dashboard` (GET) — Aggregated dashboard payload (featured playlists, widgets)
- `spotify/playlists` — User's Spotify playlists (current playlists feature)
- `landing-tracks` — Tracks for landing visuals
- `now-playing`, `queue`, `playback/{play,next,previous,seek,volume}` — Web Playback control
- `stats/{summary,top-tracks,top-artists,recently-played,preview}`
- `explore` (+ `explore/share`), `share/[id]` — Public sharing
- `settings` (GET/PUT, `settings/export`) — User preferences

## Flow
Prompt → Gemini returns `[{title, artist}]` JSON (≈20) → per-song Spotify `/v1/search` (mapped via `spotifyTrackMapper`) → stream tracks (id, albumArt, previewUrl, Deezer fallback) → user saves → create Spotify playlist → store Prompt in Mongo. Refine/swap/similar reuse the same pipeline.

## DB Models
- **User** — spotifyId, displayName, email, profileImage, accessToken/refreshToken (encrypted via `lib/crypto`), tokenExpiry
- **Prompt** — userId, promptText, recommendations[{spotifyTrackId,title,artist,albumArt,previewUrl}], savedAsPlaylist, spotifyPlaylistId/Url, shared flags, createdAt
- **Settings** — Per-user preferences (UI/playback/privacy)
- **PlayHistory** — Per-user track play log for taste profile & stats

## Key Components
- Global: Navbar, ProfileMenu, AuthButton, Providers, ToastContext, SettingsContext, ErrorBoundary, OnboardingTour, GlobalMiniPlayer, AudioPreview(Provider), WebPlaybackProvider, SonataLogo
- Prompt/Tracks: PromptInput, VibeChips, FineTuneControls, TrackCard, TrackList, PlaylistSaveButton, MergeModal, ShareToggle
- Pages: DashboardClient, HistoryPageClient, HistoryCard, ExploreClient/ExploreCard, StatsClient, YourMusicClient, CurrentPlaylistsClient, SpotifyPlaylistCard
- Dashboard widgets: HeroPromptCard, NowPlayingPanel, ListeningInsights, RecentHistoryWidget, TrendingMoods, StatTiles, TasteProfile, RefinementInput, ResultsSection, WidgetGroup
- Playlist detail: PlaylistDetailClient, TrackTable, RefinePanel, SimilarSongsTab, HistoryTab, MoodFitPill
- Landing: HeroSection, DemoSection, FeatureCards, HowItWorks, WhySonata, SpotifyIntegration, FAQSection, FinalCTA, FloatingAlbums, AlbumArt, DashboardPreview, LandingHeader, Footer
- Settings: SettingsModal + `settings/tabs` + `settings/controls`

## Lib Helpers
`auth`, `mongodb`, `crypto` (token enc), `gemini`, `spotify`, `spotifyApp` (app-token), `spotifyAuth`, `spotifyTrackMapper`, `deezer` (preview fallback), `history`, `stats`, `playHistory`, `tasteProfile`, `moodFit`, `explore`, `playlistCover`, `settings`, `rateLimit`, `stringSimilarity`. Co-located `*.test.js` files.

## Spotify Scopes
user-read-private, user-read-email, user-read-playback-state, user-modify-playback-state, user-read-currently-playing, user-read-recently-played, user-top-read, playlist-read-private, playlist-modify-public, playlist-modify-private, streaming

## Packages
next 14, next-auth, mongoose, @google/generative-ai, tailwindcss, framer-motion, react-icons, @dnd-kit/{core,sortable,utilities}, canvas (cover gen). Dev: vitest, @vitest/ui, @testing-library/jest-dom, jsdom, @playwright/test.

## Scripts
`dev`, `build`, `start`, `lint`, `test` (vitest run), `test:watch`, `test:ui`.

## Env
SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, NEXTAUTH_URL, NEXTAUTH_SECRET, GEMINI_API_KEY, MONGODB_URI, plus token encryption key consumed by `lib/crypto`.

## Notes
- Tokens stored encrypted; always refresh via `spotifyAuth` helper before Spotify calls.
- Preview URLs: Spotify previews are unreliable — `lib/deezer` provides fallback in mapper.
- Rate limiting is enforced on `/api/recommend` via `lib/rateLimit`.
- Gemini system prompt: return JSON only (no prose), mix popular + deep cuts across decades.
