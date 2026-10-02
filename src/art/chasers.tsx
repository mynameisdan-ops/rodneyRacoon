import type { FC } from 'react';
import { CHASER_BOX, CHASER_WORLDS } from './chaserData';
import { ROCK } from './obstacles/mineKit';
import { noise, roundPath } from './obstacles/sceneKit';
import { ink, INK, shade, tint } from './style';
import './chasers.css';

/*
 * The danger that chases the hero along the page strip, one per world, drawn in
 * `CHASER_BOX`. Motion is CSS (spin, bob, buzz), so the page doesn't re-render
 * for it. Thrilling, never scary: no teeth, no glaring eyes.
 */

/** The boulder's lumpy outline around (72, 72), like the cut scene's boulder. */
const BOULDER_EDGE = roundPath(
  Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2;
    const m = 52 * (1 + 0.06 * noise(i, 4));
    return [72 + Math.cos(a) * m, 72 + Math.sin(a) * m] as const;
  }),
);

/** A pebble hopping along in front of the boulder. */
function Pebble({ x, delay }: { x: number; delay: number }) {
  return (
    <g className="chaser__hop" style={{ animationDelay: `${delay}s` }}>
      <path
        d={`M${x - 7} 124 Q${x - 8} 116 ${x - 2} 114 Q${x + 6} 112 ${x + 7} 119 Q${x + 8} 124 ${x - 7} 124 Z`}
        fill={ROCK}
        {...ink(2.2)}
      />
    </g>
  );
}

/** World 1: a boulder rolling down the tunnel, kicking up dust and pebbles. */
function Boulder() {
  return (
    <g>
      <DustPuffs color="#c8a88c" />
      <g stroke="#fff3d6" strokeWidth={4} strokeLinecap="round" opacity={0.7}>
        <path d="M6 50 h-20 M2 74 h-26 M8 98 h-16" />
      </g>
      <g className="chaser__spin" style={{ transformOrigin: '72px 72px' }}>
        <path d={BOULDER_EDGE} fill={ROCK} {...ink(4)} />
        <g fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M62 54 L74 68 L69 82 M74 68 L90 71" />
          <path d="M38 86 L50 92" />
          <path d="M90 38 L96 48" />
          <path d="M98 88 Q102 95 100 102" />
        </g>
        <circle cx={52} cy={50} r={4.5} fill={shade(ROCK, 0.25)} />
        <circle cx={62} cy={100} r={5.5} fill={shade(ROCK, 0.3)} />
        <circle cx={106} cy={74} r={3.5} fill={shade(ROCK, 0.25)} />
      </g>
      {/* Light and shadow stay put while it rolls: a crisp shadow, a rim light, a shine. */}
      <path d="M23 81 A50 50 0 0 0 89 119 Q50 110 23 81 Z" fill={shade(ROCK, 0.36)} />
      <path
        d="M79 31 A41 41 0 0 1 113 65"
        fill="none"
        stroke={tint(ROCK, 0.5)}
        strokeWidth={5.5}
        strokeLinecap="round"
      />
      <ellipse cx={88} cy={45} rx={7} ry={4} transform="rotate(40 88 45)" fill={tint(ROCK, 0.7)} />
      <Pebble x={130} delay={0} />
      <Pebble x={146} delay={-0.25} />
    </g>
  );
}

const BEES = [
  { x: 96, y: 40, d: 0 },
  { x: 70, y: 62, d: 0.15 },
  { x: 110, y: 78, d: 0.3 },
  { x: 48, y: 36, d: 0.45 },
  { x: 84, y: 96, d: 0.6 },
  { x: 40, y: 82, d: 0.75 },
  { x: 116, y: 18, d: 0.9 },
];

/** World 2: a buzzing swarm of forest bees. */
function Bees() {
  return (
    <g>
      <path
        d="M20 60 Q50 20 90 30 Q130 40 120 90 Q110 120 60 112 Q14 104 20 60 Z"
        fill="#ffd35a"
        opacity={0.12}
      />
      {BEES.map((b, i) => (
        <g key={i} className="chaser__buzz" style={{ animationDelay: `${-b.d}s` }}>
          <g transform={`translate(${b.x} ${b.y})`}>
            <ellipse cx={-4} cy={-10} rx={8} ry={6} fill="#e8f6ff" opacity={0.9} {...ink(1.5)} />
            <ellipse cx={0} cy={0} rx={12} ry={9} fill="#ffc93c" {...ink(2.5)} />
            <path d="M-3 -8 V8 M4 -8 V8" stroke={INK} strokeWidth={3.5} />
            <circle cx={9} cy={-2} r={1.8} fill={INK} />
          </g>
        </g>
      ))}
    </g>
  );
}

