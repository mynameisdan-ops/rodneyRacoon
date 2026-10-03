import { useId, useMemo } from 'react';
import { createRng } from '../../game/rng';
import { mix, shade, tint } from '../style';
import { PAINTED_MINE } from './minePalette';
import { Glint, MossRock, Pebbles } from './paintKit';
import { ridgePath, useSpots, W, type LayerProps } from './sceneryKit';
import type { MineTheme } from './themes';

/*
 * The Old Mine Shaft backdrop layers, painted (M7b). A deep cavern glowing amber far away, a rock
 * ceiling whose undersides catch the lantern light, a shaft of daylight through a crack, timber
 * supports with hanging lanterns that throw warm pools of light, glowing crystals, mining odds
 * and ends, and a gravel floor with the rails. As in the forest, nothing here has an outline:
 * only the hero and the props he touches are lined. The layers are drawn once as images in scenes
 * and on the page strip, so the detail costs nothing per frame. Each layer is a 1280px tile:
 * anything at a tile's edge is drawn the same at both ends.
 */

type P = LayerProps<MineTheme>;

const C = PAINTED_MINE;

/** How far the rock ceiling hangs down. */
const ceilingDepth = (horizon: number) => Math.max(20, horizon * 0.33);

/** Soft round lights that fade to nothing: lantern light, a hot core, and each crystal's glow. */
function GlowDefs({ id }: { id: string }) {
  const stops = (color: string, peak: number) => [
    <stop key="a" offset="0" stopColor={color} stopOpacity={peak} />,
    <stop key="b" offset="0.42" stopColor={color} stopOpacity={peak * 0.36} />,
    <stop key="c" offset="1" stopColor={color} stopOpacity={0} />,
  ];
  return (
    <>
      <radialGradient id={`${id}warm`}>{stops(C.glow, 0.5)}</radialGradient>
      <radialGradient id={`${id}hot`}>{stops('#fff4c8', 0.95)}</radialGradient>
      <radialGradient id={`${id}day`}>{stops(C.daylight, 0.9)}</radialGradient>
      {C.crystals.map((c, i) => (
        <radialGradient key={c} id={`${id}c${i}`}>
          {stops(c, 0.55)}
        </radialGradient>
      ))}
    </>
  );
}

/** Seamless rows: the spots, plus the same piece at both ends of the tile. */
const withEnds = <T extends { x: number; r: number; r2: number }>(spots: T[]) => [
  ...spots.map((s) => ({ ...s, end: false })),
  { x: 0, r: 0.5, r2: 0.5, end: true },
  { x: W, r: 0.5, r2: 0.5, end: true },
];

/**
 * The rock ceiling overhead (in the slow "clouds" slot): rounded lumps whose undersides glow with
 * lantern light, stalactites with a lit side and a drip, and a crack letting a shaft of daylight
 * down into the cave, with roots hanging from it and dust drifting in the light.
 */
