"use client";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TrackRow from "./TrackRow";
import MobileTrackCard from "./MobileTrackCard";
import TablePagination from "./TablePagination";

export default function TrackTable({
  tracks,
  selection,
  onToggleSelection,
  onToggleAll,
  readOnly = false,
  onRemoveOne,
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
      {visible.map((t) => (
        <TrackRow
          key={t.uri || t.spotifyTrackId}
          t={t}
          readOnly={readOnly}
          selected={!readOnly && selection?.has(t.uri)}
          onToggleSelection={onToggleSelection}
          onRemoveOne={onRemoveOne}
          onAddOne={onAddOne}
          draggable={draggable}
        />
      ))}
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

      <TablePagination
        total={total}
        totalPages={totalPages}
        safePage={safePage}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </div>
  );
}
