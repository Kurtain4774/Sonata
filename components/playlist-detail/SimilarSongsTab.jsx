"use client";
import { useEffect, useState } from "react";
import TrackTable from "./TrackTable";

export default function SimilarSongsTab({ promptId, currentTracks, onAdd }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let cancelled = false;
    async function load() {
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
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [promptId]);

  if (loading) {
    return (
      <div className="py-16 text-center text-neutral-500 text-sm">
        Finding similar songs…
      </div>
    );
  }
  if (error) {
    return (
      <div className="py-16 text-center text-rose-400 text-sm">{error}</div>
    );
  }
  return (
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
  );
}
