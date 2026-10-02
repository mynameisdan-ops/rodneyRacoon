import { useId, useMemo } from 'react';
import { createRng } from '../../game/rng';
import { shade, tint } from '../style';
import { ridgePath, useSpots, W, type LayerProps } from '../worlds/sceneryKit';
import type { ForestTheme } from '../worlds/themes';
import {
  BarkGrooves,
  Flower,
  Frond,
  GrassClump,
  Ivy,
  LeafCluster,
  LeafLitter,
  MossRock,
  Mushrooms,
  type Foliage,
} from './paintKit';
import { PAINTED_FOREST } from './paintedPalette';

/*
 * The Whispering Forest, painted (M7b style test). Backgrounds in a Saturday-morning cartoon are
 * painted rather than outlined: soft gradients, fog between the rows of trees, light falling
 * through the canopy, and only the hero and the props he touches get ink lines. Detail comes from
 * the paint kit (leaf clusters, bark, ivy, ferns, mossy rocks, grass, litter); the layers are
 * drawn once as images, so it costs nothing per frame. Same layer slots and tiling rules as the
 * flat forest: anything at a tile's edge is drawn the same at both ends.
 */

type P = LayerProps<ForestTheme>;

const C = PAINTED_FOREST;

const CANOPY_BACK: Foliage = { dark: '#0a2419', base: '#113a27', light: '#1c5435', rim: '#3a7f47' };
const CANOPY: Foliage = { dark: '#0f3326', base: '#1d5638', light: '#37844a', rim: '#8fd06a' };
const BRANCH: Foliage = { dark: '#164a2f', base: '#286c3f', light: '#4a9a50', rim: '#a5e07a' };
const BUSH: Foliage = { dark: '#1a4a2c', base: '#2e7840', light: '#58a64e', rim: '#b4e77f' };
const LITTER = ['#c9822f', '#e0a63d', '#a8562a', '#d9b84a', '#8a6a2e'] as const;

const canopyDepth = (horizon: number) => Math.max(18, horizon * 0.32);

