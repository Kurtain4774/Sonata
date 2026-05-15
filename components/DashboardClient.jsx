"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import WebPlaybackProvider from "./WebPlaybackProvider";
import { DEFAULT_FINE_TUNE } from "./FineTuneControls";
import { useToast } from "./ToastContext";
import ErrorBoundary from "./ErrorBoundary";
import OnboardingTour from "./OnboardingTour";
import HeroPromptCard from "./dashboard/HeroPromptCard";
import StatTiles from "./dashboard/StatTiles";
import WidgetGroup from "./dashboard/WidgetGroup";
import NowPlayingPanel from "./dashboard/NowPlayingPanel";
import ListeningInsights from "./dashboard/ListeningInsights";
import TasteProfile from "./dashboard/TasteProfile";
import ResultsSection from "./dashboard/ResultsSection";

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const toast = useToast();

  // ── Prompt & generation state ──────────────────────────────────────────────
  const [prompt, setPrompt] = useState("");
  const [fineTune, setFineTune] = useState(DEFAULT_FINE_TUNE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // ── Refinement state ───────────────────────────────────────────────────────
  const [refineText, setRefineText] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineError, setRefineError] = useState(null);
  const refineInputRef = useRef(null);
  const resultsRef = useRef(null);

  // ── Exclusion state ────────────────────────────────────────────────────────
  const [excludedArtists, setExcludedArtists] = useState([]);
  const [excludedSongKeys, setExcludedSongKeys] = useState(() => new Set());
  const [swappingKey, setSwappingKey] = useState(null);
  const seedAutoFiredRef = useRef(false);

  // ── Batched dashboard data ─────────────────────────────────────────────────
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (active) { setDashboardData(d); setDashboardLoading(false); } })
      .catch(() => { if (active) setDashboardLoading(false); });
    return () => { active = false; };
  }, []);

  // ── Stable helpers ─────────────────────────────────────────────────────────
  const songKey = useCallback(
    (t) => `${(t.title || "").toLowerCase()}|${(t.artist || "").toLowerCase()}`,
    []
  );

  const addExcludedArtist = useCallback((name) => {
    const clean = (name || "").trim();
    if (!clean) return;
    setExcludedArtists((prev) =>
      prev.some((a) => a.toLowerCase() === clean.toLowerCase()) ? prev : [...prev, clean]
    );
  }, []);

  const removeExcludedArtist = useCallback((name) => {
    setExcludedArtists((prev) => prev.filter((a) => a !== name));
  }, []);

  const excludeSong = useCallback((track) => {
    setExcludedSongKeys((prev) => {
      const next = new Set(prev);
      next.add(`${(track.title || "").toLowerCase()}|${(track.artist || "").toLowerCase()}`);
      return next;
    });
  }, []);

  // ── Refs for latest mutable values so callbacks stay stable ──────────────
  const excludedArtistsRef = useRef(excludedArtists);
  const fineTuneRef = useRef(fineTune);
  const resultRef = useRef(result);
  const refineTextRef = useRef(refineText);
  useEffect(() => { excludedArtistsRef.current = excludedArtists; }, [excludedArtists]);
  useEffect(() => { fineTuneRef.current = fineTune; }, [fineTune]);
  useEffect(() => { resultRef.current = result; }, [result]);
  useEffect(() => { refineTextRef.current = refineText; }, [refineText]);

  const generate = useCallback(async (overridePrompt, seed = null) => {
    const p = (overridePrompt ?? "").trim();
    if (!p) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setRefineText("");
    setRefineError(null);
    let scrolled = false;
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: p,
          context: fineTuneRef.current,
          excludedArtists: excludedArtistsRef.current,
          ...(seed ? { seed } : {}),
        }),
      });
      if (!res.ok || !res.body) {
        let msg = "Something went wrong";
        try { const d = await res.json(); msg = d.error || msg; } catch {}
        throw new Error(msg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
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
          try { handleFrame(JSON.parse(trimmed)); } catch {}
        }
      }
      if (buffer.trim()) {
        try { handleFrame(JSON.parse(buffer.trim())); } catch {}
      }
      if (streamError) throw new Error(streamError);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refine = useCallback(async () => {
    const followUp = refineTextRef.current.trim();
    const currentResult = resultRef.current;
    if (!followUp || !currentResult) return;
    setRefineLoading(true);
    setRefineError(null);
    try {
      const res = await fetch("/api/recommend/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: currentResult.originalPrompt,
          currentTracks: currentResult.tracks.map(({ title, artist }) => ({ title, artist })),
          followUp,
          excludedArtists: excludedArtistsRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refinement failed");
      setResult((prev) => prev ? { ...prev, tracks: data.tracks } : prev);
      setRefineText("");
      refineInputRef.current?.focus();
    } catch (err) {
      setRefineError(err.message);
    } finally {
      setRefineLoading(false);
    }
  }, []);

  const swapTrack = useCallback(async (track) => {
    const currentResult = resultRef.current;
    if (!currentResult || swappingKey) return;
    const key = `${(track.title || "").toLowerCase()}|${(track.artist || "").toLowerCase()}`;
    setSwappingKey(key);
    try {
      const res = await fetch("/api/recommend/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: currentResult.originalPrompt,
          currentTracks: currentResult.tracks.map(({ title, artist }) => ({ title, artist })),
          trackToReplace: { title: track.title, artist: track.artist },
          excludedArtists: excludedArtistsRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Swap failed");
      setResult((prev) => {
        if (!prev) return prev;
        const next = prev.tracks.map((t) =>
          `${(t.title || "").toLowerCase()}|${(t.artist || "").toLowerCase()}` === key
            ? data.track
            : t
        );
        return { ...prev, tracks: next };
      });
    } catch (err) {
      toast({ type: "error", message: err.message || "Swap failed" });
    } finally {
      setSwappingKey(null);
    }
  }, [toast, swappingKey]);

  const buildAround = useCallback((track) => {
    const auto = `songs like ${track.title} by ${track.artist}`;
    setPrompt(auto);
    generate(auto, { title: track.title, artist: track.artist });
  }, [generate]);

  const appendVibe = useCallback((v) => {
    setPrompt((cur) => (cur ? `${cur.trim()} ${v.toLowerCase()}` : v.toLowerCase()));
  }, []);

  const handlePickMood = useCallback((moodPrompt) => {
    if (!moodPrompt) return;
    setPrompt(moodPrompt);
    generate(moodPrompt);
  }, [generate]);

  // ── Seed auto-fire from URL params ─────────────────────────────────────────
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

  const promptRef = useRef(prompt);
  useEffect(() => { promptRef.current = prompt; }, [prompt]);

  const handleHeroSubmit = useCallback(() => {
    generate(promptRef.current);
  }, [generate]);

  return (
    <WebPlaybackProvider>
      <OnboardingTour />
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 pb-28 xl:pb-6">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_280px] 2xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-5">
          <div className="min-w-0 space-y-6">
            <HeroPromptCard
              prompt={prompt}
              onChange={setPrompt}
              onSubmit={handleHeroSubmit}
              loading={loading}
              onPickVibe={appendVibe}
              fineTune={fineTune}
              onFineTuneChange={setFineTune}
            />

            <ErrorBoundary compact label="Stats">
              <StatTiles data={dashboardData?.stats} loading={dashboardLoading} />
            </ErrorBoundary>

            <WidgetGroup
              onPickMood={handlePickMood}
              historyData={dashboardData?.history}
              historyLoading={dashboardLoading}
              moodsData={dashboardData?.moods}
              moodsLoading={dashboardLoading}
            />

            <ResultsSection
              result={result}
              loading={loading}
              error={error}
              refineText={refineText}
              refineLoading={refineLoading}
              refineError={refineError}
              swappingKey={swappingKey}
              excludedArtists={excludedArtists}
              excludedSongKeys={excludedSongKeys}
              onRefineTextChange={setRefineText}
              onRefine={refine}
              onAddExcludedArtist={addExcludedArtist}
              onRemoveExcludedArtist={removeExcludedArtist}
              onExcludeSong={excludeSong}
              onSwap={swapTrack}
              onBuildAround={buildAround}
              songKey={songKey}
              onGenerate={generate}
              resultsRef={resultsRef}
              refineInputRef={refineInputRef}
            />
          </div>

          <aside className="hidden xl:flex xl:flex-col gap-4 sticky top-6 h-fit min-w-0">
            <ErrorBoundary compact label="Now playing">
              <NowPlayingPanel />
            </ErrorBoundary>
            <ErrorBoundary compact label="Listening insights">
              <ListeningInsights data={dashboardData?.stats} loading={dashboardLoading} />
            </ErrorBoundary>
            <ErrorBoundary compact label="Taste profile">
              <TasteProfile data={dashboardData?.stats} loading={dashboardLoading} />
            </ErrorBoundary>
          </aside>
        </div>
      </div>
    </WebPlaybackProvider>
  );
}
