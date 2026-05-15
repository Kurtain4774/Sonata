"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMusic,
  FiPlay,
  FiEdit2,
  FiSearch,
  FiFilter,
  FiSliders,
  FiTrash2,
  FiRepeat,
  FiX,
  FiChevronDown,
  FiPlusCircle,
} from "react-icons/fi";
import { FaSpotify } from "react-icons/fa";
import TrackTable from "./TrackTable";
import RefinePanel from "./RefinePanel";
import HistoryTab from "./HistoryTab";
import SimilarSongsTab from "./SimilarSongsTab";
import MergeModal from "@/components/MergeModal";
import { useToast } from "@/components/ToastContext";

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function totalDurationLabel(tracks) {
  const ms = tracks.reduce((acc, t) => acc + (t.durationMs || 0), 0);
  if (!ms) return null;
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const TABS = [
  { id: "tracks", label: "Tracks" },
  { id: "similar", label: "Similar Songs" },
  { id: "history", label: "History" },
];

export default function PlaylistDetailClient({ playlist }) {
  const toast = useToast();
  const [tracks, setTracks] = useState(playlist.recommendations || []);
  const [name, setName] = useState(playlist.playlistName || playlist.promptText);
  const [description, setDescription] = useState(
    playlist.playlistDescription || playlist.promptText
  );
  const [editingMeta, setEditingMeta] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftDesc, setDraftDesc] = useState(description);

  const [tab, setTab] = useState("tracks");
  const [selection, setSelection] = useState(() => new Set());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState(null);
  const [history, setHistory] = useState(playlist.refinementHistory || []);
  const [excludedArtists, setExcludedArtists] = useState(playlist.excludedArtists || []);

  const [showMerge, setShowMerge] = useState(false);
  const [replaceMenuOpen, setReplaceMenuOpen] = useState(false);
  const [savingSelection, setSavingSelection] = useState(false);

  const [savedAsPlaylist, setSavedAsPlaylist] = useState(playlist.savedAsPlaylist);
  const [playlistUrl, setPlaylistUrl] = useState(playlist.spotifyPlaylistUrl);
  const [savingToSpotify, setSavingToSpotify] = useState(false);

  const artistsOnPlaylist = useMemo(() => {
    const set = new Set();
    for (const t of tracks) {
      if (!t.artist) continue;
      for (const a of t.artist.split(",")) {
        const clean = a.trim();
        if (clean) set.add(clean);
      }
    }
    return Array.from(set).sort();
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter((t) =>
      [t.title, t.artist, t.album]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [tracks, search]);

  function toggleSelection(uri) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(uri)) next.delete(uri);
      else next.add(uri);
      return next;
    });
  }
  function toggleAllVisible(uris, makeSelected) {
    setSelection((prev) => {
      const next = new Set(prev);
      for (const u of uris) {
        if (makeSelected) next.add(u);
        else next.delete(u);
      }
      return next;
    });
  }
  function clearSelection() {
    setSelection(new Set());
  }

  const selectedTracks = useMemo(
    () => tracks.filter((t) => selection.has(t.uri)),
    [tracks, selection]
  );

  async function persistPatch(payload) {
    const res = await fetch(`/api/playlist/${playlist._id}/tracks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Update failed");
    return data;
  }

  async function persistMetadata(payload) {
    const res = await fetch(`/api/playlist/${playlist._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Update failed");
    return data;
  }

  async function removeSelected() {
    const uris = [...selection];
    if (!uris.length) return;
    const prev = tracks;
    setTracks(tracks.filter((t) => !selection.has(t.uri)));
    clearSelection();
    try {
      await persistPatch({ removeUris: uris });
    } catch (err) {
      setTracks(prev);
      alert(err.message);
    }
  }

  async function removeOne(uri) {
    const prev = tracks;
    setTracks(tracks.filter((t) => t.uri !== uri));
    try {
      await persistPatch({ removeUris: [uri] });
    } catch (err) {
      setTracks(prev);
      alert(err.message);
    }
  }

  async function reorderTracks(activeUri, overUri) {
    if (activeUri === overUri) return;
    const fromIdx = tracks.findIndex((t) => t.uri === activeUri);
    const toIdx = tracks.findIndex((t) => t.uri === overUri);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = tracks.slice();
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    const prev = tracks;
    setTracks(next);
    try {
      await persistPatch({ reorderUris: next.map((t) => t.uri).filter(Boolean) });
    } catch (err) {
      setTracks(prev);
      toast({ type: "error", message: err.message || "Couldn't save new order" });
    }
  }

  async function replaceSelectedWithNew() {
    const sel = selectedTracks;
    if (!sel.length) return;
    setRefining(true);
    setRefineError(null);
    setReplaceMenuOpen(false);
    try {
      const followUp = `Replace these specific tracks with alternatives that fit the same vibe: ${sel
        .map((t) => `"${t.title}" by ${t.artist}`)
        .join(", ")}.`;
      const res = await fetch("/api/recommend/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: playlist.promptText,
          followUp,
          currentTracks: tracks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refine failed");
      const replacements = data.tracks || [];
      const replaceMap = {};
      const selUris = sel.map((t) => t.uri);
      replacements.slice(0, selUris.length).forEach((newT, i) => {
        replaceMap[selUris[i]] = newT;
      });
      const newTracks = tracks.map((t) =>
        replaceMap[t.uri] ? replaceMap[t.uri] : t
      );
      setTracks(newTracks);
      clearSelection();
      await persistPatch({
        replaceMap,
        refinement: {
          followUp,
          shortcutsApplied: [],
          excludedArtists: [],
        },
      });
      setHistory([
        ...history,
        { followUp, shortcutsApplied: [], excludedArtists: [], appliedAt: new Date() },
      ]);
    } catch (err) {
      setRefineError(err.message);
    } finally {
      setRefining(false);
    }
  }

  async function applyRefinement({ followUp, shortcutsApplied, excludedArtists: excl }) {
    if (!followUp) return;
    setRefining(true);
    setRefineError(null);
    try {
      const res = await fetch("/api/recommend/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: playlist.promptText,
          followUp,
          currentTracks: tracks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refine failed");
      const newTracks = data.tracks || [];
      setTracks(newTracks);
      setExcludedArtists(excl);
      clearSelection();
      await persistPatch({
        replaceAll: newTracks,
        refinement: { followUp, shortcutsApplied, excludedArtists: excl },
      });
      await persistMetadata({ excludedArtists: excl });
      setHistory([
        ...history,
        { followUp, shortcutsApplied, excludedArtists: excl, appliedAt: new Date() },
      ]);
    } catch (err) {
      setRefineError(err.message);
    } finally {
      setRefining(false);
    }
  }

  async function saveMetadata() {
    try {
      await persistMetadata({
        playlistName: draftName,
        playlistDescription: draftDesc,
      });
      setName(draftName);
      setDescription(draftDesc);
      setEditingMeta(false);
    } catch (err) {
      alert(err.message);
    }
  }

  async function saveSelectionAsNewPlaylist() {
    const sel = selectedTracks;
    if (!sel.length || savingSelection) return;
    const defaultName = `Selection from ${name}`.slice(0, 100);
    const input = window.prompt("New Spotify playlist name:", defaultName);
    if (!input) return;
    const newName = input.trim();
    if (!newName) return;
    setSavingSelection(true);
    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: `Selected from "${name}" — built with Sonata`,
          trackUris: sel.map((t) => t.uri).filter(Boolean),
          tracks: sel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast({
        type: "success",
        message: `Saved ${sel.length} track${sel.length !== 1 ? "s" : ""} to a new Spotify playlist.`,
      });
      clearSelection();
    } catch (err) {
      toast({ type: "error", message: err.message || "Couldn't save selection" });
    } finally {
      setSavingSelection(false);
    }
  }

  async function addSimilarTrack(track) {
    if (tracks.some((t) => t.uri === track.uri)) return;
    const prev = tracks;
    setTracks([...tracks, track]);
    try {
      await persistPatch({ appendTracks: [track] });
    } catch (err) {
      setTracks(prev);
      alert(err.message);
    }
  }

  async function saveToSpotify() {
    setSavingToSpotify(true);
    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: playlist._id,
          name,
          description,
          tracks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSavedAsPlaylist(true);
      setPlaylistUrl(data.playlistUrl);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingToSpotify(false);
    }
  }

  async function playAll() {
    try {
      const trackUris = tracks.map((t) => t.uri).filter(Boolean);
      if (!trackUris.length) return;
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackUris }),
      });
    } catch {
      // ignore
    }
  }

  const totalDur = totalDurationLabel(tracks);
  const collageArts = tracks.slice(0, 4).map((t) => t.albumArt).filter(Boolean);
  while (collageArts.length < 4) collageArts.push(null);

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
      <div className="mb-4">
        <Link
          href="/your-music"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Playlists
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT PANEL */}
        <section className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
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
                      onClick={saveMetadata}
                      className="px-3 py-1.5 rounded-md bg-spotify text-black text-xs font-semibold hover:brightness-110"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingMeta(false);
                        setDraftName(name);
                        setDraftDesc(description);
                      }}
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
                      onClick={() => {
                        setDraftName(name);
                        setDraftDesc(description);
                        setEditingMeta(true);
                      }}
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
                  <FiCalendar className="w-3.5 h-3.5" /> Created {formatDate(playlist.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiMusic className="w-3.5 h-3.5" /> {tracks.length} tracks
                </span>
                {totalDur && (
                  <span className="inline-flex items-center gap-1.5">
                    <FiClock className="w-3.5 h-3.5" /> {totalDur}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={playAll}
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
                    onClick={saveToSpotify}
                    disabled={savingToSpotify}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-100 text-sm hover:bg-neutral-800 transition disabled:opacity-50"
                  >
                    <FaSpotify className="w-4 h-4 text-spotify" />
                    {savingToSpotify ? "Saving…" : "Save to Spotify"}
                  </button>
                )}
                <button
                  onClick={() => {
                    setDraftName(name);
                    setDraftDesc(description);
                    setEditingMeta(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-100 text-sm hover:bg-neutral-800 transition"
                >
                  <FiEdit2 className="w-4 h-4" /> Edit Playlist
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-neutral-800">
            <div className="flex gap-6">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`pb-3 -mb-px text-sm font-medium transition-colors ${
                    tab === t.id
                      ? "text-neutral-100 border-b-2 border-spotify"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === "tracks" && (
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-[220px]">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search tracks in this playlist..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                  />
                </div>
                <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-800 hover:border-neutral-700 text-sm text-neutral-300">
                  <FiFilter className="w-4 h-4" /> Filters
                </button>
                <button className="px-3 py-2 rounded-lg border border-neutral-800 hover:border-neutral-700 text-neutral-300">
                  <FiSliders className="w-4 h-4" />
                </button>
              </div>

              {selection.size > 0 && (
                <div className="flex flex-wrap items-center gap-3 mb-3 px-4 py-3 rounded-xl border border-spotify/40 bg-spotify/[0.08]">
                  <span className="inline-flex items-center gap-2 text-sm text-spotify font-medium">
                    <span className="w-4 h-4 rounded bg-spotify text-black inline-flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                    {selection.size} track{selection.size !== 1 ? "s" : ""} selected
                  </span>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <button
                      onClick={removeSelected}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-rose-400 hover:bg-rose-400/10 text-sm font-medium transition"
                    >
                      <FiTrash2 className="w-4 h-4" /> Remove Selected
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setReplaceMenuOpen((v) => !v)}
                        disabled={refining}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-amber-400 hover:bg-amber-400/10 text-sm font-medium transition disabled:opacity-50"
                      >
                        <FiRepeat className="w-4 h-4" /> Replace Selected
                        <FiChevronDown className="w-3 h-3" />
                      </button>
                      {replaceMenuOpen && (
                        <div className="absolute right-0 mt-1 w-64 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-20 overflow-hidden">
                          <button
                            onClick={replaceSelectedWithNew}
                            className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                          >
                            Replace with new tracks
                          </button>
                          <button
                            onClick={() => {
                              setShowMerge(true);
                              setReplaceMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                          >
                            Merge selected into another playlist…
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={saveSelectionAsNewPlaylist}
                      disabled={savingSelection}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-spotify hover:bg-spotify/10 text-sm font-medium transition disabled:opacity-50"
                      title="Create a new Spotify playlist from these tracks"
                    >
                      <FiPlusCircle className="w-4 h-4" />
                      {savingSelection ? "Saving…" : "Save as new playlist"}
                    </button>
                    <button
                      onClick={clearSelection}
                      className="p-1.5 rounded text-neutral-400 hover:bg-neutral-800"
                      aria-label="Clear selection"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {refineError && (
                <div className="mb-3 text-sm text-rose-400">{refineError}</div>
              )}

              <TrackTable
                tracks={filteredTracks}
                selection={selection}
                onToggleSelection={toggleSelection}
                onToggleAll={toggleAllVisible}
                onRemoveOne={removeOne}
                onReorder={search.trim() ? undefined : reorderTracks}
                page={page}
                onPageChange={setPage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(n) => {
                  setRowsPerPage(n);
                  setPage(1);
                }}
              />
            </div>
          )}

          {tab === "similar" && (
            <div className="mt-4">
              <SimilarSongsTab
                promptId={playlist._id}
                currentTracks={tracks}
                onAdd={addSimilarTrack}
              />
            </div>
          )}

          {tab === "history" && (
            <div className="mt-2">
              <HistoryTab history={history} />
            </div>
          )}
        </section>

        {/* RIGHT PANEL */}
        <div className="lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)]">
          <RefinePanel
            artistsOnPlaylist={artistsOnPlaylist}
            initialExcludedArtists={excludedArtists}
            refining={refining}
            onRefine={applyRefinement}
          />
        </div>
      </div>

      {showMerge && (
        <MergeModal
          tracks={selectedTracks.length ? selectedTracks : tracks}
          onClose={() => setShowMerge(false)}
        />
      )}
    </div>
  );
}