export function MineCeiling({ horizon, height, k, seed }: P) {
  const id = useId();
  const depth = ceilingDepth(horizon);
  const back = useSpots(seed * 13, 12, 0);
  const front = useSpots(seed * 17, 10, 0);
  const drips = useSpots(seed * 19, 11, 50);
  const shafts = useSpots(seed * 29, 2, 260);
  // Stalactites stop short of the far rock, which is drawn in front of the ceiling.
  const maxDrip = Math.max(8, horizon * 0.25);
  return (
    <g>
      <defs>
        <GlowDefs id={id} />
        <linearGradient id={`${id}shaft`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.daylight} stopOpacity={0.5} />
          <stop offset="0.55" stopColor={C.daylight} stopOpacity={0.14} />
          <stop offset="1" stopColor={C.daylight} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}rock`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.ceilingDark} />
          <stop offset="1" stopColor={C.ceiling} />
        </linearGradient>
      </defs>
      {/* Daylight falling through the crack, behind the rock it comes through. */}
      {shafts.map((s, i) => {
        const w0 = (22 + s.r * 18) * k;
        const top = depth * 0.5;
        const lean = (90 + s.r2 * 70) * k;
        const spread = (110 + s.r * 70) * k;
        const motes = Array.from({ length: 7 }, (_, j) => {
          const f = 0.12 + (j / 7) * 0.8;
          const wob = Math.sin(j * 2.3 + s.r * 9);
          return {
            x: s.x + lean * f + w0 * 0.5 + (spread * f * (0.5 + 0.4 * wob)) / 2,
            y: top + (height - top) * f * 0.85,
            r: (1.4 + (j % 3) * 0.7) * k,
          };
        });
        return (
          <g key={i}>
            <path
              d={`M${s.x} ${top} L${s.x + w0} ${top} L${s.x + w0 + lean + spread} ${height} L${s.x + lean} ${height} Z`}
              fill={`url(#${id}shaft)`}
            />
            <g fill={C.daylight}>
              {motes.map((m, j) => (
                <circle key={j} cx={m.x} cy={m.y} r={m.r} opacity={0.75 - j * 0.07} />
              ))}
            </g>
          </g>
        );
      })}
      <rect x={0} y={0} width={W} height={depth * 0.66} fill={C.ceilingDark} />
      {withEnds(back).map((b, i) => (
        <ellipse
          key={`b${i}`}
          cx={b.x}
          cy={depth * (0.62 + b.r * 0.16)}
          rx={(58 + b.r2 * 40) * k}
          ry={(20 + b.r * 12) * k}
          fill={mix(C.ceilingDark, C.ceiling, 0.6)}
        />
      ))}
      {withEnds(front).map((b, i) => {
        const cx = b.x;
        const cy = depth * (0.8 + b.r * 0.18);
        const rx = (46 + b.r2 * 34) * k;
        const ry = (18 + b.r * 11) * k;
        return (
          <g key={`f${i}`}>
            {/* The lit underside shows as a rim below the lump. */}
            <ellipse cx={cx + 3 * k} cy={cy + 3 * k} rx={rx} ry={ry} fill={C.ceilingLit} />
            <ellipse cx={cx} cy={cy} rx={rx * 0.98} ry={ry * 0.94} fill={`url(#${id}rock)`} />
            <path
              d={`M${cx - rx * 0.55} ${cy - ry * 0.35} Q${cx - rx * 0.1} ${cy - ry * 0.72} ${cx + rx * 0.4} ${cy - ry * 0.5}`}
              stroke={shade(C.ceilingDark, 0.2)}
              strokeWidth={2 * k}
              fill="none"
              opacity={0.6}
            />
          </g>
        );
      })}
      {drips.map((d, i) => {
        const len = Math.min(maxDrip, (22 + d.r * 64) * k);
        const w = (7 + d.r2 * 9) * k;
        const y = depth * (0.9 + d.r2 * 0.12);
        const x = d.x;
        return (
          <g key={`d${i}`}>
            <path
              d={`M${x - w} ${y} Q${x - w * 0.35} ${y + len * 0.55} ${x} ${y + len} Q${x + w * 0.4} ${y + len * 0.5} ${x + w} ${y} Z`}
              fill={C.ceiling}
            />
            <path
              d={`M${x + w * 0.1} ${y} Q${x + w * 0.35} ${y + len * 0.5} ${x} ${y + len} Q${x + w * 0.62} ${y + len * 0.42} ${x + w} ${y} Z`}
              fill={C.ceilingLit}
              opacity={0.85}
            />
            {/* A smaller one beside the big ones. */}
            {d.r > 0.55 && (
              <path
                d={`M${x + w * 0.9} ${y} Q${x + w * 1.15} ${y + len * 0.3} ${x + w * 1.3} ${y + len * 0.45} Q${x + w * 1.5} ${y + len * 0.25} ${x + w * 1.8} ${y} Z`}
                fill={mix(C.ceiling, C.ceilingLit, 0.4)}
              />
            )}
            {d.r2 > 0.45 && (
              <circle cx={x} cy={y + len + 4 * k} r={2 * k} fill="#d4f0ff" opacity={0.85} />
            )}
          </g>
        );
      })}
      {/* The crack the daylight comes through, with roots hanging out of it. */}
      {shafts.map((s, i) => {
        const w0 = (22 + s.r * 18) * k;
        const cx = s.x + w0 / 2;
        const cy = depth * 0.62;
        const crack = `M${cx - w0} ${cy + 2 * k} L${cx - w0 * 0.55} ${cy - 4 * k} L${cx - w0 * 0.2} ${cy - 1 * k} L${cx + w0 * 0.15} ${cy - 7 * k} L${cx + w0 * 0.6} ${cy - 3 * k} L${cx + w0} ${cy + 1 * k} L${cx + w0 * 0.4} ${cy + 5 * k} L${cx - w0 * 0.3} ${cy + 4 * k} Z`;
        return (
          <g key={`c${i}`}>
            <ellipse cx={cx} cy={cy} rx={56 * k} ry={26 * k} fill={`url(#${id}day)`} />
            <path
              d={crack}
              fill="#d6efff"
              stroke={C.ceilingLit}
              strokeWidth={3 * k}
              strokeLinejoin="round"
            />
            <g fill="#6fa04a">
              <path
                d={`M${cx - w0 * 0.7} ${cy - 2 * k} l${-3 * k} ${-7 * k} l${5 * k} ${6 * k} Z`}
              />
              <path
                d={`M${cx + w0 * 0.5} ${cy - 3 * k} l${2 * k} ${-8 * k} l${3 * k} ${8 * k} Z`}
              />
            </g>
            <g stroke="#4a3020" strokeWidth={2 * k} fill="none" strokeLinecap="round">
              <path
                d={`M${cx - w0 * 0.6} ${cy + 2 * k} q ${6 * k} ${22 * k} ${-3 * k} ${44 * k}`}
              />
              <path
                d={`M${cx + w0 * 0.5} ${cy + 2 * k} q ${-8 * k} ${16 * k} ${2 * k} ${30 * k}`}
              />
            </g>
            <g fill="#5f8a3a">
              <ellipse cx={cx - w0 * 0.62} cy={cy + 26 * k} rx={4 * k} ry={2 * k} />
              <ellipse cx={cx + w0 * 0.46} cy={cy + 18 * k} rx={4 * k} ry={2 * k} />
            </g>
          </g>
        );
      })}
    </g>
  );
}

interface Formation {
  x: number;
  h: number;
  w: number;
  kind: number;
  r: number;
}

/** A blunt stalagmite at `x` on `base`, `h` tall and `w` across at its foot, and its lit side. */
function cone(x: number, base: number, h: number, w: number) {
  return {
    body: `M${x - w} ${base} Q${x - w * 0.62} ${base - h * 0.5} ${x - w * 0.22} ${base - h * 0.9} Q${x} ${base - h * 1.04} ${x + w * 0.24} ${base - h * 0.88} Q${x + w * 0.62} ${base - h * 0.45} ${x + w} ${base} Z`,
    rim: `M${x + w * 0.06} ${base - h * 0.98} Q${x + w * 0.5} ${base - h * 0.5} ${x + w * 0.85} ${base - h * 0.1} L${x + w} ${base} Q${x + w * 0.62} ${base - h * 0.45} ${x + w * 0.24} ${base - h * 0.88} Z`,
  };
}

/**
 * A far rock formation standing on `base`, and the lit right-hand side of it: a cluster of blunt
 * stalagmites, a broad mound, or a flat-topped mesa with a step.
 */
