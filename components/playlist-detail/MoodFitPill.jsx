import { moodFitColor, moodFitBars } from "@/lib/moodFit";

export default function MoodFitPill({ label }) {
  if (!label) return <span className="text-neutral-600">—</span>;
  const colors = moodFitColor(label);
  const bars = moodFitBars(label);
  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md ${colors.bg} ${colors.text} text-xs font-medium`}
    >
      {label}
      <span className="flex items-end gap-[2px] h-3">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`w-[3px] rounded-sm ${i <= bars ? colors.bar : "bg-neutral-700"}`}
            style={{ height: `${i * 25}%` }}
          />
        ))}
      </span>
    </span>
  );
}
