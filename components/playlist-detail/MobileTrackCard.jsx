"use client";
import { FiTrash2, FiPlus } from "react-icons/fi";
import MoodFitPill from "./MoodFitPill";
import AlbumArtImage from "@/components/AlbumArtImage";
import { formatDuration } from "@/lib/timeFormatters";

export default function MobileTrackCard({
  t,
  readOnly,
  selected,
  onToggleSelection,
  onRemoveOne,
  onAddOne,
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        selected
          ? "border-spotify/40 bg-spotify/[0.06]"
          : "border-neutral-800 bg-neutral-900/70"
      }`}
    >
      <div className="flex gap-3">
        {!readOnly && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggleSelection?.(t.uri)}
            className="mt-4 h-4 w-4 shrink-0 cursor-pointer accent-spotify"
            aria-label={`Select ${t.title}`}
          />
        )}
        <AlbumArtImage
          src={t.albumArt}
          className="h-14 w-14 shrink-0 rounded object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-neutral-100">{t.title}</div>
          <div className="truncate text-sm text-neutral-400">{t.artist}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            <span>{formatDuration(t.durationMs, "—")}</span>
            {t.matchScore != null && (
              <span className="text-spotify">{t.matchScore}% match</span>
            )}
            {t.moodFit && <MoodFitPill label={t.moodFit} />}
          </div>
        </div>
      </div>
      {(readOnly || onRemoveOne) && (
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-neutral-800 pt-2 text-sm">
          {readOnly ? (
            <button
              type="button"
              onClick={() => onAddOne?.(t)}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-neutral-200 hover:border-spotify/50 hover:text-spotify"
            >
              <FiPlus className="h-4 w-4" /> Add
            </button>
          ) : (
            onRemoveOne && (
              <button
                type="button"
                onClick={() => onRemoveOne(t.uri)}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-neutral-300 hover:border-rose-400/40 hover:text-rose-400"
              >
                <FiTrash2 className="h-4 w-4" /> Remove
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
