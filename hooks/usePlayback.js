"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const POLL_MS = 5000;
const TICK_MS = 500;

// Shared Spotify playback state + controls for the mini-player and dashboard panel.
// Polls `/api/now-playing`, advances the progress bar locally between polls, and
// exposes play/pause/skip/seek handlers. Pass `enabled: false` to pause polling.
export function usePlayback({ enabled = true } = {}) {
  const [playback, setPlayback] = useState(null);
  const [position, setPosition] = useState(0);
  const [seekDraft, setSeekDraft] = useState(null);
  const [controlError, setControlError] = useState(null);
  const lastSyncRef = useRef(0);

  const fetchPlayback = useCallback(async (signal) => {
    try {
      const res = await fetch("/api/now-playing", { signal, cache: "no-store" });
      if (!res.ok) {
        setPlayback(null);
        return;
      }
      const data = await res.json();
      const pb = data.playback || null;
      setPlayback(pb);
      if (pb) {
        setPosition(pb.progressMs || 0);
        lastSyncRef.current = Date.now();
      } else {
        setPosition(0);
      }
    } catch (err) {
      if (err.name !== "AbortError") setPlayback(null);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setPlayback(null);
      return;
    }
    const controller = new AbortController();
    fetchPlayback(controller.signal);
    const id = setInterval(() => fetchPlayback(controller.signal), POLL_MS);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [enabled, fetchPlayback]);

  useEffect(() => {
    if (!playback?.isPlaying || !playback?.durationMs) return;
    const id = setInterval(() => {
      if (seekDraft !== null) return;
      const elapsed = Date.now() - lastSyncRef.current;
      const next = Math.min((playback.progressMs || 0) + elapsed, playback.durationMs);
      setPosition(next);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playback?.isPlaying, playback?.progressMs, playback?.durationMs, seekDraft]);

  const callControl = useCallback(async (path, init) => {
    setControlError(null);
    try {
      const res = await fetch(path, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        ...init,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setControlError(
            data?.error === "PREMIUM_REQUIRED"
              ? "Spotify Premium required."
              : data?.error === "NO_ACTIVE_DEVICE"
              ? "No active Spotify device."
              : "Playback unavailable."
          );
        }
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const handlePlayPause = useCallback(async () => {
    const target = !playback?.isPlaying;
    setPlayback((p) => (p ? { ...p, isPlaying: target } : p));
    const ok = await callControl("/api/playback/play", {
      method: "PUT",
      body: JSON.stringify({ play: target, deviceId: playback?.device?.id }),
    });
    if (!ok) setPlayback((p) => (p ? { ...p, isPlaying: !target } : p));
    setTimeout(() => fetchPlayback(), 600);
  }, [playback?.isPlaying, playback?.device?.id, callControl, fetchPlayback]);

  const handleNext = useCallback(async () => {
    const ok = await callControl("/api/playback/next", { method: "POST" });
    if (ok) setTimeout(() => fetchPlayback(), 400);
  }, [callControl, fetchPlayback]);

  const handlePrev = useCallback(async () => {
    const ok = await callControl("/api/playback/previous", { method: "POST" });
    if (ok) setTimeout(() => fetchPlayback(), 400);
  }, [callControl, fetchPlayback]);

  const commitSeek = useCallback(
    async (ms) => {
      setSeekDraft(null);
      setPosition(ms);
      lastSyncRef.current = Date.now();
      setPlayback((p) => (p ? { ...p, progressMs: ms } : p));
      await callControl("/api/playback/seek", {
        method: "PUT",
        body: JSON.stringify({ positionMs: ms }),
      });
    },
    [callControl]
  );

  return {
    playback,
    setPlayback,
    track: playback?.track || null,
    duration: playback?.durationMs || 0,
    isPlaying: !!playback?.isPlaying,
    device: playback?.device || null,
    position,
    seekDraft,
    setSeekDraft,
    controlError,
    refresh: fetchPlayback,
    callControl,
    handlePlayPause,
    handleNext,
    handlePrev,
    commitSeek,
  };
}
