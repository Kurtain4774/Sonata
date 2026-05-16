// Curated prompt ideas + time-aware suggestions for the dashboard hero.
// Pure helpers — safe to unit test.

// "Surprise me" pool: evocative, specific seed phrases. Personalization is
// applied server-side, so any of these still gets tailored to the listener.
export const SURPRISE_PROMPTS = [
  "a slow sunrise, warm coffee, nowhere to be",
  "neon-lit city streets after midnight",
  "windows down on an empty highway",
  "rainy afternoon, a good book, no lyrics",
  "golden hour on the last day of summer",
  "underground clubs and basement beats",
  "a long-distance phone call you didn't want to end",
  "cold morning, big headphones, sharp focus",
  "dancing alone in the kitchen",
  "the quiet drive home after a great night",
  "nostalgic radio hits from a road trip you half-remember",
  "stargazing on a rooftop in late spring",
  "first snow, fairy lights, hot chocolate",
  "a confident strut into a room that matters",
  "lazy hungover sunday, soft and forgiving",
  "heartbreak you're finally ready to dance through",
];

// Clickable example prompts — specific enough to teach what a good prompt
// looks like.
export const EXAMPLE_PROMPTS = [
  "rainy sunday morning, coffee, no lyrics",
  "2010s indie for a long night drive",
  "high-energy gym set, no slow songs",
  "mellow jazz for cooking dinner",
  "throwback 2000s pop-punk nostalgia",
  "ambient focus music for deep work",
  "feel-good summer road trip anthems",
  "moody R&B for a late night in",
  "upbeat latin pop for a house party",
  "acoustic singer-songwriter, soft and intimate",
];

// Return `count` items from `list` starting at a rotating offset so the hero
// feels fresh between visits. Deterministic when `seed` is supplied.
export function pickRotating(list, count, seed = Date.now()) {
  if (!Array.isArray(list) || list.length === 0) return [];
  const n = Math.min(count, list.length);
  const start = Math.abs(Math.floor(seed / 60000)) % list.length;
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(list[(start + i) % list.length]);
  }
  return out;
}

// Pick a random surprise prompt.
export function randomSurprisePrompt(rand = Math.random) {
  return SURPRISE_PROMPTS[Math.floor(rand() * SURPRISE_PROMPTS.length)];
}

// Time-aware suggestion for the hero's contextual card.
// `date` is injectable for testing. Returns { label, prompt, blurb }.
export function getContextualSuggestion(date = new Date()) {
  const hour = date.getHours();
  const day = date.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = day === 0 || day === 6;
  const isFriday = day === 5;

  // Late night (after 11pm or before 5am)
  if (hour >= 23 || hour < 5) {
    return {
      label: "Late-night wind-down",
      prompt: "calm late-night wind-down music, soft and atmospheric",
      blurb: "It's late — ease into something quiet.",
    };
  }

  // Friday / weekend evening → going out
  if ((isFriday || isWeekend) && hour >= 18) {
    return {
      label: "Going out",
      prompt: "high-energy going-out anthems to start the night",
      blurb: isFriday
        ? "It's Friday night — start a going-out playlist."
        : "Weekend night — start a going-out playlist.",
    };
  }

  // Weekday early morning → commute / wake up
  if (!isWeekend && hour >= 5 && hour < 10) {
    return {
      label: "Morning commute",
      prompt: "upbeat music to wake up and start the commute",
      blurb: "Morning — kick the day off with a commute mix.",
    };
  }

  // Weekday working hours → focus
  if (!isWeekend && hour >= 10 && hour < 17) {
    return {
      label: "Focus session",
      prompt: "instrumental focus music for deep work, minimal lyrics",
      blurb: "Midday — settle into a focus session.",
    };
  }

  // Weekend daytime → easygoing
  if (isWeekend && hour >= 10 && hour < 18) {
    return {
      label: "Easygoing weekend",
      prompt: "relaxed, feel-good weekend music for a slow day",
      blurb: "Weekend afternoon — keep it easygoing.",
    };
  }

  // Evening (everyone else, ~5pm–11pm)
  return {
    label: "Evening unwind",
    prompt: "warm, mellow music to unwind in the evening",
    blurb: "Evening — unwind with something warm.",
  };
}
