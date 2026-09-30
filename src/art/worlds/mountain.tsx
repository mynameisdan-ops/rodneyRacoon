import { useMemo } from 'react';
import { createRng } from '../../game/rng';
import { ink, shade, tint } from '../style';
import { Clouds, Ground, Path, Stone } from './scenery';
import { ridgeLine, ridgePath, useGroundBits, useSpots, W, type LayerProps } from './sceneryKit';
import type { MountainTheme } from './themes';

/*
 * The Misty Mountains backdrop layers: hazy snow-capped peaks, nearer rocky slopes
 * with snowy pines, and a snowfield with a stony path.
 */

type P = LayerProps<MountainTheme>;

export function MountainClouds({ theme, horizon, k, seed }: P) {
  return <Clouds color={theme.cloud} horizon={horizon} k={k} seed={seed} count={4} />;
}

/** Tall peaks with snowcaps, fading into the haze. */
export function MountainFar({ theme, horizon, height, k, seed }: P) {
  const peaks = useMemo(() => {
    const rng = createRng(seed * 131);
    return Array.from({ length: 5 }, (_, i) => ({
      x: 140 + i * 250 + rng.int(-40, 40),
      h: rng.int(150, 250) * k,
      w: rng.int(170, 240) * k,
    }));
  }, [seed, k]);
  return (
    <g>
      <rect x={0} y={horizon - 2} width={W} height={height - horizon + 2} fill={theme.peakFar} />
      {peaks.map((p, i) => {
        const top = horizon - p.h;
        const cap = 0.32;
        return (
          <g key={i}>
            <path
              d={`M${p.x - p.w} ${horizon} L${p.x} ${top} L${p.x + p.w} ${horizon} Z`}
              fill={theme.peakFar}
            />
            <path
              d={`M${p.x} ${top} L${p.x + p.w} ${horizon} L${p.x + p.w * 0.2} ${horizon} Z`}
              fill={shade(theme.peakFar, 0.12)}
            />
            <path
              d={`M${p.x - p.w * cap} ${top + p.h * cap} L${p.x} ${top} L${p.x + p.w * cap} ${top + p.h * cap} L${p.x + p.w * 0.12} ${top + p.h * 0.26} L${p.x - p.w * 0.05} ${top + p.h * 0.34} L${p.x - p.w * 0.16} ${top + p.h * 0.27} Z`}
              fill={theme.snow}
              opacity={0.9}
            />
          </g>
        );
      })}
    </g>
  );
}

/** Nearer rocky slopes with snowy pines. */
export function MountainMid({ theme, horizon, groundTop, height, k, seed }: P) {
  const base = horizon + (groundTop - horizon) * 0.5;
  const pines = useSpots(seed * 211, 9, 40);
  return (
    <g>
      <path d={ridgePath(seed * 13, base - 40 * k, 60 * k, 200, height)} fill={theme.peakMid} />
      <path
        d={ridgeLine(seed * 13, base - 40 * k, 60 * k, 200, height)}
        fill="none"
        stroke={shade(theme.peakMid, 0.35)}
        strokeWidth={2 * k}
      />
      <path
        d={ridgePath(seed * 19, base, 14 * k, 120, height, true)}
        fill={tint(theme.peakMid, 0.55)}
      />
      {pines.map((p, i) => {
        const s = (0.6 + p.r * 0.6) * k;
        return (
          <g
            key={i}
            transform={`translate(${p.x} ${base + 6 * k}) scale(${s})`}
            {...ink(2 / Math.max(s, 0.3))}
          >
            <rect x={-4} y={-12} width={8} height={14} fill="#6b4a32" />
            <path d="M-26 -10 L0 -48 L26 -10 Z" fill={theme.pine} />
            <path d="M-20 -34 L0 -74 L20 -34 Z" fill={theme.pine} />
            <path d="M-8 -60 L0 -74 L8 -60 L2 -56 Z" fill={theme.snow} stroke="none" />
            <path
              d="M-20 -34 L-8 -40 L4 -34 L20 -34"
              fill="none"
              stroke={theme.snow}
              strokeWidth={4}
            />
          </g>
        );
      })}
    </g>
  );
}

/** The snowfield: drifts, snow-topped rocks and the stony path. */
export function MountainNear({ theme, groundTop, height, pathY, k, seed }: P) {
  const bits = useGroundBits(seed * 307, groundTop, height, pathY, k, 5);
  return (
    <g>
      <Ground
        groundTop={groundTop}
        height={height}
        k={k}
        color={theme.ground}
        light={theme.groundLight}
      />
      {pathY !== undefined && <Path y={pathY} k={k} color={theme.path} edge={theme.pathEdge} />}
      {bits.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
          {b.kind < 0.5 ? (
            <path d="M-30 0 Q-16 -12 0 -8 Q14 -16 30 0 Z" fill={shade(theme.ground, 0.08)} />
          ) : (
            <g>
              <Stone color={theme.rock} big={b.kind > 0.8} />
              <path
                d={
                  b.kind > 0.8
                    ? 'M-14 -12 L-2 -18 L12 -14 L6 -11 L-6 -12 Z'
                    : 'M-6 -8 L4 -9 L1 -7 Z'
                }
                fill={theme.snow}
              />
            </g>
          )}
        </g>
      ))}
    </g>
  );
}
