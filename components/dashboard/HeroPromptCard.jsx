"use client";

import { useEffect, useState } from "react";
import { HiSparkles } from "react-icons/hi";
import { FiArrowRight, FiShuffle } from "react-icons/fi";
import { useSettings } from "../SettingsContext";
import GuidedBuilder from "./GuidedBuilder";
import {
  EXAMPLE_PROMPTS,
  getContextualSuggestion,
  pickRotating,
} from "@/lib/promptIdeas";

const CHIPS = [
  { label: "Chill", dot: "bg-emerald-400", prompt: "chill, relaxed, easygoing songs to unwind to" },
  { label: "Hype", dot: "bg-yellow-400", prompt: "hype, high-energy songs to get pumped up" },
  { label: "Sad", dot: "bg-blue-400", prompt: "sad, melancholy songs for an emotional mood" },
  { label: "Focus", dot: "bg-violet-400", prompt: "focus music for concentration with minimal distractions" },
  { label: "Party", dot: "bg-pink-400", prompt: "party anthems to get everyone dancing" },
  { label: "Throwback", dot: "bg-orange-400", prompt: "nostalgic throwback hits from past decades" },
];

export default function HeroPromptCard({
  prompt,
  onChange,
  onSubmit,
  loading,
  onChipGenerate,
  onSurprise,
  onQuickGenerate,
  moods,
}) {
  const settings = useSettings();
  const personalized = settings?.aiTastePersonalization !== false;

  const [mode, setMode] = useState("describe"); // "describe" | "build"
  const [suggestion, setSuggestion] = useState(null);
  const [examples, setExamples] = useState([]);

  // Computed client-side to avoid SSR/CSR hydration mismatch (time-dependent).
  useEffect(() => {
    setSuggestion(getContextualSuggestion());
    setExamples(pickRotating(EXAMPLE_PROMPTS, 4));
  }, []);

  const trending = (moods?.playlists || [])
    .filter((m) => m?.name && m?.prompt)
    .slice(0, 4);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-950 via-neutral-900 to-emerald-950/30 shadow-spotify-glow">
      <div className="pointer-events-none absolute -top-24 -left-16 w-64 h-64 rounded-full bg-spotify/20 blur-3xl" />
      <div className="relative grid grid-cols-1 xl:grid-cols-2 gap-6 p-6 md:p-8">
        {/* Left: headline + contextual nudge */}
        <div className="flex flex-col justify-center gap-4">
          <div>
            <HiSparkles className="text-spotify text-2xl mb-3" />
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
              What are you<br />in the mood for?
            </h1>
            <p className="text-sm text-neutral-400 mt-3 max-w-sm">
              Not sure? Tap a starting point — Sonata takes it from there.
            </p>
          </div>

          {/* Time-aware one-tap suggestion */}
          {suggestion && (
            <button
              type="button"
              disabled={loading}
              onClick={() => onQuickGenerate(suggestion.prompt)}
              className="group flex items-center gap-3 w-full max-w-sm p-3.5 rounded-xl bg-spotify/10 border border-spotify/30 hover:bg-spotify/15 text-left transition-colors disabled:opacity-50"
            >
              <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-spotify/20 flex items-center justify-center">
                <HiSparkles className="text-spotify" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-white">
                  {suggestion.label}
                </span>
                <span className="block text-[11px] text-neutral-400 truncate">
                  {suggestion.blurb}
                </span>
              </span>
              <FiArrowRight className="text-spotify group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Inline inspiration: trending moods */}
          {trending.length > 0 && (
            <div className="max-w-sm">
              <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-2">
                Trending now
              </p>
              <div className="flex flex-wrap gap-2">
                {trending.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    disabled={loading}
                    onClick={() => onQuickGenerate(m.prompt)}
                    className="px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 hover:bg-neutral-800 text-xs text-neutral-200 disabled:opacity-50 transition-colors"
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: mode toggle + input */}
        <div className="flex flex-col gap-4">
          {/* Mode toggle */}
          <div className="inline-flex self-start p-1 rounded-full bg-neutral-950/70 border border-neutral-800">
            {[
              { id: "describe", label: "Describe it" },
              { id: "build", label: "Build it" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  mode === t.id
                    ? "bg-spotify text-black"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {mode === "describe" ? (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit();
                }}
              >
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Tell Sonata your mood, activity, or moment…"
                    rows={3}
                    maxLength={500}
                    className="w-full p-4 pr-10 rounded-xl bg-neutral-950/70 border border-neutral-800 focus:border-spotify focus:outline-none resize-none text-sm"
                  />
                  <HiSparkles className="absolute right-3 bottom-3 text-neutral-600" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-spotify hover:brightness-110 text-black font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiSparkles /> {loading ? "Generating…" : "Generate"}
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onSurprise}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-900/80 border border-neutral-800 hover:bg-neutral-800 text-sm text-neutral-200 disabled:opacity-50 transition-colors"
                  >
                    <FiShuffle /> Surprise me
                  </button>
                  {personalized && (
                    <span
                      title="Sonata is using your top artists & recent listening to personalize results."
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-spotify/10 border border-spotify/30 text-[11px] font-medium text-spotify"
                    >
                      <HiSparkles className="text-[10px]" /> Personalized for you
                    </span>
                  )}
                </div>
              </form>

              {/* Vibe chips — one tap generates */}
              <div className="flex flex-wrap gap-2">
                {CHIPS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    disabled={loading}
                    onClick={() => onChipGenerate(c.prompt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 hover:bg-neutral-800 text-xs text-neutral-200 disabled:opacity-50 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Clickable example prompts */}
              {examples.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-2">
                    Try one of these
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {examples.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        disabled={loading}
                        onClick={() => onQuickGenerate(ex)}
                        className="px-3 py-1.5 rounded-full bg-transparent border border-dashed border-neutral-700 hover:border-spotify/60 hover:text-white text-xs text-neutral-400 disabled:opacity-50 transition-colors"
                      >
                        “{ex}”
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <GuidedBuilder onSubmit={onQuickGenerate} loading={loading} />
          )}
        </div>
      </div>
    </section>
  );
}
