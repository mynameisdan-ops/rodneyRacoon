import { ink, shade } from '../../style';

/**
 * Pieces shared by the World 4 (Misty Mountains) obstacles.
 * Local coordinates, with the ground line at y = 0.
 */

/** A sheer drop in front of the path from a to b (a chasm down to the bottom of the screen). */
export function Chasm({ a, b, color = '#3a4458' }: { a: number; b: number; color?: string }) {
  return (
    <g>
      <path
        d={`M${a - 8} -2 L${a} 16 L${a + 10} 240 L${b - 10} 240 L${b} 16 L${b + 8} -2 Z`}
        fill={color}
        {...ink(3)}
      />
      <path d={`M${a} 16 L${a + 10} 240 L${a + 30} 240 Z`} fill={shade(color, 0.3)} />
      <path
        d={`M${a + 20} 200 Q${(a + b) / 2} 150 ${b - 20} 200 L${b - 20} 240 L${a + 20} 240 Z`}
        fill="#dfe8f6"
        opacity={0.5}
      />
    </g>
  );
}
