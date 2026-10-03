import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
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
  /**
   * Draw each layer once as an image and slide the images: far cheaper to move than the shapes,
   * which matters for painted layers full of gradients (cut scenes and the page strip).
   */
  raster?: boolean;
  /** Draw the layer in front of the hero (cut scenes; it would hide the page strip's trail). */
  foreground?: boolean;
  children?: ReactNode;
}

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
  const art = getWorldArt(worldId);
  const { theme, sky: paintedSky } = art;
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
        {paintedSky ? (
          <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={paintedSky.top} />
            <stop offset={Math.min(1, horizon / height) * 0.7} stopColor={paintedSky.mid} />
            <stop offset={Math.min(1, groundTop / height)} stopColor={paintedSky.bottom} />
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
        className={art.drift ? 'backdrop__clouds' : undefined}
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
