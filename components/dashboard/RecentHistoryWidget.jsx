"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { FiMoreVertical, FiClock } from "react-icons/fi";

function relativeTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString();
}

export default function RecentHistoryWidget() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => (r.ok ? r.json() : { prompts: [] }))
      .then((d) => setItems((d.prompts || []).slice(0, 4)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiClock className="text-neutral-400" />
          <h3 className="text-sm font-semibold">Recent History</h3>
        </div>
        <Link href="/history" className="text-xs text-neutral-400 hover:text-white">
          View all
        </Link>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-neutral-900 animate-pulse" />
          ))}
        </div>
      )}
      {!loading && !items.length && (
        <p className="text-sm text-neutral-500">No history yet — generate a playlist to begin.</p>
      )}
      <ul className="space-y-1">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              href={`/history/${p.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-900 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                <HiSparkles className="text-spotify text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{p.playlistName || p.promptText}</div>
                <div className="text-[11px] text-neutral-500 truncate">
                  {relativeTime(p.createdAt)}
                </div>
              </div>
              <button
                type="button"
                aria-label="Play"
                onClick={(e) => e.preventDefault()}
                className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-300 hover:bg-spotify hover:text-black hover:border-transparent transition"
              >
                <FaPlay className="text-[10px] ml-0.5" />
              </button>
              <button
                type="button"
                aria-label="More"
                onClick={(e) => e.preventDefault()}
                className="text-neutral-500 hover:text-white"
              >
                <FiMoreVertical />
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
