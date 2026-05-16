"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp } from "react-icons/fa";
import { HiOutlineMusicNote } from "react-icons/hi";
import { formatDuration } from "@/lib/timeFormatters";
import { usePlayback } from "@/hooks/usePlayback";

export default function NowPlayingPanel() {
  const {
    playback,
    track,
    duration,
    isPlaying,
    device,
    position,
    seekDraft,
    setSeekDraft,
    controlError,
    handlePlayPause,
    handleNext,
    handlePrev,
    commitSeek,
  } = usePlayback();

  const [volume, setVolume] = useState(0.7);
  const [volumeBlocked, setVolumeBlocked] = useState(false);
  const volumeTimerRef = useRef(null);

  // Sync the slider to the device volume reported by polling, unless the user
  // is mid-drag (a pending debounce timer means a local change is in flight).
  useEffect(() => {
    const vp = playback?.device?.volumePercent;
    if (typeof vp === "number" && !volumeTimerRef.current) {
      setVolume(vp / 100);
    }
  }, [playback]);

  const handleVolume = (vol) => {
    setVolume(vol);
    if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
    volumeTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/playback/volume", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ percent: Math.round(vol * 100) }),
        });
        if (res.status === 409) {
          const data = await res.json().catch(() => ({}));
          if (data?.error === "PREMIUM_REQUIRED" || data?.error === "FORBIDDEN") {
            setVolumeBlocked(true);
          }
        }
      } finally {
        volumeTimerRef.current = null;
      }
    }, 250);
  };

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <HiOutlineMusicNote className="text-spotify" />
        <h3 className="text-sm font-semibold flex-1">Now Playing</h3>
        <button className="text-neutral-500 hover:text-white text-lg leading-none">···</button>
      </div>

      {!track ? (
        <div className="h-[180px] rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-center px-6">
          <p className="text-sm text-neutral-500">
            Nothing playing on Spotify right now.
          </p>
        </div>
      ) : (
        <>
          <div className="h-[180px] rounded-xl overflow-hidden bg-neutral-800 mb-3">
            {track.albumArt ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={track.albumArt} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="text-center">
            <div className="text-base font-semibold truncate">{track.title}</div>
            <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
            {device ? (
              <div className="text-[10px] text-neutral-500 mt-1 truncate">
                Playing on {device.name}
              </div>
            ) : null}
          </div>
        </>
      )}

      <div className="mt-3">
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={Math.min(seekDraft !== null ? seekDraft : position, duration || 1)}
          disabled={!track}
          onChange={(e) => setSeekDraft(Number(e.target.value))}
          onMouseUp={(e) => commitSeek(Number(e.currentTarget.value))}
          onTouchEnd={(e) => commitSeek(Number(e.currentTarget.value))}
          onKeyUp={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              commitSeek(Number(e.currentTarget.value));
            }
          }}
          className="w-full h-1 accent-green-400 cursor-pointer disabled:opacity-40"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 tabular-nums mt-1">
          <span>{formatDuration(seekDraft !== null ? seekDraft : position)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-3">
        <button onClick={handlePrev} disabled={!track} className="text-neutral-300 hover:text-white disabled:opacity-40" aria-label="Previous">
          <FaStepBackward />
        </button>
        <button
          onClick={handlePlayPause}
          disabled={!track}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="w-11 h-11 rounded-full bg-spotify hover:brightness-110 text-black flex items-center justify-center disabled:opacity-40"
        >
          {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
        </button>
        <button onClick={handleNext} disabled={!track} className="text-neutral-300 hover:text-white disabled:opacity-40" aria-label="Next">
          <FaStepForward />
        </button>
      </div>

      {controlError && (
        <div className="mt-2 text-[11px] text-neutral-500 text-center">{controlError}</div>
      )}

      {device && typeof device.volumePercent === "number" && !volumeBlocked ? (
        <div className="flex items-center gap-2 mt-4">
          <FaVolumeUp className="text-neutral-500 text-xs" />
          <span className="text-xs text-neutral-400">Speaker</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => handleVolume(Number(e.target.value))}
            className="flex-1 h-1 accent-green-400 cursor-pointer"
          />
        </div>
      ) : null}
    </section>
  );
}
