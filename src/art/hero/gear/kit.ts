import type { ShopItem } from '../../../content/shop';

/**
 * Shop gear, drawn in the Hero's own 100×170 view units (facing right, feet at y 163), so each
 * piece slots into the paper doll: hats ride on the head, capes replace the default cape, packs
 * sit on his back, and pets stand (or hover) just ahead of him. One file per slot; the item
 * data (names, prices, colors) is in `content/shop.ts`.
 */

/** A shop item of one slot. */
export type Item<S extends ShopItem['slot']> = Extract<ShopItem, { slot: S }>;

/** Outline width for gear, in view units. */
export const LW = 2;
/** A five-point star, centered on (0, 0). */
export const STAR =
  'M0 -5 L1.5 -1.6 L5 -1.5 L2.3 0.9 L3.1 4.6 L0 2.5 L-3.1 4.6 L-2.3 0.9 L-5 -1.5 L-1.5 -1.6 Z';
