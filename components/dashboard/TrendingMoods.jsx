"use client";

import { HiSparkles } from "react-icons/hi";
import { FiChevronRight, FiExternalLink } from "react-icons/fi";

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

function SkeletonRow() {
  return (
    <li className="flex items-center gap-3 p-2">
      <div className="w-12 h-9 rounded-md bg-neutral-800 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-28 rounded bg-neutral-800 animate-pulse" />
        <div className="h-2.5 w-16 rounded bg-neutral-800 animate-pulse" />
      </div>
    </li>
  );
}

export default function TrendingMoods({ onPickMood, data, loading }) {
  const moods = data?.length ? data : FALLBACK_MOODS;
  const isFeatured = !!(data?.length);

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiSparkles className="text-violet-400" />
          <h3 className="text-sm font-semibold">
            {isFeatured ? "Featured on Spotify" : "Explore Trending Moods"}
          </h3>
        </div>
      </div>
      <ul className="space-y-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          : moods.slice(0, 6).map((m) => (
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
                  {m.spotifyUrl ? (
                    <a
                      href={m.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-neutral-500 hover:text-green-400 transition-colors"
                      aria-label="Open in Spotify"
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
    </section>
  );
}
