import { FiClock } from "react-icons/fi";

function formatWhen(d) {
  return new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HistoryTab({ history = [] }) {
  if (!history.length) {
    return (
      <div className="py-16 text-center text-neutral-500 text-sm">
        No refinements yet. Use the Refine Playlist panel to tweak this playlist.
      </div>
    );
  }
  return (
    <ol className="relative border-l border-neutral-800 ml-2 mt-4 space-y-6">
      {[...history].reverse().map((h, i) => (
        <li key={i} className="ml-6">
          <span className="absolute -left-2 mt-1 w-4 h-4 rounded-full bg-spotify flex items-center justify-center">
            <FiClock className="w-2.5 h-2.5 text-black" />
          </span>
          <div className="text-xs text-neutral-500">{formatWhen(h.appliedAt)}</div>
          <div className="mt-1 text-sm text-neutral-200">{h.followUp || "Refinement applied"}</div>
          {(h.shortcutsApplied?.length || h.excludedArtists?.length) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {h.shortcutsApplied?.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-full bg-spotify/15 text-spotify text-[11px]"
                >
                  {s.replace(/_/g, " ")}
                </span>
              ))}
              {h.excludedArtists?.map((a) => (
                <span
                  key={a}
                  className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[11px]"
                >
                  − {a}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
