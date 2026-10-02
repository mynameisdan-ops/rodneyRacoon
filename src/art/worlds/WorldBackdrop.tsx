import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createRng } from '../../game/rng';
import { CanyonFar, CanyonMid, CanyonNear, CanyonSky } from './canyon';
import { ForestCanopy, ForestFar, ForestFront, ForestMid, ForestNear } from './forest';
import { PAINTED_FOREST } from './forestPalette';
import { MineCeiling, MineFar, MineMid, MineNear } from './mine';
import { MountainClouds, MountainFar, MountainMid, MountainNear } from './mountain';
import { RiverClouds, RiverFar, RiverMid, RiverNear } from './river';
import { getTheme, type OutdoorTheme } from './themes';
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
  /**
   * Draw each layer once as an image and slide the images: far cheaper to move than the shapes,
   * which matters for painted layers full of gradients (cut scenes and the page strip).
   */
  raster?: boolean;
  /** Draw the layer in front of the hero (cut scenes; it would hide the page strip's trail). */
  foreground?: boolean;
  children?: ReactNode;
}

/** Kinds whose top layer is clouds that drift on their own. */
const DRIFTING = new Set(['outdoor', 'river', 'mountain']);

/** Parallax speed of each layer relative to `scroll`. Must keep scroll × factor < 1280. */
const PARALLAX = { clouds: 0.05, far: 0.15, mid: 0.4, near: 1 };
/** The foreground (in front of the hero) slides faster than the ground; it wraps around its tile. */
const FRONT_SPEED = 1.4;

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
  raster = false,
  foreground = false,
  children,
}: Props) {
  const speed = { ...PARALLAX, ...parallax };
  const theme = getTheme(worldId);
  const skyId = useId();
  const layers = useMemo((): Record<'clouds' | 'far' | 'mid' | 'near', ReactNode> & {
    front?: ReactNode;
  } => {
    const base = { horizon, groundTop, height, pathY, k: detail, seed: worldId };
    switch (theme.kind) {
      case 'mine': {
        const p = { ...base, theme };
        return {
          clouds: <MineCeiling {...p} />,
          far: <MineFar {...p} />,
          mid: <MineMid {...p} />,
          near: <MineNear {...p} />,
        };
      }
      case 'forest': {
        const p = { ...base, theme };
        return {
          clouds: <ForestCanopy {...p} />,
          far: <ForestFar {...p} />,
          mid: <ForestMid {...p} />,
          near: <ForestNear {...p} />,
          front: <ForestFront {...p} />,
        };
      }
      case 'river': {
        const p = { ...base, theme };
        return {
          clouds: <RiverClouds {...p} />,
          far: <RiverFar {...p} />,
          mid: <RiverMid {...p} />,
          near: <RiverNear {...p} />,
        };
      }
      case 'mountain': {
        const p = { ...base, theme };
        return {
          clouds: <MountainClouds {...p} />,
          far: <MountainFar {...p} />,
          mid: <MountainMid {...p} />,
          near: <MountainNear {...p} />,
        };
      }
      case 'canyon': {
        const p = { ...base, theme };
        return {
          clouds: <CanyonSky {...p} />,
          far: <CanyonFar {...p} />,
          mid: <CanyonMid {...p} />,
          near: <CanyonNear {...p} />,
        };
      }
    }
    return {
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
    };
  }, [theme, horizon, groundTop, height, pathY, detail, worldId]);
  const paintedSky = theme.kind === 'forest';

  return (
    <svg
      className={smooth ? 'backdrop backdrop--smooth' : 'backdrop'}
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        {paintedSky ? (
          <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={PAINTED_FOREST.skyTop} />
            <stop offset={Math.min(1, horizon / height) * 0.7} stopColor={PAINTED_FOREST.skyMid} />
            <stop offset={Math.min(1, groundTop / height)} stopColor={PAINTED_FOREST.skyBottom} />
          </linearGradient>
        ) : (
          <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={theme.skyTop} />
            <stop offset={Math.min(1, groundTop / height)} stopColor={theme.skyBottom} />
          </linearGradient>
        )}
      </defs>
      <rect width={W} height={height} fill={`url(#${skyId})`} />
      <Layer
        offset={scroll * speed.clouds}
        className={DRIFTING.has(theme.kind) ? 'backdrop__clouds' : undefined}
        raster={raster}
        height={height}
      >
        {layers.clouds}
      </Layer>
      <Layer offset={scroll * speed.far} raster={raster} height={height}>
        {layers.far}
      </Layer>
      <Layer offset={scroll * speed.mid} raster={raster} height={height}>
        {layers.mid}
      </Layer>
      <Layer offset={scroll * speed.near} raster={raster} height={height}>
        {layers.near}
      </Layer>
      {children}
      {foreground && layers.front && (
        <Layer offset={(scroll * FRONT_SPEED) % (W - 1)} raster={raster} height={height}>
          {layers.front}
        </Layer>
      )}
    </svg>
  );
}

function Layer({
  offset,
  className,
  children,
  raster = false,
  height,
}: {
  offset: number;
  className?: string;
  children: ReactNode;
  raster?: boolean;
  height: number;
}) {
  const vector = useRef<SVGGElement>(null);
  const href = useLayerImage(vector, raster, children, height);
  if (raster) {
    return (
      <g className="backdrop__layer" style={{ transform: `translateX(${-offset}px)` }}>
        <g className={className}>
          {href ? (
            <>
              <image href={href} width={W} height={height} />
              <image href={href} x={W - 1} width={W} height={height} />
            </>
          ) : (
            children
          )}
          {/* Kept (hidden) so it can be drawn into the image again when it changes. */}
          <g ref={vector} style={{ display: 'none' }}>
            {children}
          </g>
        </g>
      </g>
    );
  }
  return (
    <g className="backdrop__layer" style={{ transform: `translateX(${-offset}px)` }}>
      <g className={className}>
        {children}
        {/* Overlap by 1px so no hairline shows where the tiles meet. */}
        <g transform={`translate(${W - 1} 0)`}>{children}</g>
      </g>
    </g>
  );
}

/** Serializes a layer's shapes (rendered hidden in `ref`) into an SVG image, as a blob URL. */
function useLayerImage(
  ref: RefObject<SVGGElement | null>,
  on: boolean,
  children: ReactNode,
  height: number,
) {
  const [href, setHref] = useState<string | null>(null);
  useEffect(() => {
    const g = ref.current;
    if (!on || !g) return;
    const inner = [...g.childNodes].map((n) => new XMLSerializer().serializeToString(n)).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}">${inner}</svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    setHref(url);
    return () => URL.revokeObjectURL(url);
  }, [ref, on, children, height]);
  return on ? href : null;
}

function Clouds({
  theme,
  horizon,
  k,
  seed,
}: {
  theme: OutdoorTheme;
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
  theme: OutdoorTheme;
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
  theme: OutdoorTheme;
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
  theme: OutdoorTheme;
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
