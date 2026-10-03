import type { FC } from 'react';
import { CHASER_BOX } from './chaserData';
import { ROCK } from './obstacles/mine/kit';
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
export function Boulder() {
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

/** One round, fuzzy bee with big shiny eyes, flying right (no stinger: busy, not scary). */
function Bee() {
  const body = '#ffc93c';
  return (
    <g>
      <path d="M-14 0 L-20 -4 L-20 4 Z" fill={INK} />
      <ellipse
        cx={-6}
        cy={-12}
        rx={9}
        ry={6}
        fill="#e8f6ff"
        opacity={0.85}
        {...ink(1.4)}
        transform="rotate(-20 -6 -12)"
      />
      <ellipse cx={0} cy={0} rx={13} ry={10} fill={body} {...ink(2.6)} />
      <path d="M-13 3 Q0 13 13 2 Q8 9 0 9 Q-8 9 -13 3 Z" fill={shade(body, 0.3)} />
      <path d="M-5 -9 V9 M2 -10 V10" stroke={INK} strokeWidth={3.6} />
      <path
        d="M2 -8 Q8 -9 11 -4"
        stroke={tint(body, 0.6)}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx={4}
        cy={-14}
        rx={8}
        ry={5.5}
        fill="#f4fbff"
        opacity={0.9}
        {...ink(1.4)}
        transform="rotate(-35 4 -14)"
      />
      <circle cx={9} cy={-2} r={3.6} fill="#fff" {...ink(1)} />
      <circle cx={10} cy={-1.6} r={2} fill={INK} />
      <circle cx={10.6} cy={-2.6} r={0.7} fill="#fff" />
      <path
        d="M11 -9 q3 -6 7 -6 M8 -10 q0 -6 3 -8"
        stroke={INK}
        strokeWidth={1.3}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

/** World 2: a buzzing swarm of round forest bees, with a dotted flight trail. */
export function Bees() {
  return (
    <g>
      <path
        d="M20 60 Q50 20 90 30 Q130 40 120 90 Q110 120 60 112 Q14 104 20 60 Z"
        fill="#ffd35a"
        opacity={0.12}
      />
      <path
        d="M-10 70 Q20 40 46 62 Q70 82 96 52"
        stroke="#fff6c0"
        strokeWidth={3}
        strokeDasharray="1 9"
        strokeLinecap="round"
        fill="none"
        opacity={0.8}
      />
      {BEES.map((b, i) => (
        <g key={i} className="chaser__buzz" style={{ animationDelay: `${-b.d}s` }}>
          <g transform={`translate(${b.x} ${b.y})`}>
            <Bee />
          </g>
        </g>
      ))}
    </g>
  );
}

/** World 3: a flood wave curling after him, claws of foam on its lip, a happy fish leaping out. */
export function Wave() {
  const water = '#2ea6da';
  const deep = '#15669f';
  return (
    <g className="chaser__bob">
      <path
        d="M0 124 V70 Q10 20 64 14 Q118 10 128 50 Q112 36 96 44 Q86 52 100 64 Q116 76 134 72 L140 124 Z"
        fill={water}
        {...ink(4)}
      />
      <path d="M2 124 V100 Q40 82 80 98 Q110 110 138 102 L140 124 Z" fill={shade(water, 0.25)} />
      <path d="M126 48 Q112 36 96 44 Q86 52 100 64 Q92 50 104 46 Q116 42 126 48 Z" fill={deep} />
      <g fill="none" stroke={tint(water, 0.55)} strokeLinecap="round">
        <path d="M18 62 Q36 28 84 22" strokeWidth={6} />
        <path d="M8 94 Q12 76 26 64" strokeWidth={3} />
      </g>
      {/* A little fish leaping out of the back of the wave. */}
      <g transform="translate(34 4) rotate(-25)">
        <path d="M-12 0 L-20 -6 L-19 6 Z" fill="#ff9a3c" {...ink(1.6)} />
        <ellipse cx={0} cy={0} rx={13} ry={7} fill="#ffb347" {...ink(2)} />
        <path d="M-6 4 Q2 8 10 3" stroke="#ff8a2a" strokeWidth={2} fill="none" />
        <circle cx={6} cy={-2} r={2.2} fill="#fff" {...ink(1)} />
        <circle cx={6.6} cy={-1.8} r={1.1} fill={INK} />
      </g>
      <g fill="#ffffff" {...ink(2)}>
        <circle cx={120} cy={42} r={9} />
        <circle cx={106} cy={32} r={7.5} />
        <circle cx={91} cy={26} r={6} />
        <circle cx={129} cy={57} r={6} />
        <circle cx={133} cy={112} r={7} />
        <circle cx={119} cy={118} r={5.5} />
      </g>
      <g fill="#effbff" {...ink(1.6)}>
        <ellipse cx={142} cy={34} rx={5} ry={3.4} transform="rotate(30 142 34)" />
        <ellipse cx={150} cy={50} rx={4} ry={2.8} transform="rotate(50 150 50)" />
        <ellipse cx={146} cy={96} rx={4} ry={2.8} />
      </g>
    </g>
  );
}

/** The snowball's lumpy outline around (72, 72). */
const SNOWBALL_EDGE = roundPath(
  Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const m = 50 * (1 + 0.07 * noise(i, 9));
    return [72 + Math.cos(a) * m, 72 + Math.sin(a) * m] as const;
  }),
);

/**
 * World 4: an avalanche snowball tumbling after him, a pine twig and pebbles rolled up in it,
 * clumps of snow flying off its front and a little snow bunting riding on top, quite happy.
 */
export function Snowball() {
  const snow = '#f4f8ff';
  const blue = '#b4c8ec';
  return (
    <g>
      <DustPuffs color="#ffffff" />
      <g stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.75}>
        <path d="M8 46 h-20 M2 70 h-26 M10 96 h-16" />
      </g>
      <g className="chaser__spin" style={{ transformOrigin: '72px 72px' }}>
        <path d={SNOWBALL_EDGE} fill={snow} {...ink(4)} />
        <g fill={blue}>
          <circle cx={50} cy={48} r={7} />
          <circle cx={96} cy={84} r={9} />
          <circle cx={58} cy={102} r={6} />
        </g>
        <path
          d="M86 36 l14 -12 M93 30 l8 2 M92 31 l-2 -8"
          stroke="#5a3e2a"
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <path d="M94 28 l8 -4 l-2 6 Z M84 40 l-8 -2 l4 6 Z" fill="#2f735a" {...ink(1.4)} />
        <path d="M34 82 q-6 -6 -2 -12 q8 2 8 10 Z" fill="#8f8ba3" {...ink(1.6)} />
        <path d="M78 110 q-2 -8 6 -9 q4 6 -1 10 Z" fill="#8f8ba3" {...ink(1.6)} />
      </g>
      {/* Light and shadow stay put while it rolls: a blue cel shadow, a rim light, a shine. */}
      <path d="M26 88 A50 50 0 0 0 98 116 Q52 112 26 88 Z" fill={blue} />
      <path
        d="M80 30 A42 42 0 0 1 114 64"
        fill="none"
        stroke="#ffffff"
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* Clumps of snow flung off its front. */}
      <g fill={snow} {...ink(2)}>
        <circle cx={132} cy={60} r={7} />
        <circle cx={142} cy={86} r={5} />
        <circle cx={136} cy={112} r={6} />
      </g>
      {/* A little snow bunting riding on top, cheerful about it. */}
      <g className="chaser__bob">
        <g transform="translate(70 16)">
          <path d="M-14 0 L-22 -4 L-20 4 Z" fill="#3a3448" {...ink(1.4)} />
          <ellipse cx={0} cy={0} rx={13} ry={10} fill="#ffffff" {...ink(2.2)} />
          <path d="M-12 -2 Q-4 -12 6 -9 Q-2 -2 -12 2 Z" fill="#3a3448" />
          <circle cx={8} cy={-3} r={2.2} fill={INK} />
          <circle cx={8.6} cy={-3.8} r={0.8} fill="#ffffff" />
          <path d="M12 -1 L18 1 L12 3 Z" fill="#ffb347" {...ink(1.2)} />
          <path d="M-2 10 v4 M3 10 v4" stroke="#ff9a3c" strokeWidth={1.8} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

/** The dust devil's funnel: narrow at the ground (70, 124), wide at its top. */
const DEVIL_EDGE = (() => {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const y = 124 - i * 14;
    const w = 8 + 50 * (i / 8) ** 1.4;
    return { y, w };
  });
  const left = pts.map((p) => `${70 - p.w} ${p.y}`);
  const right = pts.map((p) => `${70 + p.w} ${p.y}`).reverse();
  return `M${left.join(' L')} Q70 0 ${right[0]} L${right.slice(1).join(' L')} Z`;
})();

