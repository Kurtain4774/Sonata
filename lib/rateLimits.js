// Per-route rate-limit configs, kept in one place so quotas are easy to audit.
// All windows are one minute; `limit` is the max requests per user per window.
const WINDOW_MS = 60_000;

export const RATE_LIMITS = {
  recommend: { limit: 10, windowMs: WINDOW_MS },
  refine: { limit: 15, windowMs: WINDOW_MS },
  swap: { limit: 30, windowMs: WINDOW_MS },
  settingsExport: { limit: 5, windowMs: WINDOW_MS },
  exploreShare: { limit: 20, windowMs: WINDOW_MS },
  ogImage: { limit: 30, windowMs: WINDOW_MS },
};
