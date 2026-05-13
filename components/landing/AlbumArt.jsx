"use client";

import { useState } from "react";

export default function AlbumArt({ track, fill = false, className = "", sizes = "64px" }) {
  const [failed, setFailed] = useState(false);

  const gradient = `linear-gradient(135deg, ${track.gradientFrom} 0%, ${track.gradientTo} 100%)`;

  if (failed || !track.albumArtUrl) {
    return (
      <div
        className={`flex items-center justify-center text-white/60 text-xs font-bold ${className}`}
        style={{
          background: gradient,
          ...(fill ? { position: "absolute", inset: 0 } : {}),
        }}
      >
        {track.artist.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  if (fill) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={track.albumArtUrl}
          alt={track.album}
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/5" />
      </>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={track.albumArtUrl}
      alt={track.album}
      onError={() => setFailed(true)}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}
