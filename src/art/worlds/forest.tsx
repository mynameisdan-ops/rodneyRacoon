import { useMemo } from 'react';
import { createRng } from '../../game/rng';
import { Glow } from '../fx';
import { ink, shade, tint } from '../style';
import { Ground, Path, Stone, Tuft } from './scenery';
import { ridgePath, useGroundBits, useSpots, W, type LayerProps } from './sceneryKit';
import type { ForestTheme } from './themes';

/*
 * The Whispering Forest backdrop layers. A leafy canopy hangs from the top with
 * shafts of light through it; misty rows of trees stand behind big outlined trunks.
 */

type P = LayerProps<ForestTheme>;

const canopyDepth = (horizon: number) => Math.max(18, horizon * 0.3);

/** The canopy overhead and light shafts (uses the slow "clouds" slot). */
export function ForestCanopy({ theme, horizon, height, k, seed }: P) {
  const depth = canopyDepth(horizon);
  const blobs = useSpots(seed * 17, 14, 0);
  const shafts = useSpots(seed * 29, 4, 120);
  return (
    <g>
      {shafts.map((s, i) => (
        <path
          key={i}
          d={`M${s.x} 0 L${s.x + 60 * k} 0 L${s.x + 260 * k} ${height} L${s.x + 120 * k} ${height} Z`}
          fill={theme.light}
          opacity={0.1 + s.r * 0.08}
        />
      ))}
      <rect x={0} y={0} width={W} height={depth * 0.6} fill={theme.canopy} />
      <g fill={theme.canopy}>
        {blobs.map((b, i) => (
          <circle key={i} cx={b.x} cy={depth * (0.55 + b.r * 0.35)} r={(40 + b.r2 * 40) * k} />
        ))}
        {/* Round the tile ends off at the same height so the tiles join. */}
        <circle cx={0} cy={depth * 0.7} r={46 * k} />
        <circle cx={W} cy={depth * 0.7} r={46 * k} />
      </g>
      <g fill={tint(theme.canopy, 0.12)}>
        {blobs.slice(0, 10).map((b, i) => (
          <circle key={i} cx={b.x + 14 * k} cy={depth * (0.4 + b.r * 0.3)} r={22 * k} />
        ))}
      </g>
      {/* A few hanging vines. */}
      <g stroke={shade(theme.fern, 0.2)} strokeWidth={4 * k} fill="none" strokeLinecap="round">
        {blobs
          .filter((_, i) => i % 4 === 1)
          .map((b, i) => (
            <path
              key={i}
              d={`M${b.x} ${depth * 0.8} q ${10 * k} ${40 * k} ${-4 * k} ${(70 + b.r * 60) * k}`}
            />
          ))}
      </g>
    </g>
  );
}

