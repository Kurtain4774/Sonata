"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

const AudioPreviewContext = createContext(null);

export function useAudioPreview() {
  return useContext(AudioPreviewContext);
}

export default function AudioPreviewProvider({ children }) {
  const currentAudioRef = useRef(null);
  const currentSetterRef = useRef(null);
  const fadesRef = useRef(new WeakMap());

  const cancelFade = useCallback((audio) => {
    const handle = fadesRef.current.get(audio);
    if (handle) {
      cancelAnimationFrame(handle);
      fadesRef.current.delete(audio);
    }
  }, []);

  const fadeTo = useCallback((audio, targetVolume, durationMs, onDone) => {
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
        fadesRef.current.set(audio, requestAnimationFrame(tick));
      } else {
        fadesRef.current.delete(audio);
        onDone?.();
      }
    };
    fadesRef.current.set(audio, requestAnimationFrame(tick));
  }, [cancelFade]);

  const playPreview = useCallback(({ audio, setter, targetVolume, crossfadeMs }) => {
    if (!audio) return false;
    const previous = currentAudioRef.current;
    const previousSetter = currentSetterRef.current;

    if (previous && previous !== audio) {
      if (crossfadeMs > 0) {
        fadeTo(previous, 0, crossfadeMs, () => {
          previous.pause();
          previous.volume = targetVolume;
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
    currentAudioRef.current = audio;
    currentSetterRef.current = setter;
    return true;
  }, [fadeTo, cancelFade]);

  const releaseIfCurrent = useCallback((audio) => {
    if (currentAudioRef.current === audio) {
      currentAudioRef.current = null;
      currentSetterRef.current = null;
    }
  }, []);

  const isFading = useCallback((audio) => fadesRef.current.has(audio), []);

  const stopAll = useCallback(() => {
    const audio = currentAudioRef.current;
    if (audio) {
      audio.pause();
      currentSetterRef.current?.(false);
    }
    currentAudioRef.current = null;
    currentSetterRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      const audio = currentAudioRef.current;
      if (audio) {
        cancelFade(audio);
        audio.pause();
      }
      currentAudioRef.current = null;
      currentSetterRef.current = null;
    };
  }, [cancelFade]);

  const value = useMemo(
    () => ({ playPreview, releaseIfCurrent, isFading, stopAll }),
    [playPreview, releaseIfCurrent, isFading, stopAll]
  );

  return (
    <AudioPreviewContext.Provider value={value}>
      {children}
    </AudioPreviewContext.Provider>
  );
}
