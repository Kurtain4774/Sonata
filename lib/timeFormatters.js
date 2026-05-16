// Shared date/time formatting helpers used across track lists, stats, and players.

// Formats a millisecond duration as `m:ss`. Returns `emptyLabel` for falsy input.
export function formatDuration(ms, emptyLabel = "0:00") {
  if (!ms) return emptyLabel;
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Verbose relative time, e.g. "5 minutes ago", "Yesterday".
export function relativeTime(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

// Compact relative time, e.g. "5m ago", "3h ago", "Yesterday".
export function shortRelativeTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString();
}

// Day-bucket header for grouping a list by date: "Today", "Yesterday", or a weekday label.
export function dayHeader(iso) {
  const d = new Date(iso);
  const startOfDay = (x) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// Short calendar date, e.g. "May 15, 2026".
export function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Calendar date with time, e.g. "May 15, 2026, 3:07 PM".
export function formatDateTime(d) {
  return new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
