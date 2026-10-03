import { memo, useId } from 'react';
import { Dust } from '../../fx';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { PAINTED_RIVER } from '../../worlds/riverPalette';
import { bump, clamp01, fallen, lerp, noise, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { LIGHT, WOOD, ROPE } from './kit';
import { ROPE_BRIDGE } from './layout';

// ---------- Level 20: rope bridge ----------
// snap (the planks ahead fall away) → he goes hand over hand along the rope → climbs up.

/** An almond-shaped leaf pointing right from (0, 0), about 12 long. */
const P = PAINTED_RIVER;

const LEAF_PATH = 'M0 0 Q5 -5 12 0 Q5 5 0 0 Z';

/** A rope: a bold line with twists along it. */
function Rope({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={INK} strokeWidth={8.4} />
      <path d={d} stroke={ROPE} strokeWidth={5} />
      <path d={d} stroke={shade(ROPE, 0.35)} strokeWidth={5} strokeDasharray="2 6" />
    </g>
  );
}

/** The gorge under the bridge (painted): the far wall falling away into the dark, a river below. */
const Gorge = memo(function Gorge() {
  const id = useId();
  const [a, b] = ROPE_BRIDGE.gorge;
  const facets = [0.08, 0.2, 0.33, 0.47, 0.6, 0.74, 0.88];
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}far`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-14}
          x2="0"
          y2={200}
        >
          <stop offset="0" stopColor="#9890b8" />
          <stop offset="0.04" stopColor="#5a5282" />
          <stop offset="0.18" stopColor="#2c2848" />
          <stop offset="0.5" stopColor="#1a1830" />
          <stop offset="1" stopColor="#0e0d1c" />
        </linearGradient>
        <linearGradient id={`${id}facet`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d74a4" stopOpacity={0.8} />
          <stop offset="1" stopColor="#7d74a4" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}mist`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dff0ff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#dff0ff" stopOpacity={0.16} />
          <stop offset="1" stopColor="#dff0ff" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id={`${id}lit`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-4}
          x2="0"
          y2={180}
        >
          <stop offset="0" stopColor="#a69dc4" />
          <stop offset="0.2" stopColor="#5f5784" />
          <stop offset="1" stopColor="#1c1930" />
        </linearGradient>
        <linearGradient
          id={`${id}dark`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-4}
          x2="0"
          y2={180}
        >
          <stop offset="0" stopColor="#6c6490" />
          <stop offset="0.2" stopColor="#3a3456" />
          <stop offset="1" stopColor="#121022" />
        </linearGradient>
      </defs>
      <path
        d={`M${a} 240 V-2 Q${a + 30} -14 ${a + 60} -14 H${b - 60} Q${b - 30} -14 ${b} -2 V240 Z`}
        fill={`url(#${id}far)`}
      />
      {/* Lit facets of the far wall, fading into the shadow below. */}
      <g fill={`url(#${id}facet)`}>
        {facets.map((f, i) => {
          const x = lerp(a, b, f);
          const w = 30 + 26 * noise(i, 3);
          const h = 50 + 50 * noise(i, 5);
          return (
            <path
              key={f}
              d={`M${x - w * 0.5} -8 L${x + w * 0.5} -10 L${x + w * 0.3} ${h} L${x - w * 0.2} ${h * 0.8} Z`}
            />
          );
        })}
      </g>
      <path
        d={`M${a + 40} -6 Q${(a + b) / 2} -10 ${b - 40} -6`}
        stroke="#c8bfe0"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
      {/* Vines hanging over the far rim. */}
      <g stroke={P.reed} strokeWidth={3} fill="none" strokeLinecap="round">
        {[0.14, 0.4, 0.66, 0.92].map((f, i) => {
          const x = lerp(a, b, f);
          const len = 30 + 26 * noise(i, 7);
          return <path key={f} d={`M${x} -10 q${6 + i * 2} ${len * 0.5} ${-2} ${len}`} />;
        })}
      </g>
      <g fill={P.grass}>
        {[0.14, 0.4, 0.66, 0.92].map((f, i) => {
          const x = lerp(a, b, f);
          const len = 30 + 26 * noise(i, 7);
          return (
            <g key={f}>
              <path d={LEAF_PATH} transform={`translate(${x + 3} ${-10 + len * 0.4}) rotate(30)`} />
              <path
                d={LEAF_PATH}
                transform={`translate(${x - 1} ${-10 + len * 0.75}) rotate(150)`}
              />
            </g>
          );
        })}
      </g>
      {/* Mist drifting over the river far below. */}
      <rect x={a} y={84} width={b - a} height={56} fill={`url(#${id}mist)`} />
      <path
        d={`M${a + 20} 148 Q${(a + b) / 2} 140 ${b - 20} 148 V240 H${a + 20} Z`}
        fill="#1d4f7e"
      />
      <path
        d={`M${a + 70} 152 h70 M${a + 310} 148 h110 M${b - 190} 152 h80`}
        stroke={LIGHT}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.55}
      />
      {/* The gorge's near edges: the left one faces the light, the right one is in shadow. */}
      <path
        d={`M${a - 24} -3 L${a + 2} -3 Q${a + 20} 30 ${a + 34} 240 L${a - 24} 240 Z`}
        fill={`url(#${id}lit)`}
      />
      <path
        d={`M${b + 24} -3 L${b - 2} -3 Q${b - 20} 30 ${b - 34} 240 L${b + 24} 240 Z`}
        fill={`url(#${id}dark)`}
      />
      <g fill={P.grass}>
        <path
          d={`M${a - 30} -4 Q${a - 4} -8 ${a + 8} 2 Q${a + 2} 14 ${a + 6} 30 Q${a - 8} 14 ${a - 30} 6 Z`}
        />
        <path
          d={`M${b + 30} -4 Q${b + 4} -8 ${b - 8} 2 Q${b - 2} 16 ${b - 8} 34 Q${b + 8} 14 ${b + 30} 6 Z`}
        />
      </g>
    </g>
  );
});

