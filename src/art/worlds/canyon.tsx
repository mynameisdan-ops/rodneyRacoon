import { useMemo } from 'react';
import { createRng } from '../../game/rng';
import { Glow } from '../fx';
import { ink, shade, tint } from '../style';
import { Ground, Path, Stone } from './scenery';
import { ridgeLine, ridgePath, useGroundBits, useSpots, W, type LayerProps } from './sceneryKit';
import type { CanyonTheme } from './themes';

/*
 * The Canyon to Home backdrop layers: a low warm sun, flat-topped mesas in the
 * haze, striped red cliffs with cacti, and sandy ground.
 */

type P = LayerProps<CanyonTheme>;

/** The big evening sun and a couple of thin clouds (the slow "clouds" slot). */
export function CanyonSky({ theme, horizon, k }: P) {
  const x = 900;
  const y = horizon * 0.55;
  return (
    <g>
      <Glow x={x} y={y} r={200 * k} color={theme.sun} />
      <circle cx={x} cy={y} r={56 * k} fill={theme.sun} />
      <g fill={tint(theme.skyTop, 0.35)} opacity={0.7}>
        <rect x={200} y={horizon * 0.3} width={260 * k} height={8 * k} rx={4 * k} />
        <rect x={260} y={horizon * 0.3 + 14 * k} width={180 * k} height={6 * k} rx={3 * k} />
        <rect x={980} y={horizon * 0.75} width={220 * k} height={7 * k} rx={3.5 * k} />
      </g>
    </g>
  );
}

/** Flat-topped mesas and buttes in the haze. */
export function CanyonFar({ theme, horizon, height, k, seed }: P) {
  const mesas = useMemo(() => {
    const rng = createRng(seed * 131);
    return Array.from({ length: 4 }, (_, i) => ({
      x: 80 + i * 310 + rng.int(-30, 30),
      w: rng.int(120, 220) * k,
      h: rng.int(70, 130) * k,
      butte: rng.next() < 0.4,
    }));
  }, [seed, k]);
  return (
    <g fill={theme.mesaFar}>
      <rect x={0} y={horizon - 2} width={W} height={height - horizon + 2} />
      {mesas.map((m, i) => (
        <g key={i}>
          <path
            d={`M${m.x - 20 * k} ${horizon} L${m.x} ${horizon - m.h} H${m.x + m.w} L${m.x + m.w + 20 * k} ${horizon} Z`}
          />
          <rect
            x={m.x}
            y={horizon - m.h * 0.55}
            width={m.w}
            height={4 * k}
            fill={shade(theme.mesaFar, 0.12)}
          />
          {m.butte && (
            <path
              d={`M${m.x + m.w + 60 * k} ${horizon} L${m.x + m.w + 68 * k} ${horizon - m.h * 1.2} H${m.x + m.w + 96 * k} L${m.x + m.w + 104 * k} ${horizon} Z`}
            />
          )}
        </g>
      ))}
    </g>
  );
}

/** Striped red cliffs with cacti along their foot. */
export function CanyonMid({ theme, horizon, groundTop, height, k, seed }: P) {
  const base = horizon + (groundTop - horizon) * 0.55;
  const cliffTop = base - 70 * k;
  const cacti = useSpots(seed * 211, 5, 60);
  const cliff = ridgePath(seed * 23, cliffTop, 40 * k, 160, height);
  return (
    <g>
      <path d={cliff} fill={theme.cliff} />
      <g stroke={theme.strata} strokeWidth={5 * k} opacity={0.55}>
        <path d={`M0 ${cliffTop + 30 * k} H${W}`} />
        <path d={`M0 ${cliffTop + 52 * k} H${W}`} strokeWidth={3 * k} />
      </g>
      <path
        d={ridgeLine(seed * 23, cliffTop, 40 * k, 160, height)}
        fill="none"
        stroke={shade(theme.cliff, 0.4)}
        strokeWidth={2 * k}
      />
      <path
        d={ridgePath(seed * 29, base, 10 * k, 140, height, true)}
        fill={shade(theme.ground, 0.12)}
      />
      {cacti.map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${base + 6 * k}) scale(${(0.6 + c.r * 0.5) * k})`}>
          <Cactus color={theme.cactus} />
        </g>
      ))}
    </g>
  );
}

/** Sandy ground with scrub, stones and the path. */
export function CanyonNear({ theme, groundTop, height, pathY, k, seed }: P) {
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
          {b.kind < 0.3 ? (
            <g fill={theme.scrub} {...ink(2)}>
              <circle cx={-8} cy={-8} r={9} />
              <circle cx={6} cy={-10} r={11} />
            </g>
          ) : b.kind < 0.45 ? (
            <g transform="scale(0.45)">
              <Cactus color={theme.cactus} />
            </g>
          ) : (
            <Stone color={theme.rock} big={b.kind > 0.85} />
          )}
        </g>
      ))}
    </g>
  );
}

/** A saguaro standing at (0, 0), about 110px tall. */
export function Cactus({ color }: { color: string }) {
  return (
    <g {...ink(3)}>
      <path d="M-30 -40 V-62 Q-30 -70 -22 -70 Q-14 -70 -14 -62 V-52 H-8 V-40 Z" fill={color} />
      <path d="M30 -54 V-78 Q30 -86 22 -86 Q14 -86 14 -78 V-66 H8 V-54 Z" fill={color} />
      <path d="M-12 0 V-96 Q-12 -110 0 -110 Q12 -110 12 -96 V0 Z" fill={color} />
      <path d="M-30 -40 Q-30 -30 -12 -30 V-40 Z M30 -54 Q30 -44 12 -44 V-54 Z" fill={color} />
      <path d="M4 -104 V-4" stroke={shade(color, 0.3)} strokeWidth={3} />
      <path d="M-4 -96 V-12" stroke={tint(color, 0.3)} strokeWidth={2} />
    </g>
  );
}
