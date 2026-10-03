import { useId, useMemo } from 'react';
import { createRng } from '../../game/rng';
import { mix, shade, tint } from '../style';
import { Flower, GrassClump, Glint, MossRock, Pebbles } from './paintKit';
import { PAINTED_CANYON } from './canyonPalette';
import { ridgePath, useSpots, W, type LayerProps } from './sceneryKit';
import type { CanyonTheme } from './themes';

/*
 * The Canyon to Home backdrop layers, painted (M7b) like the river and the mountains, at golden
 * hour on the last stretch home: a low sun, clouds lit pink underneath, hawks and a hot-air
 * balloon far off; hazy buttes and banded mesas lit from the upper right; a long red canyon wall
 * with junipers, a ranch windmill and fence posts (home is near); and the warm desert floor with
 * its dirt road, painted saguaros, prickly pears, flowers, red stones and a lizard sunning itself.
 * No outlines: only the hero and his props are lined. Each layer is a 1280px tile, drawn once as
 * an image; anything at a tile's edge is drawn the same at both ends.
 */

type P = LayerProps<CanyonTheme>;
type Pt = readonly [number, number];

const C = PAINTED_CANYON;
const poly = (list: readonly Pt[]) =>
  `M${list.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;

/** The low sun, long clouds lit pink from below, hawks circling and a balloon far away. */
export function CanyonSky({ horizon, k, seed }: P) {
  const id = useId();
  const clouds = useSpots(seed * 101, 4, 170);
  const hawks = useSpots(seed * 107, 2, 300);
  const sx = 900;
  const sy = horizon * 0.62;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}sun`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="0.14" stopColor={C.sun} stopOpacity={0.85} />
          <stop offset="0.4" stopColor={C.sun} stopOpacity={0.35} />
          <stop offset="1" stopColor={C.sun} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={sx} cy={sy} rx={340 * k} ry={260 * k} fill={`url(#${id}sun)`} />
      {/* The page strip draws its own sun as the timer, so it shows only this one's glow. */}
      {k >= 0.8 && (
        <g>
          <circle cx={sx} cy={sy} r={50 * k} fill={C.sun} />
          <circle cx={sx} cy={sy} r={38 * k} fill={C.sunCore} />
        </g>
      )}
      {clouds.map((c, i) => {
        const y = horizon * (0.18 + c.r * 0.42);
        const s = (0.8 + c.r2 * 0.6) * k;
        return (
          <g key={i} transform={`translate(${c.x} ${y}) scale(${s})`}>
            <path
              d="M-120 6 Q-110 -10 -80 -8 Q-70 -26 -40 -22 Q-20 -40 10 -30 Q30 -44 56 -28 Q86 -32 96 -12 Q124 -12 130 6 Z"
              fill={C.cloud}
            />
            <path d="M-120 6 Q-40 -2 130 6 Q90 16 -10 14 Q-80 16 -120 6 Z" fill={C.cloudShade} />
            <path
              d="M-60 -14 Q-36 -30 -6 -24 Q20 -36 48 -22"
              stroke={C.cloudLit}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );
      })}
      <g stroke="#7a4a5a" strokeWidth={2.4 * k} strokeLinecap="round" fill="none" opacity={0.6}>
        {hawks.map((b, i) => {
          const y = horizon * (0.3 + b.r * 0.25);
          const s = (8 + b.r2 * 4) * k;
          return (
            <path
              key={i}
              d={`M${b.x - s} ${y - s * 0.3} Q${b.x - s * 0.4} ${y - s * 0.7} ${b.x} ${y} Q${b.x + s * 0.4} ${y - s * 0.7} ${b.x + s} ${y - s * 0.3}`}
            />
          );
        })}
      </g>
      {/* A hot-air balloon drifting far off, striped red and gold. */}
      <g transform={`translate(${280} ${horizon * 0.34}) scale(${0.8 * k})`} opacity={0.85}>
        <path
          d="M0 -34 Q-26 -34 -26 -6 Q-26 12 -8 22 L8 22 Q26 12 26 -6 Q26 -34 0 -34 Z"
          fill="#e8584a"
        />
        <path
          d="M0 -34 Q-10 -30 -10 -6 Q-10 14 -4 22 L4 22 Q10 14 10 -6 Q10 -30 0 -34 Z"
          fill="#ffc94a"
        />
        <path
          d="M0 -34 Q20 -32 24 -10 Q26 6 14 18 Q22 0 18 -14 Q14 -30 0 -34 Z"
          fill="#ffffff"
          opacity={0.3}
        />
        <path d="M-8 22 L-5 32 M8 22 L5 32" stroke="#6a4430" strokeWidth={1.4} />
        <rect x={-6} y={32} width={12} height={8} rx={1.5} fill="#8a5a3a" />
      </g>
    </g>
  );
}

