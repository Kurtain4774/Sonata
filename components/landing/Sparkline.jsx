const SPARKLINE_POINTS = [
  4, 8, 6, 12, 10, 16, 14, 18, 22, 20, 28, 24, 30, 26, 34, 32, 38, 36, 42, 40,
  46, 44, 50, 48, 54, 52, 58, 56, 62, 60,
];

export default function Sparkline() {
  const max = Math.max(...SPARKLINE_POINTS);
  const w = 200;
  const h = 50;
  const step = w / (SPARKLINE_POINTS.length - 1);
  const path = SPARKLINE_POINTS.map((v, i) => {
    const x = i * step;
    const y = h - (v / max) * h;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1DB954" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1DB954" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#spark)" />
      <path d={path} stroke="#1DB954" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
