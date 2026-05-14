"use client";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FiTrash2,
  FiThumbsDown,
  FiMoreVertical,
  FiPlus,
  FiMenu,
} from "react-icons/fi";
import MoodFitPill from "./MoodFitPill";

function formatDuration(ms) {
  if (!ms) return "—";
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TrackRow({
  t,
  readOnly,
  selected,
  onToggleSelection,
  onRemoveOne,
  onDislikeOne,
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
          {t.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.albumArt}
              alt=""
              className="w-9 h-9 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded bg-neutral-800 flex-shrink-0" />
          )}
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
        {formatDuration(t.durationMs)}
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
            <>
              <button
                onClick={() => onRemoveOne?.(t.uri)}
                className="p-1.5 rounded hover:bg-neutral-800 hover:text-rose-400"
                title="Remove"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDislikeOne?.(t.uri)}
                className="p-1.5 rounded hover:bg-neutral-800 hover:text-amber-400"
                title="Dislike"
              >
                <FiThumbsDown className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded hover:bg-neutral-800"
                title="More"
              >
                <FiMoreVertical className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function TrackTable({
  tracks,
  selection,
  onToggleSelection,
  onToggleAll,
  readOnly = false,
  onRemoveOne,
  onDislikeOne,
  onAddOne,
  onReorder,
  rowsPerPage = 10,
  page,
  onPageChange,
  onRowsPerPageChange,
}) {
  const total = tracks.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const visible = tracks.slice(start, start + rowsPerPage);

  const allVisibleSelected =
    !readOnly &&
    visible.length > 0 &&
    visible.every((t) => selection?.has(t.uri));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const draggable = typeof onReorder === "function";

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder?.(active.id, over.id);
  };

  const visibleUris = visible.map((t) => t.uri);

  const tableBody = (
    <tbody>
      {visible.map((t) => {
        const selected = !readOnly && selection?.has(t.uri);
        return (
          <TrackRow
            key={t.uri || t.spotifyTrackId}
            t={t}
            readOnly={readOnly}
            selected={selected}
            onToggleSelection={onToggleSelection}
            onRemoveOne={onRemoveOne}
            onDislikeOne={onDislikeOne}
            onAddOne={onAddOne}
            draggable={draggable}
          />
        );
      })}
      {visible.length === 0 && (
        <tr>
          <td
            colSpan={(readOnly ? 7 : 8) + (draggable ? 1 : 0)}
            className="py-10 text-center text-neutral-500"
          >
            No tracks to show.
          </td>
        </tr>
      )}
    </tbody>
  );

  const tableInner = (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-neutral-500 text-xs uppercase tracking-wider border-b border-neutral-800">
          {draggable && <th className="py-3 pl-3 pr-1 w-7"></th>}
          {!readOnly && (
            <th className="py-3 pl-3 pr-2 w-8">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={() => onToggleAll?.(visible.map((t) => t.uri), !allVisibleSelected)}
                className="accent-spotify w-4 h-4 cursor-pointer"
              />
            </th>
          )}
          <th className="py-3 px-2 font-medium">Track</th>
          <th className="py-3 px-2 font-medium">Artist</th>
          <th className="py-3 px-2 font-medium">Album</th>
          <th className="py-3 px-2 font-medium">Match Score</th>
          <th className="py-3 px-2 font-medium">Mood Fit</th>
          <th className="py-3 px-2 font-medium">Duration</th>
          <th className="py-3 px-2 font-medium text-right pr-3">Actions</th>
        </tr>
      </thead>
      {tableBody}
    </table>
  );

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        {draggable ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={visibleUris} strategy={verticalListSortingStrategy}>
              {tableInner}
            </SortableContext>
          </DndContext>
        ) : (
          tableInner
        )}
      </div>

      <div className="flex items-center justify-between mt-3 px-1 text-xs text-neutral-400">
        <div>{total} tracks</div>
        <div className="flex items-center gap-2">
          <button
            disabled={safePage <= 1}
            onClick={() => onPageChange?.(safePage - 1)}
            className="px-2 py-1 rounded hover:bg-neutral-800 disabled:opacity-40"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange?.(p)}
              className={`min-w-[28px] px-2 py-1 rounded ${
                p === safePage
                  ? "bg-spotify text-black font-semibold"
                  : "hover:bg-neutral-800"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={safePage >= totalPages}
            onClick={() => onPageChange?.(safePage + 1)}
            className="px-2 py-1 rounded hover:bg-neutral-800 disabled:opacity-40"
          >
            ›
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
            className="bg-neutral-900 border border-neutral-800 rounded px-1.5 py-1 text-neutral-200 focus:outline-none focus:border-neutral-600"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
