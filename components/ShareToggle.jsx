"use client";

import { useState } from "react";
import { FiGlobe, FiLock } from "react-icons/fi";

export default function ShareToggle({ promptId, initialShared = false }) {
  const [shared, setShared] = useState(initialShared);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/explore/share", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId, shared: !shared }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setShared(data.sharedToExplore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={toggle}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-60 ${
          shared
            ? "bg-spotify/20 text-spotify border border-spotify/40 hover:bg-spotify/30"
            : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:text-white"
        }`}
      >
        {shared ? <FiGlobe className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
        {loading ? "Saving…" : shared ? "Shared to Explore" : "Share to Explore"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
