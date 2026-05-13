"use client";

import AlbumArt from "./AlbumArt";
import { SAMPLE_TRACKS } from "./tracks";

export default function FloatingAlbums({ selectedTrackId }) {
  const idx = Math.max(
    0,
    SAMPLE_TRACKS.findIndex((t) => t.id === selectedTrackId)
  );
  const top = SAMPLE_TRACKS[idx];
  const bottom = SAMPLE_TRACKS[(idx + 3) % SAMPLE_TRACKS.length];

  const tiles = [
    {
      track: top,
      className:
        "top-[14%] left-[41%] w-24 h-24 min-[1800px]:w-28 min-[1800px]:h-28 rotate-[8deg] animate-[float_7s_ease-in-out_infinite] hidden min-[1800px]:block",
    },
    {
      track: bottom,
      className:
        "bottom-[14%] left-[41%] w-24 h-24 min-[1800px]:w-28 min-[1800px]:h-28 -rotate-[6deg] animate-[float_9s_ease-in-out_infinite_-2s] hidden min-[1800px]:block",
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="relative w-[min(92vw,1120px)] xl:w-[min(94vw,1240px)] min-[1500px]:w-[min(94vw,1780px)] min-[1800px]:w-[min(94vw,1880px)] mx-auto h-full">
        {tiles.map((tile, i) => (
          <div
            key={i}
            className={`absolute rounded-lg overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(29,185,84,0.25)] ring-1 ring-white/10 opacity-80 ${tile.className}`}
          >
            <AlbumArt track={tile.track} fill />
          </div>
        ))}
      </div>
    </div>
  );
}
