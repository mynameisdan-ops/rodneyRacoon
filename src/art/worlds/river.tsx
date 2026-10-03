import { useId, useMemo } from 'react';
import { createRng } from '../../game/rng';
import { mix, shade, tint } from '../style';
import {
  Flower,
  GrassClump,
  Glint,
  LEAF,
  LeafCluster,
  MossRock,
  Pebbles,
  type Foliage,
} from './paintKit';
import { PAINTED_RIVER } from './riverPalette';
import { ridgePath, useSpots, W, type LayerProps } from './sceneryKit';
import type { RiverTheme } from './themes';

/*
 * The Rushing River backdrop layers, painted (M7b) like the forest and the mine: puffy clouds lit
 * from above, a glimpse of the snowy mountains ahead, green hills fading into the haze with a tall
 * waterfall and a rainbow in its mist, the wide turquoise river with willows, reeds, lily pads and
 * a family of ducks, and the sunny near bank with its sandy shore and path. No outlines: only the
 * hero and his props are lined. Each layer is a 1280px tile, drawn once as an image; anything at
 * a tile's edge is drawn the same at both ends.
 */

type P = LayerProps<RiverTheme>;
type Pt = readonly [number, number];

const C = PAINTED_RIVER;

const WILLOW: Foliage = { dark: '#2d6b3a', base: '#4a984b', light: '#7cc262', rim: '#c2eb8a' };
const BUSH: Foliage = { dark: '#2a6634', base: '#43923e', light: '#74bf58', rim: '#bce887' };
const CLOUD_BODY = '#f2f8fe';
const RAINBOW = ['#ff6b6b', '#ffa94d', '#ffe066', '#8ce99a', '#74c0fc', '#b197fc'];
const BUTTERFLIES = ['#ffd23f', '#ff9ec7', '#a8d8ff'];

