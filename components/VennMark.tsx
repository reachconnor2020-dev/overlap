type VennMarkProps = {
  size?: number;
  labelA?: string;
  labelB?: string;
  exampleA?: string;
  exampleB?: string;
  overlapLabel?: string;
  animated?: boolean;
};

/**
 * The app's signature element: two overlapping circles, one per couple.
 * The shared middle shows what overlaps; the outer wings can show a couple
 * of things unique to each side, to make clear couples aren't identical —
 * just compatible where it counts.
 */
export default function VennMark({
  size = 220,
  labelA,
  labelB,
  exampleA,
  exampleB,
  overlapLabel,
  animated = false,
}: VennMarkProps) {
  const r = size * 0.28;
  const offset = r * 0.55;
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
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={animated ? 'animate-snap' : ''}>
        <defs>
          <filter id="venn-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#1B2E2A" floodOpacity="0.14" />
          </filter>
        </defs>
        <g filter="url(#venn-soft-shadow)">
          <circle cx={cxA} cy={cy} r={r} fill="#3E7C90" />
          <circle cx={cxB} cy={cy} r={r} fill="#B4677A" style={{ mixBlendMode: 'multiply' }} />
        </g>
      </svg>

      {labelA && (
        <div
          className="absolute -translate-x-1/2 whitespace-nowrap text-center font-mono text-[11px] uppercase tracking-wide text-paper/90"
          style={{ left: cxA, top: cy - r * 0.8 }}
        >
          {labelA}
        </div>
      )}
      {labelB && (
        <div
          className="absolute -translate-x-1/2 whitespace-nowrap text-center font-mono text-[11px] uppercase tracking-wide text-paper/90"
          style={{ left: cxB, top: cy - r * 0.8 }}
        >
          {labelB}
        </div>
      )}

      {exampleA && (
        <div
          className="absolute -translate-x-1/2 text-center font-display text-sm italic leading-snug text-paper/80"
          style={{ left: cxA - r * 0.45, top: cy + r * 0.01, width: r * 0.85 }}
        >
          {exampleA}
        </div>
      )}
      {exampleB && (
        <div
          className="absolute -translate-x-1/2 text-center font-display text-sm italic leading-snug text-paper/80"
          style={{ left: cxB + r * 0.45, top: cy + r * 0.01, width: r * 0.85 }}
        >
          {exampleB}
        </div>
      )}

      {overlapLabel && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 text-center font-display text-xs italic leading-snug text-paper"
          style={{ left: size / 2, top: cy, width: r * 0.9 }}
        >
          {overlapLabel}
        </div>
      )}
    </div>
  );
}