function formation(f: Formation, base: number, k: number, maxH: number) {
  const h = Math.min(f.h * k, maxH);
  const { x } = f;
  const w = f.w * k;
  if (f.kind < 0.35) {
    const parts = [
      cone(x - w * 0.95, base, h * 0.55, w * 0.7),
      cone(x + w, base, h * 0.72, w * 0.8),
      cone(x, base, h, w),
    ];
    return { body: parts.map((c) => c.body).join(' '), rim: parts.map((c) => c.rim).join(' ') };
  }
  if (f.kind < 0.65) {
    const m = h * 0.62;
    return {
      body: `M${x - w * 2.4} ${base} Q${x - w * 2} ${base - m * 0.55} ${x - w * 0.9} ${base - m * 0.8} Q${x - w * 0.2} ${base - m * 1.02} ${x + w * 0.6} ${base - m * 0.78} Q${x + w * 2} ${base - m * 0.5} ${x + w * 2.6} ${base} Z`,
      rim: `M${x + w * 0.2} ${base - m * 0.92} Q${x + w * 1.6} ${base - m * 0.62} ${x + w * 2.3} ${base - m * 0.12} L${x + w * 2.6} ${base} Q${x + w * 2} ${base - m * 0.5} ${x + w * 0.6} ${base - m * 0.78} Z`,
    };
  }
  const t = base - h * 0.88;
  const step = base - h * 0.6;
  return {
    body: `M${x - w * 2} ${base} L${x - w * 1.75} ${step + 6 * k} Q${x - w * 1.65} ${step} ${x - w * 1.35} ${step} L${x - w * 0.45} ${step} L${x - w * 0.32} ${t + 6 * k} Q${x - w * 0.24} ${t} ${x} ${t} L${x + w * 1.1} ${t} Q${x + w * 1.36} ${t} ${x + w * 1.42} ${t + 8 * k} L${x + w * 1.95} ${base} Z`,
    rim: `M${x + w * 1.1} ${t} Q${x + w * 1.36} ${t} ${x + w * 1.42} ${t + 8 * k} L${x + w * 1.95} ${base} L${x + w * 1.66} ${base} L${x + w * 1.18} ${t + 10 * k} Z`,
    ledge: `M${x - w * 0.2} ${t + 1.5 * k} H${x + w * 1.1} M${x - w * 1.6} ${step + 1.5 * k} H${x - w * 0.5}`,
  };
}

/**
 * The far cavern: rows of spires and mounds fading into a warm glow, with a distant trestle, a
 * winding tower, a rock arch, little lantern lights and the glow of far-off crystals.
 */
export function MineFar({ horizon, height, k, seed }: P) {
  const id = useId();
  const depth = ceilingDepth(horizon);
  const rows = useMemo(() => {
    const rng = createRng(seed * 131);
    return [0, 1, 2].map((row) => {
      const forms: Formation[] = [];
      for (let x = 40 + row * 30; x < W - 50; x += rng.int(70, 150)) {
        forms.push({
          x,
          h: rng.int(44, 130) * (1 + row * 0.2),
          w: rng.int(16, 34),
          kind: rng.next(),
          r: rng.next(),
        });
      }
      return forms;
    });
  }, [seed]);
  const lights = useSpots(seed * 137, 7, 60);
  const sparks = useSpots(seed * 139, 4, 90);
  const [trestleAt, towerAt, archAt] = useSpots(seed * 149, 3, 160);
  const rowBase = (row: number) => horizon + row * 22 * k;
  // Keep the far rock below the ceiling's stalactites (the ceiling is drawn behind this layer).
  const maxH = (row: number) => Math.max(10, rowBase(row) - depth * 1.95);
  const haze = (row: number, t: number) => mix(C.rows[row]!, C.haze, t);
  return (
    <g>
      <defs>
        <GlowDefs id={id} />
        {C.rows.map((color, row) => (
          <linearGradient key={row} id={`${id}r${row}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} />
            <stop offset="1" stopColor={C.haze} />
          </linearGradient>
        ))}
        <linearGradient id={`${id}fog`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.haze} stopOpacity={0} />
          <stop offset="0.6" stopColor={C.haze} stopOpacity={0.45} />
          <stop offset="1" stopColor={C.haze} stopOpacity={0} />
        </linearGradient>
      </defs>
      {rows.map((forms, row) => {
        const base = rowBase(row);
        const lit = tint(C.rows[row]!, 0.32);
        return (
          <g key={row}>
            <rect x={0} y={base - 6} width={W} height={height - base + 6} fill={C.rows[row]} />
            {row === 1 && archAt && (
              <Arch x={archAt.x} base={base} k={k} fill={`url(#${id}r1)`} rim={lit} />
            )}
            {forms.map((f, i) => {
              const shape = formation(f, base, k, maxH(row));
              return (
                <g key={i}>
                  <path d={shape.body} fill={`url(#${id}r${row})`} />
                  <path d={shape.rim} fill={lit} opacity={0.55} />
                  {shape.ledge && (
                    <path
                      d={shape.ledge}
                      stroke={lit}
                      strokeWidth={3 * k}
                      fill="none"
                      opacity={0.6}
                    />
                  )}
                </g>
              );
            })}
            {row === 0 && towerAt && (
              <Tower x={towerAt.x} base={base} k={k} color={haze(0, 0.15)} />
            )}
            {row === 1 && trestleAt && (
              <Trestle x={trestleAt.x} base={base} k={k} color={haze(1, 0.25)} id={id} />
            )}
            <rect x={0} y={base - 46 * k} width={W} height={76 * k} fill={`url(#${id}fog)`} />
          </g>
        );
      })}
      {/* Far-off crystals glowing at the foot of the rocks. */}
      {sparks.map((s, i) => {
        const y = rowBase(2) + 2 * k;
        const c = C.crystals[i % 3]!;
        return (
          <g key={`s${i}`}>
            <ellipse
              cx={s.x}
              cy={y - 8 * k}
              rx={36 * k}
              ry={22 * k}
              fill={`url(#${id}c${i % 3})`}
            />
            <g fill={mix(c, C.haze, 0.25)}>
              <path d={`M${s.x - 7 * k} ${y} L${s.x - 3 * k} ${y - 16 * k} L${s.x} ${y} Z`} />
              <path
                d={`M${s.x - 1 * k} ${y} L${s.x + 3 * k} ${y - 22 * k} L${s.x + 7 * k} ${y} Z`}
              />
              <path
                d={`M${s.x + 6 * k} ${y} L${s.x + 9 * k} ${y - 11 * k} L${s.x + 12 * k} ${y} Z`}
              />
            </g>
          </g>
        );
      })}
      {/* Lanterns far away. */}
      {lights.map((l, i) => {
        const y = rowBase(i % 3) - (14 + l.r * 46) * k;
        return (
          <g key={`l${i}`}>
            <circle cx={l.x} cy={y} r={20 * k} fill={`url(#${id}warm)`} />
            <circle cx={l.x} cy={y} r={2.4 * k} fill="#ffe9a8" />
          </g>
        );
      })}
    </g>
  );
}

