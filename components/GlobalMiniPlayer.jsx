"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaTimes } from "react-icons/fa";
import AlbumArtImage from "./AlbumArtImage";
import { formatDuration } from "@/lib/timeFormatters";
import { usePlayback } from "@/hooks/usePlayback";

const DISMISS_KEY = "sonata-mini-player-dismissed";

export default function GlobalMiniPlayer() {
  const { status } = useSession();
  const pathname = usePathname() || "";

  const [dismissedId, setDismissedId] = useState(null);

  const isPublic = pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/api");
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const shouldPoll = status === "authenticated" && !isPublic;

  const {
    playback,
    track,
    duration,
    isPlaying,
    position,
    seekDraft,
    setSeekDraft,
    controlError,
    handlePlayPause,
    handleNext,
    handlePrev,
    commitSeek,
  } = usePlayback({ enabled: shouldPoll });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const v = sessionStorage.getItem(DISMISS_KEY);
      if (v) setDismissedId(v);
    } catch {}
  }, []);

  useEffect(() => {
    const id = playback?.track?.id;
    if (id && dismissedId && id !== dismissedId) {
      setDismissedId(null);
      try { sessionStorage.removeItem(DISMISS_KEY); } catch {}
    }
  }, [playback?.track?.id, dismissedId]);

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
          <AlbumArtImage
            src={track.albumArt}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />

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
            {formatDuration(displayPosition)}
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
            {formatDuration(duration)}
          </span>
        </div>

        {controlError && (
          <div className="mt-1 text-[11px] text-neutral-500 text-center">{controlError}</div>
        )}
      </div>
    </div>
  );
}
