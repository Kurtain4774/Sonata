"use client";

// Shared building blocks for the listening-stats tabs.

export const RANGES = [
  { key: "short_term", label: "Last 4 Weeks" },
  { key: "medium_term", label: "Last 6 Months" },
  { key: "long_term", label: "All Time" },
];

export const INITIAL_VISIBLE = 20;

export function RangeToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-neutral-800 bg-neutral-900 p-1">
      {RANGES.map((r) => (
        <button
          key={r.key}
          onClick={() => onChange(r.key)}
          className={`px-4 py-1.5 text-sm rounded-full transition ${
            value === r.key
              ? "bg-spotify text-black font-medium"
              : "text-neutral-300 hover:text-white"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function SkeletonRow({ withImage = true, circular = false }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 animate-pulse">
      <div className="w-6 text-right text-neutral-700">·</div>
      {withImage && (
        <div
          className={`w-14 h-14 bg-neutral-800 ${
            circular ? "rounded-full" : "rounded"
          }`}
        />
      )}
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-neutral-800 rounded w-1/2" />
        <div className="h-3 bg-neutral-800 rounded w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 6, circular = false }) {
  return (
    <div className="grid gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} circular={circular} />
      ))}
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="p-8 text-center text-neutral-400 border border-neutral-800 rounded-lg bg-neutral-900">
      {message}
    </div>
  );
}
