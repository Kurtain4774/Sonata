import Link from "next/link";
import { FiMusic, FiCalendar } from "react-icons/fi";

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HistoryCard({ item }) {
  const thumbs = (item.thumbnails || []).slice(0, 4);
  while (thumbs.length < 4) thumbs.push(null);

  return (
    <Link
      href={`/your-music/${item.id}`}
      className="group block p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-spotify/40 hover:shadow-[0_0_0_1px_rgba(29,185,84,0.15)] transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="grid grid-cols-2 grid-rows-2 w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-800">
          {thumbs.map((t, i) =>
            t ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={t} alt="" className="w-full h-full object-cover" />
            ) : (
              <div key={i} className="bg-neutral-800" />
            )
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold tracking-wider text-spotify mb-1">
            AI GENERATED PLAYLIST
          </div>
          <div className="font-semibold text-neutral-100 truncate">
            {item.playlistName || item.promptText}
          </div>
          <div className="text-sm text-neutral-400 truncate mt-0.5">
            “{item.promptText}”
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <FiMusic className="w-3.5 h-3.5" /> {item.trackCount} tracks
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5" /> {formatDate(item.createdAt)}
            </span>
            {item.savedAsPlaylist && (
              <span className="px-2 py-0.5 rounded-full bg-spotify/15 text-spotify text-[10px] font-semibold uppercase tracking-wider">
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
