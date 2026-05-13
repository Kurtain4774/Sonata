"use client";
import { useState } from "react";
import { FiX } from "react-icons/fi";
import { FaSpotify } from "react-icons/fa";

export default function MergeModal({ tracks, onClose }) {
  const [name, setName] = useState("Sonata Mix");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      const uris = tracks.map((t) => t.uri).filter(Boolean);
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), trackUris: uris }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create playlist");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">
            {result ? "Playlist created!" : "Create merged playlist"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 transition"
            aria-label="Close"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {result ? (
          <div className="text-center py-4">
            <div className="flex justify-center text-spotify text-5xl mb-4">
              <FaSpotify />
            </div>
            <p className="text-neutral-300 mb-5">
              &ldquo;{name}&rdquo; was added to your Spotify library.
            </p>
            <a
              href={result.playlistUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 bg-spotify text-black rounded-full text-sm font-semibold hover:bg-spotify/90 transition"
            >
              <FaSpotify />
              Open in Spotify
            </a>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-400 mb-4">
              {tracks.length} track{tracks.length !== 1 ? "s" : ""} selected
            </p>
            <label className="block text-sm text-neutral-400 mb-1.5">
              Playlist name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !saving && name.trim() && handleCreate()}
              className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-spotify mb-4 transition"
              placeholder="Sonata Mix"
            />
            {error && (
              <p className="text-red-400 text-sm mb-3">{error}</p>
            )}
            <button
              onClick={handleCreate}
              disabled={saving || !name.trim()}
              className="w-full py-2.5 bg-spotify text-black rounded-full font-semibold hover:bg-spotify/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating…" : "Create playlist"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
