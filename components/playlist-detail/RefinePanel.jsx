"use client";
import { useState, useMemo } from "react";
import {
  FiX,
  FiPlus,
  FiCheck,
  FiCloud,
  FiMicOff,
  FiZap,
  FiTrendingUp,
  FiClock,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

const SHORTCUTS = [
  { id: "more_ambient", label: "More ambient", description: "Increase ambient and atmospheric tracks", Icon: FiCloud, phrase: "more ambient and atmospheric tracks" },
  { id: "less_vocals", label: "Less vocals", description: "Reduce vocal presence", Icon: FiMicOff, phrase: "less vocal presence — more instrumental" },
  { id: "more_dreamy", label: "More dreamy", description: "Increase dreamy and ethereal vibes", Icon: FiZap, phrase: "more dreamy and ethereal vibes" },
  { id: "more_evolving", label: "More evolving", description: "Add more progressive, evolving tracks", Icon: FiTrendingUp, phrase: "more progressive, evolving tracks" },
  { id: "slower_tempo", label: "Slower tempo", description: "Focus on slower, downtempo tracks", Icon: FiClock, phrase: "slower, downtempo tracks" },
];

export default function RefinePanel({
  artistsOnPlaylist = [],
  initialExcludedArtists = [],
  refining = false,
  onClose,
  onRefine,
}) {
  const [staged, setStaged] = useState(() => new Set());
  const [excluded, setExcluded] = useState(initialExcludedArtists);
  const [artistQuery, setArtistQuery] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = artistQuery.trim().toLowerCase();
    if (!q) return [];
    return artistsOnPlaylist
      .filter((a) => a.toLowerCase().includes(q) && !excluded.includes(a))
      .slice(0, 5);
  }, [artistQuery, artistsOnPlaylist, excluded]);

  function toggleShortcut(id) {
    setStaged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addExclusion(name) {
    const clean = name.trim();
    if (!clean) return;
    if (excluded.includes(clean)) return;
    setExcluded([...excluded, clean]);
    setArtistQuery("");
  }

  function removeExclusion(name) {
    setExcluded(excluded.filter((a) => a !== name));
  }

  const canRefine = staged.size > 0 || excluded.length > 0;

  function submit() {
    const shortcutsApplied = SHORTCUTS.filter((s) => staged.has(s.id));
    const phrases = shortcutsApplied.map((s) => s.phrase);
    const parts = [];
    if (phrases.length) parts.push(`Apply these adjustments: ${phrases.join(", ")}.`);
    if (excluded.length) parts.push(`Exclude these artists entirely: ${excluded.join(", ")}.`);
    const followUp = parts.join(" ");
    onRefine?.({
      followUp,
      shortcutsApplied: shortcutsApplied.map((s) => s.id),
      excludedArtists: excluded,
    });
  }

  return (
    <aside className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-neutral-100">Refine Playlist</h2>
          <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-spotify/20 text-spotify">
            BETA
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1 rounded"
            aria-label="Close refine panel"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        <p className="text-sm text-neutral-400 leading-relaxed">
          Fine-tune your playlist after removing or editing tracks. Your changes help Sonata get better.
        </p>

        <section>
          <h3 className="text-sm font-semibold text-neutral-200 mb-3">Refinement Shortcuts</h3>
          <div className="space-y-2">
            {SHORTCUTS.map(({ id, label, description, Icon }) => {
              const on = staged.has(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleShortcut(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                    on
                      ? "border-spotify bg-spotify/10"
                      : "border-neutral-800 hover:border-neutral-700 bg-neutral-950/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${on ? "text-spotify" : "text-neutral-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-100">{label}</div>
                    <div className="text-xs text-neutral-500 truncate">{description}</div>
                  </div>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      on ? "bg-spotify text-black" : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {on ? <FiCheck className="w-3.5 h-3.5" /> : <FiPlus className="w-3.5 h-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-neutral-200">Exclude from Playlist</h3>
            <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-spotify/20 text-spotify">
              BETA
            </span>
          </div>
          <div className="relative">
            <div className="flex gap-2">
              <input
                value={artistQuery}
                onChange={(e) => setArtistQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addExclusion(artistQuery);
                  }
                }}
                placeholder="Search artist to exclude..."
                className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
              />
              <button
                onClick={() => addExclusion(artistQuery)}
                disabled={!artistQuery.trim()}
                className="px-3 py-2 rounded-lg border border-neutral-800 hover:border-neutral-700 text-neutral-300 disabled:opacity-40"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="absolute z-10 left-0 right-12 mt-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => addExclusion(s)}
                    className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          {excluded.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {excluded.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 text-xs text-neutral-200"
                >
                  {a}
                  <button
                    onClick={() => removeExclusion(a)}
                    className="text-neutral-400 hover:text-rose-400"
                    aria-label={`Remove ${a}`}
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        <section>
          <button
            onClick={() => setAdvancedOpen((v) => !v)}
            className="w-full flex items-center justify-between py-2 text-sm font-semibold text-neutral-200"
          >
            <span>Advanced Options</span>
            {advancedOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
          </button>
          {advancedOpen && (
            <p className="text-xs text-neutral-500 mt-1">
              More options coming soon.
            </p>
          )}
        </section>
      </div>

      <div className="border-t border-neutral-800 p-4 bg-neutral-950/40">
        <button
          onClick={submit}
          disabled={!canRefine || refining}
          className="w-full py-2.5 rounded-full bg-spotify text-black font-semibold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {refining ? "Refining…" : (
            <>
              <FiZap className="w-4 h-4" /> Refine Playlist
            </>
          )}
        </button>
        <p className="text-[11px] text-neutral-500 text-center mt-2">
          This will regenerate and reorder your playlist.
        </p>
      </div>
    </aside>
  );
}
