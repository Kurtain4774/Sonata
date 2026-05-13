"use client";

import { useEffect, useState } from "react";
import ExploreCard from "./ExploreCard";

function CardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 animate-pulse">
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-12 h-12 rounded bg-neutral-800" />
        ))}
      </div>
      <div className="h-3 bg-neutral-800 rounded w-4/5 mb-2" />
      <div className="h-3 bg-neutral-800 rounded w-2/5" />
    </div>
  );
}

export default function ExploreClient() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = async (pageNum, append = false) => {
    try {
      const res = await fetch(`/api/explore?page=${pageNum}`);
      if (!res.ok) throw new Error("Failed to load explore feed");
      const data = await res.json();
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPage(1).finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    await fetchPage(page + 1, true);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-950 border border-red-900 text-red-200 text-sm">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-500">
        <p className="text-lg">No shared playlists yet.</p>
        <p className="text-sm mt-1">Save a playlist and share it to be the first!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ExploreCard key={item.id} item={item} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-sm font-medium disabled:opacity-60 transition-colors"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
