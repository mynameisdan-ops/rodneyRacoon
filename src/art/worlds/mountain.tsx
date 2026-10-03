import { useId, useMemo } from 'react';
import { createRng, type Rng } from '../../game/rng';
import { mix, shade } from '../style';
import { Flower, GrassClump, Glint, MossRock, Pebbles } from './paintKit';
import { PAINTED_MOUNTAIN } from './mountainPalette';
import { ridgePath, useSpots, W, type LayerProps } from './sceneryKit';
import type { MountainTheme } from './themes';

/*
 * The Misty Mountains backdrop layers, painted (M7b) like the river: puffy clouds and soaring
 * eagles, two ranges of great snowy peaks lit from the upper right with mist at their feet, a
 * misty pine forest, nearer snowy slopes with painted pines, rocky outcrops and a log cabin
 * with smoke curling from its chimney, and the sunny snowfield with its stony path, snowy
 * rocks, dry grass, alpine flowers and a snow hare. No outlines: only the hero and his props
 * are lined. Each layer is a 1280px tile, drawn once as an image; anything at a tile's edge
 * is drawn the same at both ends.
 */

type P = LayerProps<MountainTheme>;
type Pt = readonly [number, number];

const C = PAINTED_MOUNTAIN;
const CLOUD_BODY = '#f3f8ff';