/** The canopy overhead, a glow of sun through the leaves, and shafts of light. */
export function PaintedCanopy({ horizon, height, k, seed }: P) {
  const id = useId();
  const depth = canopyDepth(horizon);
  const back = useSpots(seed * 13, 14, 0);
  const front = useSpots(seed * 17, 11, 0);
  const shafts = useSpots(seed * 29, 5, 100);
  const vines = useSpots(seed * 31, 6, 60);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}shaft`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.light} stopOpacity={0.55} />
          <stop offset="0.7" stopColor={C.light} stopOpacity={0.12} />
          <stop offset="1" stopColor={C.light} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}sun`}>
          <stop offset="0" stopColor="#fffbe0" stopOpacity={0.9} />
          <stop offset="0.3" stopColor={C.light} stopOpacity={0.55} />
          <stop offset="1" stopColor={C.light} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse
        cx={W * 0.62}
        cy={horizon * 0.72}
        rx={430 * k}
        ry={270 * k}
        fill={`url(#${id}sun)`}
      />
      {shafts.map((s, i) => (
        <path
          key={i}
          d={`M${s.x} ${depth * 0.5} L${s.x + (40 + s.r * 50) * k} ${depth * 0.5} L${s.x + (250 + s.r2 * 120) * k} ${height} L${s.x + (110 + s.r2 * 60) * k} ${height} Z`}
          fill={`url(#${id}shaft)`}
        />
      ))}
      <rect x={0} y={0} width={W} height={depth * 0.55} fill={CANOPY_BACK.dark} />
      {/* A darker row of foliage behind, then the lit row, with the same cluster at both ends. */}
      {[...back, { x: 0, r: 0.5, r2: 0.5 }, { x: W, r: 0.5, r2: 0.5 }].map((b, i) => (
        <LeafCluster
          key={`b${i}`}
          x={b.x}
          y={depth * (0.5 + b.r * 0.25)}
          r={(34 + b.r2 * 22) * k}
          c={CANOPY_BACK}
          seed={b.x === 0 || b.x === W ? seed * 7 : seed * 100 + i}
        />
      ))}
      {[...front, { x: 0, r: 0.4, r2: 0.6 }, { x: W, r: 0.4, r2: 0.6 }].map((b, i) => (
        <LeafCluster
          key={`f${i}`}
          x={b.x}
          y={depth * (0.72 + b.r * 0.3)}
          r={(30 + b.r2 * 26) * k}
          c={CANOPY}
          seed={b.x === 0 || b.x === W ? seed * 11 : seed * 200 + i}
        />
      ))}
      {/* Vines hanging out of the canopy. */}
      {vines.map((v, i) => {
        const len = (90 + v.r * 110) * k;
        const top = depth * 0.95;
        return (
          <g key={i}>
            <path
              d={`M${v.x} ${top} q ${12 * k} ${len * 0.5} ${-5 * k} ${len}`}
              stroke="#1f5a34"
              strokeWidth={3.5 * k}
              fill="none"
              strokeLinecap="round"
            />
            {Array.from({ length: 6 }, (_, j) => {
              const f = (j + 1) / 7;
              const side = j % 2 ? 1 : -1;
              return (
                <path
                  key={j}
                  d="M0 0 Q4 -4.6 10 0 Q4 4.6 0 0 Z"
                  transform={`translate(${v.x + 4 * k * Math.sin(f * 3)} ${top + len * f}) rotate(${side > 0 ? 30 : 150}) scale(${1.1 * k})`}
                  fill={j % 3 === 0 ? BRANCH.light : BRANCH.base}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

/** Rows of trees fading into the fog, palest farthest away, with lit crowns. */
export function PaintedFar({ horizon, height, k, seed }: P) {
  const id = useId();
  const rows = useMemo(() => {
    const rng = createRng(seed * 131);
    return [0, 1, 2].map((row) => {
      const trees: { x: number; h: number; pine: boolean; r: number }[] = [];
      for (let x = 20 + row * 30; x < W - 30; x += rng.int(46, 84)) {
        trees.push({
          x,
          h: rng.int(70, 140) * (1 + row * 0.25),
          pine: rng.next() < 0.5,
          r: rng.next(),
        });
      }
      return trees;
    });
  }, [seed]);
  return (
    <g>
      <defs>
        {C.rows.map((color, row) => (
          <linearGradient key={row} id={`${id}r${row}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} />
            <stop offset="1" stopColor={C.mist} />
          </linearGradient>
        ))}
        <linearGradient id={`${id}fog`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.mist} stopOpacity={0} />
          <stop offset="0.6" stopColor={C.mist} stopOpacity={0.75} />
          <stop offset="1" stopColor={C.mist} stopOpacity={0} />
        </linearGradient>
      </defs>
      {rows.map((trees, row) => {
        const base = horizon + row * 22 * k;
        const lit = tint(C.rows[row]!, 0.28);
        return (
          <g key={row}>
            <rect x={0} y={base - 6} width={W} height={height - base + 6} fill={C.rows[row]} />
            {trees.map((t, i) => {
              const h = t.h * k;
              return t.pine ? (
                <g key={i}>
                  {[0, 1, 2].map((tier) => {
                    const ty = base - h * (0.35 + tier * 0.25);
                    const tw = (26 - tier * 6) * k;
                    return (
                      <path
                        key={tier}
                        d={`M${t.x - tw} ${ty + h * 0.32} Q${t.x - tw * 0.3} ${ty + h * 0.1} ${t.x} ${ty - h * 0.08} Q${t.x + tw * 0.3} ${ty + h * 0.1} ${t.x + tw} ${ty + h * 0.32} Z`}
                        fill={`url(#${id}r${row})`}
                      />
                    );
                  })}
                  <path
                    d={`M${t.x} ${base - h * 0.93} L${t.x + 9 * k} ${base - h * 0.7} L${t.x + 2 * k} ${base - h * 0.72} Z`}
                    fill={lit}
                    opacity={0.7}
                  />
                </g>
              ) : (
                <g key={i}>
                  <rect
                    x={t.x - 4 * k}
                    y={base - h * 0.42}
                    width={8 * k}
                    height={h * 0.42}
                    fill={`url(#${id}r${row})`}
                  />
                  <g fill={`url(#${id}r${row})`}>
                    <circle cx={t.x} cy={base - h * 0.68} r={h * 0.3} />
                    <circle cx={t.x - h * 0.2} cy={base - h * 0.5} r={h * 0.24} />
                    <circle cx={t.x + h * 0.22} cy={base - h * 0.52} r={h * 0.25} />
                  </g>
                  <circle
                    cx={t.x + h * 0.08}
                    cy={base - h * 0.8}
                    r={h * 0.14}
                    fill={lit}
                    opacity={0.6}
                  />
                  <circle
                    cx={t.x + h * 0.27}
                    cy={base - h * 0.62}
                    r={h * 0.09}
                    fill={lit}
                    opacity={0.5}
                  />
                </g>
              );
            })}
            <rect x={0} y={base - 50 * k} width={W} height={80 * k} fill={`url(#${id}fog)`} />
          </g>
        );
      })}
    </g>
  );
}

/**
 * Big painted trunks with bark, ivy, moss and roots; leafy branches; bushes, ferns, rocks and
 * mushrooms at their feet; a mossy fallen log; fireflies.
 */
export function PaintedMid({ horizon, groundTop, height, k, seed }: P) {
  const id = useId();
  const base = horizon + (groundTop - horizon) * 0.55;
  const trunks = useSpots(seed * 211, 5, 70);
  const flies = useSpots(seed * 223, 10, 30);
  const logAt = useSpots(seed * 227, 1, 300)[0]!;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}bark`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.trunkDark} />
          <stop offset="0.45" stopColor={C.trunk} />
          <stop offset="0.8" stopColor={C.trunk} />
          <stop offset="0.92" stopColor={C.trunkLight} />
          <stop offset="1" stopColor={C.trunk} />
        </linearGradient>
        <linearGradient id={`${id}ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(C.ground, 0.12)} />
          <stop offset="1" stopColor={C.groundDark} />
        </linearGradient>
        <linearGradient id={`${id}moss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint(C.moss, 0.3)} />
          <stop offset="1" stopColor={shade(C.moss, 0.3)} />
        </linearGradient>
        <radialGradient id={`${id}fly`}>
          <stop offset="0" stopColor={C.firefly} stopOpacity={0.95} />
          <stop offset="0.25" stopColor={C.firefly} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.firefly} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={ridgePath(seed * 5, base, 8 * k, 160, height, true)} fill={`url(#${id}ground)`} />
      {/* A mossy fallen log between the trees. */}
      <g transform={`translate(${logAt.x} ${base + 2 * k}) scale(${k})`}>
        <rect x={-90} y={-26} width={180} height={28} rx={14} fill={C.trunk} />
        <rect x={-86} y={-24} width={172} height={8} rx={4} fill={C.trunkLight} opacity={0.6} />
        <ellipse cx={90} cy={-12} rx={9} ry={14} fill="#c79a62" />
        <ellipse cx={90} cy={-12} rx={4} ry={7} fill="#9a6e3e" />
        <path d="M-80 -24 Q-40 -38 10 -26 Q-30 -22 -80 -18 Z" fill={C.moss} />
        <Mushrooms x={-30} y={-24} s={0.45} cap="#e8a33a" />
      </g>
      {trunks.map((t, i) => {
        const w = (40 + t.r * 26) * k;
        const flip = t.r < 0.5 ? -1 : 1;
        const left = t.x - w / 2;
        return (
          <g key={i}>
            <path
              d={`M${left} -10 L${left} ${base - 24 * k} Q${left} ${base} ${t.x - w * 1.05} ${base + 5 * k} L${t.x + w * 1.05} ${base + 5 * k} Q${t.x + w / 2} ${base} ${t.x + w / 2} ${base - 24 * k} L${t.x + w / 2} -10 Z`}
              fill={`url(#${id}bark)`}
            />
            <BarkGrooves
              x0={left}
              x1={t.x + w / 2}
              top={-10}
              bottom={base - 20 * k}
              color={C.trunkDark}
              seed={seed * 300 + i}
            />
            {/* Roots flaring into the ground, lit along their tops. */}
            {[-1, 1].map((side) => (
              <g key={side}>
                <path
                  d={`M${t.x + side * w * 0.2} ${base - 30 * k} Q${t.x + side * w * 0.7} ${base - 8 * k} ${t.x + side * w * 1.3} ${base + 6 * k} L${t.x + side * w * 0.9} ${base + 6 * k} Q${t.x + side * w * 0.45} ${base - 4 * k} ${t.x + side * w * 0.05} ${base - 18 * k} Z`}
                  fill={C.trunk}
                />
                <path
                  d={`M${t.x + side * w * 0.25} ${base - 28 * k} Q${t.x + side * w * 0.7} ${base - 9 * k} ${t.x + side * w * 1.2} ${base + 3 * k}`}
                  stroke={C.trunkLight}
                  strokeWidth={2 * k}
                  fill="none"
                  opacity={0.6}
                />
              </g>
            ))}
            {t.r2 < 0.5 && (
              <g>
                <ellipse
                  cx={t.x - w * 0.08}
                  cy={base - 72 * k}
                  rx={w * 0.2}
                  ry={16 * k}
                  fill={C.trunkDark}
                />
                <ellipse
                  cx={t.x - w * 0.04}
                  cy={base - 68 * k}
                  rx={w * 0.13}
                  ry={10 * k}
                  fill="#1a0f0a"
                />
                <path
                  d={`M${t.x - w * 0.28} ${base - 74 * k} Q${t.x - w * 0.08} ${base - 92 * k} ${t.x + w * 0.12} ${base - 74 * k}`}
                  stroke={C.trunkLight}
                  strokeWidth={2.5 * k}
                  fill="none"
                  opacity={0.5}
                />
              </g>
            )}
            {/* Moss climbing from the roots, and ivy up some trunks. */}
            <path
              d={`M${t.x - w * 1.05} ${base + 5 * k} Q${t.x - w * 0.6} ${base - 30 * k} ${t.x - w * 0.5} ${base - 60 * k} Q${t.x - w * 0.3} ${base - 40 * k} ${t.x - w * 0.1} ${base - 32 * k} Q${t.x + w * 0.2} ${base - 10 * k} ${t.x + w * 0.1} ${base + 5 * k} Z`}
              fill={`url(#${id}moss)`}
            />
            {i % 2 === 0 && (
              <Ivy x={t.x + w * 0.15} y={base - 20 * k} h={horizon * 0.9} c={BRANCH} />
            )}
            {/* A leafy branch reaching out. */}
            <g transform={`translate(${t.x} ${horizon * 0.62}) scale(${flip} 1)`}>
              <path
                d={`M0 0 Q${40 * k} ${-4 * k} ${78 * k} ${-30 * k}`}
                stroke={C.trunk}
                strokeWidth={10 * k}
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={`M0 ${-3 * k} Q${40 * k} ${-7 * k} ${78 * k} ${-33 * k}`}
                stroke={C.trunkLight}
                strokeWidth={2.5 * k}
                fill="none"
                strokeLinecap="round"
                opacity={0.7}
              />
              <LeafCluster x={70 * k} y={-46 * k} r={30 * k} c={BRANCH} seed={seed * 400 + i} />
              <LeafCluster x={104 * k} y={-30 * k} r={22 * k} c={BRANCH} seed={seed * 410 + i} />
              <LeafCluster x={88 * k} y={-70 * k} r={20 * k} c={BRANCH} seed={seed * 420 + i} />
            </g>
            {/* Life at the roots. */}
            {t.r < 0.6 && (
              <LeafCluster
                x={t.x - w * 1.1}
                y={base - 4 * k}
                r={22 * k}
                c={BUSH}
                seed={seed * 500 + i}
              />
            )}
            <Frond
              x={t.x + w * 0.6}
              y={base + 4 * k}
              s={0.8 * k}
              dark={C.fern}
              light={C.fernLight}
            />
            <Frond
              x={t.x + w * 0.9}
              y={base + 4 * k}
              s={0.6 * k}
              flip={-1}
              dark={C.fern}
              light={C.fernLight}
            />
            {t.r2 > 0.5 ? (
              <Mushrooms x={t.x + w * 1.1} y={base + 3 * k} s={0.8 * k} cap={C.mushroom} />
            ) : (
              <MossRock
                x={t.x + w * 1.3}
                y={base + 4 * k}
                s={0.7 * k}
                rock="#7d7f74"
                moss={C.moss}
                seed={seed * 600 + i}
              />
            )}
          </g>
        );
      })}
      {flies.map((f, i) => (
        <circle
          key={i}
          cx={f.x}
          cy={horizon * (0.7 + f.r * 0.6)}
          r={(10 + f.r2 * 8) * k}
          fill={`url(#${id}fly)`}
        />
      ))}
    </g>
  );
}

