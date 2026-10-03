/**
 * Positions shared by the World 1 obstacle art and the cut-scene scripts, in local
 * px from each scene's anchor (x right, y down, the ground line at 0). The scripts
 * in `content/cutscenes/mine.ts` add the anchor to get world x.
 *
 * Riders sit with their feet on the cart floor, `CART_FLOOR` px above the rails.
 */
export const CART_FLOOR = 44;

/** Level 1: a boulder chases the cart, then drops into a pit. */
export const CART_RACE = {
  cartRest: 60,
  bufferX: 1650,
  pit: [1000, 1200] as const,
  boulderStart: -350,
  /** The boulder trails the cart by this much while chasing (it shrinks from `start`). */
  gap: { start: 410, end: 300 },
  width: 1760,
};

/** Level 2: the cart runs up a broken ramp and jumps the gap. */
export const CART_JUMP = {
  cartRest: 120,
  rampStart: 520,
  rampEnd: 640,
  rampHeight: 60,
  gap: [650, 1010] as const,
  stop: 1260,
  width: 1320,
};

/** Level 3: he pushes an ore cart through a cave-in. */
export const WALL_SMASH = {
  cartRest: 100,
  /** He pushes from this far behind the cart's center. */
  pushGap: 90,
  wall: [700, 810] as const,
  width: 900,
};

/** Level 4: rats pour out of a hole; he swings over them on a chain. */
export const RAT_SWARM = {
  pivot: { x: 400, y: -560 },
  /** Chain length from the pivot to his hands. */
  chain: 295,
  /** His hands are this far above his feet in the swing pose. */
  reach: 175,
  hole: 600,
  ratSpeed: 0.55,
  width: 760,
};

/** Level 5: the ledge crumbles; he hops across sinking crystal spires. */
export const CRYSTAL_CAVERN = {
  pit: [20, 640] as const,
  spires: [140, 300, 460] as const,
  /** Spire tops stand this far above the ground. */
  spireTop: 90,
  width: 700,
};

/** Level 6: bats burst out; he slides under a fallen beam. */
export const BAT_STORM = {
  lantern: { x: 100, y: -470 },
  crack: { x: 820, y: -430 },
  beam: [280, 440] as const,
  /** Underside of the beam, px above the ground. */
  beamClear: 155,
  width: 620,
};

/** Level 7: the lift's rope snaps; he climbs the chain to the upper ledge. */
export const RUNAWAY_LIFT = {
  shaft: [10, 190] as const,
  cage: 100,
  chainX: 150,
  pulley: { x: 100, y: -560 },
  ledge: { x: 190, lift: 340 },
  width: 380,
};

/** Level 8 (boss): a rockfall chases the mine train out of the mine, and it jumps the canyon. */
export const MINE_TRAIN = {
  cartRest: 100,
  /** The engine pushes from behind the cart. */
  engineGap: 170,
  mouth: 1000,
  canyon: [1200, 1550] as const,
  stop: 1850,
  width: 1960,
};
