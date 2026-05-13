import Link from "next/link";

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HistoryCard({ item }) {
  return (
    <Link
      href={`/history/${item.id}`}
      className="block p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">
            {item.playlistName || item.promptText}
          </div>
          <div className="text-sm text-neutral-400 truncate">
            “{item.promptText}”
          </div>
        </div>
        <span
          className={
            "shrink-0 text-xs px-2 py-1 rounded-full " +
            (item.savedAsPlaylist
              ? "bg-spotify/20 text-spotify"
              : "bg-neutral-800 text-neutral-400")
          }
        >
          {item.savedAsPlaylist ? "Saved" : "Not saved"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {item.thumbnails.map((t, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={t}
            alt=""
            className="w-10 h-10 rounded object-cover"
          />
        ))}
        <div className="ml-auto text-xs text-neutral-500">
          {item.trackCount} tracks · {formatDate(item.createdAt)}
        </div>
      </div>
    </Link>
  );
}
