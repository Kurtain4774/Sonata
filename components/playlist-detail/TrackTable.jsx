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
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function MobileTrackCard({
  t,
  readOnly,
  selected,
  onToggleSelection,
  onRemoveOne,
  onDislikeOne,
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
        {t.albumArt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={t.albumArt}
            alt=""
            className="h-14 w-14 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded bg-neutral-800" />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-neutral-100">{t.title}</div>
          <div className="truncate text-sm text-neutral-400">{t.artist}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            <span>{formatDuration(t.durationMs)}</span>
            {t.matchScore != null && (
              <span className="text-spotify">{t.matchScore}% match</span>
            )}
            {t.moodFit && <MoodFitPill label={t.moodFit} />}
          </div>
        </div>
      </div>
      {(readOnly || onDislikeOne || onRemoveOne) && (
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
            <>
              {onDislikeOne && (
                <button
                  type="button"
                  onClick={() => onDislikeOne(t.uri)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-neutral-300 hover:border-amber-400/40 hover:text-amber-400"
                >
                  <FiThumbsDown className="h-4 w-4" /> Dislike
                </button>
              )}
              {onRemoveOne && (
                <button
                  type="button"
                  onClick={() => onRemoveOne(t.uri)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1.5 text-neutral-300 hover:border-rose-400/40 hover:text-rose-400"
                >
                  <FiTrash2 className="h-4 w-4" /> Remove
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
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
      <div className="grid gap-3 md:hidden">
        {visible.map((t) => (
          <MobileTrackCard
            key={t.uri || t.spotifyTrackId}
            t={t}
            readOnly={readOnly}
            selected={!readOnly && selection?.has(t.uri)}
            onToggleSelection={onToggleSelection}
            onRemoveOne={onRemoveOne}
            onDislikeOne={onDislikeOne}
            onAddOne={onAddOne}
          />
        ))}
        {visible.length === 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 py-10 text-center text-sm text-neutral-500">
            No tracks to show.
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-3 px-1 text-xs text-neutral-400">
        <div>{total} tracks</div>
        <div className="flex items-center justify-center gap-2">
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
        <div className="flex items-center justify-between gap-2 sm:justify-start">
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
