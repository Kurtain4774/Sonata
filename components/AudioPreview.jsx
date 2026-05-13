"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaSpotify } from "react-icons/fa";
import { useWebPlayback } from "./WebPlaybackProvider";
import { useSettings } from "./SettingsContext";

// Module-level singletons so only one <audio> plays at a time across all instances
let currentAudio = null;
let currentSetter = null;
let activeFades = new WeakMap();

function cancelFade(audio) {
  const handle = activeFades.get(audio);
  if (handle) {
    cancelAnimationFrame(handle);
    activeFades.delete(audio);
  }
}

function fadeTo(audio, targetVolume, durationMs, onDone) {
  cancelFade(audio);
  if (durationMs <= 0) {
    audio.volume = targetVolume;
    onDone?.();
    return;
  }
  const startVolume = audio.volume;
  const startTime = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - startTime) / durationMs);
    audio.volume = startVolume + (targetVolume - startVolume) * t;
    if (t < 1) {
      activeFades.set(audio, requestAnimationFrame(tick));
    } else {
      activeFades.delete(audio);
      onDone?.();
    }
  };
  activeFades.set(audio, requestAnimationFrame(tick));
}

export default function AudioPreview({ url, spotifyUrl, uri, title, artist, albumArt, autoplay = false }) {
  const audioRef = useRef(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const settings = useSettings();
  const previewsEnabled = settings.enableDeezerPreviews;
  const effectiveUrl = previewsEnabled ? url : null;
  const autoplayFiredRef = useRef(false);

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

  // Keep volume in sync with setting
  useEffect(() => {
    if (audioRef.current && !activeFades.get(audioRef.current)) {
      audioRef.current.volume = settings.defaultVolume / 100;
    }
  }, [settings.defaultVolume]);

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

  const startPreview = () => {
    const audio = audioRef.current;
    if (!audio) return false;
    const targetVolume = settings.defaultVolume / 100;
    const crossfadeMs = (settings.crossfadeDuration || 0) * 1000;

    const previous = currentAudio;
    const previousSetter = currentSetter;

    if (previous && previous !== audio) {
      if (crossfadeMs > 0) {
        fadeTo(previous, 0, crossfadeMs, () => {
          previous.pause();
          previous.volume = targetVolume; // restore so next play isn't silent
        });
        previousSetter?.(false);
      } else {
        previous.pause();
        previousSetter?.(false);
      }
    }

    cancelFade(audio);
    audio.volume = crossfadeMs > 0 ? 0 : targetVolume;
    audio.play().catch(() => {});
    if (crossfadeMs > 0) fadeTo(audio, targetVolume, crossfadeMs);
    currentAudio = audio;
    currentSetter = setAudioPlaying;
    setAudioPlaying(true);
    return true;
  };

  const toggle = async () => {
    // ── SDK path ──────────────────────────────────────────────────────────────
    if (sdkReady && uri) {
      if (isSdkActive) {
        isPlayingViaSdk ? wb.pausePlayback() : wb.resumePlayback();
        return;
      }
      const ok = await wb.playTrack(uri, { title, artist, albumArt, uri });
      if (ok) {
        if (currentAudio) {
          currentAudio.pause();
          currentSetter?.(false);
          currentAudio = null;
          currentSetter = null;
        }
        return;
      }
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

    startPreview();
  };

  // Autoplay-on-mount when settings allow and this is flagged as the autoplay target
  useEffect(() => {
    if (!autoplay) return;
    if (autoplayFiredRef.current) return;
    if (!settings.autoplayPreviews) return;
    if (!effectiveUrl) return;
    autoplayFiredRef.current = true;
    // Small defer so the <audio> element is mounted
    const id = setTimeout(() => startPreview(), 50);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, effectiveUrl, settings.autoplayPreviews]);

  const canPlay = Boolean(effectiveUrl) || (sdkReady && Boolean(uri));

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
        className="w-9 h-9 rounded-full bg-spotify hover:brightness-110 text-black flex items-center justify-center"
      >
        {playing
          ? <FaPause className="text-xs" />
          : <FaPlay className="text-xs ml-0.5" />}
      </button>

      {effectiveUrl && (
        <audio
          ref={audioRef}
          src={effectiveUrl}
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
