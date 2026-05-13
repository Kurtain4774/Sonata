"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaSpotify } from "react-icons/fa";
import { useWebPlayback } from "./WebPlaybackProvider";

// Module-level singletons so only one <audio> plays at a time across all instances
let currentAudio = null;
let currentSetter = null;

export default function AudioPreview({ url, spotifyUrl, uri, title, artist, albumArt }) {
  const audioRef = useRef(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Context is null when rendered outside WebPlaybackProvider (e.g. StatsClient)
  const wb = useWebPlayback();
  const sdkReady = wb?.sdkReady ?? false;
  const isSdkActive = sdkReady && wb?.currentTrack?.uri === uri && uri != null;
  const isPlayingViaSdk = isSdkActive && wb?.isPlaying;

  useEffect(() => {
    return () => {
      if (currentAudio === audioRef.current) {
        currentAudio?.pause();
        currentAudio = null;
        currentSetter = null;
      }
    };
  }, []);

  // If the SDK takes over this track, stop any local audio
  useEffect(() => {
    if (isSdkActive && audioPlaying && audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
      if (currentAudio === audioRef.current) {
        currentAudio = null;
        currentSetter = null;
      }
    }
  }, [isSdkActive, audioPlaying]);

  const toggle = async () => {
    // ── SDK path ──────────────────────────────────────────────────────────────
    if (sdkReady && uri) {
      if (isSdkActive) {
        // This track is already loaded in the SDK player — toggle play/pause
        isPlayingViaSdk ? wb.pausePlayback() : wb.resumePlayback();
        return;
      }
      // Try to play a new track via SDK
      const ok = await wb.playTrack(uri, { title, artist, albumArt, uri });
      if (ok) {
        // Stop any local audio that was playing
        if (currentAudio) {
          currentAudio.pause();
          currentSetter?.(false);
          currentAudio = null;
          currentSetter = null;
        }
        return;
      }
      // SDK rejected (non-Premium 403, network error, etc.) — fall through to preview
    }

    // ── Preview-URL fallback ──────────────────────────────────────────────────
    const audio = audioRef.current;
    if (!audio) return;

    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
      if (currentAudio === audio) {
        currentAudio = null;
        currentSetter = null;
      }
      return;
    }

    // Pause any other preview that is playing
    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause();
      currentSetter?.(false);
    }
    audio.play();
    currentAudio = audio;
    currentSetter = setAudioPlaying;
    setAudioPlaying(true);
  };

  // Show a play button if: there's a preview URL, or the SDK is ready and we have a URI
  const canPlay = Boolean(url) || (sdkReady && Boolean(uri));

  if (!canPlay) {
    if (!spotifyUrl) return null;
    return (
      <a
        href={spotifyUrl}
        target="_blank"
        rel="noreferrer"
        title="Play on Spotify"
        className="w-9 h-9 rounded-full bg-green-900 hover:bg-green-800 text-green-300 flex items-center justify-center"
      >
        <FaSpotify className="text-sm" />
      </a>
    );
  }

  const playing = isPlayingViaSdk || audioPlaying;

  return (
    <>
      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="w-9 h-9 rounded-full bg-spotify hover:bg-green-400 text-black flex items-center justify-center"
      >
        {playing
          ? <FaPause className="text-xs" />
          : <FaPlay className="text-xs ml-0.5" />}
      </button>

      {/* Only render the <audio> element when there's a preview URL to play */}
      {url && (
        <audio
          ref={audioRef}
          src={url}
          onEnded={() => {
            setAudioPlaying(false);
            if (currentAudio === audioRef.current) {
              currentAudio = null;
              currentSetter = null;
            }
          }}
        />
      )}
    </>
  );
}
