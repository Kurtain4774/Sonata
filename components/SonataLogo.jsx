const BARS = [
  { x: 6, h: 20 },
  { x: 14, h: 32 },
  { x: 22, h: 26 },
  { x: 30, h: 38 },
  { x: 38, h: 14 },
];

export default function SonataLogo({ size = 28, color = "#1DB954", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {BARS.map((bar, i) => (
        <rect
          key={i}
          x={bar.x - 2.5}
          y={44 - bar.h - 3}
          width="5"
          height={bar.h}
          rx="2.5"
          fill={color}
          opacity={0.5 + i * 0.12}
        />
      ))}
    </svg>
  );
}
