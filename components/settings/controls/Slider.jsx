"use client";

export default function Slider({ value, onChange, min = 0, max = 100, step = 1, label, description, valueLabel }) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-neutral-100">{label}</div>
          {description && (
            <div className="text-xs text-neutral-400 mt-0.5">{description}</div>
          )}
        </div>
        <span className="text-xs text-neutral-300 tabular-nums">
          {valueLabel ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-spotify"
      />
    </div>
  );
}