const pts = (list: readonly Pt[]) => list.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`);
const poly = (list: readonly Pt[]) => `M${pts(list).join(' L')} Z`;

/** Puffy painted clouds (lit on top, blue underneath), wisps of mist and two soaring eagles. */
export function MountainClouds({ horizon, k, seed }: P) {
  const spots = useSpots(seed * 101, 4, 160);
  const wisps = useSpots(seed * 109, 3, 200);
  const eagles = useSpots(seed * 107, 2, 260);
  const clouds = useMemo(() => {
    const rng = createRng(seed * 103);
    return spots.map((s) => ({
      x: s.x,
      y: horizon * (0.14 + s.r * 0.3),
      s: (0.75 + s.r2 * 0.65) * k,
      lobes: [0, 10, 20, 12, 2].map((grow, j) => {
        const r = 20 + rng.next() * 10 + grow;
        return { x: (j - 2) * 30 + (rng.next() - 0.5) * 10, y: -r * 0.5, r };
      }),
    }));
  }, [spots, horizon, k, seed]);
  return (
    <g>
      <g fill="#ffffff" opacity={0.42}>
        {wisps.map((w, i) => (
          <g key={i} transform={`translate(${w.x} ${horizon * (0.5 + w.r * 0.25)}) scale(${k})`}>
            <ellipse cx={0} cy={0} rx={150} ry={7} />
            <ellipse cx={40} cy={-6} rx={90} ry={6} />
            <ellipse cx={-60} cy={5} rx={70} ry={4} />
          </g>
        ))}
      </g>
      {clouds.map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.s})`}>
          <g fill={C.cloudShade}>
            <ellipse cx={-4} cy={2} rx={92} ry={15} />
            {c.lobes.map((l, j) => (
              <circle key={j} cx={l.x - 4} cy={l.y + 5} r={l.r} />
            ))}
          </g>
          <g fill={CLOUD_BODY}>
            <ellipse cx={2} cy={-5} rx={84} ry={12} />
            {c.lobes.map((l, j) => (
              <circle key={j} cx={l.x} cy={l.y} r={l.r * 0.93} />
            ))}
          </g>
          <g fill={C.cloud}>
            {c.lobes.map((l, j) => (
              <circle key={j} cx={l.x + l.r * 0.24} cy={l.y - l.r * 0.3} r={l.r * 0.55} />
            ))}
          </g>
        </g>
      ))}
      {eagles.map((e, i) => {
        const y = horizon * (0.3 + e.r * 0.3);
        const s = (0.9 + e.r2 * 0.5) * k;
        return (
          <g key={i} transform={`translate(${e.x} ${y}) scale(${s * (i % 2 ? -1 : 1)} ${s})`}>
            <path
              d="M-30 -2 Q-18 -10 -6 -4 Q-2 -6 0 -3 Q2 -6 6 -4 Q18 -12 32 -6 Q22 -4 14 0 Q6 3 0 4 Q-8 3 -16 1 Q-24 1 -30 -2 Z"
              fill="#4a4c6e"
              opacity={0.75}
            />
            <path d="M-3 0 Q0 -5 3 0 Z" fill="#f4f6ff" opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** Points along an edge from `from` to `to`, bowed down by `bow` and broken into rocky steps. */
function edge(rng: Rng, from: Pt, to: Pt, n: number, bow: number, jag: number): Pt[] {
  const out: Pt[] = [from];
  for (let i = 1; i < n; i++) {
    const u = i / n;
    out.push([
      from[0] + (to[0] - from[0]) * u + (rng.next() - 0.5) * jag,
      from[1] +
        (to[1] - from[1]) * u +
        Math.sin(Math.PI * u) * bow +
        (rng.next() - 0.5) * jag * 0.7,
    ]);
  }
  out.push(to);
  return out;
}

/** An edge (top first) cut where it crosses height `y`. */
function cut(list: readonly Pt[], y: number): Pt[] {
  const out: Pt[] = [list[0]!];
  for (let i = 1; i < list.length; i++) {
    const a = list[i - 1]!;
    const b = list[i]!;
    if (b[1] >= y) {
      const u = (y - a[1]) / Math.max(0.01, b[1] - a[1]);
      out.push([a[0] + (b[0] - a[0]) * u, y]);
      return out;
    }
    out.push(b);
  }
  return out;
}

interface PeakColors {
  rock: string;
  shade: string;
  snow: string;
  snowShade: string;
}

/**
 * A great peak at x, `h` tall: a shadowed face on the left and a lit one on the right of a
 * crest running down from the top, a cap of snow with drips down its gullies, and streaks of
 * snow and rock bands below it.
 */
function Peak({
  x,
  h,
  w,
  base,
  seed,
  c,
  snowLine = 0.42,
}: {
  x: number;
  h: number;
  w: number;
  base: number;
  seed: number;
  c: PeakColors;
  snowLine?: number;
}) {
  const shape = useMemo(() => {
    const rng = createRng(seed);
    const top: Pt = [x + (rng.next() - 0.5) * w * 0.1, base - h];
    const jag = h * 0.07;
    const left = edge(rng, top, [x - w, base + 2], 6, h * 0.08, jag);
    const right = edge(rng, top, [x + w * (0.9 + rng.next() * 0.2), base + 2], 6, h * 0.1, jag);
    const crest = edge(rng, top, [x + w * (0.05 + rng.next() * 0.2), base + 2], 5, 0, h * 0.06);
    const sy = base - h * (1 - snowLine);
    const sl = cut(left, sy);
    const sr = cut(right, sy);
    const sc = cut(crest, sy + h * 0.06);
    // The snow's lower edge: drips down the gullies, from the left side to the right.
    const a = sl[sl.length - 1]!;
    const b = sr[sr.length - 1]!;
    const n = Math.max(4, Math.round((b[0] - a[0]) / (h * 0.09)));
    const teeth: Pt[] = [];
    for (let i = 1; i < n; i++) {
      const u = i / n;
      const drip = i % 2 ? h * (0.04 + rng.next() * 0.14) : -h * (0.02 + rng.next() * 0.03);
      teeth.push([a[0] + (b[0] - a[0]) * u, sy + drip]);
    }
    const crestX = sc[sc.length - 1]![0];
    const litTeeth = teeth.filter(([tx]) => tx > crestX);
    const streaks = Array.from({ length: 4 }, () => {
      const sx = a[0] + (b[0] - a[0]) * (0.15 + rng.next() * 0.7);
      const len = h * (0.12 + rng.next() * 0.2);
      return { x: sx, y: sy + h * 0.06, len, lean: (sx - top[0]) * 0.18 };
    });
    return { top, left, right, crest, sl, sr, sc, teeth, litTeeth, streaks, b };
  }, [x, h, w, base, seed, snowLine]);
  const { top, left, right, crest, sl, sr, sc, teeth, litTeeth, streaks, b } = shape;
  const rev = (l: readonly Pt[]) => [...l].reverse();
  return (
    <g>
      <path d={poly([...rev(left), ...right.slice(1)])} fill={c.shade} />
      <path d={poly([...crest, ...rev(right).slice(0, -1)])} fill={c.rock} />
      {/* Snow lying in the gullies below the cap, tapering away down the face. */}
      <g fill={c.snowShade} opacity={0.7}>
        {streaks.map((s, i) => {
          const wd = h * 0.022;
          return (
            <path
              key={i}
              d={`M${(s.x - wd).toFixed(1)} ${s.y.toFixed(1)} Q${(s.x + s.lean * 0.4).toFixed(1)} ${(s.y + s.len * 0.6).toFixed(1)} ${(s.x + s.lean).toFixed(1)} ${(s.y + s.len).toFixed(1)} Q${(s.x + s.lean * 0.5 + wd).toFixed(1)} ${(s.y + s.len * 0.5).toFixed(1)} ${(s.x + wd).toFixed(1)} ${s.y.toFixed(1)} Z`}
            />
          );
        })}
      </g>
      <path d={poly([...sl, ...teeth, ...rev(sr)])} fill={c.snowShade} />
      <path d={poly([...sc, ...rev(litTeeth), b, ...rev(sr).slice(0, -1)])} fill={c.snow} />
      <path d={poly([top, ...sc.slice(1, 3)])} fill={c.snow} opacity={0.6} />
    </g>
  );
}

/** A painted pine with snow on every tier, its base at (x, y) and `h` tall. */
export function SnowPine({
  x,
  y,
  h,
  hazy = 0,
  flip = false,
}: {
  x: number;
  y: number;
  h: number;
  /** 0..1: how far it fades into the haze. */
  hazy?: number;
  flip?: boolean;
}) {
  const s = h / 100;
  const pine = mix(C.pine, C.haze, hazy);
  const dark = mix(C.pineDark, C.haze, hazy);
  const light = mix(C.pineLight, C.haze, hazy);
  const snowShade = mix(C.snowShade, C.haze, hazy * 0.5);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <rect x={-4} y={-14} width={8} height={15} fill={mix(C.bark, C.haze, hazy)} />
      {[0, 1, 2, 3].map((i) => {
        const by = -10 - i * 20;
        const ay = by - 36 + i * 2;
        const tw = 31 - i * 6.5;
        const my = ay + (by - ay) * 0.55;
        return (
          <g key={i}>
            <path
              d={`M0 ${ay} Q${-tw * 0.35} ${my} ${-tw} ${by} Q${-tw * 0.5} ${by + 4} 0 ${by - 1} Q${tw * 0.5} ${by + 4} ${tw} ${by} Q${tw * 0.35} ${my} 0 ${ay} Z`}
              fill={pine}
            />
            <path
              d={`M${-tw} ${by} Q${-tw * 0.5} ${by + 4} 0 ${by - 1} L${-tw * 0.4} ${by - 6} Z`}
              fill={dark}
            />
            <path
              d={`M0 ${ay} Q${tw * 0.35} ${my} ${tw} ${by} Q${tw * 0.5} ${by + 4} 0 ${by - 1} Q${tw * 0.2} ${my} 0 ${ay} Z`}
              fill={light}
              opacity={0.7}
            />
            <path
              d={`M0 ${ay - 1} Q${-tw * 0.32} ${my - 2} ${-tw * 0.82} ${by - 3} Q${-tw * 0.55} ${by - 8} ${-tw * 0.3} ${by - 5} Q${-tw * 0.05} ${by - 11} ${tw * 0.3} ${by - 5} Q${tw * 0.58} ${by - 9} ${tw * 0.86} ${by - 3} Q${tw * 0.32} ${my - 2} 0 ${ay - 1} Z`}
              fill={snowShade}
            />
            <path
              d={`M0 ${ay - 1} Q${tw * 0.1} ${my - 3} ${tw * 0.05} ${by - 8} Q${tw * 0.3} ${by - 7} ${tw * 0.3} ${by - 5} Q${tw * 0.58} ${by - 9} ${tw * 0.86} ${by - 3} Q${tw * 0.32} ${my - 2} 0 ${ay - 1} Z`}
              fill={C.snow}
            />
          </g>
        );
      })}
    </g>
  );
}

/**
 * The far peaks: the sun's glow, a pale far range and the great snowy peaks in front of it
 * with mist at their feet, and a misty pine forest below them.
 */
export function MountainFar({ horizon, height, k, seed }: P) {
  const id = useId();
  const base = horizon + 6 * k;
  const ranges = useMemo(() => {
    const make = (
      s: number,
      edgeH: number,
      edgeW: number,
      minH: number,
      maxH: number,
      gap: [number, number],
    ) => {
      const rng = createRng(seed * s);
      const list: { x: number; h: number; w: number; seed: number }[] = [];
      for (let x = 200 + rng.int(0, 80); x < W - 200; x += rng.int(gap[0], gap[1])) {
        list.push({ x, h: rng.int(minH, maxH) * k, w: rng.int(120, 180) * k, seed: seed * s + x });
      }
      // The same peak at both ends of the tile, drawn last so the seam always shows it.
      const end = { h: edgeH * k, w: edgeW * k, seed: seed * s + 7 };
      list.push({ x: 0, ...end }, { x: W, ...end });
      return list;
    };
    return {
      back: make(131, 150, 150, 140, 210, [200, 260]),
      front: make(137, 170, 170, 150, 250, [260, 360]),
    };
  }, [seed, k]);
  const forest = useMemo(() => {
    const y = base + 10 * k;
    const rng = createRng(seed * 151);
    const trees: { x: number; y: number; h: number }[] = [];
    for (let x = 6; x < W - 6; x += (9 + rng.next() * 12) * k) {
      trees.push({ x, y: y - rng.next() * 8 * k, h: (16 + rng.next() * 18) * k });
    }
    return { y, d: ridgePath(seed * 157, y + 4 * k, 6 * k, 90, height, true), trees };
  }, [base, height, k, seed]);
  const farC: PeakColors = {
    rock: C.farRock,
    shade: C.farShade,
    snow: C.farSnow,
    snowShade: C.farSnowShade,
  };
  const nearC: PeakColors = {
    rock: C.rock,
    shade: C.rockShade,
    snow: C.snow,
    snowShade: C.snowShade,
  };
  return (
    <g>
      <defs>
        <radialGradient id={`${id}sun`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="0.16" stopColor={C.sun} stopOpacity={0.75} />
          <stop offset="1" stopColor={C.sun} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}mist`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.haze} stopOpacity={0} />
          <stop offset="0.7" stopColor={C.haze} stopOpacity={0.85} />
          <stop offset="1" stopColor={C.haze} stopOpacity={0.95} />
        </linearGradient>
        <linearGradient
          id={`${id}forest`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={forest.y - 30 * k}
          x2="0"
          y2={forest.y + 40 * k}
        >
          <stop offset="0" stopColor={C.forestFar} />
          <stop offset="1" stopColor={mix(C.forestHaze, C.haze, 0.5)} />
        </linearGradient>
      </defs>
      <ellipse
        cx={W * 0.78}
        cy={horizon * 0.24}
        rx={300 * k}
        ry={230 * k}
        fill={`url(#${id}sun)`}
      />
      <g opacity={0.92}>
        {ranges.back.map((p, i) => (
          <Peak key={i} {...p} base={base - 34 * k} c={farC} snowLine={0.5} />
        ))}
      </g>
      <rect x={0} y={base - 110 * k} width={W} height={84 * k} fill={`url(#${id}mist)`} />
      {ranges.front.map((p, i) => (
        <Peak key={i} {...p} base={base} c={nearC} />
      ))}
      <rect x={0} y={base - 90 * k} width={W} height={100 * k} fill={`url(#${id}mist)`} />
      {/* A misty pine forest along the foot of the peaks. */}
      <g fill={`url(#${id}forest)`}>
        {forest.trees.map((t, i) => (
          <path
            key={i}
            d={`M${t.x - t.h * 0.3} ${t.y} L${t.x} ${t.y - t.h} L${t.x + t.h * 0.3} ${t.y} Z`}
          />
        ))}
        <path d={forest.d} />
      </g>
      <rect
        x={0}
        y={forest.y - 14 * k}
        width={W}
        height={40 * k}
        fill={`url(#${id}mist)`}
        opacity={0.8}
      />
    </g>
  );
}

/** A log cabin at (x, y) with snow on its roof, a glowing window and smoke from its chimney. */
function Cabin({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={4} cy={1} rx={46} ry={5} fill={C.snowBlue} opacity={0.7} />
      {/* Smoke curling up from the chimney, fading as it rises. */}
      <g fill={C.smoke}>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={20 + i * 6 + Math.sin(i * 1.7) * 5}
            cy={-64 - i * 13}
            r={5 + i * 2.2}
            opacity={0.8 - i * 0.14}
          />
        ))}
      </g>
      <rect x={14} y={-62} width={10} height={20} fill={C.stoneDark} />
      <rect x={14} y={-62} width={4} height={20} fill={C.stone} />
      <rect x={-34} y={-34} width={66} height={34} fill={C.wood} />
      <rect x={-34} y={-34} width={20} height={34} fill={C.woodDark} opacity={0.6} />
      <g stroke={C.woodDark} strokeWidth={1.6} opacity={0.7}>
        {[-27, -20, -13, -6].map((ly) => (
          <path key={ly} d={`M-34 ${ly} H32`} />
        ))}
      </g>
      <g fill={C.woodLight}>
        {[-30, -23, -16, -9, -2].map((ly) => (
          <circle key={ly} cx={32} cy={ly} r={3} />
        ))}
      </g>
      {/* The window's warm glow. */}
      <circle cx={8} cy={-18} r={16} fill={C.window} opacity={0.22} />
      <rect x={1} y={-24} width={14} height={12} fill={C.window} />
      <path d="M8 -24 V-12 M1 -18 H15" stroke={C.woodDark} strokeWidth={1.8} />
      <rect x={-24} y={-22} width={12} height={22} fill={C.woodDark} />
      <circle cx={-15} cy={-11} r={1.2} fill={C.window} />
      {/* The roof under a thick blanket of snow, with icicles along the eave. */}
      <path d="M-42 -32 L-2 -58 L40 -32 Z" fill={C.woodDark} />
      <path
        d="M-46 -30 Q-44 -38 -36 -40 L-2 -64 L36 -40 Q44 -38 44 -30 Q36 -26 28 -30 Q16 -25 4 -30 Q-8 -25 -20 -30 Q-32 -25 -46 -30 Z"
        fill={C.snowShade}
      />
      <path
        d="M-2 -64 L36 -40 Q44 -38 44 -30 Q36 -26 28 -30 Q16 -25 4 -30 Q2 -46 -2 -64 Z"
        fill={C.snow}
      />
      <g fill="#e6f4ff">
        {[-38, -26, -12, 6, 20, 34].map((ix, i) => (
          <path key={ix} d={`M${ix - 2} -29 L${ix} ${-21 + (i % 2) * 4} L${ix + 2} -29 Z`} />
        ))}
      </g>
      {/* A stack of firewood under a cap of snow. */}
      <g transform="translate(-44 0)">
        {[
          [-6, -4],
          [2, -4],
          [-2, -11],
        ].map(([lx, ly], i) => (
          <g key={i}>
            <circle cx={lx} cy={ly} r={4} fill={C.woodLight} />
            <circle cx={lx} cy={ly} r={1.6} fill={C.wood} />
          </g>
        ))}
        <path d="M-10 -13 Q-2 -19 6 -13 Q-2 -11 -10 -13 Z" fill={C.snow} />
      </g>
    </g>
  );
}

/** A rocky outcrop at (x, y), `w` wide: a lit face, a shadowed one, snow on its ledges. */
function Crag({ x, y, w, seed }: { x: number; y: number; w: number; seed: number }) {
  const shape = useMemo(() => {
    const rng = createRng(seed);
    const h = w * (0.55 + rng.next() * 0.25);
    const top: Pt[] = [
      [-w * 0.5, 0],
      [-w * 0.42, -h * 0.55],
      [-w * 0.2, -h * (0.85 + rng.next() * 0.15)],
      [w * 0.05, -h],
      [w * 0.28, -h * (0.7 + rng.next() * 0.15)],
      [w * 0.46, -h * 0.35],
      [w * 0.5, 0],
    ];
    return { h, top };
  }, [w, seed]);
  const { h, top } = shape;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={poly(top)} fill={C.rockShade} />
      <path d={poly([top[3]!, top[4]!, top[5]!, top[6]!, [w * 0.05, 0]])} fill={C.rock} />
      <path
        d={`M${-w * 0.3} ${-h * 0.45} L${w * 0.1} ${-h * 0.4} M${-w * 0.1} ${-h * 0.2} L${w * 0.3} ${-h * 0.18}`}
        stroke={C.rockDark}
        strokeWidth={2}
        opacity={0.4}
      />
      <path
        d={poly([
          top[1]!,
          top[2]!,
          top[3]!,
          top[4]!,
          [w * 0.3, -h * 0.58],
          [w * 0.12, -h * 0.72],
          [-w * 0.05, -h * 0.66],
          [-w * 0.22, -h * 0.7],
          [-w * 0.36, -h * 0.5],
        ])}
        fill={C.snowShade}
      />
      <path
        d={poly([
          top[3]!,
          top[4]!,
          [w * 0.3, -h * 0.58],
          [w * 0.12, -h * 0.72],
          [w * 0.02, -h * 0.85],
        ])}
        fill={C.snow}
      />
      <path d={`M${-w * 0.5} 0 Q0 ${-h * 0.12} ${w * 0.5} 0 Z`} fill={C.snowMid} />
    </g>
  );
}

