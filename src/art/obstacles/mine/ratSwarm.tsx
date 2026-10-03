import { Dust } from '../../fx';
import { INK, ink, shade } from '../../style';
import { eventTime, type ObstacleProps } from '../types';
import { STEEL, WOOD, HOLE } from './kit';
import { RAT_SWARM } from './layout';
import { Chain, RoofBeam } from './parts';

// ---------- Level 4: rat swarm ----------
// swarm (rats pour out of the hole) → grab (he swings on the chain) → letgo.

const RATS = Array.from({ length: 26 }, (_, i) => ({
  delay: i * 70,
  lane: i % 3,
  size: 0.8 + ((i * 7) % 5) * 0.08,
  shift: (i % 2) * 12,
}));

function Rat({ x, y, s, step }: { x: number; y: number; s: number; step: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M20 -10 Q42 -24 52 -8"
        fill="none"
        stroke={INK}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M20 -10 Q42 -24 52 -8"
        fill="none"
        stroke="#e8a0a8"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d={`M-8 0 l${step * 4} -6 M10 0 l${-step * 4} -6`} stroke={INK} strokeWidth={3} />
      <ellipse cx={2} cy={-13} rx={22} ry={12} fill="#8a8494" {...ink(2.5)} />
      <ellipse cx={6} cy={-9} rx={14} ry={6} fill={shade('#8a8494', 0.25)} />
      <circle cx={-18} cy={-16} r={10} fill="#8a8494" {...ink(2.5)} />
      <circle cx={-14} cy={-27} r={6} fill="#e8a0a8" {...ink(2)} />
      <circle cx={-22} cy={-18} r={2.2} fill={INK} />
      <circle cx={-28} cy={-14} r={2.6} fill="#ff7a8a" {...ink(1)} />
    </g>
  );
}

/** The chain's lower end: hanging still, in his hands, or swinging back after he lets go. */
function chainEnd(p: ObstacleProps) {
  const { pivot, chain, reach } = RAT_SWARM;
  const grabAt = eventTime(p.events, 'grab');
  const letgoAt = eventTime(p.events, 'letgo');
  if (p.t >= grabAt && p.t < letgoAt) return { x: p.heroX, y: -(p.heroLift + reach) };
  let angle = 0.04 * Math.sin(p.t / 500);
  if (p.t >= letgoAt) {
    const dt = p.t - letgoAt;
    const a0 = Math.asin(Math.max(-1, Math.min(1, (p.heroAt(letgoAt).x - pivot.x) / chain)));
    angle = a0 * Math.cos(dt / 320) * Math.exp(-dt / 1400);
  }
  return { x: pivot.x + chain * Math.sin(angle), y: pivot.y + chain * Math.cos(angle) };
}

export function RatSwarmBack(p: ObstacleProps) {
  const { pivot, hole, ratSpeed } = RAT_SWARM;
  const swarmAt = eventTime(p.events, 'swarm');
  const end = chainEnd(p);
  const blink = Math.sin(p.t / 180) > -0.7;
  return (
    <g>
      {/* The rat hole in the tunnel wall. */}
      <path
        d={`M${hole - 50} 4 L${hole - 50} -54 Q${hole} -110 ${hole + 50} -54 L${hole + 50} 4 Z`}
        fill={HOLE}
        {...ink(3)}
      />
      <path d={`M${hole - 62} 4 V-62 M${hole + 62} 4 V-62`} stroke={WOOD} strokeWidth={14} />
      <path
        d={`M${hole - 70} -64 H${hole + 70}`}
        stroke={WOOD}
        strokeWidth={16}
        strokeLinecap="round"
      />
      {p.t < swarmAt && blink && (
        <g fill="#ffd35a">
          <circle cx={hole - 16} cy={-40} r={3.5} />
          <circle cx={hole - 4} cy={-40} r={3.5} />
          <circle cx={hole + 14} cy={-24} r={3} />
          <circle cx={hole + 24} cy={-24} r={3} />
        </g>
      )}
      <RoofBeam x={pivot.x} y={pivot.y} w={240} />
      <Chain x1={pivot.x} y1={pivot.y} x2={end.x} y2={end.y} />
      <circle cx={pivot.x} cy={pivot.y} r={9} fill={STEEL} {...ink(3)} />
      {[0, 1, 2].map((lane) =>
        RATS.filter((r) => r.lane === lane).map((r, i) => {
          const dt = p.t - swarmAt - r.delay;
          if (!(dt >= 0)) return null;
          const x = hole - ratSpeed * dt - r.shift;
          if (x < -700) return null;
          const hop = -Math.abs(Math.sin(dt / 55 + i)) * 6;
          return (
            <Rat
              key={`${lane}-${i}`}
              x={x}
              y={(lane - 1) * 9 + hop}
              s={r.size * (0.9 + lane * 0.08)}
              step={Math.sin(dt / 40)}
            />
          );
        }),
      )}
      <Dust x={hole} y={-6} dt={p.t - swarmAt} ms={900} size={0.8} />
    </g>
  );
}