/** A natural rock arch, far away. */
function Arch({
  x,
  base,
  k,
  fill,
  rim,
}: {
  x: number;
  base: number;
  k: number;
  fill: string;
  rim: string;
}) {
  const o = 84 * k;
  const i = 52 * k;
  const top = 128 * k;
  return (
    <g>
      <path
        d={`M${x - o} ${base} L${x - o * 0.86} ${base - top * 0.6} Q${x} ${base - top * 1.25} ${x + o * 0.86} ${base - top * 0.6} L${x + o} ${base} L${x + i} ${base} L${x + i * 0.92} ${base - top * 0.55} Q${x} ${base - top * 0.92} ${x - i * 0.92} ${base - top * 0.55} L${x - i} ${base} Z`}
        fill={fill}
      />
      <path
        d={`M${x + o * 0.2} ${base - top * 0.92} Q${x + o * 0.7} ${base - top * 0.82} ${x + o * 0.86} ${base - top * 0.6} L${x + o} ${base} L${x + o * 0.9} ${base} L${x + o * 0.78} ${base - top * 0.58} Q${x + o * 0.55} ${base - top * 0.82} ${x + o * 0.2} ${base - top * 0.92} Z`}
        fill={rim}
        opacity={0.55}
      />
    </g>
  );
}

/** A winding tower over a far shaft: two legs, a cross brace and the wheel on top. */
function Tower({ x, base, k, color }: { x: number; base: number; k: number; color: string }) {
  const h = 104 * k;
  return (
    <g stroke={color} strokeLinecap="round" fill="none">
      <path
        d={`M${x - 26 * k} ${base} L${x - 5 * k} ${base - h} M${x + 26 * k} ${base} L${x + 5 * k} ${base - h} M${x - 18 * k} ${base - h * 0.35} H${x + 18 * k} M${x - 11 * k} ${base - h * 0.68} H${x + 11 * k} M${x - 18 * k} ${base - h * 0.35} L${x + 11 * k} ${base - h * 0.68}`}
        strokeWidth={3.2 * k}
      />
      <circle cx={x} cy={base - h - 10 * k} r={13 * k} strokeWidth={3 * k} />
      <path
        d={`M${x} ${base - h - 23 * k} V${base - h + 3 * k} M${x - 13 * k} ${base - h - 10 * k} H${x + 13 * k}`}
        strokeWidth={1.6 * k}
      />
    </g>
  );
}

/** A far trestle bridge with a little track and lanterns along it. */
function Trestle({
  x,
  base,
  k,
  color,
  id,
}: {
  x: number;
  base: number;
  k: number;
  color: string;
  id: string;
}) {
  const span = 250 * k;
  const deck = base - 58 * k;
  const legs = [0, 1, 2, 3, 4].map((i) => x + (span * i) / 4);
  return (
    <g>
      <g stroke={color} strokeWidth={2.6 * k} strokeLinecap="round" fill="none">
        {legs.map((lx, i) => (
          <path key={i} d={`M${lx} ${deck} V${base + 4 * k}`} />
        ))}
        {legs.slice(0, 4).map((lx, i) => (
          <path
            key={`x${i}`}
            d={`M${lx} ${deck + 4 * k} L${lx + span / 4} ${base} M${lx + span / 4} ${deck + 4 * k} L${lx} ${base}`}
            strokeWidth={1.6 * k}
          />
        ))}
      </g>
      <rect x={x - 10 * k} y={deck - 7 * k} width={span + 20 * k} height={7 * k} fill={color} />
      <rect
        x={x - 10 * k}
        y={deck - 9 * k}
        width={span + 20 * k}
        height={2 * k}
        fill={tint(color, 0.35)}
      />
      {[0.2, 0.6, 0.95].map((f) => (
        <g key={f}>
          <circle cx={x + span * f} cy={deck - 16 * k} r={14 * k} fill={`url(#${id}warm)`} />
          <circle cx={x + span * f} cy={deck - 16 * k} r={1.8 * k} fill="#ffe9a8" />
        </g>
      ))}
    </g>
  );
}

/** A glowing cluster of crystals sitting at (x, y), with a soft light behind it and glints. */
function CrystalCluster({
  x,
  y,
  s,
  color,
  glow,
  seed,
}: {
  x: number;
  y: number;
  s: number;
  color: string;
  glow: string;
  seed: number;
}) {
  const prisms = useMemo(() => {
    const rng = createRng(seed);
    return Array.from({ length: 5 }, (_, i) => ({
      dx: (i - 2) * 7 + (rng.next() - 0.5) * 4,
      h: 16 + rng.next() * 26 - Math.abs(i - 2) * 5,
      w: 5 + rng.next() * 3,
      tilt: (i - 2) * 11 + (rng.next() - 0.5) * 8,
    })).sort((a, b) => a.h - b.h);
  }, [seed]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={-14} rx={50} ry={34} fill={glow} />
      {prisms.map((p, i) => (
        <g key={i} transform={`translate(${p.dx} 2) rotate(${p.tilt})`}>
          <path
            d={`M${-p.w} 0 L${-p.w} ${-p.h} L0 ${-p.h - p.w * 1.3} L${p.w} ${-p.h} L${p.w} 0 Z`}
            fill={color}
          />
          <path
            d={`M0 0 L0 ${-p.h - p.w * 1.3} L${p.w} ${-p.h} L${p.w} 0 Z`}
            fill={shade(color, 0.28)}
          />
          <path
            d={`M${-p.w * 0.55} ${-2} L${-p.w * 0.55} ${-p.h * 0.92}`}
            stroke={tint(color, 0.7)}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </g>
      ))}
      <Glint x={-6} y={-30} r={6} color="#ffffff" />
      <Glint x={12} y={-18} r={4} color="#ffffff" />
    </g>
  );
}

