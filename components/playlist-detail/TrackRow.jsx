"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiTrash2, FiPlus, FiMenu } from "react-icons/fi";
import MoodFitPill from "./MoodFitPill";
import AlbumArtImage from "@/components/AlbumArtImage";
import { formatDuration } from "@/lib/timeFormatters";

export default function TrackRow({
  t,
  readOnly,
  selected,
  onToggleSelection,
  onRemoveOne,
  onAddOne,
  draggable,
}) {
  const sortable = useSortable({ id: t.uri, disabled: !draggable });
  const style = draggable
    ? {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <tr
      ref={draggable ? sortable.setNodeRef : undefined}
      style={style}
      className={`border-b border-neutral-900 hover:bg-neutral-900/60 transition-colors ${
        selected ? "bg-spotify/[0.06]" : ""
      } ${draggable && sortable.isDragging ? "shadow-lg" : ""}`}
    >
      {draggable && (
        <td className="py-2.5 pl-3 pr-1 w-7">
          <button
            type="button"
            className="text-neutral-600 hover:text-neutral-300 cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...sortable.attributes}
            {...sortable.listeners}
          >
            <FiMenu className="w-4 h-4" />
          </button>
        </td>
      )}
      {!readOnly && (
        <td className="py-2.5 pl-3 pr-2">
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggleSelection?.(t.uri)}
            className="accent-spotify w-4 h-4 cursor-pointer"
          />
        </td>
      )}
      <td className="py-2.5 px-2">
        <div className="flex items-center gap-3 min-w-0">
          <AlbumArtImage
            src={t.albumArt}
            className="w-9 h-9 rounded object-cover flex-shrink-0"
          />
          <span className="font-medium text-neutral-100 truncate">
            {t.title}
          </span>
        </div>
      </td>
      <td className="py-2.5 px-2 text-neutral-300 truncate max-w-[160px]">
        {t.artist}
      </td>
      <td className="py-2.5 px-2 text-neutral-400 truncate max-w-[160px]">
        {t.album || "—"}
      </td>
      <td className="py-2.5 px-2 text-spotify font-medium">
        {t.matchScore != null ? `${t.matchScore}%` : "—"}
      </td>
      <td className="py-2.5 px-2">
        <MoodFitPill label={t.moodFit} />
      </td>
      <td className="py-2.5 px-2 text-neutral-400 tabular-nums">
        {formatDuration(t.durationMs, "—")}
      </td>
      <td className="py-2.5 pl-2 pr-3">
        <div className="flex items-center justify-end gap-1 text-neutral-400">
          {readOnly ? (
            <button
              onClick={() => onAddOne?.(t)}
              className="p-1.5 rounded hover:bg-neutral-800 hover:text-spotify"
              title="Add to playlist"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onRemoveOne?.(t.uri)}
              className="p-1.5 rounded hover:bg-neutral-800 hover:text-rose-400"
              title="Remove"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
