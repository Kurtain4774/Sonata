"use client";
import { useState, useCallback } from "react";
import HistoryCard from "./HistoryCard";
import MergeModal from "./MergeModal";

export default function HistoryPageClient({ items }) {
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState(new Map());
  const [showModal, setShowModal] = useState(false);

  const toggleTrack = useCallback((track) => {
    setSelectedTracks((prev) => {
      const next = new Map(prev);
      if (next.has(track.uri)) {
        next.delete(track.uri);
      } else {
        next.set(track.uri, track);
      }
      return next;
    });
  }, []);

  const exitMergeMode = () => {
    setMergeMode(false);
    setSelectedTracks(new Map());
  };

  return (
    <>
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={() => (mergeMode ? exitMergeMode() : setMergeMode(true))}
          className={
            "px-4 py-2 rounded-full text-sm font-medium transition " +
            (mergeMode
              ? "bg-spotify text-black"
              : "border border-neutral-700 text-neutral-300 hover:border-neutral-500")
          }
        >
          {mergeMode ? "Exit Merge Mode" : "Merge Mode"}
        </button>
      </div>

      <div className={`grid gap-3 ${mergeMode ? "" : "sm:grid-cols-2"} ${mergeMode && selectedTracks.size > 0 ? "pb-24" : ""}`}>
        {items.map((item) =>
          mergeMode ? (
            <MergeHistoryCard
              key={item.id}
              item={item}
              selectedTracks={selectedTracks}
              onToggleTrack={toggleTrack}
            />
          ) : (
            <HistoryCard key={item.id} item={item} />
          )
        )}
      </div>

      {mergeMode && selectedTracks.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur border-t border-neutral-700 px-6 py-4 flex items-center justify-between gap-4 z-40">
          <span className="text-sm text-neutral-300">
            <span className="font-semibold text-white">{selectedTracks.size}</span>{" "}
            track{selectedTracks.size !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2 bg-spotify text-black rounded-full text-sm font-semibold hover:bg-spotify/90 transition"
          >
            Create merged playlist
          </button>
        </div>
      )}

      {showModal && (
        <MergeModal
          tracks={[...selectedTracks.values()]}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function MergeHistoryCard({ item, selectedTracks, onToggleTrack }) {
  const mergeableTracks = item.tracks.filter((t) => t.uri);

  return (
    <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
      <div className="p-4 border-b border-neutral-800">
        <div className="font-medium truncate">
          {item.playlistName || item.promptText}
        </div>
        <div className="text-sm text-neutral-400 truncate">
          &ldquo;{item.promptText}&rdquo;
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          {mergeableTracks.length} tracks available
        </div>
      </div>
      {mergeableTracks.length === 0 ? (
        <div className="px-4 py-3 text-sm text-neutral-500">
          No tracks with Spotify URIs in this entry.
        </div>
      ) : (
        <div className="divide-y divide-neutral-800">
          {mergeableTracks.map((track) => (
            <label
              key={track.uri}
              className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedTracks.has(track.uri)}
                onChange={() => onToggleTrack(track)}
                className="w-4 h-4 rounded accent-spotify shrink-0"
              />
              {track.albumArt ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={track.albumArt}
                  alt=""
                  className="w-10 h-10 rounded object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-neutral-800 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{track.title}</div>
                <div className="truncate text-xs text-neutral-400">{track.artist}</div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
