/**
 * Positions shared by the World 2 (forest) obstacle art and the cut-scene scripts, in
 * local px from each scene's anchor (x right, y down, the ground line at 0). The
 * scripts in `content/cutscenes.ts` add the anchor to get world x.
 */

/** Level 9: a log rolls up behind him; he rides it until it hits a stump. */
export const LOG_ROLL = {
  /** Where the log starts rolling from (off to the left). */
  logStart: -900,
  r: 85,
  /** His feet ride on top of the log. */
  top: 170,
  stump: 1300,
  /** Where the log's center stops against the stump. */
  stop: 1160,
  width: 1400,
};

/** Level 10: brambles grow into a wall; he vaults over them on a sapling pole. */
export const BRAMBLE = {
  pole: 80,
  wall: [300, 520] as const,
  wallHeight: 240,
  /** Where the pole's foot is planted. */
  plant: 290,
  poleLength: 300,
  width: 600,
};

/** Level 11: the ground gives way and he slides through a root chute under the forest. */
export const ROOT_SLIDE = {
  hole: [150, 900] as const,
  depth: 110,
  /** The chute's floor along his path: [x, lift]. */
  chute: [
    [150, 0],
    [200, -40],
    [420, -110],
    [640, -110],
    [860, -10],
    [900, 0],
  ] as const,
  width: 950,
};

/** Level 12: the gully floods; he swings across on a vine. */
export const VINE_SWING = {
  pivot: { x: 450, y: -560 },
  vine: 295,
  /** His hands are this far above his feet in the swing pose. */
  reach: 175,
  gully: [230, 670] as const,
  width: 760,
};

/** Level 13: a boar charges; he climbs onto a branch and it thunders past into a bush. */
export const BOAR = {
  tree: 200,
  /** The branch he stands on, feet this high. */
  branch: 260,
  boarStart: 1000,
  bush: -140,
  width: 650,
};

/** Level 14: the path turns to bubbling mud; he bounces across giant mushrooms. */
export const MUSHROOMS = {
  bog: [150, 930] as const,
  caps: [280, 520, 760] as const,
  /** Cap tops stand this far up. */
  capTop: 70,
  width: 980,
};

/** Level 15: the plank bridge collapses behind him as he runs. */
export const FALLING_BRIDGE = {
  ravine: [150, 1150] as const,
  plank: 50,
  /** The collapse follows this far behind his heels. */
  lag: 140,
  width: 1200,
};

/** Level 16 (boss): night falls; fireflies lead him over, under and across the roots. */
export const FIREFLIES = {
  hump: 500,
  arch: 900,
  /** Underside of the root arch, px above the ground. */
  archClear: 150,
  gap: [1300, 1500] as const,
  width: 1950,
};
