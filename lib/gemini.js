import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiParseError extends Error {}

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

export async function getRefinedRecommendations(originalPrompt, currentTracks, followUp) {
  const trackList = currentTracks
    .map((t) => `"${t.title}" by ${t.artist}`)
    .join(", ");

  const refinementPrompt = `Original request: ${originalPrompt}. Current recommendations: ${trackList}. User wants to adjust: ${followUp}. Return a new set of 15 songs as a JSON array with "title" and "artist" fields only, incorporating the feedback. No explanation.`;

  const model = client().getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent(refinementPrompt);
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

  return parsed
    .filter((x) => x && typeof x.title === "string" && typeof x.artist === "string")
    .slice(0, 15);
}

const LANGUAGE_LABELS = {
  english: "English",
  japanese: "Japanese",
  korean: "Korean",
  spanish: "Spanish",
  portuguese: "Portuguese",
  french: "French",
};

const REGION_LABELS = {
  north_america: "North America",
  latin_america: "Latin America",
  europe: "Europe",
  asia: "Asia",
  africa: "Africa",
  middle_east: "the Middle East",
};

export async function getRecommendations(prompt, personalization = null, excludedSongs = [], context = null, settings = null) {
  let systemInstruction = SYSTEM_PROMPT;
  if (excludedSongs.length > 0) {
    const exclusionList = excludedSongs.map((s) => `${s.title} - ${s.artist}`).join(", ");
    systemInstruction = `${systemInstruction}\n\nDo NOT recommend any of the following songs, as the user has already received them: ${exclusionList}.`;
  }
  if (settings) {
    const extras = [];
    if (settings.allowExplicit === false) {
      extras.push("Do not include any songs with explicit content.");
    }
    if (settings.languagePreference && settings.languagePreference !== "any") {
      const label = LANGUAGE_LABELS[settings.languagePreference];
      if (label) extras.push(`Strongly prefer songs sung primarily in ${label}.`);
    }
    if (settings.regionPreference && settings.regionPreference !== "global") {
      const label = REGION_LABELS[settings.regionPreference];
      if (label) extras.push(`Lean toward music from ${label}.`);
    }
    if (extras.length) {
      systemInstruction = `${systemInstruction}\n\n${extras.join(" ")}`;
    }
  }
  if (personalization && settings?.aiTastePersonalization !== false) {
    const { topArtists = [], topTracks = [] } = personalization;
    const artistList = topArtists.map((a) => a.name).filter(Boolean).join(", ");
    const trackList = topTracks
      .map((t) => (t.artist ? `${t.title} by ${t.artist}` : t.title))
      .filter(Boolean)
      .join(", ");
    if (artistList || trackList) {
      const parts = [];
      if (artistList) parts.push(`The user's favorite artists include: ${artistList}.`);
      if (trackList) parts.push(`Their most-played tracks include: ${trackList}.`);
      parts.push(
        "Use this context to personalize your recommendations — lean into their taste while still introducing new discoveries."
      );
      systemInstruction = `${systemInstruction}\n\n${parts.join(" ")}`;
    }
  }

  const model = client().getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt + buildContextSuffix(context));
  const text = result.response.text();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new GeminiParseError(`Gemini returned non-JSON: ${text.slice(0, 200)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new GeminiParseError("Gemini response was not an array");
  }

  return parsed
    .filter((x) => x && typeof x.title === "string" && typeof x.artist === "string")
    .slice(0, 20);
}

export async function getSimilarRecommendations(currentTracks, limit = 20) {
  const trackList = currentTracks
    .map((t) => `"${t.title}" by ${t.artist}`)
    .join(", ");

  const similarPrompt = `The user has this playlist: ${trackList}. Suggest exactly ${limit} additional songs that fit the same vibe but are NOT already in the list. Return ONLY a JSON array with "title" and "artist" fields. No explanation.`;

  const model = client().getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent(similarPrompt);
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

  return parsed
    .filter((x) => x && typeof x.title === "string" && typeof x.artist === "string")
    .slice(0, limit);
}
