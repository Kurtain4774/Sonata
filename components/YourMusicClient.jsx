"use client";

import { useState } from "react";
import Link from "next/link";
import HistoryPageClient from "./HistoryPageClient";
import CurrentPlaylistsClient from "./CurrentPlaylistsClient";

const TABS = [
  { id: "generated", label: "Generated Playlists" },
  { id: "current", label: "Current Playlists" },
];

export default function YourMusicClient({ generated }) {
  const [tab, setTab] = useState("generated");

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

      {tab === "generated" ? (
        generated.length === 0 ? (
          <p className="text-neutral-400">
            No playlists yet.{" "}
            <Link href="/dashboard" className="text-spotify hover:underline">
              Go generate your first one
            </Link>
            .
          </p>
        ) : (
          <HistoryPageClient items={generated} />
        )
      ) : (
        <CurrentPlaylistsClient />
      )}
    </>
  );
}
