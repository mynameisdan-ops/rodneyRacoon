import { ink, shade, tint } from '../style';
import { useSpots, W } from './sceneryKit';

/** Shared drawings for the outdoor world backdrops (see sceneryKit.ts for the tiling rules). */

/** Puffy cartoon clouds with a flat shaded underside. */
export function Clouds({
  color,
  horizon,
  k,
  seed,
  count = 5,
}: {
  color: string;
  horizon: number;
  k: number;
  seed: number;
  count?: number;
}) {
  const spots = useSpots(seed * 101, count, 60);
  return (
    <g>
      {spots.map((c, i) => (
        <g
          key={i}
          transform={`translate(${c.x} ${horizon * (0.15 + c.r * 0.4)}) scale(${(0.7 + c.r2 * 0.6) * k})`}
        >
          <g fill={color}>
            <ellipse cx={0} cy={0} rx={62} ry={20} />
            <circle cx={-24} cy={-12} r={22} />
            <circle cx={12} cy={-22} r={28} />
            <circle cx={42} cy={-6} r={18} />
          </g>
          <ellipse cx={4} cy={8} rx={54} ry={9} fill={shade(color, 0.12)} />
        </g>
      ))}
    </g>
  );
}

/** Ground from `groundTop` down, with a lit lip along its top edge. */
export function Ground({
  groundTop: g,
  height,
  k,
  color,
  light,
}: {
  groundTop: number;
  height: number;
  k: number;
  color: string;
  light: string;
}) {
  return (
    <g>
      <path d={`M0 ${g} Q 320 ${g - 12 * k} 640 ${g} T ${W} ${g} V ${height} H 0 Z`} fill={color} />
      <path
        d={`M0 ${g} Q 320 ${g - 12 * k} 640 ${g} T ${W} ${g} V ${g + 7 * k} Q 960 ${g} 640 ${g + 7 * k} T 0 ${g + 7 * k} Z`}
        fill={light}
      />
    </g>
  );
}

/** A walking path along the near ground, centered at `y`, with pebbles. */
export function Path({ y, k, color, edge }: { y: number; k: number; color: string; edge: string }) {
  return (
    <g>
      <rect x={0} y={y - 15 * k} width={W} height={30 * k} fill={color} />
      <rect x={0} y={y - 15 * k} width={W} height={4 * k} fill={tint(color, 0.3)} />
      <rect x={0} y={y + 11 * k} width={W} height={4 * k} fill={edge} opacity={0.7} />
      {Array.from({ length: 16 }, (_, i) => (
        <ellipse
          key={i}
          cx={i * 80 + 30}
          cy={y + ((i % 3) - 1) * 6 * k}
          rx={5 * k}
          ry={3 * k}
          fill={edge}
        />
      ))}
    </g>
  );
}

/** A small outlined rock resting at (0, 0). */
export function Stone({ color, big }: { color: string; big: boolean }) {
  return (
    <g>
      <path
        d={big ? 'M-18 0 L-14 -12 L-2 -18 L12 -14 L18 0 Z' : 'M-9 0 L-6 -8 L4 -9 L9 0 Z'}
        fill={color}
        {...ink(2.5)}
      />
      <path
        d={big ? 'M-14 -12 L-2 -18 L2 -8 Z' : 'M-6 -8 L4 -9 L0 -4 Z'}
        fill={tint(color, 0.25)}
      />
    </g>
  );
}

/** A tuft of grass at (0, 0). */
export function Tuft({ color }: { color: string }) {
  return (
    <path
      d="M-8 0 Q-7 -9 -11 -16 M0 0 Q0 -12 2 -20 M8 0 Q7 -9 12 -15"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      fill="none"
    />
  );
}
