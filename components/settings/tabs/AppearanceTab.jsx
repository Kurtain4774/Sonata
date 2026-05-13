"use client";

import { useSettings, useUpdateSettings } from "../../SettingsContext";
import { ACCENT_COLORS } from "@/lib/settings";

const ACCENT_SWATCHES = {
  green: "rgb(29 185 84)",
  blue: "rgb(59 130 246)",
  purple: "rgb(168 85 247)",
  pink: "rgb(236 72 153)",
  red: "rgb(239 68 68)",
  orange: "rgb(249 115 22)",
  teal: "rgb(20 184 166)",
};

const THEMES = [
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
];

export default function AppearanceTab() {
  const settings = useSettings();
  const update = useUpdateSettings();

  return (
    <div className="divide-y divide-neutral-800">
      <div className="py-3">
        <div className="text-sm font-medium text-neutral-100">Theme</div>
        <div className="text-xs text-neutral-400 mt-0.5">
          Choose how Sonata should appear.
        </div>
        <div className="mt-3 inline-flex rounded-lg bg-neutral-800 p-1">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update({ theme: t.value })}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                settings.theme === t.value
                  ? "bg-spotify text-black font-semibold"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="py-3">
        <div className="text-sm font-medium text-neutral-100">Accent color</div>
        <div className="text-xs text-neutral-400 mt-0.5">
          Used for buttons, toggles, and active states.
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {Object.keys(ACCENT_COLORS).map((color) => {
            const selected = settings.accentColor === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => update({ accentColor: color })}
                aria-label={`Accent color ${color}`}
                className={`w-8 h-8 rounded-full ring-offset-2 ring-offset-neutral-950 transition-all ${
                  selected ? "ring-2 ring-white scale-110" : "hover:scale-105"
                }`}
                style={{ backgroundColor: ACCENT_SWATCHES[color] }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