interface MesaColors {
  face: string;
  lit: string;
  shade: string;
}

/**
 * A mesa at x, `w` wide and `h` tall on `base`: a flat top, cliffs banded with rock, slopes of
 * rubble at its feet, its right side lit by the sun and its left in purple shadow.
 */
function Mesa({
  x,
  w,
  h,
  base,
  c,
  bands = true,
  seed,
}: {
  x: number;
  w: number;
  h: number;
  base: number;
  c: MesaColors;
  bands?: boolean;
  seed: number;
}) {
  const shape = useMemo(() => {
    const rng = createRng(seed);
    const top = base - h;
    const cliff = top + h * (0.5 + rng.next() * 0.15);
    const l = x - w / 2;
    const r = x + w / 2;
    const apron = w * 0.28;
    const notch = rng.next() * w * 0.3;
    const body: Pt[] = [
      [l - apron, base],
      [l - apron * 0.4, cliff + (base - cliff) * 0.4],
      [l, cliff],
      [l + 6, top + 4],
      [l + w * 0.3, top],
      [l + w * 0.3 + notch * 0.2, top + 6],
      [l + w * 0.3 + notch, top + 4],
      [r - 4, top],
      [r, cliff],
      [r + apron * 0.4, cliff + (base - cliff) * 0.4],
      [r + apron, base],
    ];
    const lit: Pt[] = [
      [r - w * 0.18, top + 2],
      [r - 4, top],
      [r, cliff],
      [r + apron * 0.4, cliff + (base - cliff) * 0.4],
      [r + apron, base],
      [r - w * 0.1, base],
      [r - w * 0.14, cliff],
    ];
    const dark: Pt[] = [
      [l - apron, base],
      [l - apron * 0.4, cliff + (base - cliff) * 0.4],
      [l, cliff],
      [l + 6, top + 4],
      [l + w * 0.14, top + 2],
      [l + w * 0.1, cliff],
      [l + w * 0.04, base],
    ];
    const grooves = Array.from({ length: Math.max(2, Math.round(w / 40)) }, (_, i) => {
      const gx = l + w * (0.15 + (0.7 * (i + rng.next() * 0.6)) / Math.max(2, Math.round(w / 40)));
      return { x: gx, len: (cliff - top) * (0.5 + rng.next() * 0.5) };
    });
    return { top, cliff, l, r, body, lit, dark, grooves };
  }, [x, w, h, base, seed]);
  const { top, cliff, l, r, body, lit, dark, grooves } = shape;
  const bandH = (cliff - top) / 5;
  return (
    <g>
      <path d={poly(body)} fill={c.face} />
      {bands &&
        [1, 3].map((b) => (
          <path
            key={b}
            d={`M${l + 2} ${top + bandH * b} H${r - 2} V${top + bandH * (b + 0.7)} H${l + 2} Z`}
            fill={b === 1 ? tint(c.face, 0.25) : shade(c.face, 0.15)}
            opacity={0.8}
          />
        ))}
      <path d={poly(lit)} fill={c.lit} opacity={0.85} />
      <path d={poly(dark)} fill={c.shade} opacity={0.85} />
      <g stroke={c.shade} strokeLinecap="round" opacity={0.45}>
        {grooves.map((g, i) => (
          <path
            key={i}
            d={`M${g.x} ${top + 6} l2 ${g.len}`}
            strokeWidth={Math.max(1.5, w * 0.012)}
          />
        ))}
      </g>
      <path
        d={`M${l + 6} ${top + 1} H${r - 4}`}
        stroke={tint(c.lit, 0.35)}
        strokeWidth={Math.max(1.5, h * 0.03)}
        strokeLinecap="round"
      />
    </g>
  );
}

