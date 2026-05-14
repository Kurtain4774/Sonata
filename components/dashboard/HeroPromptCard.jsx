"use client";

import { HiSparkles } from "react-icons/hi";
import FineTuneControls from "../FineTuneControls";
import { useSettings } from "../SettingsContext";

const CHIPS = [
  { label: "Chill", dot: "bg-emerald-400", icon: "🌿" },
  { label: "Hype", dot: "bg-yellow-400", icon: "⚡" },
  { label: "Sad", dot: "bg-blue-400", icon: "🌧️" },
  { label: "Focus", dot: "bg-violet-400", icon: "🎯" },
  { label: "Party", dot: "bg-pink-400", icon: "🪩" },
  { label: "Throwback", dot: "bg-orange-400", icon: "📼" },
];

export default function HeroPromptCard({
  prompt,
  onChange,
  onSubmit,
  loading,
  onPickVibe,
  fineTune,
  onFineTuneChange,
}) {
  const settings = useSettings();
  const personalized = settings?.aiTastePersonalization !== false;
  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-950 via-neutral-900 to-emerald-950/30 shadow-spotify-glow">
      <div className="pointer-events-none absolute -top-24 -left-16 w-64 h-64 rounded-full bg-spotify/20 blur-3xl" />
      <div className="relative grid grid-cols-1 xl:grid-cols-2 gap-6 p-6 md:p-8">
        {/* Left: headline */}
        <div className="flex flex-col justify-center">
          <HiSparkles className="text-spotify text-2xl mb-3" />
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
            What are you<br />in the mood for?
          </h1>
          <p className="text-sm text-neutral-400 mt-3 max-w-sm">
            Describe your vibe and Sonata will craft the perfect soundtrack.
          </p>
        </div>

        {/* Right: input + chips */}
        <div className="flex flex-col gap-4">
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
              {personalized && (
                <span
                  title="Sonata is using your top artists & recent listening to personalize results."
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-spotify/10 border border-spotify/30 text-[11px] font-medium text-spotify"
                >
                  <HiSparkles className="text-[10px]" /> Personalized for you
                </span>
              )}
              <div className="flex flex-wrap gap-2">
                {CHIPS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    disabled={loading}
                    onClick={() => onPickVibe(c.label)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 hover:bg-neutral-800 text-xs text-neutral-200 disabled:opacity-50 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </form>

          <FineTuneControls values={fineTune} onChange={onFineTuneChange} />
        </div>
      </div>
    </section>
  );
}
