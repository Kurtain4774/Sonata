"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import PromptInput from "./PromptInput";
import VibeChips from "./VibeChips";
import FineTuneControls, { DEFAULT_FINE_TUNE } from "./FineTuneControls";
import TrackList from "./TrackList";
import PlaylistSaveButton from "./PlaylistSaveButton";
import WebPlaybackProvider from "./WebPlaybackProvider";
import MiniPlayer from "./MiniPlayer";

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

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [fineTune, setFineTune] = useState(DEFAULT_FINE_TUNE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [refineText, setRefineText] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineError, setRefineError] = useState(null);
  const refineInputRef = useRef(null);

  useEffect(() => {
    const initial = searchParams.get("prompt");
    if (initial) setPrompt(initial);
  }, [searchParams]);

  const generate = async (overridePrompt) => {
    const p = (overridePrompt ?? prompt).trim();
    if (!p) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setRefineText("");
    setRefineError(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p, context: fineTune }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResult({ ...data, originalPrompt: p });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refine = async () => {
    const followUp = refineText.trim();
    if (!followUp || !result) return;
    setRefineLoading(true);
    setRefineError(null);
    try {
      const res = await fetch("/api/recommend/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: result.originalPrompt,
          currentTracks: result.tracks.map(({ title, artist }) => ({ title, artist })),
          followUp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refinement failed");
      setResult((prev) => ({ ...prev, tracks: data.tracks }));
      setRefineText("");
      refineInputRef.current?.focus();
    } catch (err) {
      setRefineError(err.message);
    } finally {
      setRefineLoading(false);
    }
  };

  const appendVibe = (v) => {
    setPrompt((cur) => (cur ? `${cur.trim()} ${v.toLowerCase()}` : v.toLowerCase()));
  };

  return (
    <WebPlaybackProvider>
    <div className="max-w-3xl mx-auto px-6 pt-10 pb-28">
      <h1 className="text-3xl font-semibold text-center mb-6">
        What are you in the mood for?
      </h1>

      <PromptInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={() => generate()}
        loading={loading}
      />
      <FineTuneControls values={fineTune} onChange={setFineTune} />
      <VibeChips onPick={appendVibe} disabled={loading} />

      {error && (
        <div className="mt-6 p-4 rounded-lg bg-red-950 border border-red-900 text-red-200">
          {error}
        </div>
      )}

      <div className="mt-10">
        {loading && <Skeleton />}
        {result && !loading && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-2xl font-semibold">{result.playlistName}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generate(result.prompt)}
                  className="px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-sm"
                >
                  Try again
                </button>
                {result.tracks.length > 0 && (
                  <PlaylistSaveButton
                    promptId={result.promptId}
                    name={result.playlistName}
                    trackUris={result.tracks.map((t) => t.uri).filter(Boolean)}
                    tracks={result.tracks}
                  />
                )}
              </div>
            </div>

            {result.tracks.length === 0 ? (
              <p className="text-neutral-400">No matches found. Try a different prompt.</p>
            ) : (
              <>
                {refineLoading ? <Skeleton /> : <TrackList tracks={result.tracks} />}

                <div className="mt-6 border-t border-neutral-800 pt-5">
                  <p className="text-sm text-neutral-400 mb-3">Not quite right? Refine the vibe:</p>
                  <div className="flex gap-2">
                    <input
                      ref={refineInputRef}
                      type="text"
                      value={refineText}
                      onChange={(e) => setRefineText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !refineLoading && refine()}
                      placeholder="Refine: more upbeat, less pop, add 90s songs..."
                      disabled={refineLoading}
                      className="flex-1 px-4 py-2.5 rounded-full bg-neutral-900 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 disabled:opacity-50"
                    />
                    <button
                      onClick={refine}
                      disabled={refineLoading || !refineText.trim()}
                      className="px-5 py-2.5 rounded-full bg-neutral-700 hover:bg-neutral-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {refineLoading ? "Refining…" : "Refine"}
                    </button>
                  </div>
                  {refineError && (
                    <p className="mt-2 text-sm text-red-300">{refineError}</p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
    <MiniPlayer />
    </WebPlaybackProvider>
  );
}
