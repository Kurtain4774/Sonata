"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaTimes } from "react-icons/fa";

const POLL_MS = 5000;
const TICK_MS = 500;
const DISMISS_KEY = "sonata-mini-player-dismissed";

function formatMs(ms) {
  const secs = Math.floor((ms || 0) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GlobalMiniPlayer() {
  const { status } = useSession();
  const pathname = usePathname() || "";

  const [playback, setPlayback] = useState(null);
  const [position, setPosition] = useState(0);
  const [dismissedId, setDismissedId] = useState(null);
  const [controlError, setControlError] = useState(null);
  const [seekDraft, setSeekDraft] = useState(null);
  const lastSyncRef = useRef(0);

  const isPublic = pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/api");
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const shouldPoll = status === "authenticated" && !isPublic;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const v = sessionStorage.getItem(DISMISS_KEY);
      if (v) setDismissedId(v);
    } catch {}
  }, []);

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
    if (!shouldPoll) {
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
  }, [shouldPoll, fetchPlayback]);

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

  useEffect(() => {
    const id = playback?.track?.id;
    if (id && dismissedId && id !== dismissedId) {
      setDismissedId(null);
      try { sessionStorage.removeItem(DISMISS_KEY); } catch {}
    }
  }, [playback?.track?.id, dismissedId]);

  const track = playback?.track || null;
  const duration = playback?.durationMs || 0;
  const isPlaying = !!playback?.isPlaying;

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

  const handlePlayPause = async () => {
    const target = !isPlaying;
    setPlayback((p) => (p ? { ...p, isPlaying: target } : p));
    const ok = await callControl("/api/playback/play", {
      method: "PUT",
      body: JSON.stringify({ play: target, deviceId: playback?.device?.id }),
    });
    if (!ok) setPlayback((p) => (p ? { ...p, isPlaying: !target } : p));
    setTimeout(() => fetchPlayback(), 600);
  };

  const handleNext = async () => {
    const ok = await callControl("/api/playback/next", { method: "POST" });
    if (ok) setTimeout(() => fetchPlayback(), 400);
  };

  const handlePrev = async () => {
    const ok = await callControl("/api/playback/previous", { method: "POST" });
    if (ok) setTimeout(() => fetchPlayback(), 400);
  };

  const commitSeek = async (ms) => {
    setSeekDraft(null);
    setPosition(ms);
    lastSyncRef.current = Date.now();
    setPlayback((p) => (p ? { ...p, progressMs: ms } : p));
    await callControl("/api/playback/seek", {
      method: "PUT",
      body: JSON.stringify({ positionMs: ms }),
    });
  };

  const handleDismiss = () => {
    const id = track?.id;
    if (!id) return;
    setDismissedId(id);
    try { sessionStorage.setItem(DISMISS_KEY, id); } catch {}
  };

  if (status !== "authenticated" || isPublic) return null;
  if (!track) return null;
  if (dismissedId && track.id === dismissedId) return null;

  const displayPosition = seekDraft !== null ? seekDraft : position;
  const containerCls = `fixed bottom-24 md:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(95vw,640px)] ${
    isDashboard ? "lg:hidden" : ""
  }`;

  return (
    <div className={containerCls}>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur shadow-lg px-3 py-2.5">
        <div className="flex items-center gap-3">
          {track.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.albumArt}
              alt=""
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-neutral-800 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium leading-tight">{track.title}</div>
            <div className="truncate text-xs text-neutral-400 mt-0.5">{track.artist}</div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handlePrev}
              aria-label="Previous track"
              className="w-8 h-8 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
            >
              <FaStepBackward className="text-xs" />
            </button>
            <button
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-9 h-9 rounded-full bg-spotify hover:brightness-110 text-black flex items-center justify-center transition-all"
            >
              {isPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
            </button>
            <button
              onClick={handleNext}
              aria-label="Next track"
              className="w-8 h-8 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
            >
              <FaStepForward className="text-xs" />
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Hide player"
              className="w-7 h-7 ml-1 rounded-full text-neutral-500 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-neutral-500 w-8 text-right tabular-nums">
            {formatMs(displayPosition)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={Math.min(displayPosition, duration || 1)}
            onChange={(e) => setSeekDraft(Number(e.target.value))}
            onMouseUp={(e) => commitSeek(Number(e.currentTarget.value))}
            onTouchEnd={(e) => commitSeek(Number(e.currentTarget.value))}
            onKeyUp={(e) => {
              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                commitSeek(Number(e.currentTarget.value));
              }
            }}
            disabled={!duration}
            className="flex-1 h-1 accent-spotify cursor-pointer disabled:opacity-40"
          />
          <span className="text-[10px] text-neutral-500 w-8 tabular-nums">
            {formatMs(duration)}
          </span>
        </div>

        {controlError && (
          <div className="mt-1 text-[11px] text-neutral-500 text-center">{controlError}</div>
        )}
      </div>
    </div>
  );
}
