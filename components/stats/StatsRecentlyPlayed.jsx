"use client";

import { useEffect, useMemo, useState } from "react";
import { FaSpotify } from "react-icons/fa";
import AlbumArtImage from "@/components/AlbumArtImage";
import { relativeTime, dayHeader } from "@/lib/timeFormatters";
import { SkeletonList, EmptyState } from "./StatsPrimitives";

export default function StatsRecentlyPlayed() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/stats/recently-played")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed");
        return r.json();
      })
      .then((d) => !cancelled && setTracks(d.tracks || []))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    const map = new Map();
    for (const t of tracks) {
      const header = dayHeader(t.playedAt);
      if (!map.has(header)) map.set(header, []);
      map.get(header).push(t);
    }
    return Array.from(map.entries());
  }, [tracks]);

  if (loading) return <SkeletonList count={8} />;
  if (error) return <EmptyState message={error} />;
  if (tracks.length === 0)
    return <EmptyState message="No recent plays found." />;

  return (
    <div className="space-y-6">
      {groups.map(([header, items]) => (
        <div key={header} className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">
            {header}
          </h3>
          <ol className="grid gap-2">
            {items.map((t, i) => (
              <li
                key={`${t.id}-${t.playedAt}-${i}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition"
              >
                <AlbumArtImage
                  src={t.albumArt}
                  className="w-14 h-14 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{t.title}</div>
                  <div className="truncate text-sm text-neutral-400">
                    {t.artist}
                  </div>
                </div>
                <div className="text-xs text-neutral-500 whitespace-nowrap">
                  {relativeTime(t.playedAt)}
                </div>
                {t.spotifyUrl && (
                  <a
                    href={t.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-400 hover:text-spotify"
                    title="Open in Spotify"
                  >
                    <FaSpotify className="text-xl" />
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