/**
 * The nearer slopes: rolling snowy hills with groves of painted pines, rocky outcrops and a
 * log cabin with a glowing window.
 */
export function MountainMid({ horizon, groundTop, height, k, seed }: P) {
  const id = useId();
  const base = horizon + (groundTop - horizon) * 0.5;
  const hills = useMemo(
    () => [
      ridgePath(seed * 13, base - 26 * k, 26 * k, 210, height, true),
      ridgePath(seed * 19, base + 4 * k, 14 * k, 150, height, true),
    ],
    [seed, base, height, k],
  );
  const cabin = useSpots(seed * 29, 1, 360)[0]!;
  const crags = useSpots(seed * 31, 2, 200);
  const groves = useMemo(() => {
    const rng = createRng(seed * 37);
    const list: { x: number; y: number; h: number; hazy: number; flip: boolean }[] = [];
    for (let x = 30 + rng.next() * 40; x < W - 30; x += (22 + rng.next() * 46) * k) {
      // Leave room around the cabin.
      if (Math.abs(x - cabin.x) < 70 * k) continue;
      const back = rng.next() < 0.5;
      list.push({
        x,
        y: base + (back ? -18 : 4 + rng.next() * 10) * k,
        h: (back ? 40 + rng.next() * 26 : 54 + rng.next() * 40) * k,
        hazy: back ? 0.45 : 0.1,
        flip: rng.next() < 0.5,
      });
    }
    return list.sort((a, b) => a.y - b.y);
  }, [seed, base, k, cabin.x]);
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}far`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={base - 50 * k}
          x2="0"
          y2={groundTop}
        >
          <stop offset="0" stopColor={mix(C.snowMid, C.haze, 0.4)} />
          <stop offset="1" stopColor={C.snowBlue} />
        </linearGradient>
        <linearGradient
          id={`${id}near`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={base - 14 * k}
          x2="0"
          y2={groundTop}
        >
          <stop offset="0" stopColor={C.snowTop} />
          <stop offset="1" stopColor={C.snowLow} />
        </linearGradient>
      </defs>
      <path d={hills[0]} fill={`url(#${id}far)`} />
      {crags.map((c, i) => (
        <Crag key={i} x={c.x} y={base - 6 * k} w={(70 + c.r * 50) * k} seed={seed * 41 + i} />
      ))}
      {groves
        .filter((g) => g.hazy > 0.3)
        .map((g, i) => (
          <SnowPine key={i} x={g.x} y={g.y} h={g.h} hazy={g.hazy} flip={g.flip} />
        ))}
      <path d={hills[1]} fill={`url(#${id}near)`} />
      <Cabin x={cabin.x} y={base + 8 * k} s={k} />
      {groves
        .filter((g) => g.hazy <= 0.3)
        .map((g, i) => (
          <g key={i}>
            <ellipse cx={g.x + 3 * k} cy={g.y + 1} rx={g.h * 0.3} ry={3 * k} fill={C.snowBlue} />
            <SnowPine x={g.x} y={g.y} h={g.h} hazy={g.hazy} flip={g.flip} />
          </g>
        ))}
    </g>
  );
}

