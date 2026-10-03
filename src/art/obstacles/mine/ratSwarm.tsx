import { memo, useId } from 'react';
import { Dust } from '../../fx';
import { INK, ink, shade, tint } from '../../style';
import { PAINTED_MINE } from '../../worlds/minePalette';
import { eventTime, type ObstacleProps } from '../types';
import { OUT, STEEL } from './kit';
import { RAT_SWARM } from './layout';
import { Chain, RoofBeam, HoleDefs } from './parts';

// ---------- Level 4: rat swarm ----------
// swarm (rats pour out of the hole) → grab (he swings on the chain) → letgo.

const P = PAINTED_MINE;

const RATS = Array.from({ length: 26 }, (_, i) => ({
  delay: i * 70,
  lane: i % 3,
  size: 0.8 + ((i * 7) % 5) * 0.08,
  shift: (i % 2) * 12,
}));
const FUR = '#9a90a6';
const PINK = '#f4a0b0';

/**
 * A round little rat scampering left, big shiny eye and all. Only its feet move, so its tail and
 * body are drawn once (memoized): a swarm is a lot of rats to redraw every frame.
 */
function Rat({ x, y, s, step }: { x: number; y: number; s: number; step: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <RatTail />
      <ellipse cx={12 + step * 4} cy={-2} rx={6} ry={3.5} fill={PINK} {...ink(1.8)} />
      <ellipse cx={-8 - step * 4} cy={-2} rx={5} ry={3} fill={PINK} {...ink(1.8)} />
      <RatBody />
    </g>
  );
}

const RatTail = memo(function RatTail() {
  return (
    <g fill="none" strokeLinecap="round">
      <path d="M20 -10 Q42 -26 54 -8" stroke={INK} strokeWidth={4.4} />
      <path d="M20 -10 Q42 -26 54 -8" stroke={PINK} strokeWidth={2.2} />
    </g>
  );
});

const RatBody = memo(function RatBody() {
  return (
    <g>
      <ellipse cx={3} cy={-14} rx={23} ry={13} fill={FUR} {...ink(2.6)} />
      <path d="M-18 -8 Q2 2 24 -9 Q22 -3 12 -2 Q-6 0 -18 -8 Z" fill={shade(FUR, 0.3)} />
      <path
        d="M-6 -25 Q10 -28 20 -20"
        stroke={tint(FUR, 0.55)}
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={-18} cy={-18} r={11} fill={FUR} {...ink(2.6)} />
      <ellipse cx={-29} cy={-14} rx={7} ry={5} fill={FUR} {...ink(2.2)} />
      <ellipse cx={-12} cy={-29} rx={7} ry={8} fill={FUR} {...ink(2.2)} />
      <ellipse cx={-12} cy={-28.5} rx={4} ry={5} fill={PINK} />
      <ellipse cx={-20} cy={-20} rx={3.2} ry={3.8} fill={INK} />
      <circle cx={-21} cy={-21.6} r={1.3} fill="#fff" />
      <circle cx={-19.2} cy={-18.6} r={0.7} fill="#fff" />
      <ellipse cx={-15} cy={-13} rx={3} ry={1.8} fill={PINK} opacity={0.7} />
      <circle cx={-35} cy={-15} r={2.6} fill="#ff7a8a" {...ink(1.2)} />
      <path
        d="M-32 -12 l-9 2 M-32 -11 l-8 5"
        stroke={INK}
        strokeWidth={0.9}
        strokeLinecap="round"
      />
    </g>
  );
});

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

/** A shackle and ring where a chain hangs from a beam. */
function Ring({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={10} fill={STEEL} {...ink(OUT)} />
      <circle cx={x} cy={y} r={4} fill={shade(STEEL, 0.5)} />
      <path
        d={`M${x + 2} ${y - 7} A7 7 0 0 1 ${x + 7} ${y - 2}`}
        stroke="#fff"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

export function RatSwarmBack(p: ObstacleProps) {
  const id = useId();
  const { pivot, hole, ratSpeed } = RAT_SWARM;
  const swarmAt = eventTime(p.events, 'swarm');
  const end = chainEnd(p);
  const blink = Math.sin(p.t / 180) > -0.7;
  return (
    <g>
      <defs>
        <HoleDefs id={id} />
      </defs>
      {/* The rat hole in the tunnel wall, framed with timber (painted). */}
      <path
        d={`M${hole - 50} 4 L${hole - 50} -54 Q${hole} -110 ${hole + 50} -54 L${hole + 50} 4 Z`}
        fill={`url(#${id})`}
      />
      <rect x={hole - 69} y={-64} width={14} height={68} fill={P.timber} />
      <rect x={hole - 69} y={-64} width={5} height={68} fill={P.timberDark} />
      <rect x={hole + 55} y={-64} width={14} height={68} fill={P.timber} />
      <rect x={hole + 55} y={-64} width={5} height={68} fill={P.timberDark} />
      <rect x={hole - 76} y={-74} width={152} height={15} rx={3} fill={P.timber} />
      <rect x={hole - 76} y={-64} width={152} height={5} fill={P.timberDark} />
      <rect x={hole - 76} y={-74} width={152} height={2.5} fill={P.timberLight} />
      {p.t < swarmAt && blink && (
        <g>
          {[
            [hole - 16, -40],
            [hole - 3, -40],
            [hole + 14, -24],
            [hole + 26, -24],
          ].map(([ex, ey], i) => (
            <g key={i}>
              <ellipse cx={ex} cy={ey} rx={3.2} ry={4} fill="#ffd35a" />
              <circle cx={ex! - 0.8} cy={ey! - 1.4} r={1.1} fill="#fff" />
            </g>
          ))}
        </g>
      )}
      <RoofBeam x={pivot.x} y={pivot.y} w={240} />
      <Chain x1={pivot.x} y1={pivot.y} x2={end.x} y2={end.y} />
      <Ring x={pivot.x} y={pivot.y} />
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
