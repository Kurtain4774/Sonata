"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { FiChevronRight } from "react-icons/fi";
import { useWebPlayback } from "../WebPlaybackProvider";

export default function RecommendedRow() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const wb = useWebPlayback();

  useEffect(() => {
    fetch("/api/history")
      .then((r) => (r.ok ? r.json() : { prompts: [] }))
      .then((d) => {
        const saved = (d.prompts || []).filter((p) => p.savedAsPlaylist).slice(0, 10);
        setItems(saved.length ? saved : (d.prompts || []).slice(0, 10));
      })
      .finally(() => setLoading(false));
  }, []);

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  if (!loading && !items.length) return null;

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <HiSparkles className="text-spotify" />
          <h2 className="text-base font-semibold">Recommended for You</h2>
          <span className="hidden sm:inline text-xs text-neutral-500">
            AI-curated playlists based on your taste and sessions.
          </span>
        </div>
        <Link href="/your-music" className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1">
          View all <FiChevronRight />
        </Link>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x pb-2 -mx-1 px-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="snap-start flex-shrink-0 w-[220px] rounded-xl bg-neutral-900 border border-neutral-800 animate-pulse"
              >
                <div className="aspect-square bg-neutral-800 rounded-t-xl" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-neutral-800 rounded w-3/4" />
                  <div className="h-3 bg-neutral-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          {!loading &&
            items.map((p, idx) => (
              <RecCard key={p.id} item={p} isNew={idx === 0} wb={wb} />
            ))}
        </div>
        <button
          type="button"
          onClick={scrollRight}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-950/90 border border-neutral-800 items-center justify-center hover:bg-neutral-800"
          aria-label="Scroll right"
        >
          <FiChevronRight />
        </button>
      </div>
    </section>
  );
}

function RecCard({ item, isNew, wb }) {
  const thumb = item.thumbnails?.[0];
  return (
    <div className="relative snap-start flex-shrink-0 w-[220px] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 group">
      <Link href={`/your-music/${item.id}`} className="block">
        <div className="relative aspect-square bg-neutral-800">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="w-full h-full object-cover" />
          ) : null}
          {isNew && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-spotify text-black text-[10px] font-bold uppercase">
              ✦ New
            </span>
          )}
        </div>
        <div className="p-3">
          <div className="text-sm font-semibold truncate">
            {item.playlistName || item.promptText}
          </div>
          <div className="text-[11px] text-neutral-400 truncate">
            {item.trackCount} tracks
          </div>
        </div>
      </Link>
      <button
        type="button"
        aria-label="Play"
        className="absolute bottom-12 right-3 w-10 h-10 rounded-full bg-spotify text-black flex items-center justify-center opacity-90 hover:opacity-100 hover:scale-105 transition"
        onClick={() => wb?.playTrack && null}
      >
        <FaPlay className="text-xs ml-0.5" />
      </button>
    </div>
  );
}
