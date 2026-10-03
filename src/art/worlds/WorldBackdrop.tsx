import { useId, useMemo, type ReactNode } from 'react';
import { getWorldArt } from './registry';
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
  const art = getWorldArt(worldId);
  const { theme } = art;
  const skyId = useId();
  const layers = useMemo(
    () => art.layers({ horizon, groundTop, height, pathY, k: detail, seed: worldId }),
    [art, horizon, groundTop, height, pathY, detail, worldId],
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
      <Layer offset={scroll * speed.clouds} className={art.drift ? 'backdrop__clouds' : undefined}>
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
        {/* Overlap by 1px so no hairline shows where the tiles meet. */}
        <g transform={`translate(${W - 1} 0)`}>{children}</g>
      </g>
    </g>
  );
}