/** A snow hare sitting at (x, y), facing left: white, with dark tips on its long ears. */
function Hare({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={1} cy={1} rx={16} ry={3} fill={C.snowBlue} />
      <ellipse cx={11} cy={-11} rx={5} ry={4.5} fill={C.hare} />
      <ellipse cx={2} cy={-10} rx={12} ry={10} fill={C.hare} />
      <path d="M-10 -6 Q-6 2 6 0 Q12 -1 14 -6 Q8 -2 -2 -3 Q-8 -4 -10 -6 Z" fill={C.hareShade} />
      <circle cx={-8} cy={-24} r={7.5} fill={C.hare} />
      <path d="M-15 -22 Q-14 -18 -8 -17 Q-4 -17 -2 -20 Q-8 -19 -15 -22 Z" fill={C.hareShade} />
      <ellipse cx={-6} cy={-39} rx={2.8} ry={10} transform="rotate(12 -6 -39)" fill={C.hare} />
      <ellipse cx={-11} cy={-38} rx={2.8} ry={10} transform="rotate(-8 -11 -38)" fill={C.hare} />
      <ellipse
        cx={-10.8}
        cy={-37}
        rx={1.2}
        ry={6.5}
        transform="rotate(-8 -11 -38)"
        fill="#f2b8c8"
      />
      <ellipse cx={-4} cy={-47} rx={2.2} ry={3} transform="rotate(12 -6 -39)" fill="#3a3448" />
      <ellipse
        cx={-12.5}
        cy={-46.5}
        rx={2.2}
        ry={3}
        transform="rotate(-8 -11 -38)"
        fill="#3a3448"
      />
      <circle cx={-11} cy={-25} r={1.6} fill="#2a2438" />
      <circle cx={-10.5} cy={-25.6} r={0.6} fill="#ffffff" />
      <circle cx={-15.4} cy={-22.5} r={1.1} fill="#e88aa0" />
      <circle cx={14} cy={-14} r={4} fill="#ffffff" />
      <ellipse cx={-6} cy={-1} rx={5} ry={2} fill={C.hareShade} />
    </g>
  );
}