/** Misty rows of tree silhouettes. */
export function ForestFar({ theme, horizon, height, k, seed }: P) {
  const rows = useMemo(() => {
    const rng = createRng(seed * 131);
    return [0, 1].map((row) => {
      const trees: { x: number; h: number; pine: boolean }[] = [];
      for (let x = 30 + row * 40; x < W - 30; x += rng.int(55, 95)) {
        trees.push({ x, h: rng.int(60, 130) * (1 + row * 0.2), pine: rng.next() < 0.6 });
      }
      return trees;
    });
  }, [seed]);
  return (
    <g>
      {rows.map((trees, row) => {
        const base = horizon + row * 14 * k;
        const fill = row === 0 ? theme.mistFar : theme.mistNear;
        return (
          <g key={row} fill={fill}>
            <rect x={0} y={base - 4} width={W} height={height - base + 4} />
            {trees.map((t, i) =>
              t.pine ? (
                <path
                  key={i}
                  d={`M${t.x - 26 * k} ${base} L${t.x} ${base - t.h * k} L${t.x + 26 * k} ${base} Z`}
                />
              ) : (
                <g key={i}>
                  <rect
                    x={t.x - 4 * k}
                    y={base - t.h * 0.5 * k}
                    width={8 * k}
                    height={t.h * 0.5 * k}
                  />
                  <circle cx={t.x} cy={base - t.h * 0.62 * k} r={t.h * 0.36 * k} />
                </g>
              ),
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Big outlined trunks with roots, mushrooms and fireflies. */
export function ForestMid({ theme, horizon, groundTop, height, k, seed }: P) {
  const base = horizon + (groundTop - horizon) * 0.55;
  const trunks = useSpots(seed * 211, 5, 70);
  const flies = useSpots(seed * 223, 9, 30);
  const line = ink(2 * k);
  return (
    <g>
      <path
        d={ridgePath(seed * 5, base, 8 * k, 160, height, true)}
        fill={shade(theme.ground, 0.25)}
      />
      {trunks.map((t, i) => {
        const w = (34 + t.r * 24) * k;
        const leaf = theme.leaves[i % theme.leaves.length]!;
        return (
          <g key={i}>
            {/* Trunk from above the screen down to the ground, flaring into roots. */}
            <path
              d={`M${t.x - w / 2} -10 L${t.x - w / 2} ${base - 20 * k} Q${t.x - w / 2} ${base} ${t.x - w} ${base + 4 * k} L${t.x + w} ${base + 4 * k} Q${t.x + w / 2} ${base} ${t.x + w / 2} ${base - 20 * k} L${t.x + w / 2} -10 Z`}
              fill={theme.trunk}
              {...line}
            />
            <path
              d={`M${t.x + w * 0.15} -10 L${t.x + w * 0.15} ${base - 10 * k} L${t.x + w / 2} ${base} L${t.x + w / 2} -10 Z`}
              fill={shade(theme.trunk, 0.3)}
            />
            <path
              d={`M${t.x - w * 0.3} ${horizon * 0.5} v ${60 * k} M${t.x - w * 0.1} ${horizon * 0.9} v ${40 * k}`}
              stroke={shade(theme.trunk, 0.45)}
              strokeWidth={3 * k}
              strokeLinecap="round"
            />
            {t.r2 < 0.4 && (
              <ellipse
                cx={t.x - w * 0.05}
                cy={base - 50 * k}
                rx={w * 0.22}
                ry={16 * k}
                fill={shade(theme.trunk, 0.65)}
                {...line}
              />
            )}
            {/* A leafy branch reaching out. */}
            <g transform={`translate(${t.x} ${horizon * 0.6}) scale(${t.r < 0.5 ? -k : k} ${k})`}>
              <path
                d="M0 0 Q40 -6 70 -30"
                stroke={theme.trunk}
                strokeWidth={9}
                fill="none"
                strokeLinecap="round"
              />
              <g fill={leaf} {...ink(2)}>
                <circle cx={62} cy={-40} r={26} />
                <circle cx={92} cy={-30} r={22} />
                <circle cx={78} cy={-58} r={20} />
              </g>
              <circle cx={70} cy={-50} r={10} fill={tint(leaf, 0.2)} />
            </g>
            {/* Mushrooms at the roots. */}
            <g transform={`translate(${t.x + w * 0.9} ${base + 2 * k}) scale(${k})`}>
              <rect x={-4} y={-14} width={8} height={14} rx={3} fill="#f3e6cf" {...ink(2)} />
              <path d="M-14 -12 Q0 -32 14 -12 Z" fill={theme.mushroom} {...ink(2)} />
              <circle cx={-4} cy={-20} r={2.5} fill="#fff" />
              <circle cx={5} cy={-17} r={2} fill="#fff" />
            </g>
          </g>
        );
      })}
      {flies.map((f, i) => (
        <g key={i}>
          <Glow x={f.x} y={horizon * (0.7 + f.r * 0.6)} r={18 * k} color={theme.firefly} />
          <circle cx={f.x} cy={horizon * (0.7 + f.r * 0.6)} r={2.5 * k} fill={theme.firefly} />
        </g>
      ))}
    </g>
  );
}

/** The forest floor: ferns, tufts, stones and the path. */
export function ForestNear({ theme, groundTop, height, pathY, k, seed }: P) {
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
      {pathY !== undefined && <Path y={pathY} k={k} color={theme.path} edge={theme.pathEdge} />}
      {bits.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
          {b.kind < 0.35 ? (
            <Fern color={theme.fern} />
          ) : b.kind < 0.7 ? (
            <Tuft color={theme.fern} />
          ) : (
            <Stone color="#7d7a70" big={b.kind > 0.9} />
          )}
        </g>
      ))}
    </g>
  );
}

function Fern({ color }: { color: string }) {
  return (
    <g fill={color} stroke={shade(color, 0.4)} strokeWidth={1.5}>
      <path d="M0 0 Q-20 -10 -34 -6 Q-18 -20 0 -6 Z" />
      <path d="M0 0 Q20 -12 34 -8 Q16 -24 0 -6 Z" />
      <path d="M0 0 Q-4 -24 4 -34 Q6 -16 2 0 Z" />
    </g>
  );
}
