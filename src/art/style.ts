/**
 * The shared art style kit: a cel-shaded adventure look. Every drawing uses the
 * same ink outline, and shading is done with flat overlay shapes in darker or
 * lighter versions of a base color. No CSS/SVG `filter`: it is slow on tablets.
 */

/** Outline color for every object. */
export const INK = '#1a1220';

/**
 * Line weights for the props he touches in cut scenes, in scene px (M7b): a bold line around the
 * silhouette and thin ones inside it, like the hero's (2.5 and 1.3 view units at his scene size).
 */
export const PROP_OUT = 3.2;
export const PROP_IN = 1.5;

/** The color shadows fall toward (a deep violet, not black, keeps colors rich). */
const SHADOW_TONE = '#1e1030';
/** The color highlights move toward (warm lantern light). */
const LIGHT_TONE = '#fff3d6';

function parse(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) =>
    Math.round(Math.max(0, Math.min(255, v)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Blend two hex colors; `t` = 0 gives `a`, 1 gives `b`. */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

/** The shadow side of a color (amount 0..1). */
export const shade = (color: string, amount = 0.35) => mix(color, SHADOW_TONE, amount);

/** The lit side of a color (amount 0..1). */
export const tint = (color: string, amount = 0.3) => mix(color, LIGHT_TONE, amount);

/** Props for an outlined shape: `<path {...ink(2)} />`. */
export const ink = (width: number) =>
  ({
    stroke: INK,
    strokeWidth: width,
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
  }) as const;
