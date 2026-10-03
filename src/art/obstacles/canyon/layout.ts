/**
 * Positions shared by the World 5 (canyon) obstacle art and the cut-scene scripts, in
 * local px from each scene's anchor (x right, y down, the ground line at 0).
 */

/**
 * Level 33: a flash flood roars down the wash; he scrambles up the rock steps. The wave crashes
 * against the first step's face (60px before it) and fills up against the second.
 */
export const FLASH_FLOOD = {
  steps: [
    [300, 80],
    [420, 160],
    [560, 240],
  ] as const,
  floodStart: -520,
  /** How high the muddy water rises, px. */
  depth: 120,
  /** px/ms: it reaches the steps 1400ms after 'flood'. */
  speed: 0.54,
  width: 650,
};

/** Level 34: he rides a zip line across the canyon. */
export const ZIP = {
  from: { x: 150, lift: 380 },
  to: { x: 1500, lift: 200 },
  canyon: [300, 1300] as const,
  /** His hands are this far above his feet in the swing pose. */
  reach: 175,
  width: 1550,
};

/** Level 35: a sandstorm; he surfs down the big dune on a board. */
export const DUNE = {
  profile: [
    [0, 0],
    [400, 200],
    [520, 200],
    [1300, 0],
    [1420, 0],
    [1500, 60],
    [1580, 0],
  ] as const,
  board: 520,
  seat: 20,
  stop: 1900,
  width: 1950,
};

/** Level 36: giant tumbleweeds bounce at him; he jumps each one. */
export const TUMBLEWEEDS = {
  radii: [60, 70, 100] as const,
  speed: 0.7,
  width: 1000,
};

/** Level 37: the stone arch crumbles behind him as he runs across. */
export const ARCH = {
  canyon: [200, 1100] as const,
  lag: 120,
  run: 0.81,
  width: 1150,
};

/** Level 38: he hops a canyon train and rides it to the station. */
export const TRAIN = {
  /** Where the flatcar starts, so it reaches him at his ride speed when he lands on it. */
  start: -1190,
  /** Flatcar deck, px up (his feet). */
  deck: 120,
  speed: 0.9,
  platform: [1800, 2300] as const,
  platformTop: 40,
  width: 1950,
};

/** Level 39: he climbs the last hill into the wind and sees home. */
export const HILL = {
  top: 900,
  height: 260,
  home: { x: 1420, y: -300 },
  width: 1050,
};

/** Level 40 (boss): the last storm clears and he's home. */
export const HOME = {
  gate: 600,
  twister: 900,
  house: [1200, 1500] as const,
  width: 1000,
};
