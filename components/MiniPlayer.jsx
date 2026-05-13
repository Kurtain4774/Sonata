"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaTimes, FaVolumeUp } from "react-icons/fa";
import { useWebPlayback } from "./WebPlaybackProvider";

function formatMs(ms) {
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MiniPlayer({ className = "" }) {
  const wb = useWebPlayback();
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const pollRef = useRef(null);

  const { currentTrack, isPlaying, volume, pausePlayback, resumePlayback, seekTo, changeVolume, dismissPlayer, getPlayerState } = wb ?? {};

  // Poll the SDK for position every 500 ms while something is loaded
  useEffect(() => {
    if (!currentTrack || !getPlayerState) {
      setPosition(0);
      setDuration(0);
      clearInterval(pollRef.current);
      return;
    }

    const poll = async () => {
      const state = await getPlayerState();
      if (state) {
        setPosition(state.position);
        setDuration(state.duration);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 500);
    return () => clearInterval(pollRef.current);
  }, [currentTrack, isPlaying, getPlayerState]);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const handleSeek = (e) => {
    const ms = Number(e.target.value);
    seekTo(ms);
    setPosition(ms); // optimistic
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-neutral-950 border-t border-neutral-800 ${className}`}>
      {/* Thin progress bar at the very top of the player */}
      <div className="h-0.5 bg-neutral-800">
        <div
          className="h-full bg-green-500 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Album art */}
        {currentTrack.albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentTrack.albumArt}
            alt=""
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-neutral-800 flex-shrink-0" />
        )}

        {/* Track info + scrubber */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="truncate text-sm font-medium leading-tight">{currentTrack.title}</span>
            <span className="truncate text-xs text-neutral-400 flex-shrink-0">{currentTrack.artist}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-neutral-500 w-8 text-right tabular-nums">
              {formatMs(position)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 1}
              value={position}
              onChange={handleSeek}
              className="flex-1 h-1 accent-green-400 cursor-pointer"
            />
            <span className="text-xs text-neutral-500 w-8 tabular-nums">
              {formatMs(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={isPlaying ? pausePlayback : resumePlayback}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-9 h-9 rounded-full bg-green-500 hover:brightness-110 text-black flex items-center justify-center transition-colors"
          >
            {isPlaying
              ? <FaPause className="text-xs" />
              : <FaPlay className="text-xs ml-0.5" />}
          </button>

          {/* Volume — hidden on small screens */}
          <div className="hidden sm:flex items-center gap-1.5">
            <FaVolumeUp className="text-neutral-400 text-xs flex-shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume ?? 0.7}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-20 h-1 accent-green-400 cursor-pointer"
            />
          </div>

          <button
            onClick={dismissPlayer}
            aria-label="Close player"
            className="w-7 h-7 rounded-full hover:bg-neutral-800 text-neutral-500 hover:text-white flex items-center justify-center transition-colors"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
