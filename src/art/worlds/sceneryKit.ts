import { useMemo } from 'react';
import { createRng } from '../../game/rng';

/*
 * Shared helpers for the world backdrops (the mine uses only `LayerProps`).
 * Every layer is a 1280px tile drawn twice side by side (see WorldBackdrop), so
 * ridges start and end at the same height and details stay clear of the edges.
 */

export const W = 1280;

/** What every backdrop layer gets. `k` sizes details (0.55 on the page strip, 1 full screen). */
export interface LayerProps<T> {
  theme: T;
  horizon: number;
  groundTop: number;
  height: number;
  pathY?: number;
  k: number;
  seed: number;
}

/**
 * A closed shape whose top edge is a jagged or rolling ridge around `y` (±`amp`),
 * filled down to `bottom`. It starts and ends at `y`, so tiles join without a seam.
 */
export function ridgePath(
  seed: number,
  y: number,
  amp: number,
  step: number,
  bottom: number,
  smooth = false,
): string {
  const rng = createRng(seed);
  const pts: [number, number][] = [[0, y]];
  for (let x = step; x < W - step / 2; x += step) {
    pts.push([x + rng.int(-step / 4, step / 4), y - amp + rng.next() * amp * 1.6]);
  }
  pts.push([W, y]);
  let d = `M0 ${bottom} L0 ${y}`;
  if (smooth) {
    // Curve through the midpoints, using each point as the control.
    for (let i = 1; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i]!;
      const [x2, y2] = pts[i + 1]!;
      d += ` Q ${x1} ${y1} ${(x1 + x2) / 2} ${(y1 + y2) / 2}`;
    }
    d += ` L${W} ${y}`;
  } else {
    for (const [x, py] of pts.slice(1)) d += ` L${x} ${py}`;
  }
  return `${d} L${W} ${bottom} Z`;
}

/** Just the top edge of a `ridgePath` (for an outline without seams at the tile ends). */
export const ridgeLine = (...args: Parameters<typeof ridgePath>) =>
  ridgePath(...args)
    .replace(/^M0 [\d.-]+ L/, 'M')
    .replace(/ L\d+ [\d.-]+ Z$/, '');

/** Deterministic spots across a tile, kept clear of its edges. */
export function useSpots(seed: number, count: number, margin = 40) {
  return useMemo(() => {
    const rng = createRng(seed);
    const span = (W - 2 * margin) / count;
    return Array.from({ length: count }, (_, i) => ({
      x: margin + span * i + rng.next() * span * 0.8,
      r: rng.next(),
      r2: rng.next(),
    }));
  }, [seed, count, margin]);
}

/** Near-layer spots below the ground line that stay off the path. */
export function useGroundBits(
  seed: number,
  groundTop: number,
  height: number,
  pathY: number | undefined,
  k: number,
  perRow = 7,
) {
  return useMemo(() => {
    const rng = createRng(seed);
    const count = Math.max(4, Math.round(((height - groundTop) / 60) * perRow));
    return Array.from({ length: count }, () => {
      let y = rng.int(groundTop + 14, Math.max(groundTop + 15, height - 6));
      if (pathY !== undefined && Math.abs(y - pathY) < 26 * k) y = pathY + 30 * k;
      return {
        x: rng.int(30, W - 30),
        y,
        s: (0.7 + rng.next() * 0.6) * k,
        kind: rng.next(),
      };
    });
  }, [seed, groundTop, height, pathY, k, perRow]);
}
