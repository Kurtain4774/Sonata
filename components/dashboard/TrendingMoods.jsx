"use client";

import { HiSparkles } from "react-icons/hi";
import { FiChevronRight } from "react-icons/fi";

const MOODS = [
  {
    name: "Dreamy",
    prompt: "Dreamy ethereal late-night ambient",
    count: "12.4K playlists",
    img: "https://images.unsplash.com/photo-1532978879514-6cb1f7cbfdba?w=400&q=60&auto=format",
  },
  {
    name: "Late Night",
    prompt: "Late night drive synthwave",
    count: "9.8K playlists",
    img: "https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=400&q=60&auto=format",
  },
  {
    name: "Summer Vibes",
    prompt: "Summer road trip feel-good pop",
    count: "15.3K playlists",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=60&auto=format",
  },
  {
    name: "Cinematic",
    prompt: "Cinematic orchestral score epic",
    count: "8.7K playlists",
    img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=60&auto=format",
  },
];

export default function TrendingMoods({ onPickMood }) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiSparkles className="text-violet-400" />
          <h3 className="text-sm font-semibold">Explore Trending Moods</h3>
        </div>
        <button
          type="button"
          className="text-xs text-neutral-400 hover:text-white"
          onClick={() => onPickMood?.("")}
        >
          View all
        </button>
      </div>
      <ul className="space-y-2">
        {MOODS.map((m) => (
          <li key={m.name}>
            <button
              type="button"
              onClick={() => onPickMood?.(m.prompt)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-900 transition-colors text-left group"
            >
              <div className="relative w-12 h-9 rounded-md overflow-hidden bg-neutral-800 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{m.name}</div>
                <div className="text-[11px] text-neutral-500 truncate">{m.count}</div>
              </div>
              <FiChevronRight className="text-neutral-500 group-hover:text-white" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
