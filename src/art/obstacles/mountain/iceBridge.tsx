import { INK, ink } from '../../style';
import { fallen, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { ICE } from './kit';
import { ICE_BRIDGE } from './layout';
import { Chasm } from './parts';

// ---------- Level 29: ice bridge ----------
// crack → shatter (the ice breaks up behind him as he slides across).

function iceFallAt(p: ObstacleProps, x: number) {
  const shatterAt = eventTime(p.events, 'shatter');
  const start = p.heroAt(shatterAt).x - ICE_BRIDGE.lag;
  const [a] = ICE_BRIDGE.crevasse;
  if (x <= start) return shatterAt + ((x - a) / Math.max(1, start - a)) * 200;
  // He runs a moment, then slides; the break keeps pace with him.
  return shatterAt + 250 + (x - start) / ICE_BRIDGE.speed;
}

export function IceBridgeBack(p: ObstacleProps) {
  const [a, b] = ICE_BRIDGE.crevasse;
  const crack = since(p, 'crack');
  const pieces = [];
  for (let x = a; x < b; x += 50) pieces.push(x);
  return (
    <g>
      <Chasm a={a} b={b} color="#2e4a6a" />
      {pieces.map((x, i) => {
        const dt = p.t - iceFallAt(p, x + 25);
        const y = fallen(dt, 0.0026);
        if (y > 300) return null;
        return (
          <g
            key={x}
            transform={`translate(${x + 25} ${y}) rotate(${dt > 0 ? (noise(i) - 0.5) * dt * 0.3 : 0})`}
          >
            <path
              d={`M-26 -4 H26 L${18 + (i % 3) * 3} 26 L${-20 + (i % 2) * 4} 30 Z`}
              fill={ICE}
              {...ink(2.5)}
            />
            <path d="M-20 0 H16" stroke="#ffffff" strokeWidth={4} opacity={0.8} />
          </g>
        );
      })}
      {/* Cracks spreading across the ice. */}
      {crack >= 0 && (
        <g stroke={INK} strokeWidth={2.5} fill="none">
          {[0, 1, 2, 3].map((i) => {
            const x = a + 80 + i * 170;
            const len = Math.min(1, crack / 500) * 40;
            return (
              <path
                key={i}
                d={`M${x} 0 l ${len * 0.5} ${len * 0.3} l ${len * 0.4} -${len * 0.2} l ${len * 0.6} ${len * 0.35}`}
              />
            );
          })}
        </g>
      )}
    </g>
  );
}
