import { useMemo } from 'react';
import { createRng } from '../../game/rng';
import { INK, ink, shade, tint } from '../style';
import type { MineTheme } from './themes';

/*
 * The Old Mine Shaft backdrop layers, each a 1280px tile (see WorldBackdrop).
 * Depth comes from haze: far layers are flat and hazy, the mid layer gets thin
 * outlines, and the near layer gets full ink outlines like the hero.
 */

const W = 1280;

export interface MineLayerProps {
  theme: MineTheme;
  horizon: number;
  groundTop: number;
  height: number;
  pathY?: number;
  /** Size of details relative to the full-screen scene. */
  k: number;
  seed: number;
}

/** How far the rock ceiling hangs down. */
const ceilingDepth = (horizon: number) => Math.max(20, horizon * 0.28);

/** A soft light: stacked translucent circles (cheaper than a blur filter). */
function Glow({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return (
    <g fill={color}>
      <circle cx={x} cy={y} r={r} opacity={0.07} />
      <circle cx={x} cy={y} r={r * 0.62} opacity={0.09} />
      <circle cx={x} cy={y} r={r * 0.34} opacity={0.14} />
    </g>
  );
}

/** The jagged rock ceiling with stalactites (uses the slow "clouds" parallax slot). */
export function MineCeiling({ theme, horizon, k, seed }: MineLayerProps) {
  const depth = ceilingDepth(horizon);
  const d = useMemo(() => {
    const rng = createRng(seed * 101);
    let path = `M0 0 H${W} V${depth}`;
    // Right to left along the bottom edge, ending at the same depth it started (tiles seamlessly).
    for (let x = W - 40; x > 0; x -= 40) {
      const drop = rng.next() < 0.22 ? rng.int(24, 60) * k : 0;
      const y = depth + rng.int(-8, 8) * k;
      path += drop ? ` L${x + 12} ${y} L${x} ${y + drop} L${x - 12} ${y}` : ` L${x} ${y}`;
    }
    return `${path} L0 ${depth} Z`;
  }, [depth, k, seed]);
  return (
    <g>
      <path d={d} fill={theme.rockMid} stroke={shade(theme.rockMid, 0.5)} strokeWidth={2 * k} />
      <path
        d={`M0 ${depth * 0.45} Q ${W / 4} ${depth * 0.6} ${W / 2} ${depth * 0.42} T ${W} ${depth * 0.45}`}
        fill="none"
        stroke={tint(theme.rockMid, 0.12)}
        strokeWidth={3 * k}
        opacity={0.5}
      />
    </g>
  );
}

/** Far cavern: hazy rock formations, distant scaffolds and lantern lights. */
export function MineFar({ theme, horizon, height, k, seed }: MineLayerProps) {
  const h = horizon;
  const bits = useMemo(() => {
    const rng = createRng(seed * 131);
    return Array.from({ length: 5 }, (_, i) => ({
      x: i * 256 + rng.int(40, 200),
      y: h - rng.int(20, 60) * k,
    }));
  }, [h, k, seed]);
  return (
    <g>
      <path
        d={`M0 ${h} L 70 ${h - 70 * k} L 130 ${h - 40 * k} L 210 ${h - 110 * k} L 260 ${h - 30 * k} L 400 ${h - 60 * k} L 470 ${h - 20 * k} L 610 ${h - 95 * k} L 690 ${h - 50 * k} L 820 ${h - 80 * k} L 900 ${h - 25 * k} L 1010 ${h - 120 * k} L 1080 ${h - 55 * k} L 1190 ${h - 75 * k} L ${W} ${h} V ${height} H 0 Z`}
        fill={theme.rockFar}
      />
      {/* Distant scaffolding. */}
      <g stroke={shade(theme.rockFar, 0.35)} strokeWidth={3 * k} fill="none">
        <path
          d={`M 330 ${h} V ${h - 90 * k} M 380 ${h} V ${h - 90 * k} M 325 ${h - 90 * k} H 385 M 330 ${h - 45 * k} L 380 ${h - 90 * k}`}
        />
        <path
          d={`M 930 ${h} V ${h - 70 * k} M 970 ${h} V ${h - 70 * k} M 925 ${h - 70 * k} H 975`}
        />
      </g>
      {bits.map((b, i) => (
        <g key={i}>
          <Glow x={b.x} y={b.y} r={26 * k} color={theme.lantern} />
          <circle cx={b.x} cy={b.y} r={3 * k} fill={theme.lantern} />
        </g>
      ))}
    </g>
  );
}

/** Mid layer: the tunnel wall with timber frames, hanging lanterns and crystals. */
export function MineMid({ theme, horizon, groundTop, height, k, seed }: MineLayerProps) {
  const top = ceilingDepth(horizon);
  const base = horizon + (groundTop - horizon) * 0.35;
  const frames = useMemo(() => {
    const rng = createRng(seed * 211);
    return [160, 480, 800, 1120].map((x) => ({
      x: x + rng.int(-30, 30),
      lantern: rng.next() < 0.75,
      crystal: rng.pick(theme.crystals),
      cx: rng.int(60, 200),
    }));
  }, [seed, theme.crystals]);
  const line = { stroke: shade(theme.rockMid, 0.55), strokeWidth: 2 * k };
  const postW = 18 * k;
  return (
    <g>
      <path
        d={`M0 ${base} Q 200 ${base - 24 * k} 420 ${base - 6 * k} T 860 ${base - 10 * k} T ${W} ${base} V ${height} H 0 Z`}
        fill={theme.rockMid}
      />
      {frames.map((f, i) => {
        const beamY = top + 6 * k;
        const lanternY = beamY + 34 * k;
        return (
          <g key={i}>
            {f.lantern && <Glow x={f.x} y={lanternY} r={120 * k} color={theme.lantern} />}
            {/* A crystal cluster on the wall beside the frame. */}
            <g transform={`translate(${f.x + f.cx} ${groundTop + 4 * k}) scale(${k})`}>
              <Glow x={0} y={-30} r={56} color={f.crystal} />
              <path d="M-26 0 L-20 -38 L-10 0 Z" fill={shade(f.crystal, 0.2)} {...line} />
              <path d="M-12 0 L0 -62 L12 0 Z" fill={f.crystal} {...line} />
              <path d="M0 -62 L12 0 L4 0 Z" fill={shade(f.crystal, 0.3)} />
              <path d="M8 0 L20 -30 L26 0 Z" fill={tint(f.crystal, 0.2)} {...line} />
            </g>
            {/* Timber frame: two posts and a beam under the ceiling. */}
            <g fill={shade(theme.timber, 0.25)} {...line}>
              <rect x={f.x - 90 * k} y={beamY} width={postW} height={groundTop - beamY + 8 * k} />
              <rect x={f.x + 72 * k} y={beamY} width={postW} height={groundTop - beamY + 8 * k} />
              <rect x={f.x - 104 * k} y={beamY - 4 * k} width={208 * k} height={16 * k} />
            </g>
            {f.lantern && (
              <g transform={`translate(${f.x} ${lanternY}) scale(${k})`}>
                <path d="M0 -26 V -12" stroke={INK} strokeWidth={2} />
                <rect
                  x={-8}
                  y={-12}
                  width={16}
                  height={20}
                  rx={3}
                  fill={theme.lantern}
                  {...ink(2)}
                />
                <path d="M-8 -2 H8 M0 -12 V8" stroke={INK} strokeWidth={1.5} />
                <path d="M-10 -12 H10 L6 -17 H-6 Z" fill="#3a2a22" {...ink(2)} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Near layer: the tunnel floor, loose rocks and (with `pathY`) the mine-cart rails. */
export function MineNear({ theme, groundTop, height, pathY, k, seed }: MineLayerProps) {
  const rocks = useMemo(() => {
    const rng = createRng(seed * 307);
    const count = Math.round(((height - groundTop) / 60) * 6);
    return Array.from({ length: count }, () => {
      let y = rng.int(groundTop + 14, height - 6);
      if (pathY !== undefined && Math.abs(y - pathY) < 26 * k) y = pathY + 32 * k;
      return { x: rng.int(0, W), y, s: (0.6 + rng.next() * 0.8) * k, big: rng.next() < 0.3 };
    });
  }, [groundTop, height, pathY, k, seed]);

  const g = groundTop;
  return (
    <g>
      <path
        d={`M0 ${g} Q 320 ${g - 12 * k} 640 ${g} T ${W} ${g} V ${height} H 0 Z`}
        fill={theme.ground}
      />
      <path
        d={`M0 ${g} Q 320 ${g - 12 * k} 640 ${g} T ${W} ${g} V ${g + 7 * k} Q 960 ${g} 640 ${g + 7 * k} T 0 ${g + 7 * k} Z`}
        fill={theme.groundLight}
      />
      {rocks.map((r, i) => (
        <g key={i} transform={`translate(${r.x} ${r.y}) scale(${r.s})`}>
          <path
            d={r.big ? 'M-18 0 L-14 -12 L-2 -18 L12 -14 L18 0 Z' : 'M-9 0 L-6 -8 L4 -9 L9 0 Z'}
            fill={theme.rockNear}
            {...ink(2.5)}
          />
          <path
            d={r.big ? 'M-14 -12 L-2 -18 L2 -8 Z' : 'M-6 -8 L4 -9 L0 -4 Z'}
            fill={tint(theme.rockNear, 0.2)}
          />
        </g>
      ))}
      {pathY !== undefined && <Rails theme={theme} y={pathY} k={k} />}
    </g>
  );
}

/** Side view of the track: sleepers in the dirt and a steel rail whose top is at `y`. */
function Rails({ theme, y, k }: { theme: MineTheme; y: number; k: number }) {
  const ties = Array.from({ length: 32 }, (_, i) => i * 40 + 6);
  return (
    <g>
      <rect x={0} y={y - 2 * k} width={W} height={12 * k} fill={shade(theme.ground, 0.3)} />
      {ties.map((x) => (
        <rect
          key={x}
          x={x}
          y={y - 1 * k}
          width={26 * k}
          height={11 * k}
          rx={2 * k}
          fill={theme.timber}
          {...ink(2 * k)}
        />
      ))}
      {/* Overhangs the tile so its outline has no seams where tiles meet. */}
      <rect x={-10} y={y - 9 * k} width={W + 20} height={8 * k} fill={theme.rail} {...ink(2 * k)} />
      <rect x={0} y={y - 8 * k} width={W} height={2 * k} fill={tint(theme.rail, 0.6)} />
    </g>
  );
}