/** A timber set holding up the roof: two posts, a cap beam, knee braces and wedges above it. */
function TimberSet({ x, top, base, k }: { x: number; top: number; base: number; k: number }) {
  const half = 86 * k;
  const post = 18 * k;
  const beamY = top + 10 * k;
  const beamH = 20 * k;
  const brace = 52 * k;
  const postAt = (side: -1 | 1) => x + side * half - post / 2;
  return (
    <g>
      {/* Wedges driven in between the cap beam and the rock. */}
      {[-0.7, -0.1, 0.55].map((f) => (
        <path
          key={f}
          d={`M${x + f * half - 12 * k} ${beamY} L${x + f * half - 8 * k} ${beamY - 16 * k} L${x + f * half + 10 * k} ${beamY - 18 * k} L${x + f * half + 14 * k} ${beamY} Z`}
          fill={mix(C.timberDark, C.timber, 0.35)}
        />
      ))}
      {([-1, 1] as const).map((side) => (
        <g key={side}>
          <rect
            x={postAt(side)}
            y={beamY}
            width={post}
            height={base - beamY + 4 * k}
            fill={C.timber}
          />
          <rect
            x={postAt(side)}
            y={beamY}
            width={post * 0.38}
            height={base - beamY + 4 * k}
            fill={C.timberDark}
          />
          {/* The edge facing the lantern catches its light. */}
          <rect
            x={side < 0 ? postAt(side) + post - 3.5 * k : postAt(side) + post * 0.38}
            y={beamY + beamH}
            width={3.5 * k}
            height={(base - beamY) * 0.7}
            fill={C.timberLight}
            opacity={0.85}
          />
          <path
            d={`M${postAt(side) + post * 0.62} ${beamY + 40 * k} v${60 * k} M${postAt(side) + post * 0.75} ${beamY + 130 * k} v${44 * k}`}
            stroke={C.timberDark}
            strokeWidth={1.5 * k}
            opacity={0.6}
          />
          {/* A knee brace from the post up to the beam. */}
          <path
            d={`M${x + side * (half - post / 2)} ${beamY + brace + beamH} L${x + side * (half - brace)} ${beamY + beamH} L${x + side * (half - brace - 14 * k)} ${beamY + beamH} L${x + side * (half - post / 2)} ${beamY + brace + beamH + 14 * k} Z`}
            fill={mix(C.timberDark, C.timber, 0.55)}
          />
          <rect
            x={postAt(side) - 1 * k}
            y={beamY + beamH}
            width={post + 2 * k}
            height={7 * k}
            fill={C.iron}
          />
        </g>
      ))}
      <rect
        x={x - half - 16 * k}
        y={beamY}
        width={half * 2 + 32 * k}
        height={beamH}
        fill={C.timber}
      />
      <rect
        x={x - half - 16 * k}
        y={beamY + beamH * 0.62}
        width={half * 2 + 32 * k}
        height={beamH * 0.38}
        fill={C.timberDark}
      />
      <rect
        x={x - half - 16 * k}
        y={beamY}
        width={half * 2 + 32 * k}
        height={3 * k}
        fill={C.timberLight}
        opacity={0.7}
      />
      {[-1, 1].map((side) => (
        <circle
          key={side}
          cx={x + side * half}
          cy={beamY + beamH * 0.4}
          r={2.6 * k}
          fill={C.iron}
        />
      ))}
    </g>
  );
}

/**
 * A lantern hanging on a short chain from the beam whose underside is at `hang`: an iron frame
 * around a glowing glass.
 */
function Lantern({ x, hang, k, id }: { x: number; hang: number; k: number; id: string }) {
  const y = hang + 40 * k;
  return (
    <g>
      <circle cx={x} cy={y} r={46 * k} fill={`url(#${id}hot)`} />
      <path d={`M${x} ${hang} V${y - 14 * k}`} stroke={C.iron} strokeWidth={2 * k} />
      <path
        d={`M${x - 9 * k} ${y - 12 * k} H${x + 9 * k} L${x + 6 * k} ${y - 17 * k} H${x - 6 * k} Z`}
        fill={C.iron}
      />
      <rect
        x={x - 8 * k}
        y={y - 12 * k}
        width={16 * k}
        height={21 * k}
        rx={3 * k}
        fill={C.lantern}
      />
      <rect x={x - 4 * k} y={y - 8 * k} width={8 * k} height={12 * k} rx={2 * k} fill="#fffbe8" />
      <path
        d={`M${x - 8 * k} ${y - 1 * k} H${x + 8 * k} M${x} ${y - 12 * k} V${y + 9 * k}`}
        stroke={C.iron}
        strokeWidth={1.4 * k}
      />
      <rect x={x - 9 * k} y={y + 8 * k} width={18 * k} height={4 * k} rx={1.5 * k} fill={C.iron} />
    </g>
  );
}

/** A barrel standing at (x, y): staves, two iron hoops, a lit side. */
function Barrel({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={2} cy={1} rx={22} ry={4} fill="rgba(15,8,12,0.35)" />
      <path d="M-17 0 Q-21 -22 -17 -44 L17 -44 Q21 -22 17 0 Z" fill={C.timber} />
      <path d="M-17 0 Q-21 -22 -17 -44 L-6 -44 Q-9 -22 -6 0 Z" fill={C.timberDark} />
      <path
        d="M9 -42 Q12 -22 9 -2"
        stroke={C.timberLight}
        strokeWidth={3}
        fill="none"
        opacity={0.8}
      />
      <path d="M-1 -43 Q0 -22 -1 -1" stroke={shade(C.timber, 0.3)} strokeWidth={1.2} fill="none" />
      <g fill={C.iron}>
        <path d="M-19.4 -12 Q0 -9.6 19.4 -12 L19.6 -8 Q0 -5.6 -19.6 -8 Z" />
        <path d="M-19.4 -36 Q0 -33.6 19.4 -36 L19.2 -32 Q0 -29.6 -19.2 -32 Z" />
      </g>
      <ellipse cx={0} cy={-44} rx={17} ry={4.5} fill={mix(C.timber, C.timberLight, 0.4)} />
      <ellipse cx={0} cy={-44} rx={12} ry={2.8} fill={C.timberDark} />
    </g>
  );
}

