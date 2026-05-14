"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaRedo, FaVolumeUp } from "react-icons/fa";
import { HiOutlineMusicNote } from "react-icons/hi";
import { useWebPlayback } from "../WebPlaybackProvider";

const POLL_MS = 5000;
const TICK_MS = 500;

function formatMs(ms) {
  const secs = Math.floor((ms || 0) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function NowPlayingPanel() {
  const wb = useWebPlayback();
  const { pausePlayback, resumePlayback, seekTo, changeVolume } = wb ?? {};

  const [playback, setPlayback] = useState(null);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [volumeBlocked, setVolumeBlocked] = useState(false);
  const lastSyncRef = useRef(0);
  const volumeTimerRef = useRef(null);

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
        const vp = pb.device?.volumePercent;
        if (typeof vp === "number" && !volumeTimerRef.current) {
          setVolume(vp / 100);
        }
      } else {
        setPosition(0);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setPlayback(null);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPlayback(controller.signal);
    const id = setInterval(() => fetchPlayback(controller.signal), POLL_MS);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [fetchPlayback]);

  useEffect(() => {
    if (!playback?.isPlaying || !playback?.durationMs) return;
    const id = setInterval(() => {
      const elapsed = Date.now() - lastSyncRef.current;
      const next = Math.min((playback.progressMs || 0) + elapsed, playback.durationMs);
      setPosition(next);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playback?.isPlaying, playback?.progressMs, playback?.durationMs]);

  const track = playback?.track || null;
  const duration = playback?.durationMs || 0;
  const isPlaying = !!playback?.isPlaying;
  const device = playback?.device || null;

  const handlePlayPause = async () => {
    if (isPlaying) await pausePlayback?.();
    else await resumePlayback?.();
    setTimeout(() => fetchPlayback(), 400);
  };

  const handleVolume = (vol) => {
    setVolume(vol);
    changeVolume?.(vol);
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

  const handleSeek = async (ms) => {
    setPosition(ms);
    await seekTo?.(ms);
    setTimeout(() => fetchPlayback(), 400);
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
          value={position}
          disabled={!track}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="w-full h-1 accent-green-400 cursor-pointer disabled:opacity-40"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 tabular-nums mt-1">
          <span>{formatMs(position)}</span>
          <span>{formatMs(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 px-2">
        <button className="text-neutral-400 hover:text-white" aria-label="Shuffle">
          <FaRandom />
        </button>
        <button className="text-neutral-300 hover:text-white" aria-label="Previous">
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
        <button className="text-neutral-300 hover:text-white" aria-label="Next">
          <FaStepForward />
        </button>
        <button className="text-neutral-400 hover:text-white" aria-label="Repeat">
          <FaRedo />
        </button>
      </div>

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
