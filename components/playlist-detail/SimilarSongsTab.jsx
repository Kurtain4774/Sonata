"use client";
import { useCallback, useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import TrackTable from "./TrackTable";

export default function SimilarSongsTab({ promptId, currentTracks, onAdd }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommend/similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId, currentTracks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTracks(data.tracks || []);
      setPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [promptId, currentTracks]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/recommend/similar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promptId, currentTracks }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        if (!cancelled) setTracks(data.tracks || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId]);

  const header = (
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-neutral-400">
        AI-picked songs that match this playlist&apos;s vibe.
      </p>
      <button
        onClick={load}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 disabled:opacity-50"
      >
        <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );

  if (loading && tracks.length === 0) {
    return (
      <>
        {header}
        <div className="py-16 text-center text-neutral-500 text-sm">
          Finding similar songs…
        </div>
      </>
    );
  }
  if (error) {
    return (
      <>
        {header}
        <div className="py-16 text-center text-rose-400 text-sm">{error}</div>
      </>
    );
  }
  if (tracks.length === 0) {
    return (
      <>
        {header}
        <div className="py-16 text-center text-neutral-500 text-sm">
          No similar songs found yet. Try refreshing.
        </div>
      </>
    );
  }
  return (
    <>
      {header}
      <TrackTable
        tracks={tracks}
        readOnly
        onAddOne={onAdd}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(n) => {
          setRowsPerPage(n);
          setPage(1);
        }}
      />
    </>
  );
}
