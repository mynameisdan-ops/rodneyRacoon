import { Dust } from '../../fx';
import { INK, ink } from '../../style';
import { easeOut, lerp, noise, progress, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { WOOD, LEAF } from './kit';
import { BRAMBLE } from './layout';

// ---------- Level 10: bramble vault ----------
// grow (thorny brambles grow into a wall) → grab (he picks up a sapling pole)
// → plant (he plants it and vaults) → land.

const BRAMBLE_STEMS = Array.from({ length: 9 }, (_, i) => ({
  x: BRAMBLE.wall[0] + ((BRAMBLE.wall[1] - BRAMBLE.wall[0]) * (i + 0.5)) / 9,
  h: 0.7 + 0.3 * noise(i, 2),
  lean: (noise(i, 4) - 0.5) * 60,
}));

function Brambles({ height, t }: { height: number; t: number }) {
  return (
    <g>
      {BRAMBLE_STEMS.map((s, i) => {
        const h = height * s.h;
        const sway = Math.sin(t / 300 + i) * 4;
        const dir = i % 2 ? 1 : -1;
        const top = { x: s.x + s.lean * (h / BRAMBLE.wallHeight) + sway, y: -h };
        // An S-shaped, curling stem.
        const d = `M${s.x} 4 C${s.x + dir * 40} ${-h * 0.3} ${top.x - dir * 50} ${-h * 0.65} ${top.x} ${top.y} q ${dir * 22} -4 ${dir * 16} 16`;
        const at = (f: number) => ({
          x: lerp(s.x, top.x, f) + dir * 26 * Math.sin(Math.PI * 2 * f),
          y: lerp(0, top.y, f),
        });
        return (
          <g key={i}>
            <path d={d} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
            <path d={d} stroke="#5d6b28" strokeWidth={9} fill="none" strokeLinecap="round" />
            {[0.18, 0.34, 0.5, 0.66, 0.82].map((f, j) => {
              const pt = at(f);
              const side = j % 2 ? 1 : -1;
              return (
                <path
                  key={f}
                  d={`M${pt.x} ${pt.y - 4} l${side * 14} -6 l${-side * 12} 10 Z`}
                  fill="#f0e6c8"
                  {...ink(1.5)}
                />
              );
            })}
            {h > 80 && (
              <path
                transform={`translate(${at(0.45).x} ${at(0.45).y}) rotate(${dir * 30})`}
                d="M0 0 Q14 -12 26 0 Q14 10 0 0 Z"
                fill="#4f7a2e"
                {...ink(1.5)}
              />
            )}
            {h > 60 && (
              <g fill="#b03a5a" {...ink(1.5)}>
                <circle cx={top.x} cy={top.y} r={7} />
                <circle cx={top.x + 9} cy={top.y + 6} r={5} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** When the vault carries him past the pole's foot (he lets go there). */
function releaseTime(p: ObstacleProps, plantAt: number) {
  for (let t = plantAt; t < plantAt + 2000; t += 16) {
    if (p.heroAt(t).x >= BRAMBLE.plant + 10) return t;
  }
  return plantAt + 2000;
}

function Pole({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const d = `M${x1} ${y1} L${x2} ${y2}`;
  return (
    <g strokeLinecap="round" fill="none">
      <path d={d} stroke={INK} strokeWidth={12} />
      <path d={d} stroke={WOOD} strokeWidth={7} />
      <circle cx={x2} cy={y2} r={9} fill={LEAF} {...ink(2)} />
    </g>
  );
}

export function BrambleBack(p: ObstacleProps) {
  const grow = easeOut(progress(p, 'grow', 1100));
  const height = 50 + (BRAMBLE.wallHeight - 50) * grow;
  return (
    <g>
      <Brambles height={height} t={p.t} />
      <Dust x={(BRAMBLE.wall[0] + BRAMBLE.wall[1]) / 2} y={-6} dt={since(p, 'grow')} ms={900} />
    </g>
  );
}

export function BrambleFront(p: ObstacleProps) {
  const grabAt = eventTime(p.events, 'grab');
  const plantAt = eventTime(p.events, 'plant');
  const len = BRAMBLE.poleLength;
  const hands = { x: p.heroX + 14, y: -(p.heroLift + 118) };
  if (p.t < grabAt)
    return <Pole x1={BRAMBLE.pole - len / 2} y1={-6} x2={BRAMBLE.pole + len / 2} y2={-8} />;
  if (p.t < plantAt) {
    return <Pole x1={hands.x - 90} y1={hands.y + 14} x2={hands.x + len - 90} y2={hands.y - 20} />;
  }
  const foot = { x: BRAMBLE.plant, y: 0 };
  const releaseAt = releaseTime(p, plantAt);
  let angle: number;
  if (p.t < releaseAt) {
    angle = Math.atan2(hands.x - foot.x, foot.y - hands.y);
  } else {
    // Topples forward onto the brambles.
    const dt = p.t - releaseAt;
    angle = Math.min(Math.PI / 2 - 0.25, 0.1 + 0.000004 * dt * dt);
  }
  return (
    <Pole
      x1={foot.x}
      y1={foot.y}
      x2={foot.x + len * Math.sin(angle)}
      y2={foot.y - len * Math.cos(angle)}
    />
  );
}
