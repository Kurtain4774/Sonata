"use client";

const VIBES = ["Chill", "Hype", "Sad", "Focus", "Party", "Throwback"];

export default function VibeChips({ onPick, disabled }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-3">
      {VIBES.map((v) => (
        <button
          key={v}
          type="button"
          disabled={disabled}
          onClick={() => onPick(v)}
          className="px-3 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-sm disabled:opacity-50"
        >
          {v}
        </button>
      ))}
    </div>
  );
}
