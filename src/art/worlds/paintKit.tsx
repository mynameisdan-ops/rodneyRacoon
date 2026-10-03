import { useMemo } from 'react';
import { createRng } from '../../game/rng';
import { shade, tint } from '../style';

/*
 * Painted-background kit (M7b): detailed, deterministic pieces for the painted worlds. Each piece
 * is drawn around a point and sized by `s`, with its randomness from `seed`, so a tile always
 * draws the same way. No outlines: backgrounds are painted; only the hero and his props are lined.
 * Painted layers are drawn once as images (WorldBackdrop `raster`), so detail costs nothing per
 * frame.
 */

/** An almond-shaped leaf pointing right from (0, 0), about 10 long. */
export const LEAF = 'M0 0 Q4 -4.6 10 0 Q4 4.6 0 0 Z';

export interface Foliage {
  dark: string;
  base: string;
  light: string;
  rim: string;
}

/**
 * A clump of foliage: overlapping lobes in three values (shadowed underneath, lit on top) with
 * single leaves around its edge, so it reads as leaves rather than a blob.
 */
export function LeafCluster({
  x,
  y,
  r,
  c,
  seed,
}: {
  x: number;
  y: number;
  r: number;
  c: Foliage;
  seed: number;
}) {
  const parts = useMemo(() => {
    const rng = createRng(seed);
    const lobes = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + rng.next() * 0.6;
      const d = r * (0.25 + rng.next() * 0.35);
      return {
        x: Math.cos(a) * d * 1.25,
        y: Math.sin(a) * d * 0.75,
        r: r * (0.48 + rng.next() * 0.25),
      };
    });
    const leaves = Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2 + rng.next() * 0.3;
      return {
        x: Math.cos(a) * r * 1.02,
        y: Math.sin(a) * r * 0.78,
        rot: (a * 180) / Math.PI + (rng.next() - 0.5) * 50,
        s: (0.7 + rng.next() * 0.6) * (r / 30),
        lit: Math.sin(a) < -0.1 && Math.cos(a) > -0.4,
      };
    });
    return { lobes, leaves };
  }, [r, seed]);
  return (
    <g transform={`translate(${x} ${y})`}>
      <g fill={c.dark}>
        {parts.leaves
          .filter((l) => !l.lit)
          .map((l, i) => (
            <path
              key={i}
              d={LEAF}
              transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s})`}
            />
          ))}
        {parts.lobes.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y + r * 0.14} r={b.r} />
        ))}
      </g>
      <g fill={c.base}>
        {parts.lobes.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r * 0.9} />
        ))}
      </g>
      <g fill={c.light}>
        {parts.lobes.slice(0, 4).map((b, i) => (
          <circle key={i} cx={b.x + b.r * 0.22} cy={b.y - b.r * 0.32} r={b.r * 0.5} />
        ))}
        {parts.leaves
          .filter((l) => l.lit)
          .map((l, i) => (
            <path
              key={i}
              d={LEAF}
              transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s})`}
            />
          ))}
      </g>
      <g fill={c.rim} opacity={0.75}>
        {parts.lobes.slice(0, 3).map((b, i) => (
          <path
            key={i}
            d={LEAF}
            transform={`translate(${b.x + b.r * 0.1} ${b.y - b.r * 0.62}) rotate(-20) scale(${r / 34})`}
          />
        ))}
      </g>
    </g>
  );
}