/** The forest floor: grass texture, dappled light, the path with stones, flowers and litter. */
export function PaintedNear({ groundTop, height, pathY, k, seed }: P) {
  const id = useId();
  const dapples = useSpots(seed * 331, 9, 40);
  const g = groundTop;
  const bits = useMemo(() => {
    const rng = createRng(seed * 307);
    const rows = Math.max(2, Math.round((height - g) / (34 * k)));
    const out: { x: number; y: number; kind: number; s: number; seed: number }[] = [];
    for (let r = 0; r < rows; r++) {
      const y = g + 10 * k + ((height - g - 14 * k) * (r + 0.5)) / rows;
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
        });
      }
    }
    return out;
  }, [seed, g, height, pathY, k]);
  const stones = useSpots(seed * 341, 14, 20);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.groundTop} />
          <stop offset={Math.min(1, 40 / Math.max(1, height - g))} stopColor={C.ground} />
          <stop offset="1" stopColor={C.groundDark} />
        </linearGradient>
        <linearGradient id={`${id}path`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.pathLight} />
          <stop offset="0.5" stopColor={C.path} />
          <stop offset="1" stopColor={shade(C.path, 0.25)} />
        </linearGradient>
        <radialGradient id={`${id}dapple`}>
          <stop offset="0" stopColor={C.light} stopOpacity={0.55} />
          <stop offset="1" stopColor={C.light} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path
        d={`M0 ${g} Q 320 ${g - 12 * k} 640 ${g} T ${W} ${g} V ${height} H 0 Z`}
        fill={`url(#${id}g)`}
      />
      <path
        d={`M0 ${g} Q 320 ${g - 12 * k} 640 ${g} T ${W} ${g} V ${g + 5 * k} Q 960 ${g} 640 ${g + 5 * k} T 0 ${g + 5 * k} Z`}
        fill={tint(C.groundTop, 0.3)}
      />
      {dapples.map((d, i) => (
        <ellipse
          key={i}
          cx={d.x}
          cy={g + (height - g) * (0.15 + d.r * 0.75)}
          rx={(50 + d.r2 * 40) * k}
          ry={(12 + d.r2 * 8) * k}
          fill={`url(#${id}dapple)`}
        />
      ))}
      {pathY !== undefined && (
        <g>
          <path d={`M0 ${pathY - 15 * k} H${W} V${pathY + 15 * k} H0 Z`} fill={`url(#${id}path)`} />
          {/* Wheel ruts, then the edges and stones. */}
          <path
            d={`M0 ${pathY - 4 * k} H${W} M0 ${pathY + 6 * k} H${W}`}
            stroke={shade(C.path, 0.15)}
            strokeWidth={2 * k}
            opacity={0.5}
          />
          <path
            d={`M0 ${pathY + 13 * k} H${W} V${pathY + 17 * k} H0 Z`}
            fill={C.pathEdge}
            opacity={0.55}
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
          {/* Grass leaning over both edges of the path. */}
          {stones.map((st, i) => (
            <GrassClump
              key={`e${i}`}
              x={st.x + 20 * k}
              y={pathY + (i % 2 ? 17 : -13) * k}
              s={0.55 * k}
              dark={C.fern}
              light={C.fernLight}
              seed={seed * 700 + i}
              blades={5}
            />
          ))}
          <LeafLitter
            x={W * 0.3}
            y={pathY - 2 * k}
            s={k}
            seed={seed * 9}
            colors={LITTER}
            spread={40}
          />
          <LeafLitter
            x={W * 0.74}
            y={pathY + 4 * k}
            s={k}
            seed={seed * 10}
            colors={LITTER}
            spread={30}
            count={4}
          />
        </g>
      )}
      {bits.map((b, i) =>
        b.kind < 0.45 ? (
          <GrassClump
            key={i}
            x={b.x}
            y={b.y}
            s={b.s}
            dark={C.fern}
            light={C.fernLight}
            seed={b.seed}
          />
        ) : b.kind < 0.6 ? (
          <g key={i}>
            <Flower x={b.x} y={b.y} s={b.s} color={C.flowers[i % 3]!} />
            <Flower
              x={b.x + 9 * b.s}
              y={b.y + 3 * b.s}
              s={b.s * 0.8}
              color={C.flowers[(i + 1) % 3]!}
            />
          </g>
        ) : b.kind < 0.72 ? (
          <Frond
            key={i}
            x={b.x}
            y={b.y}
            s={b.s * 0.7}
            flip={i % 2 ? 1 : -1}
            dark={C.fern}
            light={C.fernLight}
          />
        ) : b.kind < 0.82 ? (
          <LeafLitter
            key={i}
            x={b.x}
            y={b.y}
            s={b.s}
            seed={b.seed}
            colors={LITTER}
            count={4}
            spread={18}
          />
        ) : b.kind < 0.92 ? (
          <MossRock
            key={i}
            x={b.x}
            y={b.y}
            s={b.s * 0.6}
            rock="#7a7c70"
            moss={C.moss}
            seed={b.seed}
          />
        ) : (
          <Mushrooms key={i} x={b.x} y={b.y} s={b.s * 0.55} cap={C.mushroom} />
        ),
      )}
    </g>
  );
}

