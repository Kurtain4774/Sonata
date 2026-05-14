"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaSpotify } from "react-icons/fa";
import { useWebPlayback } from "./WebPlaybackProvider";
import { useSettings } from "./SettingsContext";
import { useAudioPreview } from "./AudioPreviewProvider";

export default function AudioPreview({ url, spotifyUrl, uri, title, artist, albumArt, autoplay = false }) {
  const audioRef = useRef(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const settings = useSettings();
  const previewsEnabled = settings.enableDeezerPreviews;
  const effectiveUrl = previewsEnabled ? url : null;
  const autoplayFiredRef = useRef(false);

  const preview = useAudioPreview();

  const wb = useWebPlayback();
  const sdkReady = wb?.sdkReady ?? false;
  const isSdkActive = sdkReady && wb?.currentTrack?.uri === uri && uri != null;
  const isPlayingViaSdk = isSdkActive && wb?.isPlaying;

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        preview?.releaseIfCurrent(audioRef.current);
      }
    };
  }, [preview]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !preview?.isFading(audio)) {
      audio.volume = settings.defaultVolume / 100;
    }
  }, [settings.defaultVolume, preview]);

  useEffect(() => {
    if (isSdkActive && audioPlaying && audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
      preview?.releaseIfCurrent(audioRef.current);
    }
  }, [isSdkActive, audioPlaying, preview]);

  const startPreview = () => {
    const audio = audioRef.current;
    if (!audio || !preview) return false;
    const targetVolume = settings.defaultVolume / 100;
    const crossfadeMs = (settings.crossfadeDuration || 0) * 1000;
    const ok = preview.playPreview({ audio, setter: setAudioPlaying, targetVolume, crossfadeMs });
    if (ok) setAudioPlaying(true);
    return ok;
  };

  const toggle = async () => {
    if (sdkReady && uri) {
      if (isSdkActive) {
        isPlayingViaSdk ? wb.pausePlayback() : wb.resumePlayback();
        return;
      }
      const ok = await wb.playTrack(uri, { title, artist, albumArt, uri });
      if (ok) {
        if (audioRef.current) {
          audioRef.current.pause();
          preview?.releaseIfCurrent(audioRef.current);
          setAudioPlaying(false);
        }
        return;
      }
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
      preview?.releaseIfCurrent(audio);
      return;
    }

    startPreview();
  };

  useEffect(() => {
    if (!autoplay) return;
    if (autoplayFiredRef.current) return;
    if (!settings.autoplayPreviews) return;
    if (!effectiveUrl) return;
    autoplayFiredRef.current = true;
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
            if (audioRef.current) preview?.releaseIfCurrent(audioRef.current);
          }}
        />
      )}
    </>
  );
}