/** An edelweiss at (x, y): a woolly white star with a yellow middle. */
function Edelweiss({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 Q1 -5 0 -9" stroke="#7a9a6a" strokeWidth={1.8} fill="none" />
      <g fill="#f6f8f2">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse
            key={a}
            cx={0}
            cy={-4}
            rx={2}
            ry={4.2}
            transform={`translate(0 -12) rotate(${a})`}
          />
        ))}
      </g>
      <circle cx={0} cy={-12} r={2.4} fill="#e8d26a" />
    </g>
  );
}

/** A soft drift of snow at (x, y), `w` wide: lit on top, blue shadow underneath. */
function Drift({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <path
        d={`M${x - w} ${y} Q${x - w * 0.5} ${y - h} ${x} ${y - h * 0.92} Q${x + w * 0.6} ${y - h * 1.05} ${x + w} ${y} Q${x} ${y + h * 0.3} ${x - w} ${y} Z`}
        fill={C.snowTop}
      />
      <path
        d={`M${x - w} ${y} Q${x} ${y + h * 0.3} ${x + w} ${y} Q${x} ${y + h * 0.12} ${x - w * 0.7} ${y - h * 0.25} Q${x - w * 0.9} ${y - h * 0.1} ${x - w} ${y} Z`}
        fill={C.snowBlue}
        opacity={0.75}
      />
      <path
        d={`M${x - w * 0.2} ${y - h * 0.92} Q${x + w * 0.3} ${y - h * 1.05} ${x + w * 0.6} ${y - h * 0.7}`}
        stroke="#ffffff"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

/** A hare's tracks hopping across the snow from (x, y): pairs of prints, then a single pair. */
function Tracks({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g fill={C.snowBlue} transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${i * 34} ${(i % 2) * 3})`}>
          <ellipse cx={0} cy={-3} rx={4} ry={2} />
          <ellipse cx={1} cy={3} rx={4} ry={2} />
          <ellipse cx={-10} cy={0} rx={2.2} ry={1.6} />
          <ellipse cx={-15} cy={1} rx={2.2} ry={1.6} />
        </g>
      ))}
    </g>
  );
}

/**
 * The snowfield: sunlit snow with soft blue shadows and sparkles, drifts, snowy rocks, dry
 * grass, alpine flowers, little pines, a snow hare and its tracks, and the stony path.
 */
export function MountainNear({ groundTop, height, pathY, k, seed }: P) {
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
        // Keep the path clear.
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
  const drifts = useSpots(seed * 311, 5, 90);
  const shadows = useSpots(seed * 331, 6, 80);
  const glints = useSpots(seed * 337, 14, 30);
  const stones = useSpots(seed * 341, 12, 30);
  const hare = useSpots(seed * 347, 1, 320)[0]!;
  const tracks = useSpots(seed * 349, 1, 300)[0]!;
  const lip = (y: number, amp: number, step = 64) =>
    `M0 ${y} ${Array.from({ length: W / step }, (_, i) => `Q${i * step + step / 2} ${y - amp * (i % 2 ? 0.6 : 1)} ${(i + 1) * step} ${y}`).join(' ')}`;
  const hareY =
    pathY !== undefined ? Math.min(height - 12 * k, pathY + 58 * k) : g + (height - g) * 0.4;
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
          <stop offset="0" stopColor={C.snowTop} />
          <stop offset={Math.min(1, (60 * k) / Math.max(1, height - g))} stopColor={C.snowMid} />
          <stop offset="1" stopColor={C.snowLow} />
        </linearGradient>
        <linearGradient id={`${id}path`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.pathLight} />
          <stop offset="0.45" stopColor={C.path} />
          <stop offset="1" stopColor={shade(C.path, 0.2)} />
        </linearGradient>
        <radialGradient id={`${id}shadow`}>
          <stop offset="0" stopColor={C.snowBlue} stopOpacity={0.6} />
          <stop offset="1" stopColor={C.snowBlue} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}sun`}>
          <stop offset="0" stopColor="#fffbe6" stopOpacity={0.7} />
          <stop offset="1" stopColor="#fffbe6" stopOpacity={0} />
        </radialGradient>
      </defs>
      <path
        d={`M0 ${g} Q 320 ${g - 10 * k} 640 ${g} T ${W} ${g} V ${height} H 0 Z`}
        fill={`url(#${id}g)`}
      />
      <path
        d={`M0 ${g} Q 320 ${g - 10 * k} 640 ${g} T ${W} ${g}`}
        stroke="#ffffff"
        strokeWidth={3 * k}
        fill="none"
      />
      {shadows.map((d, i) => (
        <ellipse
          key={i}
          cx={d.x}
          cy={g + (height - g) * (0.15 + d.r * 0.75)}
          rx={(90 + d.r2 * 70) * k}
          ry={(14 + d.r2 * 10) * k}
          fill={`url(#${id}${i % 2 ? 'shadow' : 'sun'})`}
        />
      ))}
      {drifts.map((d, i) => (
        <Drift
          key={i}
          x={d.x}
          y={g + (12 + d.r * 14) * k}
          w={(60 + d.r2 * 50) * k}
          h={(12 + d.r * 8) * k}
        />
      ))}
      <Tracks x={tracks.x} y={g + (height - g) * 0.22} s={0.8 * k} />
      {pathY !== undefined && (
        <g>
          <path d={`M0 ${pathY - 15 * k} H${W} V${pathY + 15 * k} H0 Z`} fill={`url(#${id}path)`} />
          <path
            d={`M0 ${pathY - 3 * k} H${W} M0 ${pathY + 7 * k} H${W}`}
            stroke={shade(C.path, 0.12)}
            strokeWidth={2 * k}
            opacity={0.4}
          />
          {stones.map((st, i) => (
            <g key={i}>
              <ellipse
                cx={st.x}
                cy={pathY + (st.r - 0.5) * 18 * k}
                rx={(3 + st.r2 * 6) * k}
                ry={(2 + st.r2 * 2.5) * k}
                fill={C.pathDark}
              />
              <ellipse
                cx={st.x - 1 * k}
                cy={pathY + (st.r - 0.5) * 18 * k - 1.2 * k}
                rx={(1.6 + st.r2 * 3) * k}
                ry={(1 + st.r2) * k}
                fill={C.pathLight}
              />
            </g>
          ))}
          {/* Snow lying along both edges of the path, lit along its lip. */}
          <path d={`${lip(pathY - 13 * k, 4 * k)} V${pathY - 20 * k} H0 Z`} fill={C.snowTop} />
          <path
            d={lip(pathY - 13 * k, 4 * k)}
            stroke={C.snowBlue}
            strokeWidth={2 * k}
            fill="none"
          />
          <path d={`${lip(pathY + 14 * k, 3 * k, 80)} V${pathY + 22 * k} H0 Z`} fill={C.snowMid} />
          <path
            d={lip(pathY + 14 * k, 3 * k, 80)}
            stroke="#ffffff"
            strokeWidth={2.4 * k}
            fill="none"
          />
        </g>
      )}
      {bits.map((b, i) =>
        b.kind < 0.3 ? (
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
        ) : b.kind < 0.46 ? (
          <g key={i}>
            <GrassClump
              x={b.x}
              y={b.y}
              s={b.s * 0.55}
              dark={C.grass}
              light={C.grassLight}
              seed={b.seed}
              blades={4}
            />
            <Flower x={b.x - 6 * b.s} y={b.y} s={b.s * 0.9} color={C.flowers[i % 4]!} />
            <Flower
              x={b.x + 8 * b.s}
              y={b.y + 3 * b.s}
              s={b.s * 0.75}
              color={C.flowers[(i + 2) % 4]!}
            />
          </g>
        ) : b.kind < 0.58 ? (
          <g key={i}>
            <Edelweiss x={b.x} y={b.y} s={b.s} />
            <Edelweiss x={b.x + 10 * b.s} y={b.y + 2 * b.s} s={b.s * 0.8} />
          </g>
        ) : b.kind < 0.76 ? (
          <g key={i}>
            <MossRock x={b.x} y={b.y} s={b.s * 0.7} rock={C.stone} moss={C.snow} seed={b.seed} />
            <ellipse
              cx={b.x - 14 * b.s}
              cy={b.y + 1}
              rx={20 * b.s}
              ry={3 * b.s}
              fill={C.snowBlue}
              opacity={0.6}
            />
          </g>
        ) : b.kind < 0.88 ? (
          <Pebbles key={i} x={b.x} y={b.y} s={b.s * 0.8} seed={b.seed} stone={C.stone} count={4} />
        ) : (
          <g key={i}>
            <ellipse cx={b.x + 3 * b.s} cy={b.y + 1} rx={14 * b.s} ry={3 * b.s} fill={C.snowBlue} />
            <SnowPine x={b.x} y={b.y} h={36 * b.s} />
          </g>
        ),
      )}
      <Hare x={hare.x} y={hareY} s={k} />
      {glints.map((s, i) => (
        <Glint
          key={i}
          x={s.x}
          y={g + (height - g) * (0.08 + s.r * 0.85)}
          r={(3 + s.r2 * 5) * k}
          color={i % 3 ? C.sparkle : '#fff6c8'}
        />
      ))}
    </g>
  );
}

