"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiExternalLink } from "react-icons/fi";

function ConnectedRow({ name, badgeText = "Connected", external }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-100">{name}</span>
        {external && (
          <a
            href={external}
            target="_blank"
            rel="noreferrer"
            className="text-neutral-400 hover:text-neutral-200"
            aria-label={`Manage ${name}`}
          >
            <FiExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-spotify">
        <span className="w-1.5 h-1.5 rounded-full bg-spotify" />
        {badgeText}
      </span>
    </div>
  );
}

export default function DataPrivacyTab({ user, onClose }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);

  const exportData = () => {
    window.location.href = "/api/settings/export";
  };

  const clearHistory = async () => {
    setClearing(true);
    setError(null);
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear history");
      onClose?.();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setClearing(false);
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-neutral-100 mb-1">Export my data</div>
        <p className="text-xs text-neutral-400 mb-3">
          Download a JSON file with all your prompts, recommendations, and playlist history.
        </p>
        <button
          type="button"
          onClick={exportData}
          className="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm text-neutral-100"
        >
          Download sonata-export.json
        </button>
      </div>

      <div>
        <div className="text-sm font-medium text-neutral-100 mb-1">Clear prompt history</div>
        <p className="text-xs text-neutral-400 mb-3">
          Permanently delete all of your prompt history.
        </p>
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="px-4 py-2 rounded-md bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-700/40 text-sm"
          >
            Clear prompt history
          </button>
        ) : (
          <div className="rounded-lg border border-red-700/40 bg-red-900/10 p-3">
            <p className="text-sm text-red-200">
              Are you sure? This will permanently delete all your prompt history and cannot be undone.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={clearHistory}
                disabled={clearing}
                className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-medium disabled:opacity-60"
              >
                {clearing ? "Clearing…" : "Yes, delete everything"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={clearing}
                className="px-4 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm"
              >
                Cancel
              </button>
            </div>
            {error && <div className="text-xs text-red-300 mt-2">{error}</div>}
          </div>
        )}
      </div>

      <div>
        <div className="text-sm font-medium text-neutral-100 mb-1">Connected accounts</div>
        <div className="divide-y divide-neutral-800">
          <ConnectedRow
            name={user?.name ? `Spotify — ${user.name}` : "Spotify"}
            external="https://www.spotify.com/account/apps/"
          />
          <ConnectedRow name="Deezer" />
          <ConnectedRow name="Gemini" />
        </div>
      </div>
    </div>
  );
}