/**
 * Big dark leaves right in front of the camera at the bottom corners, with veins and a lit
 * edge. They slide past faster than the ground (a quicker parallax), which makes the scene deep.
 */
export function PaintedFront({ height, k }: P) {
  const leaf = (rot: number, len: number, fill: string, edge: string) => (
    <g transform={`rotate(${rot})`}>
      <path
        d={`M0 0 Q${len * 0.35} ${-len * 0.24} ${len} 0 Q${len * 0.35} ${len * 0.24} 0 0 Z`}
        fill={fill}
      />
      <path
        d={`M0 0 Q${len * 0.35} ${-len * 0.24} ${len} 0`}
        stroke={edge}
        strokeWidth={3}
        fill="none"
        opacity={0.7}
      />
      <path d={`M4 0 L${len * 0.92} 0`} stroke={edge} strokeWidth={1.6} opacity={0.5} />
      {[0.3, 0.5, 0.7].map((f) => (
        <path
          key={f}
          d={`M${len * f} 0 l${len * 0.1} ${-len * 0.09} M${len * f} 0 l${len * 0.1} ${len * 0.09}`}
          stroke={edge}
          strokeWidth={1.1}
          opacity={0.4}
        />
      ))}
    </g>
  );
  return (
    <g>
      {[
        { x: 60, s: 1.15, flip: 1 },
        { x: 1190, s: 0.95, flip: -1 },
      ].map((c, i) => (
        <g
          key={i}
          transform={`translate(${c.x} ${height + 8}) scale(${c.s * c.flip * k} ${c.s * k})`}
        >
          {leaf(-122, 150, '#0b2418', '#24543a')}
          {leaf(-92, 170, '#0f2c1d', '#2b6040')}
          {leaf(-58, 140, '#0b2418', '#24543a')}
          {leaf(-30, 120, '#0e281b', '#24543a')}
          {leaf(-150, 100, '#0e281b', '#1f4a33')}
          {[-12, -4, 6, 14].map((bx, j) => (
            <path
              key={j}
              d={`M${bx} 0 Q${bx + 4} -40 ${bx + 14 - j * 6} ${-70 - j * 8} Q${bx + 6} -36 ${bx + 5} 0 Z`}
              fill={j % 2 ? '#123222' : '#0c2619'}
            />
          ))}
        </g>
      ))}
    </g>
  );
}