/** The point `u` of the way along the quadratic curve from a to c (control b). */
const qAt = (a: Pt, b: Pt, c: Pt, u: number): Pt => [
  (1 - u) ** 2 * a[0] + 2 * (1 - u) * u * b[0] + u * u * c[0],
  (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * b[1] + u * u * c[1],
];
const pt = ([x, y]: Pt) => `${x.toFixed(1)} ${y.toFixed(1)}`;

/** Puffy painted clouds drifting over the valley (lit on top, blue underneath) and a few birds. */
export function RiverClouds({ horizon, k, seed }: P) {
  const spots = useSpots(seed * 101, 5, 140);
  const birds = useSpots(seed * 107, 4, 120);
  const clouds = useMemo(() => {
    const rng = createRng(seed * 103);
    return spots.map((s) => ({
      x: s.x,
      y: horizon * (0.16 + s.r * 0.38),
      s: (0.7 + s.r2 * 0.6) * k,
      lobes: [0, 8, 16, 8, 0].map((grow, j) => {
        const r = 20 + rng.next() * 10 + grow;
        return { x: (j - 2) * 28 + (rng.next() - 0.5) * 10, y: -r * 0.5, r };
      }),
    }));
  }, [spots, horizon, k, seed]);
  return (
    <g>
      {clouds.map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.s})`}>
          <g fill={C.cloudShade}>
            <ellipse cx={-4} cy={2} rx={84} ry={14} />
            {c.lobes.map((l, j) => (
              <circle key={j} cx={l.x - 4} cy={l.y + 5} r={l.r} />
            ))}
          </g>
          <g fill={CLOUD_BODY}>
            <ellipse cx={2} cy={-5} rx={77} ry={11} />
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
      <g stroke="#3d6390" strokeWidth={2.2 * k} strokeLinecap="round" fill="none" opacity={0.5}>
        {birds.map((b, i) => {
          const y = horizon * (0.22 + b.r * 0.36);
          const s = (6 + b.r2 * 4) * k;
          return (
            <path
              key={i}
              d={`M${b.x - s} ${y - s * 0.4} Q${b.x - s * 0.4} ${y - s * 0.6} ${b.x} ${y} Q${b.x + s * 0.4} ${y - s * 0.6} ${b.x + s} ${y - s * 0.4}`}
            />
          );
        })}
      </g>
    </g>
  );
}

/** One far peak at x, `h` tall and `w` wide each side of its top, with a cap of snow. */
function Peak({ x, h, w, base }: { x: number; h: number; w: number; base: number }) {
  const l0: Pt = [x - w, base];
  const l1: Pt = [x - w * 0.35, base - h * 0.7];
  const top: Pt = [x, base - h];
  const r1: Pt = [x + w * 0.4, base - h * 0.65];
  const r0: Pt = [x + w, base];
  // The snow line meets the sides here; the snow's own edges follow the sides up to the top.
  const sl = qAt(l0, l1, top, 0.72);
  const sr = qAt(top, r1, r0, 0.3);
  const cl: Pt = [l1[0] * 0.28 + top[0] * 0.72, l1[1] * 0.28 + top[1] * 0.72];
  const cr: Pt = [top[0] * 0.7 + r1[0] * 0.3, top[1] * 0.7 + r1[1] * 0.3];
  const teeth: Pt[] = [
    [x + w * 0.14, base - h * 0.66],
    [x + w * 0.05, base - h * 0.74],
    [x - w * 0.05, base - h * 0.63],
    [x - w * 0.14, base - h * 0.72],
  ];
  return (
    <g>
      <path d={`M${pt(l0)} Q${pt(l1)} ${pt(top)} Q${pt(r1)} ${pt(r0)} Z`} />
      <path
        d={`M${pt(top)} Q${pt(l1)} ${pt(l0)} L${x - w * 0.12} ${base} Q${x - w * 0.04} ${base - h * 0.45} ${pt(top)} Z`}
        fill={C.peakShade}
        opacity={0.55}
      />
      <path
        d={`M${pt(sl)} Q${pt(cl)} ${pt(top)} Q${pt(cr)} ${pt(sr)} ${teeth.map((p) => `L${pt(p)}`).join(' ')} Z`}
        fill={C.snow}
      />
      <path
        d={`M${pt(sl)} Q${pt(cl)} ${pt(top)} L${x - w * 0.03} ${base - h * 0.68} L${pt(teeth[3]!)} Z`}
        fill="#d2dcf0"
      />
    </g>
  );
}

/**
 * The far valley: the sun's glow, snowy peaks far away (the mountains come next), rows of hills
 * with trees fading into the haze, and a tall waterfall with a rainbow in its mist.
 */
export function RiverFar({ horizon, height, k, seed }: P) {
  const id = useId();
  const base = horizon - 14 * k;
  const peaks = useMemo(() => {
    const rng = createRng(seed * 131);
    const list = [{ x: 0, h: 84, w: 130 }];
    for (let x = 150 + rng.int(0, 60); x < W - 160; x += rng.int(170, 250)) {
      list.push({ x, h: rng.int(60, 110), w: rng.int(100, 165) });
    }
    list.push({ x: W, h: 84, w: 130 });
    return list.map((p) => ({ x: p.x, h: p.h * k, w: p.w * k }));
  }, [seed, k]);
  const rows = useMemo(
    () =>
      [
        { y: horizon - 26 * k, amp: 22 * k, step: 150 },
        { y: horizon - 2 * k, amp: 16 * k, step: 130 },
        { y: horizon + 18 * k, amp: 10 * k, step: 110 },
      ].map((r, i) => {
        const rng = createRng(seed * 151 + i);
        const trees: { x: number; y: number; h: number; tall: boolean }[] = [];
        for (let x = 30 + rng.next() * 40; x < W - 30; x += (34 + rng.next() * 60) * k) {
          trees.push({
            x,
            y: r.y - r.amp * 0.2 + rng.next() * r.amp * 0.5,
            h: (18 + rng.next() * 16) * k * (1 + i * 0.35),
            tall: rng.next() < 0.3,
          });
        }
        return { ...r, d: ridgePath(seed * 7 + i * 4, r.y, r.amp, r.step, height, true), trees };
      }),
    [horizon, height, k, seed],
  );
  // The waterfall pours off a rounded cliff that stands between the far hills and the nearer ones.
  const fx = 820;
  const top = horizon - 140 * k;
  const foot = horizon + 16 * k;
  const cl = fx - 120 * k;
  const cr = fx + 150 * k;
  const peakTop = base - 110 * k;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}sun`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="0.18" stopColor={C.sun} stopOpacity={0.75} />
          <stop offset="1" stopColor={C.sun} stopOpacity={0} />
        </radialGradient>
        <linearGradient
          id={`${id}peaks`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={peakTop}
          x2="0"
          y2={base}
        >
          <stop offset="0" stopColor={C.peaks} />
          <stop offset="1" stopColor={mix(C.peaks, C.haze, 0.7)} />
        </linearGradient>
        {rows.map((r, i) => (
          <linearGradient
            key={i}
            id={`${id}row${i}`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1={r.y - r.amp}
            x2="0"
            y2={r.y + 50 * k}
          >
            <stop offset="0" stopColor={C.rows[i]} />
            <stop offset="1" stopColor={mix(C.rows[i]!, C.haze, 0.45)} />
          </linearGradient>
        ))}
        <linearGradient id={`${id}fog`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.haze} stopOpacity={0} />
          <stop offset="0.6" stopColor={C.haze} stopOpacity={0.7} />
          <stop offset="1" stopColor={C.haze} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}cliff`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.cliffDark} />
          <stop offset="0.45" stopColor={C.cliff} />
          <stop offset="0.85" stopColor={C.cliff} />
          <stop offset="0.95" stopColor={C.cliffLight} />
          <stop offset="1" stopColor={C.cliff} />
        </linearGradient>
        <linearGradient id={`${id}fall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor={C.fall} />
          <stop offset="1" stopColor={mix(C.fall, C.water, 0.3)} />
        </linearGradient>
      </defs>
      <ellipse cx={W * 0.8} cy={horizon * 0.26} rx={300 * k} ry={220 * k} fill={`url(#${id}sun)`} />
      <g fill={`url(#${id}peaks)`}>
        {peaks.map((p, i) => (
          <Peak key={i} x={p.x} h={p.h} w={p.w} base={base} />
        ))}
      </g>
      {rows.map((r, i) => (
        <g key={i}>
          {i === 1 && (
            <g>
              {/* The cliff, its strata, grass and trees on top, and the falls with their mist. */}
              <path
                d={`M${cl - 30 * k} ${foot} Q${cl - 10 * k} ${top + 60 * k} ${cl + 10 * k} ${top + 14 * k} Q${cl + 20 * k} ${top} ${cl + 60 * k} ${top - 4 * k} L${cr - 50 * k} ${top - 8 * k} Q${cr - 10 * k} ${top - 4 * k} ${cr} ${top + 20 * k} Q${cr + 20 * k} ${top + 80 * k} ${cr + 40 * k} ${foot} Z`}
                fill={`url(#${id}cliff)`}
              />
              <g
                stroke={C.cliffDark}
                strokeWidth={3 * k}
                strokeLinecap="round"
                fill="none"
                opacity={0.35}
              >
                <path d={`M${cl + 4 * k} ${top + 40 * k} q ${60 * k} ${8 * k} ${110 * k} 0`} />
                <path d={`M${cl - 6 * k} ${top + 84 * k} q ${70 * k} ${10 * k} ${130 * k} 0`} />
                <path d={`M${fx + 40 * k} ${top + 56 * k} q ${50 * k} ${6 * k} ${90 * k} 0`} />
                <path d={`M${fx + 30 * k} ${top + 104 * k} q ${60 * k} ${8 * k} ${110 * k} 0`} />
              </g>
              <path
                d={`M${cl + 10 * k} ${top + 14 * k} Q${cl + 20 * k} ${top - 4 * k} ${cl + 60 * k} ${top - 8 * k} L${cr - 50 * k} ${top - 12 * k} Q${cr - 6 * k} ${top - 8 * k} ${cr + 2 * k} ${top + 16 * k} Q${cr - 30 * k} ${top + 2 * k} ${fx} ${top + 6 * k} Q${cl + 30 * k} ${top + 4 * k} ${cl + 10 * k} ${top + 14 * k} Z`}
                fill={C.rows[2]}
              />
              <LeafCluster x={cl + 50 * k} y={top - 14 * k} r={18 * k} c={BUSH} seed={seed * 61} />
              <LeafCluster x={cr - 40 * k} y={top - 18 * k} r={22 * k} c={BUSH} seed={seed * 62} />
              <LeafCluster x={cr - 70 * k} y={top - 12 * k} r={14 * k} c={BUSH} seed={seed * 63} />
              <path
                d={`M${fx - 16 * k} ${top - 2 * k} L${fx + 18 * k} ${top - 2 * k} L${fx + 26 * k} ${foot} L${fx - 26 * k} ${foot} Z`}
                fill={`url(#${id}fall)`}
              />
              <g stroke="#ffffff" strokeLinecap="round" opacity={0.75}>
                {[-9, -1, 8, 14].map((dx, j) => (
                  <path
                    key={j}
                    d={`M${fx + dx * k} ${top + (6 + j * 7) * k} L${fx + dx * 1.35 * k} ${foot - (8 + j * 6) * k}`}
                    strokeWidth={(j % 2 ? 1.6 : 2.6) * k}
                  />
                ))}
              </g>
              <path
                d={`M${fx - 4 * k} ${top + 16 * k} L${fx - 6 * k} ${foot - 16 * k} M${fx + 4 * k} ${top + 30 * k} L${fx + 6 * k} ${foot - 30 * k}`}
                stroke={mix(C.fall, C.water, 0.45)}
                strokeWidth={1.6 * k}
                opacity={0.6}
              />
              <ellipse cx={fx + 1 * k} cy={top - 1 * k} rx={20 * k} ry={5 * k} fill="#ffffff" />
              <g fill="#ffffff">
                {[-48, -26, -6, 16, 38, 56].map((dx, j) => (
                  <circle
                    key={j}
                    cx={fx + dx * k}
                    cy={foot - (6 + (j % 2) * 6) * k}
                    r={(16 + (j % 3) * 6) * k}
                    opacity={0.45}
                  />
                ))}
              </g>
              {/* A rainbow in the spray. */}
              <g fill="none" opacity={0.32}>
                {RAINBOW.map((color, j) => {
                  const r = (78 - j * 3.6) * k;
                  const cx = fx + 22 * k;
                  const cy = foot + 12 * k;
                  return (
                    <path
                      key={color}
                      d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                      stroke={color}
                      strokeWidth={3.8 * k}
                    />
                  );
                })}
              </g>
            </g>
          )}
          {/* Trees along each row's crest; the hill in front of them hides their feet. */}
          <g fill={shade(C.rows[i]!, 0.12)}>
            {r.trees.map((t, j) =>
              t.tall ? (
                <ellipse key={j} cx={t.x} cy={t.y - t.h * 0.6} rx={t.h * 0.22} ry={t.h * 0.62} />
              ) : (
                <g key={j}>
                  <circle cx={t.x} cy={t.y - t.h * 0.55} r={t.h * 0.38} />
                  <circle cx={t.x - t.h * 0.3} cy={t.y - t.h * 0.3} r={t.h * 0.28} />
                  <circle cx={t.x + t.h * 0.3} cy={t.y - t.h * 0.32} r={t.h * 0.3} />
                </g>
              ),
            )}
          </g>
          <g fill={tint(C.rows[i]!, 0.3)} opacity={0.7}>
            {r.trees.map((t, j) => (
              <circle
                key={j}
                cx={t.x + t.h * (t.tall ? 0.06 : 0.14)}
                cy={t.y - t.h * (t.tall ? 0.95 : 0.72)}
                r={t.h * (t.tall ? 0.1 : 0.16)}
              />
            ))}
          </g>
          <path d={r.d} fill={`url(#${id}row${i})`} />
          {i < 2 && (
            <rect x={0} y={r.y - 24 * k} width={W} height={56 * k} fill={`url(#${id}fog)`} />
          )}
        </g>
      ))}
    </g>
  );
}

/** A weeping willow at (x, y), `h` tall: a leafy crown with strands hanging down to the water. */
function Willow({ x, y, h, seed }: { x: number; y: number; h: number; seed: number }) {
  const strands = useMemo(() => {
    const rng = createRng(seed);
    return Array.from({ length: 11 }, (_, i) => {
      const f = i / 10;
      const sx = (f - 0.5) * h * 0.66;
      const sy = -h * (0.6 + 0.14 * Math.sin(f * Math.PI));
      const len = h * (0.36 + rng.next() * 0.2);
      const bend = (f - 0.5) * h * 0.18;
      return { sx, sy, len, bend, lit: f > 0.55 };
    });
  }, [h, seed]);
  const leaf = h / 110;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={`M${-h * 0.06} 0 Q${-h * 0.03} ${-h * 0.3} ${-h * 0.045} ${-h * 0.6} L${h * 0.045} ${-h * 0.6} Q${h * 0.03} ${-h * 0.3} ${h * 0.07} 0 Z`}
        fill="#6a4a34"
      />
      <path
        d={`M${h * 0.03} ${-h * 0.55} Q${h * 0.02} ${-h * 0.3} ${h * 0.05} ${-h * 0.02}`}
        stroke="#a37a52"
        strokeWidth={h * 0.012}
        fill="none"
      />
      <LeafCluster x={-h * 0.2} y={-h * 0.62} r={h * 0.2} c={WILLOW} seed={seed + 1} />
      <LeafCluster x={h * 0.21} y={-h * 0.64} r={h * 0.21} c={WILLOW} seed={seed + 2} />
      <LeafCluster x={0} y={-h * 0.76} r={h * 0.26} c={WILLOW} seed={seed + 3} />
      {strands.map((s, i) => {
        const end: Pt = [s.sx + s.bend * 1.4, s.sy + s.len];
        const mid: Pt = [s.sx + s.bend, s.sy + s.len * 0.5];
        return (
          <g key={i}>
            <path
              d={`M${s.sx} ${s.sy} Q${pt(mid)} ${pt(end)}`}
              stroke={WILLOW.dark}
              strokeWidth={h * 0.022}
              fill="none"
              strokeLinecap="round"
            />
            {[0.2, 0.35, 0.5, 0.65, 0.8, 0.95].map((u, j) => {
              const [lx, ly] = qAt([s.sx, s.sy], mid, end, u);
              return (
                <path
                  key={j}
                  d={LEAF}
                  transform={`translate(${lx} ${ly}) rotate(${j % 2 ? 62 : 118}) scale(${leaf})`}
                  fill={s.lit && j % 2 ? WILLOW.light : WILLOW.base}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

/** Reeds and cattails rising from (x, y). */
function Cattails({ x, y, s, flip = 1 }: { x: number; y: number; s: number; flip?: 1 | -1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`}>
      {[
        [-6, -34, -16],
        [-2, -46, -4],
        [3, -40, 10],
        [7, -28, 18],
      ].map(([bx, h, lean], i) => (
        <path
          key={i}
          d={`M${bx! - 2} 0 Q${bx! + lean! * 0.2} ${h! * 0.6} ${bx! + lean!} ${h} Q${bx! + lean! * 0.3 + 2} ${h! * 0.5} ${bx! + 2} 0 Z`}
          fill={i % 2 ? C.reed : mix(C.reed, C.reedLight, 0.4)}
        />
      ))}
      {[
        [-1, -52],
        [5, -44],
      ].map(([cx, h], i) => (
        <g key={i}>
          <path
            d={`M${cx} 0 Q${cx! + 1} ${h! * 0.5} ${cx} ${h! - 4}`}
            stroke={C.reed}
            strokeWidth={1.6}
          />
          <rect x={cx! - 2.6} y={h! + 6} width={5.2} height={14} rx={2.6} fill={C.cattail} />
          <rect
            x={cx! + 0.2}
            y={h! + 8}
            width={1.6}
            height={9}
            rx={0.8}
            fill={tint(C.cattail, 0.4)}
          />
          <path d={`M${cx} ${h! + 6} V${h! - 4}`} stroke={C.reed} strokeWidth={1.2} />
        </g>
      ))}
    </g>
  );
}

/** Lily pads floating at (x, y), each with a notch; one may carry a pink water lily. */
function LilyPads({ x, y, s, bloom }: { x: number; y: number; s: number; bloom: boolean }) {
  const pads = [
    [0, 0, 16, 0.3],
    [24, 4, 12, 2.6],
    [-20, 5, 10, 4.2],
  ] as const;
  const pad = (px: number, py: number, r: number, a: number) => {
    const ry = r * 0.38;
    const [x1, y1] = [px + r * Math.cos(a - 0.28), py + ry * Math.sin(a - 0.28)];
    const [x2, y2] = [px + r * Math.cos(a + 0.28), py + ry * Math.sin(a + 0.28)];
    return `M${px} ${py} L${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${ry} 0 1 0 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {pads.map(([px, py, r, a], i) => (
        <g key={i}>
          <ellipse cx={px} cy={py + 1.5} rx={r * 1.02} ry={r * 0.4} fill={shade(C.water, 0.3)} />
          <path d={pad(px, py, r, a)} fill={C.lily} />
          <ellipse
            cx={px + r * 0.25}
            cy={py - r * 0.1}
            rx={r * 0.45}
            ry={r * 0.14}
            fill={C.lilyLight}
            opacity={0.8}
          />
        </g>
      ))}
      {bloom && (
        <g transform="translate(2 -3)">
          {[-60, -30, 0, 30, 60].map((a) => (
            <ellipse
              key={a}
              cx={0}
              cy={-6}
              rx={3}
              ry={7}
              transform={`rotate(${a} 0 0)`}
              fill={a === 0 ? tint(C.lilyFlower, 0.4) : C.lilyFlower}
            />
          ))}
          <circle cx={0} cy={-2} r={2.6} fill="#ffd23f" />
        </g>
      )}
    </g>
  );
}

/** A mother duck paddling upstream with her ducklings behind her, a V of ripples behind each. */
function Ducks({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {(
        [
          [0, 1, true],
          [34, 0.55, false],
          [56, 0.55, false],
          [77, 0.5, false],
        ] as const
      ).map(([dx, ds, mother], i) => {
        const body = mother ? '#f7f2e8' : C.duck;
        const dark = mother ? '#cfc6b6' : '#e0a62c';
        return (
          <g key={i} transform={`translate(${dx} ${i % 2 ? 1 : 0}) scale(${ds})`}>
            <path
              d="M12 2 L38 -3 M12 2 L38 7"
              stroke={C.foam}
              strokeWidth={2.4}
              strokeLinecap="round"
              opacity={0.7}
            />
            <ellipse cx={1} cy={3} rx={17} ry={3} fill={shade(C.water, 0.25)} opacity={0.6} />
            <path d="M12 -6 L21 -12 L17 -1 Z" fill={body} />
            <path d="M-15 -2 Q-14 -12 1 -12 Q15 -11 17 -2 Q16 2 1 2 Q-14 2 -15 -2 Z" fill={body} />
            <path d="M-15 -2 Q-6 3 1 2 Q14 2 17 -2 Q8 -4 -15 -2 Z" fill={dark} />
            <ellipse cx={4} cy={-5} rx={7} ry={3} fill={dark} opacity={0.7} />
            <circle cx={-11} cy={-15} r={6.5} fill={body} />
            <path d="M-17 -15.5 L-24 -13 L-17 -12 Z" fill="#ff9a2e" />
            <circle cx={-12.6} cy={-16.6} r={1.2} fill="#2a2030" />
            <circle cx={-9} cy={-18} r={2} fill="#ffffff" opacity={0.7} />
          </g>
        );
      })}
    </g>
  );
}

/**
 * The river: turquoise water lightening toward the far bank, a grassy far bank with willows,
 * bushes and cattails (and their reflections), rocks with foam around them, lily pads, a family
 * of ducks, ripples and sparkles of sun.
 */
export function RiverMid({ horizon, groundTop, height, k, seed }: P) {
  const id = useId();
  const top = horizon + (groundTop - horizon) * 0.35;
  const deep = groundTop - top;
  const willows = useSpots(seed * 51, 2, 180);
  const bushes = useSpots(seed * 53, 5, 60);
  const reeds = useSpots(seed * 43, 9, 40);
  const rocks = useSpots(seed * 41, 3, 140);
  const lilies = useSpots(seed * 57, 3, 120);
  const ducks = useSpots(seed * 59, 1, 300)[0]!;
  const glints = useSpots(seed * 47, 7, 40);
  const ripples = useMemo(() => {
    const rng = createRng(seed * 49);
    return Array.from({ length: 16 }, () => ({
      x: rng.int(30, W - 110),
      y: top + 8 * k + (deep - 6 * k) * rng.next(),
      w: rng.int(26, 70) * k,
    }));
  }, [seed, top, deep, k]);
  const bank = `M0 ${top - 6 * k} Q160 ${top - 12 * k} 320 ${top - 6 * k} T640 ${top - 6 * k} T960 ${top - 6 * k} T${W} ${top - 6 * k} V${top + 4 * k} H0 Z`;
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}water`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={top}
          x2="0"
          y2={groundTop}
        >
          <stop offset="0" stopColor={C.waterLight} />
          <stop offset="0.45" stopColor={C.water} />
          <stop offset="1" stopColor={C.waterDeep} />
        </linearGradient>
        <linearGradient id={`${id}bank`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.groundTop} />
          <stop offset="1" stopColor={C.grass} />
        </linearGradient>
      </defs>
      <rect x={0} y={top - 2} width={W} height={height - top + 2} fill={`url(#${id}water)`} />
      {/* The sky's reflection in long light streaks, then the bank's reflection. */}
      <g fill="#ffffff" opacity={0.28}>
        {ripples.slice(0, 7).map((r, i) => (
          <ellipse key={i} cx={r.x + 40 * k} cy={r.y} rx={r.w * 2.4} ry={1.6 * k} />
        ))}
      </g>
      <path
        d={`M0 ${top + 2 * k} H${W} V${top + 9 * k} Q960 ${top + 14 * k} 640 ${top + 9 * k} T0 ${top + 9 * k} Z`}
        fill={C.grass}
        opacity={0.35}
      />
      {willows.map((w, i) => (
        <g key={i} fill={WILLOW.dark} opacity={0.3}>
          <ellipse cx={w.x} cy={top + 12 * k} rx={60 * k} ry={10 * k} />
          {[-40, -20, 0, 20, 40].map((dx) => (
            <rect
              key={dx}
              x={w.x + dx * k - 3 * k}
              y={top + 8 * k}
              width={6 * k}
              height={(16 + Math.abs(dx) * 0.2) * k}
              rx={3 * k}
            />
          ))}
        </g>
      ))}
      <path d={bank} fill={`url(#${id}bank)`} />
      <path d={`M0 ${top + 2 * k} H${W}`} stroke={mix(C.grass, C.water, 0.5)} strokeWidth={3 * k} />
      {bushes.map((b, i) => (
        <LeafCluster
          key={i}
          x={b.x}
          y={top - 10 * k}
          r={(12 + b.r * 10) * k}
          c={BUSH}
          seed={seed * 70 + i}
        />
      ))}
      {willows.map((w, i) => (
        <Willow key={i} x={w.x} y={top - 2 * k} h={(110 + w.r * 30) * k} seed={seed * 80 + i * 7} />
      ))}
      {reeds.map((r, i) => (
        <Cattails
          key={i}
          x={r.x}
          y={top + (2 + r.r * 4) * k}
          s={(0.55 + r.r2 * 0.3) * k}
          flip={i % 2 ? 1 : -1}
        />
      ))}
      {rocks.map((r, i) => {
        const y = top + deep * (0.4 + r.r * 0.4);
        const s = (0.6 + r.r2 * 0.4) * k;
        return (
          <g key={i}>
            <MossRock x={r.x} y={y} s={s} rock={C.rock} moss={C.moss} seed={seed * 90 + i} />
            <ellipse
              cx={r.x + 2 * s}
              cy={y + 1}
              rx={40 * s}
              ry={5 * s}
              fill="none"
              stroke={C.foam}
              strokeWidth={3 * s}
              opacity={0.8}
            />
            <path
              d={`M${r.x + 40 * s} ${y - 1} h${30 * s} M${r.x + 34 * s} ${y + 5 * s} h${22 * s}`}
              stroke={C.foam}
              strokeWidth={2.4 * s}
              strokeLinecap="round"
              opacity={0.7}
            />
          </g>
        );
      })}
      {lilies.map((l, i) => (
        <LilyPads
          key={i}
          x={l.x}
          y={top + deep * (0.3 + l.r * 0.35)}
          s={(0.8 + l.r2 * 0.3) * k}
          bloom={i !== 1}
        />
      ))}
      <Ducks x={ducks.x} y={top + deep * 0.62} s={k} />
      <g stroke={C.foam} strokeWidth={2.6 * k} strokeLinecap="round" opacity={0.6}>
        {ripples.map((r, i) => (
          <path key={i} d={`M${r.x} ${r.y} h${r.w}`} />
        ))}
      </g>
      {glints.map((g, i) => (
        <Glint
          key={i}
          x={g.x}
          y={top + deep * (0.2 + g.r * 0.7)}
          r={(4 + g.r2 * 4) * k}
          color="#ffffff"
        />
      ))}
    </g>
  );
}

/** Three-leaf clovers in a little patch at (x, y). */
function Clover({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[
        [0, 0],
        [9, 3],
        [-8, 4],
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <path d="M0 0 V-6" stroke={C.grass} strokeWidth={1.4} />
          {[-90, 30, 150].map((a) => (
            <circle
              key={a}
              cx={2.6 * Math.cos((a * Math.PI) / 180)}
              cy={-7 + 2.6 * Math.sin((a * Math.PI) / 180)}
              r={2.6}
              fill={a === -90 ? C.grassLight : mix(C.grass, C.grassLight, 0.45)}
            />
          ))}
        </g>
      ))}
    </g>
  );
}

/** A butterfly resting with its wings open at (x, y). */
function Butterfly({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={-5} cy={-4} rx={5} ry={6} transform="rotate(-25 -5 -4)" fill={color} />
      <ellipse cx={5} cy={-4} rx={5} ry={6} transform="rotate(25 5 -4)" fill={tint(color, 0.3)} />
      <ellipse cx={-4} cy={3} rx={3.4} ry={4} fill={shade(color, 0.15)} />
      <ellipse cx={4} cy={3} rx={3.4} ry={4} fill={color} />
      <path d="M0 -6 V6" stroke="#3a2a30" strokeWidth={1.6} strokeLinecap="round" />
      <path
        d="M0 -6 q-2 -4 -4 -5 M0 -6 q2 -4 4 -5"
        stroke="#3a2a30"
        strokeWidth={0.8}
        fill="none"
      />
    </g>
  );
}

/** The near bank: a sandy shore where the water laps, sunny grass, the path, flowers and reeds. */
export function RiverNear({ groundTop, height, pathY, k, seed }: P) {
  const id = useId();
  const g = groundTop;
  const sand = g + 14 * k;
  const bits = useMemo(() => {
    const rng = createRng(seed * 307);
    const rows = Math.max(2, Math.round((height - sand) / (34 * k)));
    const out: { x: number; y: number; kind: number; s: number; seed: number; row: number }[] = [];
    for (let r = 0; r < rows; r++) {
      const y = sand + 10 * k + ((height - sand - 14 * k) * (r + 0.5)) / rows;
      for (let x = 30 + rng.next() * 60; x < W - 30; x += (50 + rng.next() * 70) * k) {
        const yy = y + (rng.next() - 0.5) * 14 * k;
        // Keep the path clear.
        if (pathY !== undefined && Math.abs(yy - pathY) < 24 * k) continue;
        out.push({
          x,
          y: yy,
          kind: rng.next(),
          s: (0.75 + rng.next() * 0.5) * k,
          seed: rng.int(1, 1e6),
          row: r,
        });
      }
    }
    return out;
  }, [seed, sand, height, pathY, k]);
  const shoreStones = useSpots(seed * 311, 9, 50);
  const edgeTufts = useSpots(seed * 313, 16, 30);
  const patches = useSpots(seed * 331, 6, 60);
  const stones = useSpots(seed * 341, 14, 20);
  const flies = useSpots(seed * 347, 2, 200);
  const lap = (y: number, amp: number) =>
    `M0 ${y} ${Array.from({ length: 16 }, (_, i) => `Q${i * 80 + 40} ${y - amp} ${(i + 1) * 80} ${y}`).join(' ')}`;
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}sand`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={g - 6 * k}
          x2="0"
          y2={sand + 2 * k}
        >
          <stop offset="0" stopColor={mix(C.sand, C.waterDeep, 0.3)} />
          <stop offset="0.45" stopColor={C.sand} />
          <stop offset="1" stopColor={C.sandLight} />
        </linearGradient>
        <linearGradient
          id={`${id}g`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={sand}
          x2="0"
          y2={height}
        >
          <stop offset="0" stopColor={C.groundTop} />
          <stop offset={Math.min(1, (40 * k) / Math.max(1, height - sand))} stopColor={C.ground} />
          <stop offset="1" stopColor={C.groundDark} />
        </linearGradient>
        <linearGradient id={`${id}path`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.pathLight} />
          <stop offset="0.5" stopColor={C.path} />
          <stop offset="1" stopColor={shade(C.path, 0.22)} />
        </linearGradient>
        <radialGradient id={`${id}sun`}>
          <stop offset="0" stopColor="#fff6c8" stopOpacity={0.4} />
          <stop offset="1" stopColor="#fff6c8" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}shadow`}>
          <stop offset="0" stopColor={C.groundDark} stopOpacity={0.35} />
          <stop offset="1" stopColor={C.groundDark} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* The shore: wet sand at the waterline, drying paler up the beach. */}
      <path
        d={`M0 ${g} Q 320 ${g - 8 * k} 640 ${g} T ${W} ${g} V ${height} H 0 Z`}
        fill={`url(#${id}sand)`}
      />
      <path
        d={lap(g - 2 * k, 3 * k)}
        stroke={C.foam}
        strokeWidth={2.6 * k}
        fill="none"
        opacity={0.85}
      />
      <path
        d={lap(g - 6 * k, 2 * k)}
        stroke={C.foam}
        strokeWidth={1.6 * k}
        fill="none"
        opacity={0.5}
      />
      {shoreStones.map((s, i) => (
        <Pebbles
          key={i}
          x={s.x}
          y={g + (5 + s.r * 5) * k}
          s={(0.5 + s.r2 * 0.4) * k}
          seed={seed * 320 + i}
          stone={C.rock}
          count={4}
        />
      ))}
      <path
        d={`M0 ${sand} Q 160 ${sand + 5 * k} 320 ${sand} T 640 ${sand} T 960 ${sand} T ${W} ${sand} V ${height} H 0 Z`}
        fill={`url(#${id}g)`}
      />
      <path
        d={`M0 ${sand} Q 160 ${sand + 5 * k} 320 ${sand} T 640 ${sand} T 960 ${sand} T ${W} ${sand}`}
        stroke={tint(C.groundTop, 0.3)}
        strokeWidth={3 * k}
        fill="none"
      />
      {edgeTufts.map((t, i) => (
        <GrassClump
          key={i}
          x={t.x}
          y={sand + 3 * k}
          s={(0.5 + t.r * 0.3) * k}
          dark={C.grass}
          light={C.grassLight}
          seed={seed * 360 + i}
          blades={6}
        />
      ))}
      {patches.map((d, i) => (
        <ellipse
          key={i}
          cx={d.x}
          cy={sand + (height - sand) * (0.2 + d.r * 0.7)}
          rx={(70 + d.r2 * 50) * k}
          ry={(14 + d.r2 * 8) * k}
          fill={`url(#${id}${i % 3 === 0 ? 'shadow' : 'sun'})`}
        />
      ))}
      {pathY !== undefined && (
        <g>
          <path d={`M0 ${pathY - 15 * k} H${W} V${pathY + 15 * k} H0 Z`} fill={`url(#${id}path)`} />
          <path
            d={`M0 ${pathY - 4 * k} H${W} M0 ${pathY + 6 * k} H${W}`}
            stroke={shade(C.path, 0.12)}
            strokeWidth={2 * k}
            opacity={0.45}
          />
          <path
            d={`M0 ${pathY + 13 * k} H${W} V${pathY + 17 * k} H0 Z`}
            fill={C.pathEdge}
            opacity={0.5}
          />
          {stones.map((st, i) => (
            <g key={i}>
              <ellipse
                cx={st.x}
                cy={pathY + (st.r - 0.5) * 18 * k}
                rx={(3 + st.r2 * 5) * k}
                ry={(2 + st.r2 * 2.5) * k}
                fill={C.pathEdge}
              />
              <ellipse
                cx={st.x - 1 * k}
                cy={pathY + (st.r - 0.5) * 18 * k - 1.2 * k}
                rx={(1.6 + st.r2 * 2.5) * k}
                ry={(1 + st.r2) * k}
                fill={C.pathLight}
              />
            </g>
          ))}
          {stones.map((st, i) => (
            <GrassClump
              key={`e${i}`}
              x={st.x + 20 * k}
              y={pathY + (i % 2 ? 17 : -13) * k}
              s={0.55 * k}
              dark={C.grass}
              light={C.grassLight}
              seed={seed * 700 + i}
              blades={5}
            />
          ))}
        </g>
      )}
      {bits.map((b, i) =>
        b.kind < 0.42 ? (
          <GrassClump
            key={i}
            x={b.x}
            y={b.y}
            s={b.s}
            dark={C.grass}
            light={C.grassLight}
            seed={b.seed}
          />
        ) : b.kind < 0.6 ? (
          <g key={i}>
            <Flower x={b.x} y={b.y} s={b.s} color={C.flowers[i % 4]!} />
            <Flower
              x={b.x + 9 * b.s}
              y={b.y + 3 * b.s}
              s={b.s * 0.8}
              color={C.flowers[(i + 1) % 4]!}
            />
          </g>
        ) : b.kind < 0.72 ? (
          <Clover key={i} x={b.x} y={b.y} s={b.s} />
        ) : b.kind < 0.82 ? (
          b.row === 0 ? (
            <Cattails key={i} x={b.x} y={b.y} s={b.s * 0.9} flip={i % 2 ? 1 : -1} />
          ) : (
            <GrassClump
              key={i}
              x={b.x}
              y={b.y}
              s={b.s}
              dark={C.grass}
              light={C.grassLight}
              seed={b.seed}
            />
          )
        ) : b.kind < 0.92 ? (
          <Pebbles key={i} x={b.x} y={b.y} s={b.s * 0.8} seed={b.seed} stone={C.rock} count={4} />
        ) : (
          <MossRock
            key={i}
            x={b.x}
            y={b.y}
            s={b.s * 0.55}
            rock={C.rock}
            moss={C.moss}
            seed={b.seed}
          />
        ),
      )}
      {flies.map((f, i) => (
        <Butterfly
          key={i}
          x={f.x}
          y={sand + (height - sand) * (0.18 + f.r * 0.3)}
          s={k}
          color={BUTTERFLIES[i % 3]!}
        />
      ))}
    </g>
  );
}

/**
 * Tall reeds and cattails right in front of the camera at the bottom corners, in shadow with lit
 * edges. They slide past faster than the ground (a quicker parallax), which makes the scene deep.
 */
export function RiverFront({ height, k }: P) {
  const blade = (x: number, h: number, lean: number, w: number, fill: string, edge: string) => (
    <g>
      <path
        d={`M${x - w} 0 Q${x + lean * 0.25} ${-h * 0.6} ${x + lean} ${-h} Q${x + lean * 0.35 + w} ${-h * 0.5} ${x + w} 0 Z`}
        fill={fill}
      />
      <path
        d={`M${x + w * 0.6} 0 Q${x + lean * 0.35 + w * 0.8} ${-h * 0.5} ${x + lean} ${-h}`}
        stroke={edge}
        strokeWidth={2.4}
        fill="none"
        opacity={0.7}
      />
    </g>
  );
  return (
    <g>
      {[
        { x: 50, s: 0.8, flip: 1 },
        { x: 1215, s: 0.66, flip: -1 },
      ].map((c, i) => (
        <g
          key={i}
          transform={`translate(${c.x} ${height + 8}) scale(${c.s * c.flip * k} ${c.s * k})`}
        >
          {blade(-40, 170, -60, 9, '#0d2e1e', '#22573a')}
          {blade(-20, 220, -24, 10, '#0f3322', '#2a6442')}
          {blade(10, 200, 30, 9, '#0c2b1c', '#22573a')}
          {blade(34, 150, 70, 8, '#0f3322', '#2a6442')}
          {blade(-6, 120, 50, 7, '#0b2819', '#1f4f34')}
          {[
            [-10, 206],
            [16, 178],
          ].map(([cx, h], j) => (
            <g key={j}>
              <path
                d={`M${cx} 0 Q${cx! + 6} ${-h! * 0.5} ${cx! + 4} ${-h!}`}
                stroke="#0f3322"
                strokeWidth={4}
                fill="none"
              />
              <rect
                x={cx! - 4}
                y={-h! - 6}
                width={16}
                height={46}
                rx={8}
                transform={`rotate(4 ${cx} ${-h!})`}
                fill="#2a170e"
              />
              <path
                d={`M${cx! + 8} ${-h! + 2} V${-h! + 30}`}
                stroke="#5a3a24"
                strokeWidth={3}
                strokeLinecap="round"
                transform={`rotate(4 ${cx} ${-h!})`}
              />
              <path
                d={`M${cx! + 5} ${-h! - 6} V${-h! - 30}`}
                stroke="#0f3322"
                strokeWidth={2.4}
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}