/** A clump of grass blades rising from (x, y), two-toned, leaning a little each way. */
export function GrassClump({
  x,
  y,
  s,
  dark,
  light,
  seed,
  blades = 7,
}: {
  x: number;
  y: number;
  s: number;
  dark: string;
  light: string;
  seed: number;
  blades?: number;
}) {
  const paths = useMemo(() => {
    const rng = createRng(seed);
    return Array.from({ length: blades }, (_, i) => {
      const x0 = (i - blades / 2) * 3.2 + rng.next() * 2;
      const h = 14 + rng.next() * 16;
      const lean = (rng.next() - 0.5) * 14 + (i - blades / 2) * 1.4;
      const w = 2.4 + rng.next() * 1.4;
      return {
        d: `M${x0} 0 Q${x0 + lean * 0.3} ${-h * 0.6} ${x0 + lean} ${-h} Q${x0 + lean * 0.4 + w} ${-h * 0.5} ${x0 + w} 0 Z`,
        lit: rng.next() < 0.45,
      };
    });
  }, [seed, blades]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.lit ? light : dark} />
      ))}
    </g>
  );
}

/** A fern frond curling up and over from (x, y), with leaflets that shrink toward its tip. */
export function Frond({
  x,
  y,
  s,
  flip = 1,
  dark,
  light,
}: {
  x: number;
  y: number;
  s: number;
  flip?: 1 | -1;
  dark: string;
  light: string;
}) {
  const leaflets = Array.from({ length: 9 }, (_, i) => {
    const p = (i + 1) / 10;
    // Along the curve M0 0 Q14 -46 46 -52.
    const px = 2 * (1 - p) * p * 14 + p * p * 46;
    const py = 2 * (1 - p) * p * -46 + p * p * -52;
    const size = 1.5 * (1 - p * 0.75);
    const angle = -70 + p * 70;
    return { px, py, size, angle };
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`}>
      <path d="M0 0 Q14 -46 46 -52" stroke={dark} strokeWidth={2.2} fill="none" />
      {leaflets.map((l, i) => (
        <g key={i} transform={`translate(${l.px} ${l.py})`}>
          <path d={LEAF} transform={`rotate(${l.angle - 60}) scale(${l.size})`} fill={dark} />
          <path d={LEAF} transform={`rotate(${l.angle + 70}) scale(${l.size})`} fill={light} />
        </g>
      ))}
    </g>
  );
}

/** A rock resting at (x, y) with a lit face, a shadowed side, a crack and (if given) a cap of moss. */
export function MossRock({
  x,
  y,
  s,
  rock,
  moss,
  seed,
}: {
  x: number;
  y: number;
  s: number;
  rock: string;
  moss?: string;
  seed: number;
}) {
  const r = createRng(seed);
  const w = 26 + r.next() * 14;
  const h = 16 + r.next() * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={2} cy={1} rx={w * 1.05} ry={4} fill="rgba(10,20,10,0.25)" />
      <path
        d={`M${-w} 0 Q${-w * 1.02} ${-h * 0.8} ${-w * 0.35} ${-h} Q${w * 0.4} ${-h * 1.15} ${w * 0.9} ${-h * 0.45} Q${w} ${-h * 0.1} ${w} 0 Z`}
        fill={rock}
      />
      <path
        d={`M${w * 0.2} ${-h * 1.05} Q${w * 0.75} ${-h * 0.8} ${w} 0 L${w * 0.35} 0 Q${w * 0.45} ${-h * 0.5} ${w * 0.2} ${-h * 1.05} Z`}
        fill={shade(rock, 0.3)}
      />
      <path
        d={`M${-w * 0.8} ${-h * 0.55} Q${-w * 0.6} ${-h * 0.95} ${-w * 0.2} ${-h * 0.98}`}
        stroke={tint(rock, 0.4)}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${-w * 0.1} ${-h * 0.6} l${w * 0.12} ${h * 0.3} l${-w * 0.05} ${h * 0.25}`}
        stroke={shade(rock, 0.45)}
        strokeWidth={1.6}
        fill="none"
      />
      {moss && (
        <>
          <path
            d={`M${-w * 0.7} ${-h * 0.82} Q${-w * 0.3} ${-h * 1.32} ${w * 0.35} ${-h * 1.08} Q${w * 0.1} ${-h * 0.86} ${-w * 0.2} ${-h * 0.92} Q${-w * 0.5} ${-h * 0.8} ${-w * 0.7} ${-h * 0.82} Z`}
            fill={moss}
          />
          <path
            d={`M${-w * 0.5} ${-h * 1.02} Q${-w * 0.2} ${-h * 1.26} ${w * 0.15} ${-h * 1.12}`}
            stroke={tint(moss, 0.4)}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </g>
  );
}

/** A four-pointed glint of light at (x, y), `r` from its middle to a tip. */
export function Glint({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  const n = r * 0.16;
  return (
    <path
      d={`M${x} ${y - r} Q${x + n} ${y - n} ${x + r} ${y} Q${x + n} ${y + n} ${x} ${y + r} Q${x - n} ${y + n} ${x - r} ${y} Q${x - n} ${y - n} ${x} ${y - r} Z`}
      fill={color}
    />
  );
}

/** A little heap of pebbles around (x, y): each lit on top with a shadow underneath. */
export function Pebbles({
  x,
  y,
  s,
  seed,
  stone,
  count = 5,
}: {
  x: number;
  y: number;
  s: number;
  seed: number;
  stone: string;
  count?: number;
}) {
  const stones = useMemo(() => {
    const rng = createRng(seed);
    return Array.from({ length: count }, () => ({
      x: (rng.next() - 0.5) * 34,
      y: (rng.next() - 0.5) * 6,
      r: 2.4 + rng.next() * 3.6,
      c: rng.next() < 0.5 ? stone : shade(stone, 0.18),
    })).sort((a, b) => a.y - b.y);
  }, [seed, count, stone]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {stones.map((p, i) => (
        <g key={i}>
          <ellipse
            cx={p.x + 0.8}
            cy={p.y + p.r * 0.45}
            rx={p.r * 1.1}
            ry={p.r * 0.4}
            fill="rgba(15,8,12,0.3)"
          />
          <ellipse cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.72} fill={p.c} />
          <ellipse
            cx={p.x - p.r * 0.25}
            cy={p.y - p.r * 0.32}
            rx={p.r * 0.5}
            ry={p.r * 0.26}
            fill={tint(p.c, 0.45)}
          />
        </g>
      ))}
    </g>
  );
}

/** A little five-petal flower on a stem at (x, y). */
export function Flower({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 Q1 -6 0 -12" stroke="#3f8a3a" strokeWidth={2} fill="none" />
      <path d={LEAF} transform="translate(0 -5) rotate(-30) scale(0.6)" fill="#4f9a46" />
      <g fill={color}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse
            key={a}
            cx={0}
            cy={-4.2}
            rx={2.6}
            ry={3.6}
            transform={`translate(0 -14) rotate(${a})`}
          />
        ))}
      </g>
      <circle cx={0} cy={-14} r={2.2} fill="#ffc531" />
      <circle cx={-0.7} cy={-14.7} r={0.8} fill="#fff7cf" />
    </g>
  );
}