/** Hazy buttes far away, banded mesas nearer, and a haze over the desert at their feet. */
export function CanyonFar({ horizon, height, k, seed }: P) {
  const id = useId();
  const base = horizon + 4 * k;
  const ranges = useMemo(() => {
    const make = (s: number, n: number, minW: number, maxW: number, minH: number, maxH: number) => {
      const rng = createRng(seed * s);
      const span = W / n;
      return Array.from({ length: n }, (_, i) => ({
        x: span * (i + 0.5) + (rng.next() - 0.5) * span * 0.4,
        w: rng.int(minW, maxW) * k,
        h: rng.int(minH, maxH) * k,
        seed: seed * s + i,
        butte: rng.next() < 0.35,
      }));
    };
    return { back: make(131, 5, 90, 170, 50, 90), front: make(137, 3, 150, 230, 80, 130) };
  }, [seed, k]);
  const farC: MesaColors = { face: C.far, lit: tint(C.far, 0.25), shade: C.farShade };
  const nearC: MesaColors = { face: C.mesa, lit: C.mesaLit, shade: C.mesaShade };
  return (
    <g>
      <defs>
        <linearGradient id={`${id}haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.haze} stopOpacity={0} />
          <stop offset="0.75" stopColor={C.haze} stopOpacity={0.75} />
          <stop offset="1" stopColor={C.haze} stopOpacity={0.9} />
        </linearGradient>
        <linearGradient
          id={`${id}floor`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={base}
          x2="0"
          y2={height}
        >
          <stop offset="0" stopColor={mix(C.sand, C.haze, 0.5)} />
          <stop offset="1" stopColor={C.sand} />
        </linearGradient>
      </defs>
      <rect x={0} y={base - 2} width={W} height={height - base + 2} fill={`url(#${id}floor)`} />
      {ranges.back.map((m, i) => (
        <g key={i}>
          <Mesa x={m.x} w={m.w} h={m.h} base={base - 10 * k} c={farC} bands={false} seed={m.seed} />
          {m.butte && (
            <path
              d={`M${m.x + m.w * 0.7} ${base - 10 * k} L${m.x + m.w * 0.74} ${base - 10 * k - m.h * 1.3} H${m.x + m.w * 0.86} L${m.x + m.w * 0.9} ${base - 10 * k} Z`}
              fill={C.far}
            />
          )}
        </g>
      ))}
      <rect x={0} y={base - 70 * k} width={W} height={64 * k} fill={`url(#${id}haze)`} />
      {ranges.front.map((m, i) => (
        <Mesa key={i} x={m.x} w={m.w} h={m.h} base={base} c={nearC} seed={m.seed} />
      ))}
      <rect
        x={0}
        y={base - 40 * k}
        width={W}
        height={46 * k}
        fill={`url(#${id}haze)`}
        opacity={0.7}
      />
    </g>
  );
}

/** A painted saguaro standing at (x, y), `h` tall: ribbed, lit on its right, two arms raised. */
export function Saguaro({
  x,
  y,
  h,
  flip = false,
  dark = false,
}: {
  x: number;
  y: number;
  h: number;
  flip?: boolean;
  /** Deep in shadow (the front layer). */
  dark?: boolean;
}) {
  const s = h / 110;
  const body = dark ? '#1e3a2c' : C.cactus;
  const lit = dark ? '#2e5a3e' : C.cactusLit;
  const sh = dark ? '#132a20' : C.cactusShade;
  const arm = (d: string) => (
    <g>
      <path d={d} stroke={sh} strokeWidth={17} fill="none" strokeLinecap="round" />
      <path d={d} stroke={body} strokeWidth={13} fill="none" strokeLinecap="round" />
      <path
        d={d}
        stroke={lit}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        transform="translate(3 -1)"
      />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {!dark && <ellipse cx={4} cy={1} rx={24} ry={4} fill={C.sandShade} opacity={0.6} />}
      {arm('M-8 -42 H-22 Q-28 -42 -28 -50 V-72')}
      {arm('M8 -56 H22 Q28 -56 28 -64 V-86')}
      <path d="M-12 0 V-96 Q-12 -110 0 -110 Q12 -110 12 -96 V0 Z" fill={body} />
      <path d="M-12 0 V-96 Q-12 -110 0 -110 Q-6 -104 -6 -94 V0 Z" fill={sh} />
      <path d="M4 -104 V-4" stroke={lit} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M-1 -106 V-4 M8 -98 V-4" stroke={sh} strokeWidth={1.4} opacity={0.6} />
      {!dark && (
        <path
          d="M-4 -112 Q0 -118 4 -112"
          stroke="#ffd0e0"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

/** A ranch windmill at (x, y) pumping water: a lattice tower and a fan of blades (painted). */
function Windmill({ x, y, s }: { x: number; y: number; s: number }) {
  const blades = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g stroke={C.woodDark} strokeWidth={2.4} strokeLinecap="round" fill="none">
        <path d="M-14 0 L-3 -70 M14 0 L3 -70 M-11 -18 L11 -18 M-8 -40 L8 -40 M-11 -18 L8 -40 M11 -18 L-8 -40" />
      </g>
      <g transform="translate(0 -76)">
        {blades.map((a, i) => (
          <path
            key={i}
            d={`M${(Math.cos(a) * 5).toFixed(1)} ${(Math.sin(a) * 5).toFixed(1)} L${(Math.cos(a - 0.12) * 24).toFixed(1)} ${(Math.sin(a - 0.12) * 24).toFixed(1)} L${(Math.cos(a + 0.12) * 24).toFixed(1)} ${(Math.sin(a + 0.12) * 24).toFixed(1)} Z`}
            fill={i % 2 ? '#d8d0c0' : '#b8b0a4'}
          />
        ))}
        <circle r={5} fill="#7a7068" />
        <path d="M2 0 L30 -4 L30 6 Z" fill="#c8402e" />
      </g>
      <rect x={18} y={-10} width={26} height={10} rx={3} fill="#9aa0a8" />
    </g>
  );
}

/**
 * The canyon wall: a long red cliff banded with rock, deep grooves, junipers on its top, a ranch
 * windmill and fence posts on the desert in front of it.
 */
export function CanyonMid({ horizon, groundTop, height, k, seed }: P) {
  const id = useId();
  const base = horizon + (groundTop - horizon) * 0.55;
  const top = base - 64 * k;
  const wall = useMemo(
    () => ridgePath(seed * 23, top, 26 * k, 150, height),
    [seed, top, k, height],
  );
  const junipers = useSpots(seed * 211, 6, 60);
  const grooves = useSpots(seed * 213, 12, 30);
  const windmill = useSpots(seed * 217, 1, 380)[0]!;
  const posts = useSpots(seed * 219, 9, 40);
  const bushes = useSpots(seed * 223, 8, 40);
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}wall`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={top - 30 * k}
          x2="0"
          y2={base}
        >
          <stop offset="0" stopColor={C.cliffLit} />
          <stop offset="0.35" stopColor={C.cliff} />
          <stop offset="1" stopColor={C.cliffShade} />
        </linearGradient>
        <linearGradient
          id={`${id}flat`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={base - 6 * k}
          x2="0"
          y2={groundTop}
        >
          <stop offset="0" stopColor={mix(C.sand, C.haze, 0.3)} />
          <stop offset="1" stopColor={C.sand} />
        </linearGradient>
      </defs>
      <path d={wall} fill={`url(#${id}wall)`} />
      {/* Bands of rock across the wall. */}
      {C.bands.map((b, i) => (
        <path
          key={b}
          d={`M0 ${top + (12 + i * 12) * k} Q320 ${top + (8 + i * 12) * k} 640 ${top + (12 + i * 12) * k} T${W} ${top + (12 + i * 12) * k} V${top + (17 + i * 12) * k} Q960 ${top + (21 + i * 12) * k} 640 ${top + (17 + i * 12) * k} T0 ${top + (17 + i * 12) * k} Z`}
          fill={b}
          opacity={0.55}
        />
      ))}
      <g stroke={C.cliffDark} strokeLinecap="round" opacity={0.4}>
        {grooves.map((g, i) => (
          <path
            key={i}
            d={`M${g.x} ${top + 10 * k} l${3 * k} ${(30 + g.r * 30) * k}`}
            strokeWidth={(2 + g.r2 * 3) * k}
          />
        ))}
      </g>
      {junipers.map((j, i) => (
        <g key={i} transform={`translate(${j.x} ${top - 2 * k}) scale(${(0.6 + j.r * 0.5) * k})`}>
          <ellipse cx={0} cy={-8} rx={14} ry={10} fill={shade(C.juniper, 0.2)} />
          <ellipse cx={3} cy={-11} rx={10} ry={7} fill={C.juniper} />
          <ellipse cx={6} cy={-14} rx={5} ry={3.5} fill={tint(C.juniper, 0.35)} />
        </g>
      ))}
      <path d={ridgePath(seed * 29, base, 8 * k, 140, height, true)} fill={`url(#${id}flat)`} />
      {/* Fence posts running across the flat, and the windmill by them. */}
      <g fill={C.woodDark} opacity={0.75}>
        {posts.map((p, i) => (
          <rect key={i} x={p.x} y={base + 4 * k - 12 * k} width={2.4 * k} height={12 * k} />
        ))}
      </g>
      <path d={`M0 ${base - 3 * k} H${W}`} stroke={C.woodDark} strokeWidth={1 * k} opacity={0.4} />
      <Windmill x={windmill.x} y={base + 6 * k} s={0.8 * k} />
      {bushes.map((b, i) => (
        <g
          key={i}
          transform={`translate(${b.x} ${base + (8 + b.r * 14) * k}) scale(${(0.5 + b.r2 * 0.4) * k})`}
        >
          <ellipse cx={0} cy={-6} rx={14} ry={8} fill={shade(C.scrub, 0.2)} />
          <ellipse cx={3} cy={-8} rx={9} ry={5} fill={C.scrub} />
        </g>
      ))}
      {bushes.slice(0, 3).map((b, i) => (
        <Saguaro
          key={i}
          x={b.x + 40 * k}
          y={base + (10 + b.r * 10) * k}
          h={(46 + b.r2 * 20) * k}
          flip={i % 2 === 1}
        />
      ))}
    </g>
  );
}

/** A prickly pear at (x, y): flat pads in a cluster, pink flowers and fruit on top. */
function PricklyPear({ x, y, s }: { x: number; y: number; s: number }) {
  const pads: [number, number, number, number][] = [
    [0, -14, 12, 0],
    [-14, -26, 10, -25],
    [12, -30, 10, 20],
    [-2, -40, 9, -5],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={2} cy={1} rx={20} ry={3} fill={C.sandShade} opacity={0.6} />
      {pads.map(([px, py, r, rot], i) => (
        <g key={i} transform={`translate(${px} ${py}) rotate(${rot})`}>
          <ellipse cx={0} cy={0} rx={r * 0.8} ry={r * 1.1} fill={C.cactus} />
          <ellipse
            cx={-r * 0.25}
            cy={0}
            rx={r * 0.35}
            ry={r * 0.95}
            fill={C.cactusShade}
            opacity={0.5}
          />
          <ellipse
            cx={r * 0.25}
            cy={-r * 0.3}
            rx={r * 0.25}
            ry={r * 0.45}
            fill={C.cactusLit}
            opacity={0.8}
          />
        </g>
      ))}
      <circle cx={-2} cy={-52} r={4} fill="#ff5f8f" />
      <circle cx={-2} cy={-52} r={1.6} fill="#ffd23f" />
      <ellipse cx={14} cy={-41} rx={2.6} ry={3.4} fill="#d8406a" />
      <ellipse cx={-17} cy={-37} rx={2.6} ry={3.4} fill="#d8406a" />
    </g>
  );
}

/** A little lizard basking on a rock at (x, y). */
function Lizard({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-22 0 Q-30 -2 -36 4 Q-28 0 -22 2 Z" fill="#5a8a4a" />
      <ellipse cx={-8} cy={-1} rx={14} ry={3.6} fill="#6aa058" />
      <ellipse cx={8} cy={-2} rx={6} ry={3.4} fill="#6aa058" />
      <path
        d="M-14 1 l-3 4 M-2 1 l2 4 M-12 -2 l-3 -3 M0 -2 l2 -3"
        stroke="#4a7a3a"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <circle cx={10} cy={-3} r={0.9} fill="#1a1a1a" />
      <path d="M-14 -3 Q-6 -5 2 -4" stroke="#a8d080" strokeWidth={1.2} fill="none" />
    </g>
  );
}

/**
 * The desert floor: warm sand with wind ripples, the dirt road with its wheel ruts, painted
 * saguaros, prickly pears, flowers, dry grass, red stones and a lizard on a rock.
 */
export function CanyonNear({ groundTop, height, pathY, k, seed }: P) {
  const id = useId();
  const g = groundTop;
  const bits = useMemo(() => {
    const rng = createRng(seed * 307);
    const rows = Math.max(2, Math.round((height - g) / (40 * k)));
    const out: { x: number; y: number; kind: number; s: number; seed: number }[] = [];
    for (let r = 0; r < rows; r++) {
      const y = g + 24 * k + ((height - g - 30 * k) * (r + 0.5)) / rows;
      for (let x = 30 + rng.next() * 70; x < W - 30; x += (70 + rng.next() * 90) * k) {
        const yy = y + (rng.next() - 0.5) * 16 * k;
        if (pathY !== undefined && Math.abs(yy - pathY) < 28 * k) continue;
        out.push({
          x,
          y: yy,
          kind: rng.next(),
          s: (0.75 + rng.next() * 0.5) * k,
          seed: rng.int(1, 1e6),
        });
      }
    }
    return out;
  }, [seed, g, height, pathY, k]);
  const ripples = useSpots(seed * 311, 10, 60);
  const patches = useSpots(seed * 331, 6, 80);
  const stones = useSpots(seed * 341, 12, 30);
  const saguaros = useSpots(seed * 343, 3, 160);
  const lizard = useSpots(seed * 347, 1, 320)[0]!;
  const glints = useSpots(seed * 349, 8, 40);
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}g`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={g}
          x2="0"
          y2={height}
        >
          <stop offset="0" stopColor={C.sandTop} />
          <stop offset={Math.min(1, (60 * k) / Math.max(1, height - g))} stopColor={C.sand} />
          <stop offset="1" stopColor={C.sandDark} />
        </linearGradient>
        <linearGradient id={`${id}road`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.roadLight} />
          <stop offset="0.5" stopColor={C.road} />
          <stop offset="1" stopColor={shade(C.road, 0.2)} />
        </linearGradient>
        <radialGradient id={`${id}shadow`}>
          <stop offset="0" stopColor={C.sandShade} stopOpacity={0.7} />
          <stop offset="1" stopColor={C.sandShade} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}sun`}>
          <stop offset="0" stopColor="#fff2cc" stopOpacity={0.6} />
          <stop offset="1" stopColor="#fff2cc" stopOpacity={0} />
        </radialGradient>
      </defs>
      <path
        d={`M0 ${g} Q 320 ${g - 10 * k} 640 ${g} T ${W} ${g} V ${height} H 0 Z`}
        fill={`url(#${id}g)`}
      />
      <path
        d={`M0 ${g} Q 320 ${g - 10 * k} 640 ${g} T ${W} ${g}`}
        stroke={tint(C.sandTop, 0.4)}
        strokeWidth={3 * k}
        fill="none"
      />
      {patches.map((d, i) => (
        <ellipse
          key={i}
          cx={d.x}
          cy={g + (height - g) * (0.15 + d.r * 0.75)}
          rx={(90 + d.r2 * 70) * k}
          ry={(14 + d.r2 * 10) * k}
          fill={`url(#${id}${i % 2 ? 'shadow' : 'sun'})`}
        />
      ))}
      {/* Wind ripples in the sand. */}
      <g
        stroke={tint(C.sand, 0.35)}
        strokeWidth={2.2 * k}
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      >
        {ripples.map((r, i) => {
          const y = g + (height - g) * (0.12 + r.r * 0.8);
          const w = (40 + r.r2 * 40) * k;
          return (
            <path
              key={i}
              d={`M${r.x - w} ${y} q${w / 2} ${-5 * k} ${w} 0 t${w} 0 M${r.x - w * 0.6} ${y + 6 * k} q${w / 2} ${-4 * k} ${w} 0`}
            />
          );
        })}
      </g>
      {pathY !== undefined && (
        <g>
          <path d={`M0 ${pathY - 15 * k} H${W} V${pathY + 15 * k} H0 Z`} fill={`url(#${id}road)`} />
          {/* Wheel ruts down the road. */}
          <path
            d={`M0 ${pathY - 5 * k} H${W} M0 ${pathY + 6 * k} H${W}`}
            stroke={C.roadDark}
            strokeWidth={2.6 * k}
            opacity={0.45}
          />
          <path d={`M0 ${pathY - 15 * k} H${W}`} stroke={C.roadLight} strokeWidth={2 * k} />
          <path
            d={`M0 ${pathY + 14 * k} H${W}`}
            stroke={C.roadDark}
            strokeWidth={3 * k}
            opacity={0.5}
          />
          {stones.map((st, i) => (
            <g key={i}>
              <ellipse
                cx={st.x}
                cy={pathY + (st.r - 0.5) * 18 * k}
                rx={(3 + st.r2 * 5) * k}
                ry={(2 + st.r2 * 2) * k}
                fill={C.roadDark}
              />
              <ellipse
                cx={st.x - 1 * k}
                cy={pathY + (st.r - 0.5) * 18 * k - 1.2 * k}
                rx={(1.6 + st.r2 * 2.5) * k}
                ry={(1 + st.r2) * k}
                fill={C.roadLight}
              />
            </g>
          ))}
          {stones.map((st, i) => (
            <GrassClump
              key={`e${i}`}
              x={st.x + 30 * k}
              y={pathY + (i % 2 ? 18 : -14) * k}
              s={0.5 * k}
              dark={C.grass}
              light={C.grassLight}
              seed={seed * 700 + i}
              blades={5}
            />
          ))}
        </g>
      )}
      {bits.map((b, i) =>
        b.kind < 0.28 ? (
          <GrassClump
            key={i}
            x={b.x}
            y={b.y}
            s={b.s * 0.8}
            dark={C.grass}
            light={C.grassLight}
            seed={b.seed}
            blades={6}
          />
        ) : b.kind < 0.42 ? (
          <g key={i}>
            <Flower x={b.x} y={b.y} s={b.s} color={C.flowers[i % 4]!} />
            <Flower
              x={b.x + 9 * b.s}
              y={b.y + 3 * b.s}
              s={b.s * 0.8}
              color={C.flowers[(i + 1) % 4]!}
            />
          </g>
        ) : b.kind < 0.56 ? (
          <PricklyPear key={i} x={b.x} y={b.y} s={b.s * 0.75} />
        ) : b.kind < 0.72 ? (
          <MossRock key={i} x={b.x} y={b.y} s={b.s * 0.6} rock={C.stone} seed={b.seed} />
        ) : b.kind < 0.86 ? (
          <Pebbles key={i} x={b.x} y={b.y} s={b.s * 0.8} seed={b.seed} stone={C.stone} count={4} />
        ) : (
          <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s * 0.6})`}>
            <ellipse cx={0} cy={-6} rx={14} ry={8} fill={shade(C.scrub, 0.2)} />
            <ellipse cx={3} cy={-8} rx={9} ry={5} fill={C.scrub} />
            <ellipse cx={5} cy={-10} rx={4} ry={2.4} fill={C.scrubLight} />
          </g>
        ),
      )}
      {saguaros.map((s, i) => (
        <Saguaro
          key={i}
          x={s.x}
          y={pathY !== undefined ? pathY - 22 * k : g + (height - g) * (0.2 + s.r * 0.3)}
          h={(90 + s.r2 * 40) * k}
          flip={i % 2 === 1}
        />
      ))}
      <g>
        <MossRock
          x={lizard.x}
          y={
            pathY !== undefined ? Math.min(height - 10 * k, pathY + 60 * k) : g + (height - g) * 0.5
          }
          s={0.9 * k}
          rock={C.stone}
          seed={seed * 351}
        />
        <Lizard
          x={lizard.x - 4 * k}
          y={
            (pathY !== undefined
              ? Math.min(height - 10 * k, pathY + 60 * k)
              : g + (height - g) * 0.5) -
            20 * k
          }
          s={k}
        />
      </g>
      {glints.map((s, i) => (
        <Glint
          key={i}
          x={s.x}
          y={g + (height - g) * (0.1 + s.r * 0.8)}
          r={(2.4 + s.r2 * 3) * k}
          color="#fff6d8"
        />
      ))}
    </g>
  );
}

/**
 * A saguaro and red boulders right in front of the camera at the bottom corners, in shadow with
 * lit edges. They slide past faster than the ground (a quicker parallax), which makes the scene
 * deep.
 */
export function CanyonFront({ height, k }: P) {
  return (
    <g>
      <Saguaro x={70 * k} y={height + 40 * k} h={200 * k} dark />
      <g transform={`translate(${W - 110 * k} ${height + 8 * k}) scale(${k})`}>
        <path
          d="M-100 0 Q-104 -50 -66 -74 Q-24 -100 30 -86 Q80 -70 90 -28 Q94 -10 92 0 Z"
          fill="#4a1e28"
        />
        <path d="M30 -86 Q80 -70 90 -28 Q94 -10 92 0 L54 0 Q64 -44 30 -86 Z" fill="#6a2e34" />
        <path
          d="M-66 -74 Q-24 -100 30 -86 Q64 -76 78 -54"
          stroke="#b05a44"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
        <path d="M-150 0 Q-150 -26 -126 -34 Q-100 -40 -86 -20 L-84 0 Z" fill="#3e1820" />
      </g>
      <g transform={`translate(${W - 230 * k} ${height + 4 * k}) scale(${k})`}>
        {[-14, -6, 2, 10, 18].map((bx, i) => (
          <path
            key={bx}
            d={`M${bx - 3} 0 Q${bx + (i - 2) * 6} -50 ${bx + (i - 2) * 14} ${-96 + (i % 2) * 20} Q${bx + (i - 2) * 4 + 4} -44 ${bx + 3} 0 Z`}
            fill={i % 2 ? '#3a2416' : '#4a3020'}
          />
        ))}
      </g>
    </g>
  );
}
