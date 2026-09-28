import { useId, useMemo, type ReactNode } from 'react';
import { createRng } from '../../game/rng';
import { getTheme, type WorldTheme } from './themes';
import './backdrop.css';

const W = 1280;

interface Props {
  worldId: number;
  /** Backdrop height in design px (240 for the page strip, 800 for the map). */
  height: number;
  /** y of the far horizon. */
  horizon: number;
  /** y where the near ground starts. */
  groundTop: number;
  /** Optional dirt path along the near ground, centered at this y. */
  pathY?: number;
  /** How far the camera has moved right, in px. Layers move at different speeds (parallax). */
  scroll?: number;
  /** Size of trees and flowers relative to the full-screen map. */
  detail?: number;
  /** Override layer speeds, e.g. `{ near: 0 }` to keep the ground still. */
  parallax?: Partial<typeof PARALLAX>;
  /** Ease scroll changes (page strip). Turn off when the camera moves every frame (cut scenes). */
  smooth?: boolean;
  children?: ReactNode;
}

/** Parallax speed of each layer relative to `scroll`. Must keep scroll × factor < 1280. */
const PARALLAX = { clouds: 0.05, far: 0.15, mid: 0.4, near: 1 };

/**
 * A world's layered background. Each layer is a 1280px-wide tile drawn twice
 * side by side so it can slide left as the hero walks.
 */
export function WorldBackdrop({
  worldId,
  height,
  horizon,
  groundTop,
  pathY,
  scroll = 0,
  detail = 1,
  parallax,
  smooth = true,
  children,
}: Props) {
  const speed = { ...PARALLAX, ...parallax };
  const theme = getTheme(worldId);
  const skyId = useId();
  const layers = useMemo(
    () => ({
      clouds: <Clouds theme={theme} horizon={horizon} k={detail} seed={worldId} />,
      far: <FarHills theme={theme} horizon={horizon} height={height} />,
      mid: (
        <MidLayer
          theme={theme}
          horizon={horizon}
          groundTop={groundTop}
          height={height}
          k={detail}
          seed={worldId}
        />
      ),
      near: (
        <NearLayer
          theme={theme}
          groundTop={groundTop}
          height={height}
          pathY={pathY}
          k={detail}
          seed={worldId}
        />
      ),
    }),
    [theme, horizon, groundTop, height, pathY, detail, worldId],
  );

  return (
    <svg
      className={smooth ? 'backdrop backdrop--smooth' : 'backdrop'}
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={theme.skyTop} />
          <stop offset={Math.min(1, groundTop / height)} stopColor={theme.skyBottom} />
        </linearGradient>
      </defs>
      <rect width={W} height={height} fill={`url(#${skyId})`} />
      <Layer offset={scroll * speed.clouds} className="backdrop__clouds">
        {layers.clouds}
      </Layer>
      <Layer offset={scroll * speed.far}>{layers.far}</Layer>
      <Layer offset={scroll * speed.mid}>{layers.mid}</Layer>
      <Layer offset={scroll * speed.near}>{layers.near}</Layer>
      {children}
    </svg>
  );
}

function Layer({
  offset,
  className,
  children,
}: {
  offset: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <g className="backdrop__layer" style={{ transform: `translateX(${-offset}px)` }}>
      <g className={className}>
        {children}
        <g transform={`translate(${W} 0)`}>{children}</g>
      </g>
    </g>
  );
}

