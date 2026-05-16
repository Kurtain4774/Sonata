"use client";

import { useState } from "react";
import StatsTopArtists from "./stats/StatsTopArtists";
import StatsTopTracks from "./stats/StatsTopTracks";
import StatsRecentlyPlayed from "./stats/StatsRecentlyPlayed";

const TABS = [
  { key: "artists", label: "Top Artists" },
  { key: "tracks", label: "Top Tracks" },
  { key: "recent", label: "Recently Played" },
];

export default function StatsClient() {
  const [tab, setTab] = useState("artists");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 pb-28 md:pb-10">
      <h1 className="text-3xl font-semibold mb-6">Your Listening Stats</h1>

      <div className="flex gap-2 mb-6 border-b border-neutral-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.key
                ? "border-spotify text-white"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "artists" && <StatsTopArtists />}
      {tab === "tracks" && <StatsTopTracks />}
      {tab === "recent" && <StatsRecentlyPlayed />}
    </div>
  );
}
