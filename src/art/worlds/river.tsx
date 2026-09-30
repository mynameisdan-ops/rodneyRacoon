import { useMemo } from 'react';
import { createRng } from '../../game/rng';
import { ink, shade, tint } from '../style';
import { Clouds, Ground, Path, Stone, Tuft } from './scenery';
import { ridgePath, useGroundBits, useSpots, W, type LayerProps } from './sceneryKit';
import type { RiverTheme } from './themes';

/*
 * The Rushing River backdrop layers: green hills with a far waterfall, the wide
 * river running behind the near bank, and a grassy bank with reeds and a path.
 */

type P = LayerProps<RiverTheme>;

export function RiverClouds({ theme, horizon, k, seed }: P) {
  return <Clouds color={theme.cloud} horizon={horizon} k={k} seed={seed} />;
}

/** Rolling hills with a waterfall spilling down one of them. */
export function RiverFar({ theme, horizon, height, k, seed }: P) {
  const fallX = 760;
  const top = horizon - 90 * k;
  return (
    <g>
      <path
        d={ridgePath(seed * 7, horizon - 30 * k, 50 * k, 180, height, true)}
        fill={theme.hills}
      />
      {/* The far waterfall: a cliff with a white-blue ribbon. */}
      <path
        d={`M${fallX - 70 * k} ${horizon + 10} L${fallX - 50 * k} ${top} L${fallX + 60 * k} ${top - 10 * k} L${fallX + 80 * k} ${horizon + 10} Z`}
        fill={shade(theme.hills, 0.25)}
      />
      <path
        d={`M${fallX - 12 * k} ${top - 4 * k} h ${28 * k} l ${6 * k} ${horizon + 10 - top} h ${-40 * k} Z`}
        fill={theme.foam}
        opacity={0.85}
      />
      <path
        d={`M${fallX - 2 * k} ${top} v ${horizon - top}`}
        stroke={theme.water}
        strokeWidth={3 * k}
        opacity={0.6}
      />
      <path d={ridgePath(seed * 11, horizon, 22 * k, 140, height, true)} fill={theme.hillsNear} />
    </g>
  );
}

/** The river: a band of moving water between the far bank and the near one. */
export function RiverMid({ theme, horizon, groundTop, height, k, seed }: P) {
  const top = horizon + (groundTop - horizon) * 0.35;
  const rocks = useSpots(seed * 41, 4, 100);
  const reeds = useSpots(seed * 43, 8, 30);
  const glints = useMemo(() => {
    const rng = createRng(seed * 47);
    return Array.from({ length: 14 }, () => ({
      x: rng.int(30, W - 90),
      y: top + (groundTop - top + 20 * k) * rng.next(),
      w: rng.int(30, 80) * k,
    }));
  }, [seed, top, groundTop, k]);
  return (
    <g>
      <rect x={0} y={top} width={W} height={height - top} fill={theme.water} />
      <rect x={0} y={top} width={W} height={6 * k} fill={theme.waterDeep} opacity={0.6} />
      <g stroke={theme.foam} strokeWidth={3 * k} strokeLinecap="round" opacity={0.7}>
        {glints.map((g, i) => (
          <path key={i} d={`M${g.x} ${g.y} h ${g.w}`} />
        ))}
      </g>
      {/* Reeds on the far bank. */}
      <g stroke={theme.reed} strokeWidth={3 * k} strokeLinecap="round">
        {reeds.map((r, i) => (
          <g key={i}>
            <path d={`M${r.x} ${top + 2} q ${-4 * k} ${-20 * k} ${2 * k} ${-36 * k}`} fill="none" />
            <path
              d={`M${r.x + 8 * k} ${top + 2} q ${4 * k} ${-16 * k} ${-2 * k} ${-28 * k}`}
              fill="none"
            />
            <ellipse
              cx={r.x + 2 * k}
              cy={top - 34 * k}
              rx={3 * k}
              ry={8 * k}
              fill="#8a5a33"
              stroke="none"
            />
          </g>
        ))}
      </g>
      {rocks.map((r, i) => {
        const y = top + (groundTop - top) * (0.4 + r.r * 0.5);
        return (
          <g key={i} transform={`translate(${r.x} ${y}) scale(${k})`}>
            <path d="M-26 6 Q-20 -18 2 -20 Q24 -18 28 6 Z" fill={theme.rock} {...ink(2.5)} />
            <path d="M-14 -12 Q0 -20 12 -14 L4 -6 Z" fill={tint(theme.rock, 0.3)} />
            <path
              d="M-34 8 q 10 -6 20 0 M16 8 q 10 -6 22 0"
              stroke={theme.foam}
              strokeWidth={3}
              fill="none"
            />
          </g>
        );
      })}
    </g>
  );
}

/** The near bank: grass, reeds, stones, a few flowers and the path. */
export function RiverNear({ theme, groundTop, height, pathY, k, seed }: P) {
  const bits = useGroundBits(seed * 307, groundTop, height, pathY, k);
  return (
    <g>
      <Ground
        groundTop={groundTop}
        height={height}
        k={k}
        color={theme.ground}
        light={theme.groundLight}
      />
      <path
        d={`M0 ${groundTop + 2} Q 320 ${groundTop - 10 * k} 640 ${groundTop + 2} T ${W} ${groundTop + 2}`}
        stroke={shade(theme.ground, 0.35)}
        strokeWidth={3 * k}
        fill="none"
      />
      {pathY !== undefined && <Path y={pathY} k={k} color={theme.path} edge={theme.pathEdge} />}
      {bits.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
          {b.kind < 0.4 ? (
            <Tuft color={theme.reed} />
          ) : b.kind < 0.75 ? (
            <g>
              <path d="M0 0 V -12" stroke="#3f8f45" strokeWidth={2.5} />
              <circle
                cx={0}
                cy={-15}
                r={6}
                fill={theme.flowers[i % theme.flowers.length]}
                {...ink(1.5)}
              />
              <circle cx={0} cy={-15} r={2.4} fill="#f5b700" />
            </g>
          ) : (
            <Stone color={theme.rock} big={b.kind > 0.9} />
          )}
        </g>
      ))}
    </g>
  );
}
