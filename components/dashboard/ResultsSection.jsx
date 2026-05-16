"use client";

import { memo, useMemo, useRef, useState } from "react";
import TrackList from "../TrackList";
import PlaylistSaveButton from "../PlaylistSaveButton";
import RefinementInput from "./RefinementInput";
import FineTuneControls from "../FineTuneControls";

function Skeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 animate-pulse"
        >
          <div className="w-14 h-14 rounded bg-neutral-800" />
          <div className="flex-1">
            <div className="h-3 bg-neutral-800 rounded w-3/4 mb-2" />
            <div className="h-3 bg-neutral-800 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultsSection({
  result,
  loading,
  error,
  refineText,
  refineLoading,
  refineError,
  swappingKey,
  excludedArtists,
  excludedSongKeys,
  onRefineTextChange,
  onRefine,
  onAddExcludedArtist,
  onRemoveExcludedArtist,
  onExcludeSong,
  onSwap,
  onBuildAround,
  songKey,
  onGenerate,
  fineTune,
  onFineTuneChange,
  onRegenerate,
  resultsRef,
  refineInputRef,
}) {
  const [excludeInput, setExcludeInput] = useState("");
  const [showExcludeInput, setShowExcludeInput] = useState(false);

  const visibleTracks = useMemo(
    () => (result?.tracks || []).filter((t) => !excludedSongKeys.has(songKey(t))),
    [result?.tracks, excludedSongKeys, songKey]
  );

  return (
    <div ref={resultsRef}>
      {loading && !result && <Skeleton />}
      {error && (
        <div className="p-4 rounded-lg bg-red-950 border border-red-900 text-red-200">
          {error}
        </div>
      )}
      {result && (
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              {result.playlistName}
              {result.streaming && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-spotify/10 border border-spotify/30 text-[11px] font-medium text-spotify">
                  <span className="w-1.5 h-1.5 rounded-full bg-spotify animate-pulse" />
                  Loading {result.tracks.length}/{result.total ?? "…"}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onGenerate(result.prompt)}
                disabled={loading}
                className="px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-sm disabled:opacity-50"
              >
                Try again
              </button>
              {result.tracks.length > 0 && !result.streaming && (
                <PlaylistSaveButton
                  promptId={result.promptId}
                  name={result.playlistName}
                  trackUris={result.tracks.map((t) => t.uri).filter(Boolean)}
                  tracks={result.tracks}
                />
              )}
            </div>
          </div>

          {visibleTracks.length === 0 && !result.streaming ? (
            <p className="text-neutral-400">No matches found. Try a different prompt.</p>
          ) : (
            <>
              {refineLoading ? (
                <Skeleton />
              ) : (
                <>
                  <TrackList
                    tracks={visibleTracks}
                    autoplayFirst
                    onExcludeArtist={onAddExcludedArtist}
                    onExcludeSong={onExcludeSong}
                    onSwap={!result.streaming ? onSwap : undefined}
                    onBuildAround={onBuildAround}
                    swappingKey={swappingKey}
                    getTrackKey={songKey}
                  />
                  {result.streaming && (result.total ?? 0) > result.tracks.length && (
                    <div className="mt-3 grid md:grid-cols-2 gap-3">
                      {Array.from({
                        length: Math.min((result.total ?? 0) - result.tracks.length, 6),
                      }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 animate-pulse"
                        >
                          <div className="w-14 h-14 rounded bg-neutral-800" />
                          <div className="flex-1">
                            <div className="h-3 bg-neutral-800 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-neutral-800 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="mt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-neutral-500">
                    Excluded
                  </span>
                  {excludedArtists.length === 0 && !showExcludeInput && (
                    <span className="text-xs text-neutral-500">none yet</span>
                  )}
                  {excludedArtists.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => onRemoveExcludedArtist(a)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/40 border border-red-900/60 text-xs text-red-200 hover:bg-red-900/40"
                      title="Remove exclusion"
                    >
                      {a}
                      <span aria-hidden>×</span>
                    </button>
                  ))}
                  {showExcludeInput ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        onAddExcludedArtist(excludeInput);
                        setExcludeInput("");
                        setShowExcludeInput(false);
                      }}
                      className="flex items-center gap-1"
                    >
                      <input
                        autoFocus
                        type="text"
                        value={excludeInput}
                        onChange={(e) => setExcludeInput(e.target.value)}
                        onBlur={() => {
                          if (!excludeInput.trim()) setShowExcludeInput(false);
                        }}
                        placeholder="Artist name"
                        className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                      />
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowExcludeInput(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 hover:bg-neutral-800"
                    >
                      + Add artist
                    </button>
                  )}
                  {excludedArtists.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onGenerate(result.prompt)}
                      disabled={loading}
                      className="ml-auto px-3 py-1 rounded-full bg-spotify text-black text-xs font-semibold hover:brightness-110 disabled:opacity-50"
                    >
                      Regenerate to apply
                    </button>
                  )}
                </div>
              </div>

              {/* Adjust the mix — fine-tune context, then re-generate */}
              {onFineTuneChange && (
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-wide text-neutral-500">
                      Adjust the mix
                    </span>
                    <button
                      type="button"
                      onClick={onRegenerate}
                      disabled={loading}
                      className="px-3 py-1 rounded-full bg-spotify text-black text-xs font-semibold hover:brightness-110 disabled:opacity-50"
                    >
                      Apply &amp; regenerate
                    </button>
                  </div>
                  <FineTuneControls values={fineTune} onChange={onFineTuneChange} />
                </div>
              )}

              <RefinementInput
                refineText={refineText}
                refineLoading={refineLoading}
                refineError={refineError}
                onChange={onRefineTextChange}
                onSubmit={onRefine}
                inputRef={refineInputRef}
              />
            </>
          )}
        </section>
      )}
    </div>
  );
}

export default memo(ResultsSection);