/** A wooden crate at (x, y), `w` wide: planks, a diagonal brace, a lit top. */
function Crate({ x, y, s, w = 40 }: { x: number; y: number; s: number; w?: number }) {
  const h = w * 0.82;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={3} cy={1} rx={w * 0.6} ry={3.5} fill="rgba(15,8,12,0.35)" />
      <rect x={-w / 2} y={-h} width={w} height={h} fill={mix(C.timber, C.timberLight, 0.15)} />
      <rect x={-w / 2} y={-h} width={w * 0.3} height={h} fill={mix(C.timber, C.timberDark, 0.5)} />
      <rect x={-w / 2} y={-h} width={w} height={4} fill={C.timberLight} opacity={0.8} />
      <g stroke={C.timberDark} strokeWidth={1.4} opacity={0.7}>
        <path d={`M${-w / 2} ${-h * 0.5} H${w / 2}`} />
        <path d={`M${-w / 2 + 4} ${-4} L${w / 2 - 4} ${-h + 4}`} strokeWidth={4} opacity={0.5} />
      </g>
    </g>
  );
}

/** A pickaxe (or a shovel) leaning against something at (x, y), its handle tipped by `lean`°. */
function Tool({
  x,
  y,
  s,
  lean,
  kind,
}: {
  x: number;
  y: number;
  s: number;
  lean: number;
  kind: 'pick' | 'shovel';
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${s})`}>
      <rect x={-2.6} y={-62} width={5.2} height={62} rx={2} fill={C.timberLight} />
      <rect x={-2.6} y={-62} width={2.2} height={62} rx={1} fill={C.timber} />
      {kind === 'pick' ? (
        <g>
          <path d="M-24 -56 Q0 -72 24 -56 Q0 -64 -24 -56 Z" fill="#8a909c" />
          <path d="M-24 -56 Q0 -66 24 -56" stroke="#d8dee8" strokeWidth={1.4} fill="none" />
          <rect x={-4} y={-66} width={8} height={9} rx={2} fill={C.iron} />
        </g>
      ) : (
        <g transform="translate(0 2)">
          <path d="M-9 0 Q-10 14 0 20 Q10 14 9 0 Z" fill="#8a909c" />
          <path d="M3 2 Q6 12 1 17" stroke="#d8dee8" strokeWidth={1.4} fill="none" />
        </g>
      )}
    </g>
  );
}

/** A bucket at (x, y), with a wire handle. */
function Bucket({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={2} cy={1} rx={13} ry={3} fill="rgba(15,8,12,0.35)" />
      <path d="M-11 -22 L11 -22 L8 0 L-8 0 Z" fill="#7d8796" />
      <path d="M-11 -22 L-3 -22 L-2 0 L-8 0 Z" fill="#545c6a" />
      <path d="M-10 -24 Q0 -38 10 -24" stroke={C.iron} strokeWidth={1.6} fill="none" />
      <ellipse cx={0} cy={-22} rx={11} ry={3} fill="#3a3440" />
      <path d="M-10 -14 H10" stroke="#545c6a" strokeWidth={1.4} />
    </g>
  );
}

/** A heap of ore with gold nuggets glinting in it. */
function OrePile({ x, y, s, seed }: { x: number; y: number; s: number; seed: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-34 0 Q-26 -20 -8 -24 Q8 -30 22 -18 Q34 -8 36 0 Z" fill={C.gravelDark} />
      <path d="M-8 -24 Q8 -30 22 -18 Q14 -20 2 -19 Q-6 -18 -8 -24 Z" fill={C.gravel} />
      <Pebbles x={0} y={-4} s={1} seed={seed} stone={C.gravel} count={6} />
      <g fill={C.gold}>
        <circle cx={-10} cy={-16} r={3} />
        <circle cx={8} cy={-21} r={2.4} />
        <circle cx={18} cy={-9} r={2.6} />
      </g>
      <Glint x={8} y={-24} r={6} color="#fff6c0" />
    </g>
  );
}

/** Little glowing cave mushrooms. */
function GlowShrooms({ x, y, s, id }: { x: number; y: number; s: number; id: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={-10} rx={30} ry={18} fill={`url(#${id}c0)`} />
      {[
        [-8, 0, 0.8],
        [5, 1, 1],
        [14, 2, 0.6],
      ].map(([mx, my, ms], i) => (
        <g key={i} transform={`translate(${mx} ${my}) scale(${ms})`}>
          <path d="M-2 0 Q-3 -7 -1.5 -12 L1.5 -12 Q3 -7 2 0 Z" fill="#e8f4ee" />
          <path d="M-10 -10 Q-9 -22 0 -23 Q9 -22 10 -10 Q0 -13 -10 -10 Z" fill={C.mushroom} />
          <path d="M-10 -10 Q-9 -22 0 -23 Q-5 -18 -5 -11 Z" fill={shade(C.mushroom, 0.2)} />
          <circle cx={3} cy={-18} r={1.8} fill="#ffffff" opacity={0.9} />
        </g>
      ))}
    </g>
  );
}

/**
 * The tunnel nearer by: a bank of rubble with timber sets standing on it, lanterns hanging from
 * them in pools of warm light, crystals glowing in the rock, barrels, crates, tools and ore.
 */
