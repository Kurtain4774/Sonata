"use client";

import { useCallback, useMemo, useState } from "react";

// Manages a set of selected track URIs and derives the selected track objects.
export function useTrackSelection(tracks) {
  const [selection, setSelection] = useState(() => new Set());

  const toggleSelection = useCallback((uri) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(uri)) next.delete(uri);
      else next.add(uri);
      return next;
    });
  }, []);

  const toggleAllVisible = useCallback((uris, makeSelected) => {
    setSelection((prev) => {
      const next = new Set(prev);
      for (const u of uris) {
        if (makeSelected) next.add(u);
        else next.delete(u);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelection(new Set()), []);

  const selectedTracks = useMemo(
    () => tracks.filter((t) => selection.has(t.uri)),
    [tracks, selection]
  );

  return {
    selection,
    selectedTracks,
    toggleSelection,
    toggleAllVisible,
    clearSelection,
  };
}
