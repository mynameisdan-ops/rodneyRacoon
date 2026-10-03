/**
 * Positions shared by the World 4 (mountain) obstacle art and the cut-scene scripts, in
 * local px from each scene's anchor (x right, y down, the ground line at 0).
 */

/** Level 25: a rock slide; he dives under an overhang as the rocks bounce over. */
export const ROCK_SLIDE = {
  overhang: [450, 760] as const,
  /** Underside of the overhang, px above the ground. */
  clear: 150,
  roof: 230,
  width: 900,
};

/** Level 26: the ledge crumbles into gaps; he leaps them one by one. */
export const LEDGE = {
  gaps: [
    [400, 480],
    [700, 800],
    [1000, 1180],
  ] as const,
  width: 1250,
};

/** Level 27: an avalanche; he hangs from a pine branch as the snow rushes under him. */
export const AVALANCHE = {
  tree: 560,
  /** The branch he hangs from, px up (his feet dangle 185px up). */
  branch: 360,
  snowStart: -700,
  /** The snow wave's height, and the new snow it leaves behind. */
  wave: 150,
  settled: 30,
  width: 750,
};

/** Level 28: he rides a mountain goat up three ledges to the top. */
export const GOAT = {
  goatStart: 1000,
  goatRest: 320,
  /** His feet ride this far above the goat's feet. */
  saddle: 90,
  ledges: [
    [600, 100],
    [800, 200],
    [1000, 300],
  ] as const,
  top: 300,
  width: 1250,
};

/** Level 29: the ice bridge shatters behind him as he slides across. */
export const ICE_BRIDGE = {
  crevasse: [250, 1000] as const,
  lag: 100,
  /** His sliding speed, px/ms (matches the script). */
  speed: 0.81,
  width: 1000,
};

/** Level 30: icicles crash down behind him as he dashes through the ice cave. */
export const ICICLES = {
  cave: [200, 1300] as const,
  ceiling: 440,
  /** Each icicle drops when he is this far past it. */
  behind: 70,
  width: 1350,
};

/** Level 31: he climbs a frozen waterfall with ice picks. */
export const ICE_WALL = {
  wall: 300,
  top: 330,
  width: 550,
};

/** Level 32 (boss): up the peak in a storm, then down on a sled and over a crevasse. */
export const PEAK = {
  /** Ground height along the course: [x, lift]. */
  profile: [
    [0, 0],
    [400, 220],
    [480, 220],
    [1500, 0],
  ] as const,
  sled: 480,
  /** His feet ride this far above the sled's runners. */
  seat: 20,
  crevasse: [1600, 1800] as const,
  stop: 2000,
  width: 2050,
};
