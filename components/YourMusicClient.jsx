"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import HistoryPageClient from "./HistoryPageClient";
import CurrentPlaylistsClient from "./CurrentPlaylistsClient";

const TABS = [
  { id: "generated", label: "Generated Playlists" },
  { id: "current", label: "Current Playlists" },
];

export default function YourMusicClient({ generated }) {
  const [tab, setTab] = useState("generated");
  const [query, setQuery] = useState("");

  const filteredGenerated = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return generated;
    return generated.filter((item) => {
      const hay = [item.playlistName, item.promptText]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [generated, query]);

  return (
    <>
      <h1 className="text-3xl font-semibold mb-4">Your Music</h1>

      <div className="flex items-center gap-6 border-b border-neutral-800 mb-6 text-sm">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative pb-3 transition-colors ${
                active ? "text-spotify" : "text-neutral-300 hover:text-white"
              }`}
            >
              {t.label}
              {active && (
                <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-spotify rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            tab === "generated"
              ? "Search by playlist name or prompt..."
              : "Filtering applies to your generated playlists"
          }
          disabled={tab !== "generated"}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>

      {tab === "generated" ? (
        generated.length === 0 ? (
          <p className="text-neutral-400">
            No playlists yet.{" "}
            <Link href="/dashboard" className="text-spotify hover:underline">
              Go generate your first one
            </Link>
            .
          </p>
        ) : filteredGenerated.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            No playlists match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <HistoryPageClient items={filteredGenerated} />
        )
      ) : (
        <CurrentPlaylistsClient />
      )}
    </>
  );
}
