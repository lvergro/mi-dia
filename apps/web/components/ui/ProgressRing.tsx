interface ProgressRingProps {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  label?: string;
}

export function ProgressRing({
  pct,
  size = 48,
  stroke = 4,
  color = "#4f46e5",
  trackColor = "#e0e7ff",
  label,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(Math.max(pct, 0), 100) / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {label !== undefined && (
        <span className="absolute text-[10px] font-bold" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}
