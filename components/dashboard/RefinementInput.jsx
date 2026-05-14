"use client";

import { memo } from "react";

function RefinementInput({ refineText, refineLoading, refineError, onChange, onSubmit, inputRef }) {
  return (
    <div className="mt-6 border-t border-neutral-800 pt-5">
      <p className="text-sm text-neutral-400 mb-3">
        Not quite right? Refine the vibe:
      </p>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={refineText}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !refineLoading && onSubmit()}
          placeholder="Refine: more upbeat, less pop, add 90s songs…"
          disabled={refineLoading}
          className="flex-1 px-4 py-2.5 rounded-full bg-neutral-900 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 disabled:opacity-50"
        />
        <button
          onClick={onSubmit}
          disabled={refineLoading || !refineText.trim()}
          className="px-5 py-2.5 rounded-full bg-neutral-700 hover:bg-neutral-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {refineLoading ? "Refining…" : "Refine"}
        </button>
      </div>
      {refineError && (
        <p className="mt-2 text-sm text-red-300">{refineError}</p>
      )}
    </div>
  );
}

export default memo(RefinementInput);
