export function moodFitFromScore(score) {
  if (score == null || Number.isNaN(score)) return null;
  if (score >= 95) return "Perfect";
  if (score >= 90) return "Excellent";
  if (score >= 85) return "Great";
  if (score >= 75) return "Good";
  return "Fair";
}

export function moodFitColor(label) {
  switch (label) {
    case "Perfect":
    case "Excellent":
      return { text: "text-spotify", bg: "bg-spotify/15", bar: "bg-spotify" };
    case "Great":
      return { text: "text-lime-400", bg: "bg-lime-400/15", bar: "bg-lime-400" };
    case "Good":
      return { text: "text-amber-400", bg: "bg-amber-400/15", bar: "bg-amber-400" };
    case "Fair":
      return { text: "text-rose-400", bg: "bg-rose-400/15", bar: "bg-rose-400" };
    default:
      return { text: "text-neutral-400", bg: "bg-neutral-800", bar: "bg-neutral-600" };
  }
}

export function moodFitBars(label) {
  switch (label) {
    case "Perfect":
      return 4;
    case "Excellent":
      return 4;
    case "Great":
      return 3;
    case "Good":
      return 2;
    case "Fair":
      return 1;
    default:
      return 0;
  }
}
