"use client";

export default function TablePagination({
  total,
  totalPages,
  safePage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) {
  return (
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
  );
}
