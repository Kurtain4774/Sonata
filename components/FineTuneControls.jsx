"use client";
import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const DECADES = ["60s", "70s", "80s", "90s", "2000s", "2010s", "2020s"];
const LANGUAGES = ["Any", "English", "Japanese", "Korean", "Spanish", "Portuguese", "French"];
const ACTIVITIES = ["Any", "Driving", "Working out", "Studying", "Cooking", "Sleeping", "Party"];
const ENERGY_LABELS = ["Very Low", "Low", "Medium", "High", "Very High"];

export const DEFAULT_FINE_TUNE = { energy: 3, decades: [], language: "Any", activity: "Any" };

export default function FineTuneControls({ values, onChange }) {
  const [open, setOpen] = useState(false);

  const update = (key, val) => onChange({ ...values, [key]: val });

  const toggleDecade = (d) => {
    const next = values.decades.includes(d)
      ? values.decades.filter((x) => x !== d)
      : [...values.decades, d];
    update("decades", next);
  };

  const activeCount = [
    values.energy !== 3,
    values.decades.length > 0,
    values.language !== "Any",
    values.activity !== "Any",
  ].filter(Boolean).length;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        {open ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
        Fine-tune
        {activeCount > 0 && !open && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-spotify text-black text-xs font-semibold leading-none">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-5">
          {/* Energy */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-neutral-300 uppercase tracking-wide">
                Energy
              </label>
              <span className="text-xs text-neutral-400">{ENERGY_LABELS[values.energy - 1]}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={values.energy}
              onChange={(e) => update("energy", Number(e.target.value))}
              className="w-full accent-spotify"
            />
            <div className="flex justify-between text-xs text-neutral-600 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Decade */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wide mb-2">
              Decade
            </label>
            <div className="flex flex-wrap gap-2">
              {DECADES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDecade(d)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    values.decades.includes(d)
                      ? "bg-spotify text-black font-semibold"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wide mb-2">
              Language
            </label>
            <select
              value={values.language}
              onChange={(e) => update("language", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-white focus:outline-none focus:border-neutral-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Activity */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wide mb-2">
              Activity
            </label>
            <select
              value={values.activity}
              onChange={(e) => update("activity", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-white focus:outline-none focus:border-neutral-500"
            >
              {ACTIVITIES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
