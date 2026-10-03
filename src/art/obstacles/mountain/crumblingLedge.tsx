import { Dust } from '../../fx';
import { INK, ink, shade } from '../../style';
import { clamp01, fallen, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { STONE, SNOW } from './kit';
import { LEDGE } from './layout';
import { Chasm } from './parts';

// ---------- Level 26: crumbling ledge ----------
// gust (the wind howls) → crumble (the ledge breaks into gaps) → he leaps them.

export function LedgeBack(p: ObstacleProps) {
  const gust = since(p, 'gust');
  const crumble = since(p, 'crumble');
  return (
    <g>
      {/* The sheer drop in front of the ledge. */}
      <path d="M-400 14 H1800 V240 H-400 Z" fill="#8a96b0" />
      <path d="M-400 14 H1800" stroke={INK} strokeWidth={3} />
      <g fill={shade('#8a96b0', 0.15)}>
        {[-200, 200, 600, 1000, 1400].map((x) => (
          <path key={x} d={`M${x} 14 L${x + 40} 120 L${x + 90} 240 L${x - 30} 240 Z`} />
        ))}
      </g>
      {LEDGE.gaps.map(([a, b], i) => {
        const dt = crumble - i * 120;
        return (
          <g key={a}>
            {dt >= 0 && <Chasm a={a} b={b} color="#4a5670" />}
            {/* The chunks of ledge falling away. */}
            {[0, 1, 2].map((j) => {
              const y = fallen(dt - j * 60, 0.0025);
              if (y > 300) return null;
              const x = a + ((b - a) * (j + 0.5)) / 3;
              return (
                <g
                  key={j}
                  transform={`translate(${x} ${y}) rotate(${dt > 0 ? (j - 1) * dt * 0.15 : 0})`}
                >
                  <path
                    d={`M${-(b - a) / 6 - 4} -2 H${(b - a) / 6 + 4} L${(b - a) / 8} 30 H${-(b - a) / 8} Z`}
                    fill={STONE}
                    {...ink(2.5)}
                  />
                  <path
                    d={`M${-(b - a) / 6 - 4} -2 H${(b - a) / 6 + 4} V4 H${-(b - a) / 6 - 4} Z`}
                    fill={SNOW}
                  />
                </g>
              );
            })}
            <Dust x={(a + b) / 2} y={10} dt={dt} ms={700} size={0.7} color="#dfe6f2" />
          </g>
        );
      })}
      {/* Gusts of wind. */}
      {gust >= 0 && (
        <g
          stroke="#ffffff"
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          opacity={0.7 * (1 - clamp01((gust - 2500) / 800))}
        >
          {[0, 1, 2, 3].map((i) => {
            const x = -300 + ((gust * 0.9 + i * 400) % 1800);
            const y = -120 - i * 70;
            return <path key={i} d={`M${x} ${y} q 60 -20 120 0 t 120 0 q 30 -30 0 -40`} />;
          })}
        </g>
      )}
    </g>
  );
}
