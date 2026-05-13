"use client";

import { useEffect, useState } from "react";
import SpotifyPlaylistCard from "./SpotifyPlaylistCard";

export default function CurrentPlaylistsClient() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/spotify/playlists")
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error || `Request failed: ${r.status}`);
        }
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[92px] rounded-xl bg-neutral-900 border border-neutral-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-300">
        Couldn’t load your Spotify playlists: {error}
      </div>
    );
  }

  const playlists = data?.playlists || [];
  const liked = data?.liked;

  return (
    <div className="grid gap-3">
      {liked && (
        <SpotifyPlaylistCard
          playlist={{
            spotifyUrl: liked.spotifyUrl,
            trackCount: liked.trackCount,
            thumbnails: liked.thumbnails,
          }}
          variant="liked"
        />
      )}
      {playlists.length === 0 ? (
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-400">
          You don’t have any Spotify playlists yet.
        </div>
      ) : (
        playlists.map((p) => <SpotifyPlaylistCard key={p.id} playlist={p} />)
      )}
    </div>
  );
}
