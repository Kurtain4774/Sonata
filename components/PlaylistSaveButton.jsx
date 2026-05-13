"use client";

import { useEffect, useRef, useState } from "react";
import { FaSpotify, FaPlay } from "react-icons/fa";
import { FiLink } from "react-icons/fi";
import ShareToggle from "./ShareToggle";
import { useSettings } from "./SettingsContext";

export default function PlaylistSaveButton({ promptId, name, trackUris, tracks, initialSaved, initialUrl, initialShared = false }) {
  const [status, setStatus] = useState(initialSaved ? "saved" : "idle");
  const [url, setUrl] = useState(initialUrl || null);
  const [error, setError] = useState(null);
  const [queueStatus, setQueueStatus] = useState("idle");
  const [queueMessage, setQueueMessage] = useState(null);
  const [shareStatus, setShareStatus] = useState("idle");
  const [autoSaveToast, setAutoSaveToast] = useState(false);
  const settings = useSettings();
  const autoSaveFiredRef = useRef(false);

  const save = async () => {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId, name, trackUris, tracks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setUrl(data.playlistUrl);
      setStatus("saved");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  useEffect(() => {
    if (autoSaveFiredRef.current) return;
    if (!settings.autoSaveToSpotify) return;
    if (status !== "idle") return;
    if (!trackUris || trackUris.length === 0) return;
    autoSaveFiredRef.current = true;
    (async () => {
      await save();
      setAutoSaveToast(true);
      setTimeout(() => setAutoSaveToast(false), 3500);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.autoSaveToSpotify, trackUris, status]);

  const playNow = async () => {
    setQueueStatus("queuing");
    setQueueMessage(null);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackUris }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setQueueMessage({ type: "error", text: "Open Spotify on any device first, then try again." });
        setQueueStatus("idle");
        return;
      }
      if (res.status === 403) {
        setQueueMessage({ type: "error", text: "Spotify Premium is required for queue control." });
        setQueueStatus("idle");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Queue failed");
      setQueueMessage({ type: "success", text: `${data.queued} tracks added to your queue.` });
      setQueueStatus("idle");
      setTimeout(() => setQueueMessage(null), 4000);
    } catch (err) {
      setQueueMessage({ type: "error", text: err.message });
      setQueueStatus("idle");
    }
  };

  const share = async () => {
    if (!promptId) return;
    setShareStatus("sharing");
    try {
      const res = await fetch(`/api/share/${promptId}`, { method: "POST" });
      if (!res.ok) throw new Error("Share failed");
      await navigator.clipboard.writeText(`${window.location.origin}/share/${promptId}`);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 3000);
    } catch {
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 3000);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {status === "saved" && promptId && (
        <ShareToggle promptId={promptId} initialShared={initialShared} />
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={playNow}
          disabled={queueStatus === "queuing"}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold disabled:opacity-60 transition-colors"
        >
          <FaPlay className="text-sm" />
          {queueStatus === "queuing" ? "Queuing…" : "Play Now"}
        </button>

        {status === "saved" && url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-spotify hover:brightness-110 text-black font-semibold"
          >
            <FaSpotify /> Open in Spotify
          </a>
        ) : (
          <button
            onClick={save}
            disabled={status === "saving"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-spotify hover:brightness-110 text-black font-semibold disabled:opacity-60"
          >
            <FaSpotify />
            {status === "saving" ? "Saving…" : "Save to Spotify"}
          </button>
        )}

        {status === "saved" && promptId && (
          <button
            onClick={share}
            disabled={shareStatus === "sharing"}
            title="Copy share link"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-600 text-sm text-neutral-200 disabled:opacity-60 transition-colors"
          >
            <FiLink className="w-4 h-4" />
            {shareStatus === "sharing" ? "Sharing…" : shareStatus === "copied" ? "Copied!" : "Share"}
          </button>
        )}
      </div>

      {error && <span className="text-sm text-red-300">{error}</span>}
      {shareStatus === "copied" && (
        <span className="text-sm text-green-300">Share link copied to clipboard!</span>
      )}
      {shareStatus === "error" && (
        <span className="text-sm text-red-300">Could not copy link — try again.</span>
      )}
      {queueMessage && (
        <span className={`text-sm ${queueMessage.type === "success" ? "text-green-300" : "text-amber-300"}`}>
          {queueMessage.text}
        </span>
      )}
      {autoSaveToast && (
        <span className="text-sm text-spotify">Auto-saved to Spotify</span>
      )}
    </div>
  );
}