/** A bridge post: wood with a cut top and rope wrapped round it. */
const Post = memo(function Post() {
  const top = -ROPE_BRIDGE.rope - 30;
  return (
    <g>
      <rect x={-9} y={top} width={18} height={-top + 8} rx={5} fill={WOOD} {...ink(OUT)} />
      <rect x={-7.4} y={top + 4} width={6} height={-top} rx={3} fill={shade(WOOD, 0.3)} />
      <path
        d={`M5 ${top + 8} V0`}
        stroke={tint(WOOD, 0.5)}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <ellipse cx={0} cy={top} rx={9} ry={3.4} fill={tint(WOOD, 0.35)} {...ink(IN)} />
      <path
        d={`M-10 ${top + 14} L10 ${top + 20} M-10 ${top + 20} L10 ${top + 26} M-10 ${top + 26} L10 ${top + 32}`}
        stroke={INK}
        strokeWidth={5.6}
        strokeLinecap="round"
      />
      <path
        d={`M-10 ${top + 14} L10 ${top + 20} M-10 ${top + 20} L10 ${top + 26} M-10 ${top + 26} L10 ${top + 32}`}
        stroke={ROPE}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
});

/** A plank of the bridge, its top at y 0, tied on with rope at both ends. */
const Plank = memo(function Plank() {
  return (
    <g>
      <rect x={-20} y={0} width={40} height={12} rx={2.5} fill={WOOD} {...ink(OUT - 0.6)} />
      <path d="M-20 8 H20 V9.5 Q20 12 17.5 12 H-17.5 Q-20 12 -20 9.5 Z" fill={shade(WOOD, 0.3)} />
      <path d="M-16 3.4 H14" stroke={tint(WOOD, 0.45)} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M-15 -1 V13 M15 -1 V13" stroke={INK} strokeWidth={4.6} />
      <path d="M-15 -1 V13 M15 -1 V13" stroke={ROPE} strokeWidth={2.4} />
    </g>
  );
});

export function RopeBridgeBack(p: ObstacleProps) {
  const [a, b] = ROPE_BRIDGE.gorge;
  const [g0, g1] = ROPE_BRIDGE.gap;
  const snap = since(p, 'snap');
  const planks = [];
  for (let x = a + 4; x < b - 4; x += 44) planks.push(x);
  const sag = 12 + 10 * bump(snap, 700);
  const rope = -ROPE_BRIDGE.rope;
  const mid = (a + b) / 2;
  return (
    <g>
      <Gorge />
      {/* The rope the planks hang from, behind them. */}
      <Rope d={`M${a - 10} 4 Q${mid} 18 ${b + 10} 4`} />
      {planks.map((x, i) => {
        const inGap = x > g0 - 22 && x < g1 + 22;
        const dt = inGap ? snap - Math.abs(x - (g0 + g1) / 2) * 0.6 : -1;
        const y = fallen(dt, 0.0028);
        if (y > 300) return null;
        const r = dt > 0 ? (noise(i) - 0.5) * dt * 0.5 : 0;
        return (
          <g
            key={x}
            transform={`translate(${x + 20} ${y.toFixed(1)}) rotate(${r.toFixed(1)})`}
            opacity={1 - clamp01((y - 160) / 120)}
          >
            <Plank />
          </g>
        );
      })}
      {[a - 10, b + 10].map((x) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <Post />
        </g>
      ))}
      {/* The hand rope he hangs from. */}
      <Rope d={`M${a - 10} ${rope} Q${mid} ${rope + sag} ${b + 10} ${rope}`} />
      <Dust x={(g0 + g1) / 2} y={-6} dt={snap} ms={700} size={0.9} color="#d8c8a8" />
    </g>
  );
}
