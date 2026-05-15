"use client";

import { HiSparkles } from "react-icons/hi";
import { FiChevronRight, FiExternalLink } from "react-icons/fi";
import LoadingSpinner from "./LoadingSpinner";

const FALLBACK_MOODS = [
  {
    name: "Dreamy",
    prompt: "Dreamy ethereal late-night ambient",
    count: "curated picks",
    img: "https://images.unsplash.com/photo-1532978879514-6cb1f7cbfdba?w=400&q=60&auto=format",
  },
  {
    name: "Late Night",
    prompt: "Late night drive synthwave",
    count: "curated picks",
    img: "https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=400&q=60&auto=format",
  },
  {
    name: "Summer Vibes",
    prompt: "Summer road trip feel-good pop",
    count: "curated picks",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=60&auto=format",
  },
  {
    name: "Cinematic",
    prompt: "Cinematic orchestral score epic",
    count: "curated picks",
    img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=60&auto=format",
  },
];

export default function TrendingMoods({ onPickMood, data, loading }) {
  const realPlaylists = data?.playlists?.length ? data.playlists : null;
  const moods = realPlaylists || FALLBACK_MOODS;
  const isLive = !!realPlaylists;

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiSparkles className="text-violet-400" />
          <h3 className="text-sm font-semibold">
            {isLive ? "Trending Today" : "Explore Trending Moods"}
          </h3>
        </div>
        {isLive && (
          <span className="text-[10px] uppercase tracking-wider text-neutral-500">
            via Deezer
          </span>
        )}
      </div>
      {loading && !data ? (
        <LoadingSpinner label="Loading trending moods…" />
      ) : (
      <ul className="space-y-2">
        {moods.slice(0, 6).map((m) => (
              <li key={m.name}>
                <button
                  type="button"
                  onClick={() => onPickMood?.(m.prompt)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-900 transition-colors text-left group"
                >
                  <div className="relative w-12 h-9 rounded-md overflow-hidden bg-neutral-800 flex-shrink-0">
                    {m.img && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.img} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-[11px] text-neutral-500 truncate">{m.count}</div>
                  </div>
                  {m.externalUrl ? (
                    <a
                      href={m.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-neutral-500 hover:text-violet-400 transition-colors"
                      aria-label="Open source"
                    >
                      <FiExternalLink size={14} />
                    </a>
                  ) : (
                    <FiChevronRight className="text-neutral-500 group-hover:text-white" />
                  )}
                </button>
              </li>
            ))}
      </ul>
      )}
    </section>
  );
}
