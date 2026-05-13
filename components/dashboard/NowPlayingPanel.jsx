"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaRedo, FaVolumeUp } from "react-icons/fa";
import { HiOutlineMusicNote } from "react-icons/hi";
import { useWebPlayback } from "../WebPlaybackProvider";

function formatMs(ms) {
  const secs = Math.floor((ms || 0) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function NowPlayingPanel() {
  const wb = useWebPlayback();
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const pollRef = useRef(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    pausePlayback,
    resumePlayback,
    seekTo,
    changeVolume,
    getPlayerState,
  } = wb ?? {};

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

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <HiOutlineMusicNote className="text-spotify" />
        <h3 className="text-sm font-semibold flex-1">Now Playing</h3>
        <button className="text-neutral-500 hover:text-white text-lg leading-none">···</button>
      </div>

      {!currentTrack ? (
        <div className="aspect-square rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-center px-6">
          <p className="text-sm text-neutral-500">
            Generate a playlist and hit play to start listening.
          </p>
        </div>
      ) : (
        <>
          <div className="aspect-square rounded-xl overflow-hidden bg-neutral-800 mb-3">
            {currentTrack.albumArt ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentTrack.albumArt} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="text-center">
            <div className="text-base font-semibold truncate">{currentTrack.title}</div>
            <div className="text-xs text-neutral-400 truncate">{currentTrack.artist}</div>
          </div>
        </>
      )}

      <div className="mt-3">
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={position}
          disabled={!currentTrack}
          onChange={(e) => {
            const ms = Number(e.target.value);
            seekTo?.(ms);
            setPosition(ms);
          }}
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
          onClick={isPlaying ? pausePlayback : resumePlayback}
          disabled={!currentTrack}
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

      <div className="flex items-center gap-2 mt-4">
        <FaVolumeUp className="text-neutral-500 text-xs" />
        <span className="text-xs text-neutral-400">Speaker</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume ?? 0.7}
          onChange={(e) => changeVolume?.(Number(e.target.value))}
          className="flex-1 h-1 accent-green-400 cursor-pointer"
        />
      </div>
    </section>
  );
}
