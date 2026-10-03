import { ink, shade, tint } from '../../style';
import { RED_DARK, SAND } from './kit';

/**
 * Pieces shared by the World 5 (Canyon to Home) obstacles.
 * Local coordinates, with the ground line at y = 0.
 */

/** A canyon drop in front of the path from a to b, striped red rock down to the bottom. */
export function Drop({ a, b }: { a: number; b: number }) {
  return (
    <g>
      <path
        d={`M${a - 10} -2 L${a} 18 L${a + 16} 240 L${b - 16} 240 L${b} 18 L${b + 10} -2 Z`}
        fill={RED_DARK}
        {...ink(3)}
      />
      <path
        d={`M${a + 6} 70 H${b - 6} M${a + 12} 140 H${b - 12}`}
        stroke={shade(RED_DARK, 0.3)}
        strokeWidth={6}
      />
      <path d={`M${a + 40} 240 Q${(a + b) / 2} 190 ${b - 40} 240 Z`} fill="#6b3a2a" />
    </g>
  );
}

/** Streaks of blowing sand. */
export function SandStreaks({
  t,
  strength,
  dir = 1,
}: {
  t: number;
  strength: number;
  dir?: 1 | -1;
}) {
  if (strength <= 0) return null;
  return (
    <g stroke={tint(SAND, 0.3)} strokeWidth={4} strokeLinecap="round" opacity={0.7 * strength}>
      {Array.from({ length: 18 }, (_, i) => {
        const span = 2600;
        const x = -400 + ((i * 151 + t * 1.1) % span);
        const y = -40 - ((i * 67) % 560);
        return (
          <path key={i} d={`M${dir > 0 ? x : 2200 - x} ${y} h ${dir * (40 + (i % 4) * 20)}`} />
        );
      })}
    </g>
  );
}
