import { Dust } from '../../fx';
import { INK, ink, tint } from '../../style';
import { fallen, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { RED, RED_DARK } from './kit';
import { ARCH } from './layout';
import { Drop } from './parts';

// ---------- Level 37: crumbling arch ----------
// crack → crumble (the arch breaks up behind him as he runs across).

function chunkFallAt(p: ObstacleProps, x: number) {
  const crumbleAt = eventTime(p.events, 'crumble');
  const start = p.heroAt(crumbleAt).x - ARCH.lag;
  const [a] = ARCH.canyon;
  if (x <= start) return crumbleAt + ((x - a) / Math.max(1, start - a)) * 220;
  return crumbleAt + 220 + (x - start) / ARCH.run;
}

export function ArchBack(p: ObstacleProps) {
  const [a, b] = ARCH.canyon;
  const crack = since(p, 'crack');
  const chunks = [];
  for (let x = a; x < b; x += 60) chunks.push(x);
  const mid = (a + b) / 2;
  return (
    <g>
      <Drop a={a} b={b} />
      {chunks.map((x, i) => {
        const cx = x + 30;
        const dt = p.t - chunkFallAt(p, cx);
        const y = fallen(dt, 0.0026);
        if (y > 320) return null;
        // Each chunk is a slice of the arch: deep at the ends, thin in the middle.
        const depth = 30 + 90 * ((cx - mid) / (mid - a)) ** 2;
        return (
          <g
            key={x}
            transform={`translate(${cx} ${y}) rotate(${dt > 0 ? (noise(i) - 0.5) * dt * 0.3 : 0})`}
          >
            <path d={`M-31 -2 H31 V${depth} H-31 Z`} fill={RED} {...ink(2.5)} />
            <path d={`M-31 ${depth * 0.45} H31`} stroke={RED_DARK} strokeWidth={4} />
            <path d="M-31 -2 H31 V5 H-31 Z" fill={tint(RED, 0.3)} />
          </g>
        );
      })}
      {crack >= 0 && (
        <path
          d={`M${mid - 90} 4 l 20 14 l -10 18 l 26 16 M${mid + 80} 4 l -14 18 l 18 12`}
          stroke={INK}
          strokeWidth={3}
          fill="none"
          strokeDasharray={`${Math.min(140, crack * 0.4)} 200`}
        />
      )}
      <Dust x={mid} y={30} dt={since(p, 'crumble')} ms={1200} size={1.4} color="#d8a080" />
    </g>
  );
}
