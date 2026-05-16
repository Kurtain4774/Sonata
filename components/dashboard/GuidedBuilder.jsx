"use client";

import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";

// No-typing playlist builder. The user taps through a few choices and we
// assemble a natural-language prompt for the same /api/recommend pipeline.

const MOMENTS = [
  { label: "Commuting", icon: "🚌", phrase: "for the commute" },
  { label: "Focus / Work", icon: "🎯", phrase: "for focus and deep work, minimal lyrics" },
  { label: "Working out", icon: "💪", phrase: "for a workout" },
  { label: "Winding down", icon: "🌙", phrase: "to wind down and relax" },
  { label: "Going out", icon: "🪩", phrase: "to get ready to go out" },
  { label: "With friends", icon: "🎉", phrase: "for hanging out with friends" },
];

const ENERGIES = [
  { label: "Low", icon: "🍃", word: "low-energy" },
  { label: "Medium", icon: "🌤️", word: "" },
  { label: "High", icon: "🔥", word: "high-energy" },
];

const ERAS = [
  { label: "Any", word: "" },
  { label: "80s", word: "80s" },
  { label: "90s", word: "90s" },
  { label: "2000s", word: "2000s" },
  { label: "2010s", word: "2010s" },
  { label: "2020s", word: "2020s" },
];

function buildPrompt({ moment, energy, era }) {
  const parts = [energy?.word, era?.word, "music", moment?.phrase].filter(Boolean);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export default function GuidedBuilder({ onSubmit, loading }) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState({ moment: null, energy: null, era: null });

  const reset = () => {
    setStep(0);
    setPicks({ moment: null, energy: null, era: null });
  };

  const choose = (key, value) => {
    const next = { ...picks, [key]: value };
    setPicks(next);
    if (step < 2) {
      setStep(step + 1);
    } else {
      onSubmit(buildPrompt(next));
      reset();
    }
  };

  const STEPS = [
    {
      key: "moment",
      title: "What's the moment?",
      options: MOMENTS,
      grid: "grid-cols-2 sm:grid-cols-3",
    },
    {
      key: "energy",
      title: "How much energy?",
      options: ENERGIES,
      grid: "grid-cols-3",
    },
    {
      key: "era",
      title: "Any era? (optional)",
      options: ERAS,
      grid: "grid-cols-3 sm:grid-cols-6",
    },
  ];

  const current = STEPS[step];

  return (
    <div className="flex flex-col gap-4">
      {/* Progress + back */}
      <div className="flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-50"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? "w-6 bg-spotify"
                  : i < step
                  ? "w-1.5 bg-spotify/60"
                  : "w-1.5 bg-neutral-700"
              }`}
            />
          ))}
        </div>
      </div>

      <h3 className="text-lg font-semibold">{current.title}</h3>

      <div className={`grid ${current.grid} gap-2`}>
        {current.options.map((opt) => {
          const selected = picks[current.key]?.label === opt.label;
          return (
            <button
              key={opt.label}
              type="button"
              disabled={loading}
              onClick={() => choose(current.key, opt)}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-sm transition-colors disabled:opacity-50 ${
                selected
                  ? "border-spotify bg-spotify/10 text-white"
                  : "border-neutral-800 bg-neutral-950/70 text-neutral-200 hover:bg-neutral-800 hover:border-neutral-700"
              }`}
            >
              {opt.icon && <span className="text-xl leading-none">{opt.icon}</span>}
              <span className="font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {step === 2 && (
        <p className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
          <HiSparkles className="text-spotify" /> Pick an era to build your playlist.
        </p>
      )}
    </div>
  );
}
