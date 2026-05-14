import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiParseError extends Error {}
export class GeminiUnavailableError extends Error {
  constructor(message, { status, retryAfterMs, cause } = {}) {
    super(message);
    this.name = "GeminiUnavailableError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
    this.cause = cause;
  }
}

const ENERGY_LABELS = ["very low", "low", "medium", "high", "very high"];

function buildContextSuffix(context) {
  if (!context) return "";
  const parts = [];
  if (context.energy != null && context.energy !== 3) {
    parts.push(`Energy level: ${ENERGY_LABELS[context.energy - 1]}.`);
  }
  if (Array.isArray(context.decades) && context.decades.length > 0) {
    parts.push(`Decades: ${context.decades.join(", ")}.`);
  }
  if (context.language && context.language !== "Any") {
    parts.push(`Language: ${context.language}.`);
  }
  if (context.activity && context.activity !== "Any") {
    parts.push(`Activity: ${context.activity}.`);
  }
  return parts.length > 0 ? " " + parts.join(" ") : "";
}

const SYSTEM_PROMPT = `You are a music recommendation engine. The user will describe a mood,
vibe, activity, or feeling. Return exactly 20 song recommendations
as a JSON array. Each object should have "title" and "artist" fields.

Pick songs that genuinely match the vibe. Mix well-known tracks with
deeper cuts. Span multiple decades when appropriate. Do NOT include
any explanation — return ONLY the JSON array.`;

let _client = null;
function client() {
  if (!_client) {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
    _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _client;
}

const MODEL_NAME = "gemini-2.5-flash";

const CACHE_MAX = 200;
const CACHE_TTL_MS = 60 * 60 * 1000;
const _cache = new Map();
const RETRYABLE_GEMINI_STATUSES = new Set([429, 500, 502, 503, 504]);
const GEMINI_MAX_ATTEMPTS = 3;

function cacheKey(systemInstruction, userMessage) {
  return `${MODEL_NAME}::${systemInstruction}::${userMessage}`;
}

function cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.t > CACHE_TTL_MS) {
    _cache.delete(key);
    return null;
  }
  _cache.delete(key);
  _cache.set(key, entry);
  return entry.v;
}

function cacheSet(key, value) {
  if (_cache.size >= CACHE_MAX) {
    const oldest = _cache.keys().next().value;
    if (oldest !== undefined) _cache.delete(oldest);
  }
  _cache.set(key, { v: value, t: Date.now() });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getGeminiStatus(err) {
  if (typeof err?.status === "number") return err.status;
  if (typeof err?.response?.status === "number") return err.response.status;
  const match = String(err?.message || "").match(/\[(\d{3})\s/);
  return match ? Number(match[1]) : null;
}

function getRetryAfterMs(err) {
  const retryAfter = err?.response?.headers?.get?.("retry-after");
  const seconds = Number(retryAfter);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null;
}

async function generateWithRetry(model, userMessage) {
  let lastErr;
  for (let attempt = 0; attempt < GEMINI_MAX_ATTEMPTS; attempt++) {
    try {
      return await model.generateContent(userMessage);
    } catch (err) {
      lastErr = err;
      const status = getGeminiStatus(err);
      if (!RETRYABLE_GEMINI_STATUSES.has(status)) throw err;

      if (attempt < GEMINI_MAX_ATTEMPTS - 1) {
        const retryAfterMs = getRetryAfterMs(err);
        const backoffMs = retryAfterMs ?? 500 * 2 ** attempt;
        await sleep(backoffMs);
        continue;
      }

      throw new GeminiUnavailableError(
        "Gemini is temporarily unavailable. Please try again in a moment.",
        {
          status,
          retryAfterMs: getRetryAfterMs(err) ?? 2_000,
          cause: err,
        }
      );
    }
  }
  throw lastErr;
}

async function callGemini(systemInstruction, userMessage, { useCache = true } = {}) {
  const key = cacheKey(systemInstruction, userMessage);
  if (useCache) {
    const hit = cacheGet(key);
    if (hit !== null) return hit;
  }
  const model = client().getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction,
    generationConfig: { responseMimeType: "application/json" },
  });
  const result = await generateWithRetry(model, userMessage);
  const text = result.response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiParseError(`Gemini returned non-JSON: ${text.slice(0, 200)}`);
  }
  if (!Array.isArray(parsed)) {
    throw new GeminiParseError("Gemini response was not an array");
  }
  if (useCache) cacheSet(key, parsed);
  return parsed;
}

export async function getRefinedRecommendations(originalPrompt, currentTracks, followUp, excludedArtists = []) {
  const trackList = currentTracks
    .map((t) => `"${t.title}" by ${t.artist}`)
    .join(", ");

  const userMessage = `Original request: ${originalPrompt}. Current recommendations: ${trackList}. User wants to adjust: ${followUp}. Return a new set of 15 songs as a JSON array with "title" and "artist" fields only, incorporating the feedback. No explanation.`;

  let systemInstruction = SYSTEM_PROMPT;
  if (excludedArtists.length > 0) {
    const artistList = excludedArtists.map((a) => String(a).trim()).filter(Boolean).join(", ");
    if (artistList) {
      systemInstruction = `${systemInstruction}\n\nThe user has explicitly excluded these artists. Do NOT recommend any songs by them under any circumstances: ${artistList}.`;
    }
  }

  const parsed = await callGemini(systemInstruction, userMessage);
  return parsed
    .filter((x) => x && typeof x.title === "string" && typeof x.artist === "string")
    .slice(0, 15);
}

