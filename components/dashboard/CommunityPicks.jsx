"use client";

import { memo } from "react";
import Link from "next/link";
import { FiUsers } from "react-icons/fi";

function CommunityPicks({ data, loading }) {
  const items = (data?.items || []).slice(0, 3);
  const isLoading = loading && !data;

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiUsers className="text-spotify" />
          <h3 className="text-sm font-semibold">Community Picks</h3>
        </div>
        <Link href="/explore" className="text-xs text-neutral-400 hover:text-white">
          View all
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-neutral-900 animate-pulse" />
          ))}
        </div>
      )}
      {!isLoading && !items.length && (
        <p className="text-sm text-neutral-500">No shared playlists yet.</p>
      )}
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              href={`/share/${p.id}`}
              aria-label={`Open "${p.promptText}" by @${p.username}, ${p.trackCount || 0} tracks`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-900 transition-colors focus-visible:ring-2 focus-visible:ring-spotify focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {p.thumbnails?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumbnails[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FiUsers className="text-neutral-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.promptText}</div>
                <div className="text-[11px] text-neutral-500 truncate">@{p.username}</div>
              </div>
              <span className="text-[11px] text-neutral-500 hidden sm:inline tabular-nums">
                ▷ {p.trackCount || 0}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default memo(CommunityPicks);
