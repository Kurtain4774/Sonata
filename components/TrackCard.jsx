"use client";

import { useEffect, useRef, useState } from "react";
import { FaSpotify } from "react-icons/fa";
import { FiMoreVertical, FiRefreshCw } from "react-icons/fi";
import AudioPreview from "./AudioPreview";
import AlbumArtImage from "./AlbumArtImage";
import { getFirstArtist } from "@/lib/trackHelpers";

export default function TrackCard({
  track,
  autoplay = false,
  onExcludeArtist,
  onExcludeSong,
  onSwap,
  onBuildAround,
  swapping = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const firstArtist = getFirstArtist(track);
  const hasMenu = Boolean(onExcludeArtist || onExcludeSong || onBuildAround);

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition ${
        swapping ? "opacity-60 animate-pulse" : ""
      }`}
    >
      <AlbumArtImage
        src={track.albumArt}
        className="w-14 h-14 rounded object-cover"
      />
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium leading-tight">{track.title}</div>
          <div className="truncate text-sm text-neutral-400 mt-0.5">{track.artist}</div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <AudioPreview
            url={track.previewUrl}
            spotifyUrl={track.spotifyUrl}
            uri={track.uri}
            title={track.title}
            artist={track.artist}
            albumArt={track.albumArt}
            autoplay={autoplay}
          />
          {onSwap && (
            <button
              type="button"
              onClick={() => onSwap(track)}
              disabled={swapping}
              className="p-2 sm:p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              title="Replace this track"
              aria-label="Replace this track"
            >
              <FiRefreshCw className={swapping ? "animate-spin" : ""} />
            </button>
          )}
          {track.spotifyUrl && (
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 sm:p-0 text-neutral-400 hover:text-spotify"
              title="Open in Spotify"
              aria-label="Open in Spotify"
            >
              <FaSpotify className="text-xl" />
            </a>
          )}
          {hasMenu && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="p-2 sm:p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Track options"
                title="More"
              >
                <FiMoreVertical />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 w-60 rounded-lg border border-neutral-700 bg-neutral-900 shadow-lg overflow-hidden">
                  {onBuildAround && (
                    <button
                      type="button"
                      onClick={() => {
                        onBuildAround(track);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                    >
                      Build a playlist around this song
                    </button>
                  )}
                  {onExcludeArtist && firstArtist && (
                    <button
                      type="button"
                      onClick={() => {
                        onExcludeArtist(firstArtist);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                    >
                      Don&apos;t recommend {firstArtist}
                    </button>
                  )}
                  {onExcludeSong && (
                    <button
                      type="button"
                      onClick={() => {
                        onExcludeSong(track);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                    >
                      Don&apos;t recommend this song
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
