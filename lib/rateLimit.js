// In-memory sliding-window rate limiter, keyed by an opaque string (typically
// the Spotify user id). Resets when the process restarts — fine for protecting
// the Gemini quota from a single user hammering "Try again". For multi-region
// deployments, swap this for a shared store (Redis/Upstash).

const WINDOWS = new Map();
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = 0;

function sweep(now) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, hits] of WINDOWS) {
    const cutoff = now - 60_000;
    const filtered = hits.filter((t) => t > cutoff);
    if (filtered.length === 0) WINDOWS.delete(key);
    else WINDOWS.set(key, filtered);
  }
}

// limit: max requests per windowMs. Returns { ok, remaining, retryAfterMs }.
export function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  if (!key) return { ok: true, remaining: limit, retryAfterMs: 0 };
  const now = Date.now();
  sweep(now);
  const cutoff = now - windowMs;
  const hits = (WINDOWS.get(key) || []).filter((t) => t > cutoff);
  if (hits.length >= limit) {
    const retryAfterMs = Math.max(0, hits[0] + windowMs - now);
    WINDOWS.set(key, hits);
    return { ok: false, remaining: 0, retryAfterMs };
  }
  hits.push(now);
  WINDOWS.set(key, hits);
  return { ok: true, remaining: limit - hits.length, retryAfterMs: 0 };
}