export function MineMid({ horizon, groundTop, height, k, seed }: P) {
  const id = useId();
  const top = ceilingDepth(horizon);
  const base = horizon + (groundTop - horizon) * 0.55;
  const sets = useSpots(seed * 211, 3, 150);
  const rocks = useSpots(seed * 223, 8, 40);
  const crystals = useSpots(seed * 227, 4, 90);
  const props = useMemo(() => {
    const rng = createRng(seed * 229);
    const kinds = [
      'barrel',
      'crates',
      'bucket',
      'ore',
      'shrooms',
      'barrel',
      'ore',
      'crates',
    ] as const;
    return kinds.map((kind, i) => ({
      kind,
      x: 70 + ((W - 140) * (i + rng.next() * 0.7)) / kinds.length,
      s: 0.85 + rng.next() * 0.3,
      seed: rng.int(1, 1e6),
    }));
  }, [seed]);
  return (
    <g>
      <defs>
        <GlowDefs id={id} />
        <linearGradient id={`${id}bank`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.wall} />
          <stop offset="1" stopColor={C.wallDark} />
        </linearGradient>
      </defs>
      {/* Lantern light hanging in the air around each set. */}
      {sets.map((st, i) => (
        <circle key={`g${i}`} cx={st.x} cy={top + 60 * k} r={190 * k} fill={`url(#${id}warm)`} />
      ))}
      <path
        d={ridgePath(seed * 5, base - 4 * k, 9 * k, 150, height, true)}
        fill={`url(#${id}bank)`}
      />
      <path
        d={ridgePath(seed * 5, base - 4 * k, 9 * k, 150, height, true)}
        fill="none"
        stroke={C.wallLight}
        strokeWidth={3 * k}
        opacity={0.45}
      />
      {rocks.map((r, i) => (
        <MossRock
          key={`r${i}`}
          x={r.x}
          y={base + (6 + r.r * 10) * k}
          s={(0.7 + r.r2 * 0.8) * k}
          rock={mix(C.wall, C.wallLight, 0.25 + r.r * 0.3)}
          seed={seed * 300 + i}
        />
      ))}
      {crystals.map((c, i) => (
        <CrystalCluster
          key={`c${i}`}
          x={c.x}
          y={base + 4 * k}
          s={(0.7 + c.r * 0.5) * k}
          color={C.crystals[i % 3]!}
          glow={`url(#${id}c${i % 3})`}
          seed={seed * 310 + i}
        />
      ))}
      {sets.map((st, i) => (
        <TimberSet key={`t${i}`} x={st.x} top={top} base={base} k={k} />
      ))}
      {/* Tools leaning on the posts. */}
      {sets[0] && (
        <Tool x={sets[0].x - 86 * k - 14 * k} y={base + 3 * k} s={k} lean={-14} kind="pick" />
      )}
      {sets[2] && (
        <Tool x={sets[2].x + 86 * k + 14 * k} y={base + 3 * k} s={k} lean={13} kind="shovel" />
      )}
      {props.map((pr, i) => {
        const y = base + 5 * k;
        const s = pr.s * k;
        switch (pr.kind) {
          case 'barrel':
            return <Barrel key={i} x={pr.x} y={y} s={s} />;
          case 'crates':
            return (
              <g key={i}>
                <Crate x={pr.x} y={y} s={s} w={42} />
                <Crate x={pr.x + 30 * s} y={y} s={s * 0.8} w={36} />
              </g>
            );
          case 'bucket':
            return <Bucket key={i} x={pr.x} y={y} s={s} />;
          case 'ore':
            return <OrePile key={i} x={pr.x} y={y} s={s} seed={pr.seed} />;
          case 'shrooms':
            return <GlowShrooms key={i} x={pr.x} y={y} s={s} id={id} />;
        }
        return null;
      })}
      {sets.map((st, i) => (
        <Lantern key={`l${i}`} x={st.x} hang={top + 32 * k} k={k} id={id} />
      ))}
    </g>
  );
}

