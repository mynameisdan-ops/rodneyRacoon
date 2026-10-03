import type { CutScene } from './types';

/**
 * World 2 (Whispering Forest) cut scenes, levels 9–16. Positions the art shares are in
 * `art/obstacles/forest/layout.ts`; each level's comment says which numbers it relies on.
 *
 * Directed like World 1 (M7b): impacts with hit-stops, close-ups of his face, cut-ins, slow
 * motion under focus lines and a tilted camera, sparkling landings, all timed to the props.
 */
export const FOREST_SCENES: Record<number, CutScene> = {
  // Level 9: the log roll (LOG_ROLL, anchor 500). The log rolls up from behind and is under
  // him when he lands at 470 ('ride'); he runs on top of it (feet 170 up) at 0.82px/ms until
  // it slams into the stump when its center reaches 1660 (the last 49px are split off so the
  // slam can freeze). Beats: a close-up as he spots the log, a determined cut-in, a tilted run
  // on the log under focus lines, the slam (impact, hit-stop), the leap off it in slow motion.
  9: {
    obstacle: 'log-roll',
    anchor: 500,
    width: 2200,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 420, ms: 1000 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 900, amp: 7 },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 300, expr: 'surprised' },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.7, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'face', facing: 'right' },
        { do: 'cutin', ms: 700, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 700, expr: 'determined' },
        { do: 'caption' },
        { do: 'jump', x: 470, lift: 170, height: 90, ms: 520, pose: 'leap' },
        { do: 'prop', state: 'ride' },
        { do: 'impact', x: 470, lift: 170, size: 0.4 },
        { do: 'camera', zoom: 1.12, tilt: -3, ms: 500 },
        { do: 'action', ms: 900 },
        { do: 'move', x: 900, lift: 170, ms: 1050, pose: 'run', ease: 'in' },
        { do: 'move', x: 1611, lift: 170, ms: 870, pose: 'run', ease: 'linear' },
        { do: 'impact', x: 1745, lift: 90, size: 1.1 },
        { do: 'move', x: 1660, lift: 170, ms: 60, pose: 'run', ease: 'linear' },
        { do: 'prop', state: 'hit' },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 500, amp: 10 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'slow', ms: 350, rate: 0.4 },
        { do: 'jump', x: 1960, height: 170, ms: 800, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 1960, lift: 0, size: 0.55 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.12, ms: 200 },
        { do: 'hold', pose: 'cheer', ms: 250 },
        { do: 'camera', zoom: 1, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1200 },
      ],
    },
  },

  // Level 10: the bramble vault (BRAMBLE, anchor 400). The pole lies at 480; the brambles
  // grow at 700–920, 240px tall. He plants the pole at 690, rises on it to 250px, lets go
  // over the wall and lands at 1060. Beats: the brambles burst up (impact, hit-stop, his
  // surprised face, a sweat drop), a determined cut-in as he picks up the pole, the run and
  // vault under focus lines, the flight over the thorns in slow motion, a sparkling landing.
  10: {
    obstacle: 'bramble-vault',
    anchor: 400,
    width: 1400,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'grow' },
        { do: 'impact', x: 810, lift: 40, size: 0.9 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 500, amp: 6 },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.65, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 500, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'emote', emote: 'sweat' },
        { do: 'hold', pose: 'brace', ms: 280, expr: 'worried' },
        { do: 'caption' },
        { do: 'walk', x: 480, ms: 350, expr: 'determined' },
        { do: 'prop', state: 'grab' },
        { do: 'cutin', ms: 650, expr: 'determined' },
        { do: 'hold', pose: 'idle', ms: 650, expr: 'determined' },
        { do: 'camera', zoom: 1.15, tilt: -4, ms: 300 },
        { do: 'action', ms: 1300 },
        { do: 'run', x: 640, ms: 350, expr: 'shout' },
        { do: 'prop', state: 'plant' },
        { do: 'impact', x: 690, lift: 0, size: 0.35 },
        { do: 'move', x: 700, lift: 250, ms: 450, pose: 'leap', ease: 'out' },
        { do: 'slow', ms: 300, rate: 0.4 },
        { do: 'jump', x: 1060, height: 160, ms: 700, pose: 'leap', expr: 'shout' },
        { do: 'prop', state: 'land' },
        { do: 'impact', x: 1060, lift: 0, size: 0.55 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'shake', ms: 300, amp: 5 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1450 },
      ],
    },
  },

  // Level 11: the root slide (ROOT_SLIDE, anchor 400). The ground over 550–1300 falls in;
  // he drops onto the chute and slides along it (its points plus 400), then pops out. Beats:
  // the path cracks under his feet (impact, hit-stop), the camera tilts as he drops in, the
  // slide past the glowing mushrooms under focus lines and a slow-motion stretch, a sparkle.
  11: {
    obstacle: 'root-slide',
    anchor: 400,
    width: 1800,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 520, ms: 1000 },
        { do: 'prop', state: 'crack' },
        { do: 'impact', x: 520, lift: 0, size: 0.6 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 500, amp: 8 },
        { do: 'emote', emote: 'alert' },
        { do: 'hold', pose: 'brace', ms: 190, expr: 'surprised' },
        { do: 'camera', zoom: 1.15, tilt: 4, ms: 300 },
        { do: 'move', x: 600, lift: -40, ms: 350, pose: 'fall', ease: 'in', expr: 'surprised' },
        { do: 'caption' },
        { do: 'action', ms: 1100 },
        { do: 'move', x: 820, lift: -110, ms: 370, pose: 'slide', ease: 'linear', expr: 'shout' },
        { do: 'slow', ms: 300, rate: 0.45 },
        { do: 'move', x: 1040, lift: -110, ms: 350, pose: 'slide', ease: 'linear', expr: 'happy' },
        { do: 'move', x: 1260, lift: -10, ms: 380, pose: 'slide', ease: 'linear', expr: 'shout' },
        { do: 'prop', state: 'out' },
        { do: 'camera', zoom: 1, ms: 300 },
        { do: 'jump', x: 1450, height: 140, ms: 600, pose: 'leap', expr: 'happy' },
        { do: 'impact', x: 1450, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1450 },
      ],
    },
  },

  // Level 12: the vine swing (VINE_SWING, anchor 300). The vine hangs from 750 (295px to his
  // hands, 175px above his feet); he grabs it 30° left of straight down and lets go 30° right.
  // The gully floods at 530–970. Directed like a Saturday-morning cartoon (M7b): the flood
  // freezes for a beat and the camera snaps to his surprised face; a cut-in of his determined
  // face; he crouches and leaps under a tilted camera; the swing slows at the bottom of its arc;
  // the landing freezes, kicks up dust and sparkles as the camera eases back.
  12: {
    obstacle: 'vine-swing',
    anchor: 300,
    width: 1400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 500, ms: 1000 },
        { do: 'prop', state: 'flood' },
        { do: 'impact', x: 750, lift: 40, size: 1.2 },
        { do: 'hold', pose: 'brace', ms: 70 },
        { do: 'freeze', ms: 120 },
        { do: 'shake', ms: 700, amp: 12 },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.9, ms: 240 },
        { do: 'hold', pose: 'brace', ms: 530 },
        { do: 'camera', zoom: 1.08, ms: 220 },
        { do: 'cutin', ms: 820, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 820, expr: 'determined' },
        { do: 'caption' },
        { do: 'camera', zoom: 1.22, tilt: -5, ms: 420 },
        { do: 'jump', x: 602.5, lift: 129.5, height: 70, ms: 360, pose: 'leap' },
        { do: 'prop', state: 'grab' },
        { do: 'impact', x: 602.5, lift: 304, size: 0.35 },
        { do: 'action', ms: 1100 },
        { do: 'move', x: 750, lift: 90, ms: 550, pose: 'swing', ease: 'in' },
        { do: 'slow', ms: 300, rate: 0.4 },
        { do: 'move', x: 897.5, lift: 129.5, ms: 550, pose: 'swing', ease: 'out' },
        { do: 'prop', state: 'letgo' },
        { do: 'camera', zoom: 1, ms: 380 },
        { do: 'jump', x: 1100, height: 95, ms: 420, pose: 'leap' },
        { do: 'impact', x: 1100, lift: 0, size: 0.6 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'shake', ms: 260, amp: 6 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.14, ms: 200 },
        { do: 'hold', pose: 'cheer', ms: 210 },
        { do: 'camera', zoom: 1, ms: 700 },
        { do: 'hold', pose: 'cheer', ms: 1300 },
      ],
    },
  },

  // Level 13: the boar charge (BOAR, anchor 300). The branch is 260px up over 520–740. The
  // boar charges from 1200 to the bush at 250 between 'charge' and 'crash' (0.79px/ms) and
  // passes under him about 60ms after he lands on the branch. Beats: a close-up of his face as
  // it snorts and paws, the leap up, the boar thundering beneath him in slow motion under a
  // tilted camera, its crash into the bush (impact, hit-stop, leaves, stars), a happy hop down.
  13: {
    obstacle: 'boar-charge',
    anchor: 300,
    width: 1400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 560, ms: 1000 },
        { do: 'prop', state: 'snort' },
        { do: 'hold', pose: 'brace', ms: 200, expr: 'surprised' },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.65, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 500, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 300, expr: 'determined' },
        { do: 'prop', state: 'charge' },
        { do: 'caption' },
        { do: 'hold', pose: 'brace', ms: 250, expr: 'determined' },
        { do: 'jump', x: 600, lift: 260, height: 80, ms: 450, pose: 'leap' },
        { do: 'impact', x: 600, lift: 260, size: 0.35 },
        { do: 'camera', zoom: 1.18, tilt: -4, ms: 250 },
        { do: 'action', ms: 700 },
        { do: 'slow', ms: 300, rate: 0.4 },
        { do: 'hold', pose: 'idle', ms: 500, expr: 'surprised' },
        { do: 'prop', state: 'crash' },
        { do: 'impact', x: 200, lift: 70, size: 1.1 },
        { do: 'camera', zoom: 1, ms: 300 },
        { do: 'hold', pose: 'cheer', ms: 60, expr: 'happy' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 400, amp: 8 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 840 },
        { do: 'jump', x: 850, height: 60, ms: 600, pose: 'leap' },
        { do: 'impact', x: 850, lift: 0, size: 0.45 },
        { do: 'walk', x: 1000, ms: 450 },
        { do: 'hold', pose: 'cheer', ms: 1300 },
      ],
    },
  },

  // Level 14: the mushroom bounce (MUSHROOMS, anchor 300). The bog is 450–1230; the caps
  // are at 580, 820 and 1060, 70px up. Each bounce is a little higher than the last. Beats: the
  // path turns to mud (impact, hit-stop, a worried close-up), a determined cut-in, a burst on
  // every cap, focus lines and a tilt for the last two, the big final leap in slow motion.
  14: {
    obstacle: 'mushroom-bounce',
    anchor: 300,
    width: 1600,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'bubble' },
        { do: 'impact', x: 560, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 90 },
        { do: 'shake', ms: 400, amp: 5 },
        { do: 'emote', emote: 'sweat' },
        { do: 'camera', zoom: 1.6, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 400, expr: 'worried' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'cutin', ms: 650, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 650, expr: 'determined' },
        { do: 'caption' },
        { do: 'jump', x: 580, lift: 70, height: 100, ms: 550, pose: 'leap' },
        { do: 'prop', state: 'b1' },
        { do: 'impact', x: 580, lift: 70, size: 0.4 },
        { do: 'jump', x: 820, lift: 70, height: 140, ms: 600, pose: 'leap', expr: 'happy' },
        { do: 'prop', state: 'b2' },
        { do: 'impact', x: 820, lift: 70, size: 0.45 },
        { do: 'camera', zoom: 1.15, tilt: -4, ms: 300 },
        { do: 'action', ms: 1000 },
        { do: 'jump', x: 1060, lift: 70, height: 160, ms: 600, pose: 'leap', expr: 'shout' },
        { do: 'prop', state: 'b3' },
        { do: 'impact', x: 1060, lift: 70, size: 0.5 },
        { do: 'slow', ms: 400, rate: 0.4 },
        { do: 'jump', x: 1320, height: 220, ms: 800, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 1320, lift: 0, size: 0.55 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1450 },
      ],
    },
  },

  // Level 15: the falling bridge (FALLING_BRIDGE, anchor 300). The ravine is 450–1450. After
  // 'collapse' the planks drop behind his heels as he runs at 0.78px/ms (BRIDGE_RUN). Beats: a
  // creak (a sweat drop, a worried close-up), the first planks snapping (impact, hit-stop), the
  // dash under focus lines and a tilted camera, the jump to safety in slow motion, a sparkle.
  15: {
    obstacle: 'falling-bridge',
    anchor: 300,
    width: 2000,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 440, ms: 900 },
        { do: 'walk', x: 600, ms: 500 },
        { do: 'prop', state: 'creak' },
        { do: 'shake', ms: 500, amp: 6 },
        { do: 'emote', emote: 'sweat' },
        { do: 'camera', zoom: 1.6, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'worried' },
        { do: 'prop', state: 'collapse' },
        { do: 'impact', x: 460, lift: 0, size: 0.8 },
        { do: 'camera', zoom: 1.1, tilt: -3, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 500, amp: 8 },
        { do: 'emote', emote: 'alert' },
        { do: 'caption' },
        { do: 'action', ms: 900 },
        { do: 'run', x: 1300, ms: 900, expr: 'shout' },
        { do: 'camera', zoom: 1.2, tilt: -5, ms: 250 },
        { do: 'slow', ms: 300, rate: 0.4 },
        { do: 'jump', x: 1560, height: 120, ms: 550, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 1560, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1450 },
      ],
    },
  },

  // Level 16 (boss): follow the fireflies (FIREFLIES, anchor 300). Night falls and roots rise:
  // a hump at 800, an arch at 1200 (150px clear) and a gap at 1600–1800. The fireflies lead
  // him through and swirl around him in the moonlit clearing. Beats: a worried close-up as
  // night falls, the roots bursting up (impact, hit-stop, the camera pulling back), a
  // determined cut-in, the run after the fireflies under focus lines and a tilted camera, the
  // slide under the arch and the leap over the gap in slow motion, a sparkle in the moonlight.
  16: {
    obstacle: 'fireflies',
    anchor: 300,
    width: 2500,
    sign: { x: 2080, text: 'Rushing River' },
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 450, ms: 1000 },
        { do: 'prop', state: 'dusk' },
        { do: 'hold', pose: 'idle', ms: 450, expr: 'worried' },
        { do: 'emote', emote: 'sweat' },
        { do: 'camera', zoom: 1.55, ms: 300 },
        { do: 'hold', pose: 'idle', ms: 350, expr: 'worried' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'hold', pose: 'idle', ms: 200, expr: 'worried' },
        { do: 'prop', state: 'fireflies' },
        { do: 'impact', x: 950, lift: 40, size: 1 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 600, amp: 8 },
        { do: 'emote', emote: 'alert' },
        { do: 'hold', pose: 'brace', ms: 300, expr: 'surprised' },
        { do: 'cutin', ms: 700, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 700, expr: 'determined' },
        { do: 'caption' },
        { do: 'camera', zoom: 1.12, tilt: -3, ms: 400 },
        { do: 'action', ms: 2000 },
        { do: 'run', x: 680, ms: 330, expr: 'determined' },
        { do: 'jump', x: 920, height: 170, ms: 520, pose: 'leap', expr: 'shout' },
        { do: 'run', x: 1060, ms: 200 },
        { do: 'slow', ms: 300, rate: 0.45 },
        { do: 'move', x: 1340, lift: 0, ms: 600, pose: 'slide', ease: 'out' },
        { do: 'run', x: 1560, ms: 300 },
        { do: 'camera', zoom: 1.22, tilt: -5, ms: 250 },
        { do: 'slow', ms: 350, rate: 0.4 },
        { do: 'jump', x: 1860, height: 160, ms: 650, pose: 'leap', expr: 'shout' },
        { do: 'prop', state: 'dawn' },
        { do: 'impact', x: 1860, lift: 0, size: 0.6 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'run', x: 1896, ms: 50, expr: 'happy' },
        { do: 'freeze', ms: 80 },
        { do: 'run', x: 2330, ms: 600, expr: 'happy' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1800 },
      ],
    },
  },
};
