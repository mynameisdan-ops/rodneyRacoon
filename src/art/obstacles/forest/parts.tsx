import { ink, shade } from '../../style';
import { noise } from '../sceneKit';
import { LEAF, LEAF_LIGHT } from './kit';

/**
 * Pieces shared by the World 2 (Whispering Forest) obstacles.
 * Local coordinates, with the ground line at y = 0.
 */

/** Leaves bursting out from (x, y) and fluttering down. */
export function LeafBurst({
  x,
  y,
  dt,
  count = 10,
}: {
  x: number;
  y: number;
  dt: number;
  count?: number;
}) {
  if (!(dt >= 0 && dt < 1400)) return null;
  return (
    <g opacity={1 - dt / 1400}>
      {Array.from({ length: count }, (_, i) => {
        const a = -Math.PI * (0.1 + 0.8 * noise(i, 3));
        const d = dt * (0.25 + 0.2 * noise(i, 5));
        const px = x + Math.cos(a) * d + 12 * Math.sin(dt / 120 + i);
        const py = y + Math.sin(a) * d + 0.0004 * dt * dt;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${dt * 0.3 + i * 40})`}>
            <path d="M-8 0 Q0 -7 8 0 Q0 7 -8 0 Z" fill={i % 2 ? LEAF : LEAF_LIGHT} {...ink(1.3)} />
            <path d="M-5 0 H5" stroke={shade(LEAF, 0.35)} strokeWidth={0.9} />
          </g>
        );
      })}
    </g>
  );
}
