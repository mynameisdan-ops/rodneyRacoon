import { ink, shade, tint } from '../../style';
import { noise } from '../sceneKit';
import { LEAF, EARTH } from './kit';

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
          <path
            key={i}
            transform={`translate(${px} ${py}) rotate(${dt * 0.3 + i * 40})`}
            d="M-8 0 Q0 -7 8 0 Q0 7 -8 0 Z"
            fill={i % 2 ? LEAF : tint(LEAF, 0.3)}
            {...ink(1.5)}
          />
        );
      })}
    </g>
  );
}

/** A dark cutaway hole in the ground from a to b, `depth` px deep. */
export function Hollow({ a, b, depth }: { a: number; b: number; depth: number }) {
  return (
    <g>
      <path
        d={`M${a - 10} -2 L${a + 10} ${depth + 50} Q${(a + b) / 2} ${depth + 90} ${b - 10} ${depth + 50} L${b + 10} -2 Z`}
        fill={EARTH}
        {...ink(3)}
      />
      <path
        d={`M${a + 10} 10 L${a + 24} ${depth + 50} L${a + 50} ${depth + 60} Z`}
        fill={shade(EARTH, 0.4)}
      />
    </g>
  );
}
