"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";

const WebPlaybackContext = createContext(null);

export function useWebPlayback() {
  return useContext(WebPlaybackContext);
}

export default function WebPlaybackProvider({ children }) {
  const { data: session } = useSession();
  const playerRef = useRef(null);
  // Always reflects the latest token without re-initializing the player
  const tokenRef = useRef(null);

  const [sdkReady, setSdkReady] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);

  useEffect(() => {
    tokenRef.current = session?.accessToken ?? null;
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken || playerRef.current) return;

    const initPlayer = () => {
      const player = new window.Spotify.Player({
        name: "Sonata Web Player",
        getOAuthToken: (cb) => cb(tokenRef.current),
        volume: 0.7,
      });

      player.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        setSdkReady(true);
      });

      player.addListener("not_ready", () => {
        setSdkReady(false);
        setDeviceId(null);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) {
          setIsPlaying(false);
          return;
        }
        const track = state.track_window?.current_track;
        if (track) {
          setCurrentTrack({
            title: track.name,
            artist: track.artists.map((a) => a.name).join(", "),
            albumArt: track.album?.images?.[0]?.url ?? null,
            uri: track.uri,
          });
        }
        setIsPlaying(!state.paused);
      });

      player.addListener("initialization_error", ({ message }) => {
        console.warn("Spotify SDK init error:", message);
      });

      player.addListener("authentication_error", ({ message }) => {
        console.warn("Spotify SDK auth error:", message);
        setSdkReady(false);
      });

      // Fires for non-Premium accounts
      player.addListener("account_error", ({ message }) => {
        console.warn("Spotify SDK account error (Premium required):", message);
        setSdkReady(false);
      });

      player.connect();
      playerRef.current = player;
    };

    if (window.Spotify) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
      if (!document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      playerRef.current?.disconnect();
      playerRef.current = null;
      setSdkReady(false);
      setDeviceId(null);
    };
  }, [session?.accessToken]);

  const playTrack = useCallback(async (uri, trackInfo) => {
    if (!sdkReady || !deviceId || !tokenRef.current) return false;
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [uri] }),
        }
      );
      // 403 = non-Premium, 204 = success (no body)
      if (res.status === 403 || (!res.ok && res.status !== 204)) return false;
      if (trackInfo) setCurrentTrack(trackInfo);
      setIsPlaying(true);
      return true;
    } catch {
      return false;
    }
  }, [sdkReady, deviceId]);

  const pausePlayback = useCallback(() => {
    playerRef.current?.pause();
  }, []);

  const resumePlayback = useCallback(() => {
    playerRef.current?.resume();
  }, []);

  const seekTo = useCallback((positionMs) => {
    playerRef.current?.seek(positionMs);
  }, []);

  const changeVolume = useCallback((vol) => {
    setVolumeState(vol);
    playerRef.current?.setVolume(vol);
  }, []);

  // Returns a Promise<Spotify.PlaybackState | null> — used by MiniPlayer for position polling
  const getPlayerState = useCallback(() => {
    return playerRef.current?.getCurrentState() ?? Promise.resolve(null);
  }, []);

  const dismissPlayer = useCallback(() => {
    playerRef.current?.pause();
    setCurrentTrack(null);
    setIsPlaying(false);
  }, []);

  return (
    <WebPlaybackContext.Provider
      value={{
        sdkReady,
        deviceId,
        currentTrack,
        isPlaying,
        volume,
        playTrack,
        pausePlayback,
        resumePlayback,
        seekTo,
        changeVolume,
        getPlayerState,
        dismissPlayer,
      }}
    >
      {children}
    </WebPlaybackContext.Provider>
  );
}
