/** Stand-in hero until the paper-doll avatar (M3/M8). `color` is the shirt. */
export function PlaceholderHero({
  color = '#e63946',
  size = 110,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg width={(size * 70) / 110} height={size} viewBox="0 0 70 110" aria-hidden>
      <rect x={20} y={70} width={11} height={34} rx={5} fill="#2d4a7a" />
      <rect x={39} y={70} width={11} height={34} rx={5} fill="#2d4a7a" />
      <rect x={14} y={38} width={42} height={40} rx={14} fill={color} />
      <circle cx={35} cy={24} r={20} fill="#f1c29b" />
      <path d="M15 22 Q 18 2 35 4 Q 54 4 55 22 Q 44 12 30 14 Q 20 16 15 22 Z" fill="#6b3e1e" />
      <circle cx={28} cy={25} r={2.6} fill="#1d3557" />
      <circle cx={42} cy={25} r={2.6} fill="#1d3557" />
      <path
        d="M28 33 Q 35 38 42 33"
        stroke="#1d3557"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
