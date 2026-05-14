"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import TrackList from "./TrackList";
import PlaylistSaveButton from "./PlaylistSaveButton";
import WebPlaybackProvider from "./WebPlaybackProvider";
import { DEFAULT_FINE_TUNE } from "./FineTuneControls";

import { useToast } from "./ToastContext";
import HeroPromptCard from "./dashboard/HeroPromptCard";
import StatTiles from "./dashboard/StatTiles";
import RecommendedRow from "./dashboard/RecommendedRow";
import RecentHistoryWidget from "./dashboard/RecentHistoryWidget";
import TrendingMoods from "./dashboard/TrendingMoods";
import CommunityPicks from "./dashboard/CommunityPicks";
import NowPlayingPanel from "./dashboard/NowPlayingPanel";
import ListeningInsights from "./dashboard/ListeningInsights";
import TasteProfile from "./dashboard/TasteProfile";

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
  const toast = useToast();
  const [prompt, setPrompt] = useState("");
  const [fineTune, setFineTune] = useState(DEFAULT_FINE_TUNE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [refineText, setRefineText] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineError, setRefineError] = useState(null);
  const refineInputRef = useRef(null);
  const resultsRef = useRef(null);

  const [excludedArtists, setExcludedArtists] = useState([]);
  const [excludedSongKeys, setExcludedSongKeys] = useState(() => new Set());
  const [excludeInput, setExcludeInput] = useState("");
  const [showExcludeInput, setShowExcludeInput] = useState(false);

  const songKey = (t) =>
    `${(t.title || "").toLowerCase()}|${(t.artist || "").toLowerCase()}`;

  const addExcludedArtist = (name) => {
    const clean = (name || "").trim();
    if (!clean) return;
    setExcludedArtists((prev) =>
      prev.some((a) => a.toLowerCase() === clean.toLowerCase()) ? prev : [...prev, clean]
    );
  };
  const removeExcludedArtist = (name) => {
    setExcludedArtists((prev) => prev.filter((a) => a !== name));
  };
  const excludeSong = (track) => {
    setExcludedSongKeys((prev) => {
      const next = new Set(prev);
      next.add(songKey(track));
      return next;
    });
  };

  const [swappingKey, setSwappingKey] = useState(null);
  const seedAutoFiredRef = useRef(false);

  const generate = async (overridePrompt, seed = null) => {
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
        body: JSON.stringify({
          prompt: p,
          context: fineTune,
          excludedArtists,
          ...(seed ? { seed } : {}),
        }),
      });
      if (!res.ok || !res.body) {
        let msg = "Something went wrong";
        try {
          const data = await res.json();
          msg = data.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let scrolled = false;
      let streamError = null;

      const handleFrame = (frame) => {
        if (frame.type === "meta") {
          setResult({
            playlistName: frame.playlistName,
            prompt: frame.prompt,
            originalPrompt: p,
            seed: seed || null,
            tracks: [],
            total: frame.total,
            promptId: null,
            streaming: true,
          });
          if (!scrolled) {
            scrolled = true;
            requestAnimationFrame(() =>
              resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            );
          }
        } else if (frame.type === "track") {
          setResult((prev) =>
            prev ? { ...prev, tracks: [...prev.tracks, frame.track] } : prev
          );
        } else if (frame.type === "done") {
          setResult((prev) =>
            prev ? { ...prev, promptId: frame.promptId, streaming: false } : prev
          );
        } else if (frame.type === "error") {
          streamError = frame.message || "Recommendation failed";
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            handleFrame(JSON.parse(trimmed));
          } catch {}
        }
      }
      if (buffer.trim()) {
        try {
          handleFrame(JSON.parse(buffer.trim()));
        } catch {}
      }
      if (streamError) throw new Error(streamError);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = searchParams.get("prompt");
    if (initial) setPrompt(initial);
    const seedTitle = searchParams.get("seedTitle");
    const seedArtist = searchParams.get("seedArtist");
    if (seedTitle && seedArtist && !seedAutoFiredRef.current) {
      seedAutoFiredRef.current = true;
      const auto = initial || `songs like ${seedTitle} by ${seedArtist}`;
      setPrompt(auto);
      generate(auto, { title: seedTitle, artist: seedArtist });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
          excludedArtists,
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

  const swapTrack = async (track) => {
    if (!result || swappingKey) return;
    const key = songKey(track);
    setSwappingKey(key);
    try {
      const res = await fetch("/api/recommend/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: result.originalPrompt,
          currentTracks: result.tracks.map(({ title, artist }) => ({ title, artist })),
          trackToReplace: { title: track.title, artist: track.artist },
          excludedArtists,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Swap failed");
      setResult((prev) => {
        if (!prev) return prev;
        const next = prev.tracks.map((t) => (songKey(t) === key ? data.track : t));
        return { ...prev, tracks: next };
      });
    } catch (err) {
      toast({ type: "error", message: err.message || "Swap failed" });
    } finally {
      setSwappingKey(null);
    }
  };

  const buildAround = (track) => {
    const auto = `songs like ${track.title} by ${track.artist}`;
    setPrompt(auto);
    generate(auto, { title: track.title, artist: track.artist });
  };

  const appendVibe = (v) => {
    setPrompt((cur) => (cur ? `${cur.trim()} ${v.toLowerCase()}` : v.toLowerCase()));
  };

  const handlePickMood = (moodPrompt) => {
    if (!moodPrompt) return;
    setPrompt(moodPrompt);
    generate(moodPrompt);
  };

  return (
    <WebPlaybackProvider>
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 pb-28 lg:pb-6">
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6">
          <div className="space-y-6">
            <HeroPromptCard
              prompt={prompt}
              onChange={setPrompt}
              onSubmit={() => generate()}
              loading={loading}
              onPickVibe={appendVibe}
              fineTune={fineTune}
              onFineTuneChange={setFineTune}
            />

            <StatTiles />

            <RecommendedRow />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RecentHistoryWidget />
              <TrendingMoods onPickMood={handlePickMood} />
              <CommunityPicks />
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-950 border border-red-900 text-red-200">
                {error}
              </div>
            )}

            <div ref={resultsRef}>
              {loading && !result && <Skeleton />}
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
                        onClick={() => generate(result.prompt)}
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

                  {(() => {
                    const visibleTracks = result.tracks.filter(
                      (t) => !excludedSongKeys.has(songKey(t))
                    );
                    if (visibleTracks.length === 0 && !result.streaming) {
                      return (
                        <p className="text-neutral-400">
                          No matches found. Try a different prompt.
                        </p>
                      );
                    }
                    const remaining = Math.max(
                      0,
                      (result.total ?? 0) - result.tracks.length
                    );
                    return (
                      <>
                        {refineLoading ? (
                          <Skeleton />
                        ) : (
                          <>
                            <TrackList
                              tracks={visibleTracks}
                              autoplayFirst
                              onExcludeArtist={addExcludedArtist}
                              onExcludeSong={excludeSong}
                              onSwap={!result.streaming ? swapTrack : undefined}
                              onBuildAround={buildAround}
                              swappingKey={swappingKey}
                              getTrackKey={songKey}
                            />
                            {result.streaming && remaining > 0 && (
                              <div className="mt-3 grid md:grid-cols-2 gap-3">
                                {Array.from({ length: Math.min(remaining, 6) }).map((_, i) => (
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
                                onClick={() => removeExcludedArtist(a)}
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
                                  addExcludedArtist(excludeInput);
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
                                onClick={() => generate(result.prompt)}
                                disabled={loading}
                                className="ml-auto px-3 py-1 rounded-full bg-spotify text-black text-xs font-semibold hover:brightness-110 disabled:opacity-50"
                              >
                                Regenerate to apply
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 border-t border-neutral-800 pt-5">
                          <p className="text-sm text-neutral-400 mb-3">
                            Not quite right? Refine the vibe:
                          </p>
                        <div className="flex gap-2">
                          <input
                            ref={refineInputRef}
                            type="text"
                            value={refineText}
                            onChange={(e) => setRefineText(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && !refineLoading && refine()
                            }
                            placeholder="Refine: more upbeat, less pop, add 90s songs…"
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
                    );
                  })()}
                </section>
              )}
            </div>
          </div>

          <aside className="hidden lg:flex lg:flex-col gap-6 sticky top-6 h-fit">
            <NowPlayingPanel />
            <ListeningInsights />
            <TasteProfile />
          </aside>
        </div>
      </div>
    </WebPlaybackProvider>
  );
}
