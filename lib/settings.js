export const DEFAULT_SETTINGS = {
  autoplayPreviews: false,
  defaultVolume: 70,
  crossfadeDuration: 0,
  allowExplicit: true,
  aiTastePersonalization: true,
  autoSaveToSpotify: false,
  enableDeezerPreviews: true,
  hasCompletedOnboarding: false,
  theme: "dark",
  accentColor: "green",
};

export const ACCENT_COLORS = {
  green: "29 185 84",
  blue: "59 130 246",
  purple: "168 85 247",
  pink: "236 72 153",
  red: "239 68 68",
  orange: "249 115 22",
  teal: "20 184 166",
};

export const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS);

export function sanitizeSettingsPatch(patch) {
  if (!patch || typeof patch !== "object") return {};
  const out = {};
  for (const key of SETTINGS_KEYS) {
    if (!(key in patch)) continue;
    const v = patch[key];
    const def = DEFAULT_SETTINGS[key];
    if (typeof def === "boolean") {
      if (typeof v === "boolean") out[key] = v;
    } else if (typeof def === "number") {
      if (typeof v === "number" && Number.isFinite(v)) {
        if (key === "defaultVolume") out[key] = Math.max(0, Math.min(100, v));
        else if (key === "crossfadeDuration") out[key] = Math.max(0, Math.min(8, v));
        else out[key] = v;
      }
    } else if (typeof def === "string") {
      if (typeof v === "string") {
        if (key === "theme" && !["dark", "light", "system"].includes(v)) continue;
        if (key === "accentColor" && !(v in ACCENT_COLORS)) continue;
        out[key] = v;
      }
    }
  }
  return out;
}

export function mergeWithDefaults(doc) {
  const merged = { ...DEFAULT_SETTINGS };
  if (!doc) return merged;
  for (const key of SETTINGS_KEYS) {
    if (doc[key] !== undefined && doc[key] !== null) merged[key] = doc[key];
  }
  return merged;
}
