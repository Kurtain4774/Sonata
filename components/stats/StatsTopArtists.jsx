"use client";

import { useEffect, useState } from "react";
import { FaSpotify } from "react-icons/fa";
import AlbumArtImage from "@/components/AlbumArtImage";
import { RangeToggle, SkeletonList, EmptyState, INITIAL_VISIBLE } from "./StatsPrimitives";

export default function StatsTopArtists() {
  const [range, setRange] = useState("medium_term");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setShowAll(false);
    fetch(`/api/stats/top-artists?time_range=${range}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed");
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setArtists(d.artists || []);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  const visible = showAll ? artists : artists.slice(0, INITIAL_VISIBLE);

  return (
    <div className="space-y-4">
      <RangeToggle value={range} onChange={setRange} />
      {loading ? (
        <SkeletonList circular />
      ) : error ? (
        <EmptyState message={error} />
      ) : artists.length === 0 ? (
        <EmptyState message="No top artists yet — listen on Spotify and check back." />
      ) : (
        <>
          <ol className="grid gap-2">
            {visible.map((a, i) => (
              <li
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition"
              >
                <div className="w-6 text-right text-neutral-500 tabular-nums">
                  {i + 1}
                </div>
                <AlbumArtImage
                  src={a.images?.[0]?.url}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{a.name}</div>
                  {a.genres?.length > 0 && (
                    <div className="truncate text-sm text-neutral-400">
                      {a.genres.slice(0, 3).join(", ")}
                    </div>
                  )}
                </div>
                {a.spotifyUrl && (
                  <a
                    href={a.spotifyUrl}
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
          {!showAll && artists.length > INITIAL_VISIBLE && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-2 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-neutral-700 text-sm text-neutral-300"
            >
              Show more
            </button>
          )}
        </>
      )}
    </div>
  );
}