function Clouds({
  theme,
  horizon,
  k,
  seed,
}: {
  theme: WorldTheme;
  horizon: number;
  k: number;
  seed: number;
}) {
  const clouds = useMemo(() => {
    const rng = createRng(seed * 101);
    return Array.from({ length: 5 }, (_, i) => ({
      x: i * 256 + rng.int(20, 180),
      y: rng.int(Math.round(horizon * 0.12), Math.round(horizon * 0.55)),
      s: (0.7 + rng.next() * 0.6) * k,
    }));
  }, [horizon, k, seed]);
  return (
    <g fill={theme.cloud} opacity={0.92}>
      {clouds.map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.s})`}>
          <ellipse cx={0} cy={0} rx={60} ry={20} />
          <circle cx={-22} cy={-12} r={22} />
          <circle cx={12} cy={-20} r={28} />
          <circle cx={40} cy={-6} r={18} />
        </g>
      ))}
    </g>
  );
}

function FarHills({
  theme,
  horizon,
  height,
}: {
  theme: WorldTheme;
  horizon: number;
  height: number;
}) {
  const h = horizon;
  return (
    <path
      d={`M0 ${h} Q 160 ${h - 70} 320 ${h - 25} T 640 ${h - 30} T 960 ${h - 45} T ${W} ${h} V ${height} H 0 Z`}
      fill={theme.far}
    />
  );
}

function MidLayer({
  theme,
  horizon,
  groundTop,
  height,
  k,
  seed,
}: {
  theme: WorldTheme;
  horizon: number;
  groundTop: number;
  height: number;
  k: number;
  seed: number;
}) {
  const base = horizon + (groundTop - horizon) * 0.55;
  const trees = useMemo(() => {
    const rng = createRng(seed * 211);
    const out: { x: number; y: number; s: number; leaf: string; bush: boolean }[] = [];
    for (let x = 30; x < W - 20; x += rng.int(90, 190)) {
      out.push({
        x,
        y: base + rng.int(-6, 10) * k,
        s: (0.75 + rng.next() * 0.5) * k,
        leaf: rng.pick(theme.leaves),
        bush: rng.next() < 0.35,
      });
    }
    return out;
  }, [base, k, seed, theme.leaves]);

  return (
    <g>
      <path
        d={`M0 ${base} Q 200 ${base - 30} 420 ${base - 8} T 860 ${base - 12} T ${W} ${base} V ${height} H 0 Z`}
        fill={theme.mid}
      />
      {trees.map((t, i) =>
        t.bush ? (
          <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.s})`} fill={t.leaf}>
            <circle cx={-16} cy={-10} r={14} />
            <circle cx={0} cy={-18} r={18} />
            <circle cx={18} cy={-10} r={14} />
          </g>
        ) : (
          <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.s})`}>
            <rect x={-6} y={-40} width={12} height={42} rx={4} fill={theme.trunk} />
            <circle cx={0} cy={-64} r={34} fill={t.leaf} />
            <circle cx={-22} cy={-46} r={22} fill={t.leaf} />
            <circle cx={22} cy={-48} r={24} fill={t.leaf} />
            <circle cx={-10} cy={-76} r={14} fill="rgba(255,255,255,0.14)" />
          </g>
        ),
      )}
    </g>
  );
}

function NearLayer({
  theme,
  groundTop,
  height,
  pathY,
  k,
  seed,
}: {
  theme: WorldTheme;
  groundTop: number;
  height: number;
  pathY?: number;
  k: number;
  seed: number;
}) {
  const bits = useMemo(() => {
    const rng = createRng(seed * 307);
    const count = Math.round(((height - groundTop) / 60) * 10);
    return Array.from({ length: count }, () => {
      let y = rng.int(groundTop + 12, height - 6);
      // Keep flowers off the path.
      if (pathY !== undefined && Math.abs(y - pathY) < 22 * k) y = pathY + 26 * k;
      return {
        x: rng.int(0, W),
        y,
        flower: rng.next() < 0.45,
        color: rng.pick(theme.flowers),
        s: (0.8 + rng.next() * 0.4) * k,
      };
    });
  }, [groundTop, height, pathY, k, seed, theme.flowers]);

  const g = groundTop;
  return (
    <g>
      <path
        d={`M0 ${g} Q 320 ${g - 14} 640 ${g} T ${W} ${g} V ${height} H 0 Z`}
        fill={theme.ground}
      />
      <path
        d={`M0 ${g} Q 320 ${g - 14} 640 ${g} T ${W} ${g} V ${g + 8} Q 960 ${g - 2} 640 ${g + 8} T 0 ${g + 8} Z`}
        fill={theme.groundLight}
      />
      {pathY !== undefined && (
        <g>
          <rect x={0} y={pathY - 15 * k} width={W} height={30 * k} rx={0} fill={theme.path} />
          <rect
            x={0}
            y={pathY + 11 * k}
            width={W}
            height={4 * k}
            fill={theme.pathEdge}
            opacity={0.6}
          />
          {Array.from({ length: 16 }, (_, i) => (
            <ellipse
              key={i}
              cx={i * 80 + 30}
              cy={pathY + ((i % 3) - 1) * 6 * k}
              rx={5 * k}
              ry={3 * k}
              fill={theme.pathEdge}
            />
          ))}
        </g>
      )}
      {bits.map((b, i) =>
        b.flower ? (
          <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
            <path d="M0 0 V -12" stroke="#3f8f45" strokeWidth={2.5} />
            <circle cx={0} cy={-15} r={6} fill={b.color} />
            <circle cx={0} cy={-15} r={2.4} fill="#f5b700" />
          </g>
        ) : (
          <path
            key={i}
            transform={`translate(${b.x} ${b.y}) scale(${b.s})`}
            d="M-7 0 Q-6 -8 -9 -14 M0 0 Q0 -10 1 -17 M7 0 Q6 -8 10 -13"
            stroke="#3f9d4c"
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        ),
      )}
    </g>
  );
}
