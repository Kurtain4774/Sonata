"use client";
import { useState } from "react";
import { FiCalendar, FiClock, FiMusic, FiPlay, FiEdit2 } from "react-icons/fi";
import { FaSpotify } from "react-icons/fa";
import { formatDate } from "@/lib/timeFormatters";

// Playlist header: collage, editable name/description, metadata, and primary actions.
export default function PlaylistHeader({
  name,
  description,
  createdAt,
  trackCount,
  totalDurationLabel,
  collageArts,
  savedAsPlaylist,
  playlistUrl,
  savingToSpotify,
  onPlayAll,
  onSaveToSpotify,
  onSaveMetadata,
}) {
  const [editingMeta, setEditingMeta] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftDesc, setDraftDesc] = useState(description);

  const beginEdit = () => {
    setDraftName(name);
    setDraftDesc(description);
    setEditingMeta(true);
  };

  const saveMeta = async () => {
    const ok = await onSaveMetadata(draftName, draftDesc);
    if (ok) setEditingMeta(false);
  };

  return (
    <div className="flex items-start gap-5">
      <div className="grid grid-cols-2 grid-rows-2 w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-800">
        {collageArts.map((url, i) =>
          url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div key={i} className="bg-neutral-800" />
          )
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold tracking-wider text-spotify mb-1">
          AI GENERATED PLAYLIST
        </div>
        {editingMeta ? (
          <div className="space-y-2">
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="w-full text-2xl font-bold bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-neutral-100 focus:outline-none focus:border-spotify"
            />
            <textarea
              value={draftDesc}
              onChange={(e) => setDraftDesc(e.target.value)}
              rows={2}
              className="w-full text-sm bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-neutral-300 focus:outline-none focus:border-spotify resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={saveMeta}
                className="px-3 py-1.5 rounded-md bg-spotify text-black text-xs font-semibold hover:brightness-110"
              >
                Save
              </button>
              <button
                onClick={() => setEditingMeta(false)}
                className="px-3 py-1.5 rounded-md border border-neutral-800 text-neutral-300 text-xs hover:border-neutral-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-neutral-50 break-words">
                {name}
              </h1>
              <button
                onClick={beginEdit}
                className="mt-1.5 text-neutral-500 hover:text-neutral-200 transition-colors"
                aria-label="Edit name"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
            </div>
            {description && (
              <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                {description}
              </p>
            )}
          </>
        )}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <FiCalendar className="w-3.5 h-3.5" /> Created {formatDate(createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiMusic className="w-3.5 h-3.5" /> {trackCount} tracks
          </span>
          {totalDurationLabel && (
            <span className="inline-flex items-center gap-1.5">
              <FiClock className="w-3.5 h-3.5" /> {totalDurationLabel}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={onPlayAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-spotify text-black font-semibold text-sm hover:brightness-110 transition"
          >
            <FiPlay className="w-4 h-4" /> Play
          </button>
          {savedAsPlaylist && playlistUrl ? (
            <a
              href={playlistUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-100 text-sm hover:bg-neutral-800 transition"
            >
              <FaSpotify className="w-4 h-4 text-spotify" /> Open in Spotify
            </a>
          ) : (
            <button
              onClick={onSaveToSpotify}
              disabled={savingToSpotify}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-100 text-sm hover:bg-neutral-800 transition disabled:opacity-50"
            >
              <FaSpotify className="w-4 h-4 text-spotify" />
              {savingToSpotify ? "Saving…" : "Save to Spotify"}
            </button>
          )}
          <button
            onClick={beginEdit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-100 text-sm hover:bg-neutral-800 transition"
          >
            <FiEdit2 className="w-4 h-4" /> Edit Playlist
          </button>
        </div>
      </div>
    </div>
  );
}
