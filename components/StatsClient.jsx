"use client";

import { useEffect, useMemo, useState } from "react";
import { FaSpotify } from "react-icons/fa";
import AudioPreview from "./AudioPreview";

const TABS = [
  { key: "artists", label: "Top Artists" },
  { key: "tracks", label: "Top Tracks" },
  { key: "recent", label: "Recently Played" },
];

const RANGES = [
  { key: "short_term", label: "Last 4 Weeks" },
  { key: "medium_term", label: "Last 6 Months" },
  { key: "long_term", label: "All Time" },
];

const INITIAL_VISIBLE = 20;

function RangeToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-neutral-800 bg-neutral-900 p-1">
      {RANGES.map((r) => (
        <button
          key={r.key}
          onClick={() => onChange(r.key)}
          className={`px-4 py-1.5 text-sm rounded-full transition ${
            value === r.key
              ? "bg-spotify text-black font-medium"
              : "text-neutral-300 hover:text-white"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function SkeletonRow({ withImage = true, circular = false }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 animate-pulse">
      <div className="w-6 text-right text-neutral-700">·</div>
      {withImage && (
        <div
          className={`w-14 h-14 bg-neutral-800 ${
            circular ? "rounded-full" : "rounded"
          }`}
        />
      )}
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-neutral-800 rounded w-1/2" />
        <div className="h-3 bg-neutral-800 rounded w-1/3" />
      </div>
    </div>
  );
}

function SkeletonList({ count = 6, circular = false }) {
  return (
    <div className="grid gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} circular={circular} />
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="p-8 text-center text-neutral-400 border border-neutral-800 rounded-lg bg-neutral-900">
      {message}
    </div>
  );
}

function formatDuration(ms) {
  if (!ms) return "";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function relativeTime(iso) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

function dayHeader(iso) {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function TopArtists() {
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
                {a.images?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.images[0].url}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-neutral-800" />
                )}
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

function TopTracks() {
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
        )}&artist=${encodeURIComponent(t.artist.split(",")[0].trim())}`
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
                {t.albumArt ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.albumArt}
                    alt=""
                    className="w-14 h-14 rounded object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded bg-neutral-800" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{t.title}</div>
                  <div className="truncate text-sm text-neutral-400">
                    {t.artist}
                  </div>
                </div>
                <div className="hidden sm:block text-xs text-neutral-500 tabular-nums">
                  {formatDuration(t.durationMs)}
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

function RecentlyPlayed() {
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
                {t.albumArt ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.albumArt}
                    alt=""
                    className="w-14 h-14 rounded object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded bg-neutral-800" />
                )}
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

export default function StatsClient() {
  const [tab, setTab] = useState("artists");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
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

      {tab === "artists" && <TopArtists />}
      {tab === "tracks" && <TopTracks />}
      {tab === "recent" && <RecentlyPlayed />}
    </div>
  );
}