export async function getRecommendations(prompt, personalization = null, excludedSongs = [], context = null, settings = null, excludedArtists = []) {
  let systemInstruction = SYSTEM_PROMPT;
  if (excludedSongs.length > 0) {
    const exclusionList = excludedSongs.map((s) => `${s.title} - ${s.artist}`).join(", ");
    systemInstruction = `${systemInstruction}\n\nDo NOT recommend any of the following songs, as the user has already received them: ${exclusionList}.`;
  }
  if (excludedArtists.length > 0) {
    const artistList = excludedArtists.map((a) => String(a).trim()).filter(Boolean).join(", ");
    if (artistList) {
      systemInstruction = `${systemInstruction}\n\nThe user has explicitly excluded these artists. Do NOT recommend any songs by them under any circumstances: ${artistList}.`;
    }
  }
  if (settings) {
    const extras = [];
    if (settings.allowExplicit === false) {
      extras.push("Do not include any songs with explicit content.");
    }
    if (extras.length) {
      systemInstruction = `${systemInstruction}\n\n${extras.join(" ")}`;
    }
  }
  if (personalization && settings?.aiTastePersonalization !== false) {
    const { topArtists = [], topTracks = [], recentlyPlayed = [] } = personalization;
    const artistList = topArtists.map((a) => a.name).filter(Boolean).join(", ");
    const trackList = topTracks
      .map((t) => (t.artist ? `${t.title} by ${t.artist}` : t.title))
      .filter(Boolean)
      .join(", ");
    const recentList = recentlyPlayed
      .map((t) => (t.artist ? `${t.title} by ${t.artist}` : t.title))
      .filter(Boolean)
      .join(", ");
    if (artistList || trackList || recentList) {
      const parts = [];
      if (artistList) parts.push(`The user's favorite artists include: ${artistList}.`);
      if (trackList) parts.push(`Their most-played tracks include: ${trackList}.`);
      if (recentList) parts.push(`Recently they've been listening to: ${recentList}.`);
      parts.push(
        "Use this context to personalize your recommendations — lean into their taste while still introducing new discoveries."
      );
      systemInstruction = `${systemInstruction}\n\n${parts.join(" ")}`;
    }
  }

  const userMessage = prompt + buildContextSuffix(context);
  const parsed = await callGemini(systemInstruction, userMessage);
  return parsed
    .filter((x) => x && typeof x.title === "string" && typeof x.artist === "string")
    .slice(0, 20);
}

export async function getSwapRecommendation(originalPrompt, currentTracks, trackToReplace, excludedArtists = []) {
  const trackList = currentTracks
    .map((t) => `"${t.title}" by ${t.artist}`)
    .join(", ");

  // Include a per-call nonce so the retry loop in /api/recommend/swap can ask
  // again when the first candidate is already in the playlist.
  const nonce = Math.random().toString(36).slice(2, 8);
  const userMessage = `Original request: ${originalPrompt}. Current playlist: ${trackList}. The user wants to replace "${trackToReplace.title}" by ${trackToReplace.artist} with a different song that fits the same vibe. Suggest exactly 1 song that is NOT already in the list. Return ONLY a JSON array with one object having "title" and "artist" fields. No explanation. (#${nonce})`;

  let systemInstruction = SYSTEM_PROMPT;
  if (excludedArtists.length > 0) {
    const artistList = excludedArtists.map((a) => String(a).trim()).filter(Boolean).join(", ");
    if (artistList) {
      systemInstruction = `${systemInstruction}\n\nThe user has explicitly excluded these artists. Do NOT recommend any songs by them: ${artistList}.`;
    }
  }

  const parsed = await callGemini(systemInstruction, userMessage, { useCache: false });
  if (parsed.length === 0) {
    throw new GeminiParseError("Gemini swap response was empty");
  }
  const first = parsed.find(
    (x) => x && typeof x.title === "string" && typeof x.artist === "string"
  );
  if (!first) throw new GeminiParseError("Gemini swap response had no valid track");
  return first;
}

export async function getSimilarRecommendations(currentTracks, limit = 20) {
  const trackList = currentTracks
    .map((t) => `"${t.title}" by ${t.artist}`)
    .join(", ");

  const userMessage = `The user has this playlist: ${trackList}. Suggest exactly ${limit} additional songs that fit the same vibe but are NOT already in the list. Return ONLY a JSON array with "title" and "artist" fields. No explanation.`;
  const parsed = await callGemini(SYSTEM_PROMPT, userMessage);
  return parsed
    .filter((x) => x && typeof x.title === "string" && typeof x.artist === "string")
    .slice(0, limit);
}
