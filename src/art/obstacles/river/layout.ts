/**
 * Positions shared by the World 3 (river) obstacle art and the cut-scene scripts, in
 * local px from each scene's anchor (x right, y down, the ground line at 0).
 */

/** Level 17: he hops across stepping stones as a wave rolls in behind him. */
export const STONES = {
  channel: [200, 1000] as const,
  stones: [300, 480, 660, 840] as const,
  /** Stone tops stand this far up. */
  top: 30,
  waveStart: -700,
  width: 1050,
};

/** Level 18: he runs along the top of a bursting beaver dam. */
export const DAM = {
  dam: [180, 940] as const,
  /** The dam top, px up. */
  top: 80,
  beavers: [360, 720] as const,
  /** Logs burst this far behind him as he runs at `run` px/ms. */
  lag: 110,
  run: 0.8,
  width: 1000,
};

/** Level 19: he rides a log down the rapids and over a drop. */
export const RAPIDS = {
  channel: [100, 1700] as const,
  logRest: 180,
  /** Where the river drops a step, and the water line before and after it. */
  drop: 1100,
  waterBefore: 4,
  waterAfter: 44,
  /** Log height above the water line (his feet ride on top). */
  logTop: 20,
  stop: 1650,
  width: 1700,
};

/** Level 20: the planks ahead fall away; he goes hand over hand along the rope. */
export const ROPE_BRIDGE = {
  gorge: [150, 1000] as const,
  gap: [360, 760] as const,
  /** The hand rope, px above the planks. */
  rope: 80,
  width: 1000,
};

/** Level 21: a geyser blasts him up and over the hot springs. */
export const GEYSER = {
  pool: [200, 820] as const,
  vents: [300, 520, 720] as const,
  width: 900,
};

/** Level 22: the rock cracks; he slides down the waterfall chute and flies over the pool. */
export const FALLS = {
  steps: [
    [140, 80],
    [220, 160],
    [300, 240],
  ] as const,
  chute: [
    [320, 240],
    [820, 20],
  ] as const,
  pool: [850, 1050] as const,
  width: 1100,
};

/** Level 23: the water rises; he climbs a root ladder up the cliff to a high ledge. */
export const RISING = {
  cliff: 300,
  ledge: 300,
  ladder: 260,
  width: 550,
};

/** Level 24 (boss): he builds a raft and surfs a giant wave across the river. */
export const RAFT = {
  river: [200, 1800] as const,
  raftRest: 260,
  /** Raft deck height above the water (his feet ride on top). */
  deck: 20,
  beach: 1800,
  width: 1950,
};
