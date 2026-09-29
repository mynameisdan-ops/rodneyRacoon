/** Positions shared by the mine obstacle art and the cut-scene scripts (local px from the anchor). */

/** Where the cart waits, where it stops at the buffer, and the pit it races over. */
export const CART_RACE = {
  cartRest: 60,
  bufferX: 1650,
  pit: [1000, 1200] as const,
  boulderStart: -350,
  /** The boulder trails the cart by this much while chasing (it shrinks from `start`). */
  gap: { start: 410, end: 300 },
  width: 1760,
};
