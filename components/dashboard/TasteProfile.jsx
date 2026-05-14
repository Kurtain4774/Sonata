"use client";

import { memo } from "react";

const TAG_STYLES = {
  Melodic: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  Chill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Atmospheric: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Upbeat: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  Nostalgic: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  Heavy: "bg-red-500/15 text-red-300 border-red-500/30",
  Soulful: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Lyrical: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

function TasteProfile({ data, loading }) {
  if (loading && !data) {
    return (
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 animate-pulse">
        <div className="h-3.5 w-28 bg-neutral-800 rounded mb-2" />
        <div className="h-2.5 w-44 bg-neutral-800 rounded mb-4" />
        <div className="flex flex-wrap gap-2">
          {[68, 84, 56, 72, 60].map((w, i) => (
            <div key={i} className="h-6 bg-neutral-800 rounded-full" style={{ width: w }} />
          ))}
        </div>
      </section>
    );
  }

  const tags = data?.tasteTags || [];
  const count = data?.savedPlaylists ?? null;

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h3 className="text-sm font-semibold mb-1">Taste Profile</h3>
      <p className="text-[11px] text-neutral-500 mb-3">
        Based on your last {count ?? "—"} playlists
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className={`px-3 py-1 rounded-full text-xs border ${TAG_STYLES[t] || "bg-neutral-800 text-neutral-300 border-neutral-700"}`}
          >
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

export default memo(TasteProfile);
