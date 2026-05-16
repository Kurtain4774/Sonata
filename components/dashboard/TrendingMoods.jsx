"use client";

import { HiSparkles } from "react-icons/hi";
import { FiChevronRight, FiExternalLink } from "react-icons/fi";
import LoadingSpinner from "./LoadingSpinner";

export default function TrendingMoods({ onPickMood, data, loading }) {
  const playlists = data?.playlists?.length ? data.playlists : null;

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiSparkles className="text-violet-400" />
          <h3 className="text-sm font-semibold">Trending Today</h3>
        </div>
        {playlists && (
          <span className="text-[10px] uppercase tracking-wider text-neutral-500">
            via Deezer
          </span>
        )}
      </div>
      {loading && !data ? (
        <LoadingSpinner label="Loading trending moods…" />
      ) : !playlists ? (
        <p className="text-sm text-neutral-500">
          Trending moods are unavailable right now — check back soon.
        </p>
      ) : (
        <ul className="space-y-2">
          {playlists.slice(0, 6).map((m) => (
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
