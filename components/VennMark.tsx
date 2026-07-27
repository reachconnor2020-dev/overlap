type VennMarkProps = {
  size?: number;
  labelA?: string;
  labelB?: string;
  overlapLabel?: string;
  animated?: boolean;
};

/**
 * The app's signature element: two overlapping circles, one per couple,
 * with the intersection standing in for what they have in common. Reused
 * at hero scale on the landing page and at small scale as a match badge.
 */
export default function VennMark({
  size = 220,
  labelA,
  labelB,
  overlapLabel,
  animated = false,
}: VennMarkProps) {
  const r = size * 0.32;
  const offset = r * 0.62;
  const cy = size / 2;
  const cxA = size / 2 - offset;
  const cxB = size / 2 + offset;

  return (
    <div
      className="relative select-none"
      style={{ width: size, height: size }}
      role="img"
      aria-label={overlapLabel ? `Shared: ${overlapLabel}` : 'Overlapping circles representing two couples'}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cxA}
          cy={cy}
          r={r}
          fill="#D9A62E"
          opacity={0.82}
          className={animated ? 'animate-drift' : ''}
        />
        <circle
          cx={cxB}
          cy={cy}
          r={r}
          fill="#B4677A"
          opacity={0.82}
          style={animated ? { animationDelay: '0.4s' } : undefined}
          className={animated ? 'animate-drift' : ''}
        />
      </svg>
      {labelA && (
        <span
          className="absolute font-mono text-[11px] uppercase tracking-wide text-ink/70"
          style={{ left: cxA - r * 0.55, top: cy + r * 0.55 }}
        >
          {labelA}
        </span>
      )}
      {labelB && (
        <span
          className="absolute font-mono text-[11px] uppercase tracking-wide text-ink/70"
          style={{ left: cxB - r * 0.35, top: cy + r * 0.55 }}
        >
          {labelB}
        </span>
      )}
      {overlapLabel && (
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 text-center font-display text-sm italic text-ink"
          style={{ left: size / 2, top: cy, width: r * 1.1 }}
        >
          {overlapLabel}
        </span>
      )}
    </div>
  );
}
