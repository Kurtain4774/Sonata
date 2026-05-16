"use client";

import { memo } from "react";
import Link from "next/link";
import { HiSparkles } from "react-icons/hi";
import { FiClock } from "react-icons/fi";
import LoadingSpinner from "./LoadingSpinner";
import { shortRelativeTime } from "@/lib/timeFormatters";

function RecentHistoryWidget({ data, loading }) {
  const items = (data?.prompts || []).slice(0, 4);
  const isLoading = loading && !data;

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiClock className="text-neutral-400" />
          <h3 className="text-sm font-semibold">Recent History</h3>
        </div>
        <Link href="/your-music" className="text-xs text-neutral-400 hover:text-white">
          View all
        </Link>
      </div>

      {isLoading && <LoadingSpinner label="Loading history…" />}
      {!isLoading && !items.length && (
        <p className="text-sm text-neutral-500">No history yet — generate a playlist to begin.</p>
      )}
      <ul className="space-y-1">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              href={`/your-music/${p.id}`}
              aria-label={`Open ${p.playlistName || p.promptText}, ${shortRelativeTime(p.createdAt)}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-900 transition-colors group focus-visible:ring-2 focus-visible:ring-spotify focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                <HiSparkles className="text-spotify text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{p.playlistName || p.promptText}</div>
                <div className="text-[11px] text-neutral-500 truncate">
                  {shortRelativeTime(p.createdAt)}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default memo(RecentHistoryWidget);
