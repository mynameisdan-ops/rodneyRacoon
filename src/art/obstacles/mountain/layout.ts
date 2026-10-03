/**
 * Positions shared by the World 4 (mountain) obstacle art and the cut-scene scripts, in
 * local px from each scene's anchor (x right, y down, the ground line at 0).
 */

/**
 * Level 25: a rock slide. Rocks roll down the cliff's snowy top (`slope`, from the lip up to the
 * upper right), fly off the shelf's lip over his head and crash onto the path behind him.
 */
export const ROCK_SLIDE = {
  /** The shelf of rock jutting out over the path. */
  overhang: [450, 760] as const,
  /** Underside of the shelf, px above the ground (he crouches under it). */
  clear: 198,
  /** The cliff's top edge: the shelf's lip, then the slope up to the upper right. */
  slope: [
    [430, -300],
    [560, -336],
    [700, -416],
    [850, -536],
    [1000, -660],
    [1150, -760],
    [1450, -860],
  ] as const,
  /** How long a rock takes from the top of the slope to the lip, ms. */
  roll: 1800,
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
    [600, 90],
    [800, 170],
    [1000, 250],
  ] as const,
  top: 250,
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