/** World 5: a dust devil whirling after him (cel), a tumbleweed and leaves spinning round it. */
export function DustDevil() {
  const sand = '#f2cc90';
  const dark = '#d49a68';
  return (
    <g className="chaser__sway" style={{ transformOrigin: '70px 124px' }}>
      <ellipse cx={70} cy={124} rx={34} ry={6} fill={dark} opacity={0.5} />
      <path d={DEVIL_EDGE} fill={sand} />
      <path d="M62 124 L20 12 Q40 8 60 14 Q56 70 66 124 Z" fill={dark} opacity={0.7} />
      {[0, 1, 2, 3].map((i) => {
        const y = 30 + i * 24;
        const w = 8 + 50 * ((124 - y) / 112) ** 1.4;
        return (
          <g key={i} className="chaser__whirl" style={{ animationDelay: `${-i * 0.12}s` }}>
            <path
              d={`M${70 - w} ${y} Q70 ${y + 8} ${70 + w} ${y - 2}`}
              fill="none"
              stroke={shade(sand, 0.35)}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <path
              d={`M${70 - w * 0.6} ${y - 6} Q70 ${y - 2} ${70 + w * 0.4} ${y - 8}`}
              fill="none"
              stroke={tint(sand, 0.6)}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          </g>
        );
      })}
      <path d={DEVIL_EDGE} fill="none" {...ink(4)} />
      {/* A little tumbleweed riding round it, and leaves. */}
      <g className="chaser__whirl">
        <circle cx={112} cy={60} r={11} fill="none" stroke="#6a4628" strokeWidth={3} />
        <path
          d="M103 56 Q112 68 121 56 M105 66 Q112 50 119 66"
          stroke="#a8783e"
          strokeWidth={2.4}
          fill="none"
        />
      </g>
      <path d="M22 40 q5 -5 12 0 q-5 5 -12 0 Z" fill="#6aa85a" {...ink(1.4)} />
      <path d="M128 98 q5 -5 12 0 q-5 5 -12 0 Z" fill="#e8a040" {...ink(1.4)} />
      <g fill={dark} {...ink(1.5)}>
        <circle cx={132} cy={34} r={3.5} />
        <circle cx={10} cy={84} r={3} />
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

/** A chaser drawing in its box (each world picks its own in `worlds/registry.ts`). */
export function Chaser({ art: Art, scale = 1 }: { art: FC; scale?: number }) {
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