/** A scatter of fallen leaves around (x, y) in autumn colors. */
export function LeafLitter({
  x,
  y,
  s,
  seed,
  count = 6,
  spread = 30,
  colors,
}: {
  x: number;
  y: number;
  s: number;
  seed: number;
  count?: number;
  spread?: number;
  colors: readonly string[];
}) {
  const leaves = useMemo(() => {
    const rng = createRng(seed);
    return Array.from({ length: count }, () => ({
      x: (rng.next() - 0.5) * spread * 2,
      y: (rng.next() - 0.5) * spread * 0.4,
      rot: rng.next() * 360,
      color: rng.pick(colors),
      sc: 0.6 + rng.next() * 0.5,
    }));
  }, [seed, count, spread, colors]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {leaves.map((l, i) => (
        <g
          key={i}
          transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.sc}, ${l.sc * 0.55})`}
        >
          <path d={LEAF} fill={l.color} />
          <path d="M0.5 0 L9 0" stroke={shade(l.color, 0.35)} strokeWidth={0.7} />
        </g>
      ))}
    </g>
  );
}

/** Mushrooms in a little group at (x, y): caps with spots, the tallest at the back. */
export function Mushrooms({ x, y, s, cap }: { x: number; y: number; s: number; cap: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[
        [-9, 1, 0.75],
        [7, 0, 1],
        [-1, 3, 0.55],
      ].map(([mx, my, ms], i) => (
        <g key={i} transform={`translate(${mx} ${my}) scale(${ms})`}>
          <path d="M-4 0 Q-5 -9 -3 -14 L3 -14 Q5 -9 4 0 Z" fill="#f3e6cf" />
          <path d="M-4 0 Q-5 -9 -3 -14 L-1 -14 Q-2 -8 -1 0 Z" fill="#d8c6a6" />
          <path d="M-15 -12 Q-14 -30 0 -31 Q14 -30 15 -12 Q0 -15 -15 -12 Z" fill={cap} />
          <path
            d="M-15 -12 Q-14 -30 0 -31 Q-8 -24 -8 -13 Q-12 -12.6 -15 -12 Z"
            fill={shade(cap, 0.25)}
          />
          <ellipse cx={4} cy={-25} rx={6} ry={2.6} fill={tint(cap, 0.35)} opacity={0.7} />
          <circle cx={-4} cy={-22} r={2.6} fill="#fff" />
          <circle cx={6} cy={-18} r={2} fill="#fff" />
          <circle cx={1} cy={-28} r={1.6} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

/**
 * Ivy climbing a trunk from (x, y) up `h` px: a wavy stem with pairs of small leaves.
 */
export function Ivy({ x, y, h, c }: { x: number; y: number; h: number; c: Foliage }) {
  const n = Math.max(3, Math.floor(h / 16));
  return (
    <g>
      <path
        d={`M${x} ${y} ${Array.from({ length: n }, (_, i) => `Q${x + (i % 2 ? 9 : -9)} ${y - (i + 0.5) * (h / n)} ${x} ${y - (i + 1) * (h / n)}`).join(' ')}`}
        stroke={shade(c.dark, 0.2)}
        strokeWidth={2}
        fill="none"
      />
      {Array.from({ length: n * 2 }, (_, i) => {
        const yy = y - (i + 0.5) * (h / (n * 2));
        const side = i % 2 ? 1 : -1;
        return (
          <path
            key={i}
            d={LEAF}
            transform={`translate(${x + side * 3} ${yy}) rotate(${side > 0 ? -25 : 205}) scale(0.9)`}
            fill={i % 3 === 0 ? c.light : c.base}
          />
        );
      })}
    </g>
  );
}

/** Bark: grooves running up a trunk between x0 and x1, darker on the shaded side. */
export function BarkGrooves({
  x0,
  x1,
  top,
  bottom,
  color,
  seed,
}: {
  x0: number;
  x1: number;
  top: number;
  bottom: number;
  color: string;
  seed: number;
}) {
  const grooves = useMemo(() => {
    const rng = createRng(seed);
    const w = x1 - x0;
    return Array.from({ length: Math.max(3, Math.round(w / 9)) }, () => {
      const gx = x0 + w * (0.12 + rng.next() * 0.76);
      const y0 = top + rng.next() * (bottom - top) * 0.6;
      const len = 40 + rng.next() * 120;
      const wob = (rng.next() - 0.5) * 6;
      return {
        d: `M${gx} ${y0} q${wob} ${len * 0.5} ${-wob * 0.4} ${len}`,
        w: 1.6 + rng.next() * 1.6,
      };
    });
  }, [x0, x1, top, bottom, seed]);
  return (
    <g stroke={color} fill="none" strokeLinecap="round" opacity={0.55}>
      {grooves.map((g, i) => (
        <path key={i} d={g.d} strokeWidth={g.w} />
      ))}
    </g>
  );
}
