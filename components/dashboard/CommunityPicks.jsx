"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";

export default function CommunityPicks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/explore?page=1")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems((d.items || []).slice(0, 3)))
      .finally(() => setLoading(false));
  }, []);

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

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-neutral-900 animate-pulse" />
          ))}
        </div>
      )}
      {!loading && !items.length && (
        <p className="text-sm text-neutral-500">No shared playlists yet.</p>
      )}
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              href={`/share/${p.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-900 transition-colors"
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
              <button
                type="button"
                aria-label="Play"
                onClick={(e) => e.preventDefault()}
                className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-300 hover:bg-spotify hover:text-black hover:border-transparent transition"
              >
                <FaPlay className="text-[10px] ml-0.5" />
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
