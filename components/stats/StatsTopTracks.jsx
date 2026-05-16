"use client";

import { useEffect, useMemo, useState } from "react";
import { FaSpotify } from "react-icons/fa";
import AudioPreview from "@/components/AudioPreview";
import AlbumArtImage from "@/components/AlbumArtImage";
import { formatDuration } from "@/lib/timeFormatters";
import { getFirstArtist } from "@/lib/trackHelpers";
import { RangeToggle, SkeletonList, EmptyState, INITIAL_VISIBLE } from "./StatsPrimitives";

export default function StatsTopTracks() {
  const [range, setRange] = useState("medium_term");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setShowAll(false);
    setPreviews({});
    fetch(`/api/stats/top-tracks?time_range=${range}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed");
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setTracks(d.tracks || []);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  const visible = useMemo(
    () => (showAll ? tracks : tracks.slice(0, INITIAL_VISIBLE)),
    [tracks, showAll]
  );

  useEffect(() => {
    let cancelled = false;
    visible.forEach((t) => {
      if (!t.id || previews[t.id] !== undefined) return;
      setPreviews((p) => ({ ...p, [t.id]: null }));
      fetch(
        `/api/stats/preview?title=${encodeURIComponent(
          t.title
        )}&artist=${encodeURIComponent(getFirstArtist(t))}`
      )
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          setPreviews((p) => ({ ...p, [t.id]: d.previewUrl || null }));
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <div className="space-y-4">
      <RangeToggle value={range} onChange={setRange} />
      {loading ? (
        <SkeletonList />
      ) : error ? (
        <EmptyState message={error} />
      ) : tracks.length === 0 ? (
        <EmptyState message="No top tracks yet — listen on Spotify and check back." />
      ) : (
        <>
          <ol className="grid gap-2">
            {visible.map((t, i) => (
              <li
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition"
              >
                <div className="w-6 text-right text-neutral-500 tabular-nums">
                  {i + 1}
                </div>
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
                <div className="hidden sm:block text-xs text-neutral-500 tabular-nums">
                  {formatDuration(t.durationMs, "")}
                </div>
                <AudioPreview
                  url={previews[t.id] || null}
                  spotifyUrl={t.spotifyUrl}
                />
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
          {!showAll && tracks.length > INITIAL_VISIBLE && (
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