/** A tier of needles: a drooping shape whose lower edge is a fringe of needle tips. */
function needleTier(tw: number, ay: number, by: number) {
  const n = 9;
  const fringe = Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    const x = -tw + 2 * tw * u;
    const sag = by + 6 * Math.sin(Math.PI * u);
    return `L${x.toFixed(1)} ${(sag + (i % 2 ? 10 : 0)).toFixed(1)}`;
  }).join(' ');
  return `M0 ${ay} Q${-tw * 0.4} ${(ay + by) / 2} ${-tw} ${by} ${fringe} Q${tw * 0.4} ${(ay + by) / 2} 0 ${ay} Z`;
}

/** A young pine in deep shadow right in front of the camera, its base below (x, y). */
function FrontPine({ x, y, h, flip = 1 }: { x: number; y: number; h: number; flip?: 1 | -1 }) {
  const s = h / 100;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`}>
      {[0, 1, 2, 3].map((i) => {
        const by = -4 - i * 22;
        const ay = by - 40 + i * 3;
        const tw = 40 - i * 8;
        return (
          <g key={i}>
            <path d={needleTier(tw, ay, by)} fill="#0e2a24" />
            <path
              d={`M0 ${ay} Q${tw * 0.4} ${(ay + by) / 2} ${tw} ${by} L${tw * 0.3} ${by + 4} Q${tw * 0.1} ${(ay + by) / 2} 0 ${ay} Z`}
              fill="#1b4639"
            />
            <path
              d={`M0 ${ay - 1} Q${-tw * 0.35} ${ay + (by - ay) * 0.5} ${-tw * 0.85} ${by - 4} Q${-tw * 0.5} ${by - 10} ${-tw * 0.15} ${by - 7} Q${tw * 0.2} ${by - 13} ${tw * 0.55} ${by - 7} Q${tw * 0.75} ${by - 9} ${tw * 0.9} ${by - 3} Q${tw * 0.35} ${ay + (by - ay) * 0.5} 0 ${ay - 1} Z`}
              fill="#9fb3d6"
            />
            <path
              d={`M0 ${ay - 1} Q${tw * 0.35} ${ay + (by - ay) * 0.5} ${tw * 0.9} ${by - 3}`}
              stroke="#eef5ff"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
}

/**
 * Young snowy pines and a snow-capped rock right in front of the camera at the bottom corners,
 * in shadow with lit snow. They slide past faster than the ground (a quicker parallax), which
 * makes the scene deep.
 */
export function MountainFront({ height, k }: P) {
  return (
    <g>
      <FrontPine x={70 * k} y={height + 40 * k} h={260 * k} />
      <FrontPine x={150 * k} y={height + 50 * k} h={170 * k} flip={-1} />
      <g transform={`translate(${W - 90 * k} ${height + 6 * k}) scale(${k})`}>
        <path
          d="M-90 0 Q-96 -46 -60 -70 Q-20 -96 30 -84 Q76 -70 84 -30 Q88 -10 86 0 Z"
          fill="#1a2238"
        />
        <path d="M30 -84 Q76 -70 84 -30 Q88 -10 86 0 L50 0 Q60 -40 30 -84 Z" fill="#2a3452" />
        <path
          d="M-74 -52 Q-40 -96 24 -88 Q60 -80 74 -50 Q56 -58 40 -52 Q16 -62 -6 -54 Q-30 -64 -50 -50 Q-64 -56 -74 -52 Z"
          fill="#9fb3d6"
        />
        <path
          d="M-60 -70 Q-20 -96 30 -84 Q60 -76 72 -54"
          stroke="#eef5ff"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <g transform={`translate(${W - 190 * k} ${height + 4 * k}) scale(${k})`}>
        {[-14, -6, 2, 10, 18].map((bx, i) => (
          <path
            key={bx}
            d={`M${bx - 3} 0 Q${bx + (i - 2) * 6} -60 ${bx + (i - 2) * 16} ${-110 + (i % 2) * 24} Q${bx + (i - 2) * 4 + 4} -50 ${bx + 3} 0 Z`}
            fill={i % 2 ? '#3a3020' : '#4a3d26'}
          />
        ))}
      </g>
    </g>
  );
}