/** World 3: a flood wave curling after him. */
function Wave() {
  const water = '#3aa0d8';
  return (
    <g className="chaser__bob">
      <path
        d="M0 124 V70 Q10 20 64 14 Q118 10 128 50 Q112 36 96 44 Q86 52 100 64 Q116 76 134 72 L140 124 Z"
        fill={water}
        {...ink(4)}
      />
      <path d="M0 124 V96 Q40 78 80 96 Q110 110 140 100 V124 Z" fill={shade(water, 0.3)} />
      <path
        d="M24 56 Q52 26 96 28"
        fill="none"
        stroke={tint(water, 0.5)}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <g fill="#ffffff" {...ink(2)}>
        <circle cx={118} cy={46} r={9} />
        <circle cx={104} cy={36} r={7} />
        <circle cx={128} cy={62} r={6} />
        <circle cx={132} cy={112} r={7} />
      </g>
    </g>
  );
}

/** World 4: an avalanche snowball, spraying snow. */
function Snowball() {
  const snow = '#eef6ff';
  return (
    <g>
      <DustPuffs color="#ffffff" />
      <g className="chaser__spin" style={{ transformOrigin: '72px 72px' }}>
        <circle cx={72} cy={72} r={52} fill={snow} {...ink(4)} />
        <g fill={shade(snow, 0.18)}>
          <circle cx={52} cy={52} r={9} />
          <circle cx={94} cy={82} r={12} />
          <circle cx={60} cy={100} r={7} />
        </g>
        <path
          d="M86 38 l10 -6 M40 80 l-8 6"
          stroke="#6b4a2e"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>
      <path d="M24 84 A52 52 0 0 0 96 118 Q48 112 24 84 Z" fill={shade(snow, 0.22)} />
    </g>
  );
}

/** World 5: a twisting dust devil. */
function DustDevil() {
  const sand = '#e2b36e';
  return (
    <g className="chaser__sway" style={{ transformOrigin: '70px 124px' }}>
      {[
        { y: 20, rx: 58 },
        { y: 46, rx: 46 },
        { y: 70, rx: 34 },
        { y: 92, rx: 24 },
        { y: 112, rx: 14 },
      ].map((b, i) => (
        <g key={i} className="chaser__whirl" style={{ animationDelay: `${-i * 0.12}s` }}>
          <ellipse
            cx={70}
            cy={b.y}
            rx={b.rx}
            ry={11}
            fill={i % 2 ? sand : tint(sand, 0.25)}
            {...ink(3)}
          />
          <path
            d={`M${70 - b.rx * 0.6} ${b.y} Q70 ${b.y + 6} ${70 + b.rx * 0.6} ${b.y}`}
            fill="none"
            stroke={shade(sand, 0.35)}
            strokeWidth={3}
          />
        </g>
      ))}
      <g fill={shade(sand, 0.2)} {...ink(1.5)}>
        <circle cx={130} cy={40} r={4} />
        <circle cx={120} cy={90} r={3} />
        <circle cx={12} cy={60} r={3.5} />
      </g>
    </g>
  );
}

/** Puffs kicked up behind something rolling. */
function DustPuffs({ color }: { color: string }) {
  return (
    <g fill={color} opacity={0.7}>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          className="chaser__puff"
          style={{ animationDelay: `${-i * 0.2}s` }}
          cx={30}
          cy={112}
          r={14}
        />
      ))}
    </g>
  );
}

const CHASERS: Record<(typeof CHASER_WORLDS)[number], FC> = {
  1: Boulder,
  2: Bees,
  3: Wave,
  4: Snowball,
  5: DustDevil,
};

/** The chaser for a world (the boulder if the world has none of its own). */
export function Chaser({ worldId, scale = 1 }: { worldId: number; scale?: number }) {
  const Art = CHASERS[worldId as (typeof CHASER_WORLDS)[number]] ?? Boulder;
  const { w, h } = CHASER_BOX;
  return (
    <svg
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      overflow="visible"
      aria-hidden
    >
      <Art />
    </svg>
  );
}
