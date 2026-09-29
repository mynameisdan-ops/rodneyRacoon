import type { ObstacleId } from '../art/obstacles/types';
import type { SceneScript } from '../cutscenes/timeline';

/**
 * Cut scenes after each level (data only). World x is in px from the scene's left
 * edge; the obstacle is drawn with its local (0, 0) at `anchor` on the ground line.
 * The hero is about 200px tall; `lift` is how high his feet are above the ground.
 * The captions come from `levels.ts`.
 */
export interface CutScene {
  obstacle: ObstacleId;
  anchor: number;
  /** Scene width, px. Wider than 1280 makes the camera follow the hero (max 2500). */
  width: number;
  /** A signpost near the end, e.g. pointing to the next world. */
  sign?: { x: number; text: string };
  script: SceneScript;
}

export const CUT_SCENES: Record<number, CutScene> = {
  // Level 1: through the tall grass (grass spans 460–820).
  1: {
    obstacle: 'tall-grass',
    anchor: 460,
    width: 1280,
    script: {
      startX: 140,
      steps: [
        { do: 'caption' },
        { do: 'walk', x: 380, ms: 1100 },
        { do: 'prop', state: 'rustle' },
        { do: 'walk', x: 900, ms: 2600 },
        { do: 'prop', state: 'idle' },
        { do: 'walk', x: 1000, ms: 500 },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 2: a big jump over the muddy puddle (520–760).
  2: {
    obstacle: 'puddle',
    anchor: 520,
    width: 1280,
    script: {
      startX: 140,
      steps: [
        { do: 'caption' },
        { do: 'walk', x: 460, ms: 1500 },
        { do: 'prop', state: 'splash' },
        { do: 'jump', x: 820, height: 150, ms: 800 },
        { do: 'walk', x: 980, ms: 700 },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 3: up the step, over the fence, down the other side (steps are 44px high,
  // the top rail is about 125px up).
  3: {
    obstacle: 'fence-stile',
    anchor: 560,
    width: 1280,
    script: {
      startX: 140,
      steps: [
        { do: 'caption' },
        { do: 'walk', x: 470, ms: 1300 },
        { do: 'jump', x: 531, lift: 44, height: 30, ms: 450 },
        { do: 'move', x: 620, lift: 128, ms: 900, pose: 'climb' },
        { do: 'jump', x: 713, lift: 44, height: 30, ms: 500 },
        { do: 'jump', x: 820, height: 20, ms: 450 },
        { do: 'walk', x: 960, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 4: tiptoe past the bees; the swarm drifts after him, then settles.
  4: {
    obstacle: 'bees',
    anchor: 520,
    width: 1280,
    script: {
      startX: 140,
      steps: [
        { do: 'caption' },
        { do: 'walk', x: 420, ms: 1300 },
        { do: 'prop', state: 'curious' },
        { do: 'walk', x: 900, ms: 3200 },
        { do: 'prop', state: 'home' },
        { do: 'walk', x: 1000, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 5: hop across three logs in the stream (log tops at 475, 615, 755; 20px up).
  5: {
    obstacle: 'stepping-logs',
    anchor: 380,
    width: 1280,
    script: {
      startX: 120,
      steps: [
        { do: 'caption' },
        { do: 'walk', x: 330, ms: 1100 },
        { do: 'jump', x: 475, lift: 20, height: 70, ms: 520 },
        { do: 'hold', pose: 'idle', ms: 220 },
        { do: 'jump', x: 615, lift: 20, height: 70, ms: 520 },
        { do: 'hold', pose: 'idle', ms: 220 },
        { do: 'jump', x: 755, lift: 20, height: 70, ms: 520 },
        { do: 'hold', pose: 'idle', ms: 180 },
        { do: 'jump', x: 900, height: 60, ms: 520 },
        { do: 'walk', x: 1000, ms: 450 },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 6: up the windy hill (slope from 320 to the peak at 700, 160px high) and down.
  6: {
    obstacle: 'windy-hill',
    anchor: 380,
    width: 1280,
    script: {
      startX: 100,
      steps: [
        { do: 'caption' },
        { do: 'prop', state: 'gust' },
        { do: 'walk', x: 320, ms: 1000 },
        { do: 'move', x: 700, lift: 160, ms: 2000, pose: 'walk' },
        { do: 'hold', pose: 'cheer', ms: 1000 },
        { do: 'move', x: 1080, lift: 0, ms: 1500, pose: 'walk' },
        { do: 'walk', x: 1140, ms: 350 },
        { do: 'hold', pose: 'idle', ms: 500 },
      ],
    },
  },

  // Level 7: sneak past the sleeping bull; he peeks, the hero freezes, then tiptoes on.
  7: {
    obstacle: 'sleeping-bull',
    anchor: 560,
    width: 1280,
    script: {
      startX: 140,
      steps: [
        { do: 'caption' },
        { do: 'walk', x: 420, ms: 1300 },
        { do: 'walk', x: 640, ms: 1600 },
        { do: 'prop', state: 'peek' },
        { do: 'hold', pose: 'idle', ms: 900 },
        { do: 'prop', state: 'idle' },
        { do: 'walk', x: 900, ms: 1700 },
        { do: 'walk', x: 1000, ms: 500 },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 8 (boss): across the rope bridge (ravine 700–1260). The deck sags under his feet.
  8: {
    obstacle: 'rope-bridge',
    anchor: 700,
    width: 2300,
    sign: { x: 1950, text: 'Whispering Forest' },
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 650, ms: 2000 },
        { do: 'hold', pose: 'idle', ms: 700 },
        { do: 'caption' },
        { do: 'prop', state: 'wobble' },
        { do: 'move', x: 840, lift: -30, ms: 1100, pose: 'walk' },
        { do: 'move', x: 980, lift: -44, ms: 1000, pose: 'walk' },
        { do: 'move', x: 1120, lift: -30, ms: 1000, pose: 'walk' },
        { do: 'move', x: 1262, lift: 0, ms: 900, pose: 'walk' },
        { do: 'prop', state: 'idle' },
        { do: 'walk', x: 1750, ms: 1800 },
        { do: 'hold', pose: 'cheer', ms: 1800 },
      ],
    },
  },
};

export function getCutScene(levelId: number): CutScene | undefined {
  return CUT_SCENES[levelId];
}
