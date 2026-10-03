import type { ShopItem } from '../../../content/shop';

/**
 * Shop gear (M7b), one file per slot. Hats are drawn in the head's own units (around the middle
 * of the skull) and ride inside `Head`, so they turn with it and show in the cut-in close-up;
 * hair above a hat's band is tucked under it (`HAT_LINE` in `layout.ts`). Capes, packs and pets
 * are in the hero's 100×170 view (facing right, feet at y 163): capes replace his default cape,
 * packs sit on his back (the left edge, in his three-quarter view), and pets stand (or hover)
 * just ahead of him. The item data (names, prices, colors) is in `content/shop.ts`.
 */

/** A shop item of one slot. */
export type Item<S extends ShopItem['slot']> = Extract<ShopItem, { slot: S }>;

/** Silhouette and inner line widths, in the hero's view units (as the hero's own). */
export const OUT = 2.5;
export const IN = 1.3;
export const LW = 2.4;
export const BRASS = '#f0c050';
/** A five-point star, centered on (0, 0). */
export const STAR =
  'M0 -5 L1.5 -1.6 L5 -1.5 L2.3 0.9 L3.1 4.6 L0 2.5 L-3.1 4.6 L-2.3 0.9 L-5 -1.5 L-1.5 -1.6 Z';
