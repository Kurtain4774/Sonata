import Link from "next/link";

export default function ExploreCard({ item }) {
  const { promptText, trackCount, thumbnails, username, createdAt } = item;

  return (
    <Link
      href={`/dashboard?prompt=${encodeURIComponent(promptText)}`}
      className="group block p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/60 transition-colors"
    >
      {thumbnails.length > 0 && (
        <div className="flex gap-1 mb-3">
          {thumbnails.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          ))}
        </div>
      )}

      <p className="text-sm text-white font-medium line-clamp-2 group-hover:text-spotify transition-colors">
        "{promptText}"
      </p>

      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
        <span>
          {trackCount} track{trackCount !== 1 ? "s" : ""} · {username}
        </span>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
