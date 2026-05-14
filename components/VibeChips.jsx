"use client";

import { useRef, useState } from "react";

const VIBES = ["Chill", "Hype", "Sad", "Focus", "Party", "Throwback"];

export default function VibeChips({ onPick, disabled }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const refs = useRef([]);

  const focusAt = (i) => {
    setActiveIdx(i);
    refs.current[i]?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt((activeIdx + 1) % VIBES.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt((activeIdx - 1 + VIBES.length) % VIBES.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusAt(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusAt(VIBES.length - 1);
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Vibe suggestions"
      onKeyDown={onKeyDown}
      className="flex flex-wrap justify-center gap-2 mt-3"
    >
      {VIBES.map((v, i) => (
        <button
          key={v}
          ref={(el) => (refs.current[i] = el)}
          type="button"
          disabled={disabled}
          tabIndex={i === activeIdx ? 0 : -1}
          aria-label={`Use ${v} vibe`}
          onFocus={() => setActiveIdx(i)}
          onClick={() => onPick(v)}
          className="px-3 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-sm disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-spotify focus:outline-none"
        >
          {v}
        </button>
      ))}
    </div>
  );
}
