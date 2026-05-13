export default function SpotifyPlaylistCard({ playlist, variant }) {
  const isLiked = variant === "liked";
  const title = isLiked ? "Liked Songs" : playlist.name;
  const subtitle = isLiked
    ? "Your saved tracks on Spotify"
    : playlist.description || " ";

  return (
    <a
      href={playlist.spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{title}</div>
          <div className="text-sm text-neutral-400 truncate">{subtitle}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {isLiked ? (
          <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-600 to-blue-400 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-white"
              aria-hidden="true"
            >
              <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
            </svg>
          </div>
        ) : (
          (playlist.thumbnails || []).map((t, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={t}
              alt=""
              className="w-10 h-10 rounded object-cover"
            />
          ))
        )}
        <div className="ml-auto text-xs text-neutral-500">
          {playlist.trackCount} tracks
        </div>
      </div>
    </a>
  );
}