/** The floor: lantern-lit gravel, pebbles, rocks, puddles, ore and crystals, and the rails. */
export function MineNear({ groundTop, height, pathY, k, seed }: P) {
  const id = useId();
  const g = groundTop;
  const pools = useSpots(seed * 331, 5, 80);
  const bits = useMemo(() => {
    const rng = createRng(seed * 307);
    const rows = Math.max(2, Math.round((height - g) / (36 * k)));
    const out: { x: number; y: number; kind: number; s: number; seed: number }[] = [];
    for (let r = 0; r < rows; r++) {
      const y = g + 12 * k + ((height - g - 16 * k) * (r + 0.5)) / rows;
      for (let x = 30 + rng.next() * 60; x < W - 30; x += (60 + rng.next() * 90) * k) {
        const yy = y + (rng.next() - 0.5) * 14 * k;
        // Keep the track clear.
        if (pathY !== undefined && Math.abs(yy - pathY) < 26 * k) continue;
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
  return (
    <g>
      <defs>
        <GlowDefs id={id} />
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.groundTop} />
          <stop offset={Math.min(1, (50 * k) / Math.max(1, height - g))} stopColor={C.ground} />
          <stop offset="1" stopColor={C.groundDark} />
        </linearGradient>
        <linearGradient id={`${id}puddle`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(C.puddle, 0.25)} />
          <stop offset="1" stopColor={mix(C.puddle, C.glow, 0.45)} />
        </linearGradient>
      </defs>
      <path
        d={`M0 ${g} Q 320 ${g - 12 * k} 640 ${g} T ${W} ${g} V ${height} H 0 Z`}
        fill={`url(#${id}g)`}
      />
      <path
        d={`M0 ${g} Q 320 ${g - 12 * k} 640 ${g} T ${W} ${g} V ${g + 5 * k} Q 960 ${g} 640 ${g + 5 * k} T 0 ${g + 5 * k} Z`}
        fill={tint(C.groundTop, 0.35)}
      />
      {pools.map((p, i) => (
        <ellipse
          key={i}
          cx={p.x}
          cy={g + (height - g) * (0.12 + p.r * 0.5)}
          rx={(90 + p.r2 * 60) * k}
          ry={(16 + p.r2 * 10) * k}
          fill={`url(#${id}warm)`}
        />
      ))}
      {bits.map((b, i) =>
        b.kind < 0.42 ? (
          <Pebbles
            key={i}
            x={b.x}
            y={b.y}
            s={b.s}
            seed={b.seed}
            stone={i % 2 ? C.gravel : C.gravelDark}
          />
        ) : b.kind < 0.56 ? (
          <MossRock
            key={i}
            x={b.x}
            y={b.y}
            s={b.s * 0.55}
            rock={mix(C.ground, C.gravelLight, 0.3)}
            seed={b.seed}
          />
        ) : b.kind < 0.6 ? (
          <Puddle key={i} x={b.x} y={b.y} s={b.s} fill={`url(#${id}puddle)`} />
        ) : b.kind < 0.72 ? (
          <g key={i}>
            <circle cx={b.x} cy={b.y - 3 * b.s} r={3 * b.s} fill={C.gold} />
            <circle cx={b.x + 7 * b.s} cy={b.y - 1 * b.s} r={2 * b.s} fill={shade(C.gold, 0.2)} />
            <Glint x={b.x + 1 * b.s} y={b.y - 6 * b.s} r={5 * b.s} color="#fff6c0" />
          </g>
        ) : b.kind < 0.8 ? (
          <CrystalCluster
            key={i}
            x={b.x}
            y={b.y}
            s={b.s * 0.45}
            color={C.crystals[i % 3]!}
            glow={`url(#${id}c${i % 3})`}
            seed={b.seed}
          />
        ) : null,
      )}
      {pathY !== undefined && <Rails y={pathY} k={k} />}
    </g>
  );
}

/** A puddle catching the lantern light, with a damp dark rim. */
function Puddle({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0.8} rx={33} ry={7.4} fill={shade(C.ground, 0.25)} />
      <ellipse cx={0} cy={0} rx={30} ry={6} fill={fill} />
      <path
        d="M-16 -1.5 H6"
        stroke="#ffe8b8"
        strokeWidth={2.2}
        strokeLinecap="round"
        opacity={0.85}
      />
      <path
        d="M10 0.5 H17"
        stroke="#ffe8b8"
        strokeWidth={1.6}
        strokeLinecap="round"
        opacity={0.6}
      />
    </g>
  );
}

/**
 * The track seen from the side, with the top of the rail at `y` - 9 (where the cart wheels run):
 * a bed of gravel, sleepers lit along their tops, and a steel rail with a bright edge.
 */
function Rails({ y, k }: { y: number; k: number }) {
  const ties = Array.from({ length: 32 }, (_, i) => i * 40 + 6);
  return (
    <g>
      <rect x={0} y={y - 1 * k} width={W} height={15 * k} fill={C.gravelDark} />
      <rect x={0} y={y + 12 * k} width={W} height={3 * k} fill={shade(C.gravelDark, 0.3)} />
      {ties.map((x) => (
        <g key={x}>
          <rect x={x} y={y - 1 * k} width={26 * k} height={11 * k} rx={1.5 * k} fill={C.sleeper} />
          <rect x={x} y={y - 1 * k} width={26 * k} height={2.6 * k} fill={C.sleeperLight} />
          <rect x={x} y={y + 7 * k} width={26 * k} height={3 * k} fill={C.sleeperDark} />
          <rect x={x + 10 * k} y={y - 1 * k} width={6 * k} height={3 * k} fill={C.railDark} />
        </g>
      ))}
      <rect x={0} y={y - 9 * k} width={W} height={8 * k} fill={C.rail} />
      <rect x={0} y={y - 4 * k} width={W} height={3 * k} fill={C.railDark} />
      <rect x={0} y={y - 9 * k} width={W} height={1.8 * k} fill={C.railLight} />
    </g>
  );
}

/**
 * Dark rocks right in front of the camera at the bottom corners, rimmed with lantern light, a
 * crystal glinting among them. They slide past faster than the floor (scenes only).
 */
export function MineFront({ height, k }: P) {
  const id = useId();
  /** A dark rock, and lantern light along the top of it. */
  const rock = (d: string, rim: string, fill: string) => (
    <g>
      <path d={d} fill={fill} />
      <path
        d={rim}
        stroke="#c47a4a"
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
    </g>
  );
  return (
    <g>
      <defs>
        <GlowDefs id={id} />
      </defs>
      {[
        { x: 70, s: 0.9, flip: 1, c: 0 },
        { x: 1200, s: 0.8, flip: -1, c: 2 },
      ].map(({ x, s, flip, c }, i) => {
        const crystal = C.crystals[c]!;
        return (
          <g key={i} transform={`translate(${x} ${height + 6}) scale(${s * flip * k} ${s * k})`}>
            <ellipse cx={62} cy={-66} rx={44} ry={34} fill={`url(#${id}c${c})`} />
            {rock(
              'M-120 0 Q-118 -70 -70 -104 Q-30 -126 4 -96 Q30 -70 34 0 Z',
              'M-66 -102 Q-30 -124 2 -96 Q16 -82 24 -64',
              '#1a1018',
            )}
            {rock(
              'M-10 0 Q-6 -52 30 -70 Q64 -84 90 -50 Q108 -26 112 0 Z',
              'M34 -70 Q64 -82 88 -50 Q100 -36 106 -20',
              '#22151f',
            )}
            <path d="M50 -62 L58 -106 L68 -64 Z" fill={crystal} />
            <path d="M58 -106 L68 -64 L60 -62 Z" fill={shade(crystal, 0.3)} />
            <path d="M66 -60 L80 -88 L84 -58 Z" fill={tint(crystal, 0.15)} />
            <Glint x={56} y={-94} r={7} color="#ffffff" />
            {rock(
              'M-150 0 Q-140 -36 -96 -44 Q-60 -48 -40 -20 Q-34 -8 -34 0 Z',
              'M-96 -44 Q-62 -48 -42 -22',
              '#140c13',
            )}
          </g>
        );
      })}
    </g>
  );
}
