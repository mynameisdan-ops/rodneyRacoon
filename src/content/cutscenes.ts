import type { ObstacleId } from '../art/obstacles/types';
import type { SceneScript } from '../cutscenes/timeline';

/**
 * Cut scenes after each level (data only). World x is in px from the scene's left
 * edge; the obstacle is drawn with its local (0, 0) at `anchor` on the ground line.
 * The hero is about 190px tall (sized so his hands reach 175px up in the swing pose); `lift`
 * is how high his feet are above the ground. Steps can also direct the scene like a cartoon
 * (faces, impacts, emotes, camera moves, cut-ins, slow motion and freeze frames: see
 * `SceneStep` in timeline.ts).
 * The captions come from `levels.ts`.
 */
export interface CutScene {
  obstacle: ObstacleId;
  anchor: number;
  /** Scene width, px. Wider than 1280 makes the camera follow the hero (max 2500). */
  width: number;
  /** A signpost near the end, e.g. pointing to the next world. */
  sign?: { x: number; text: string };
  /**
   * Draw the backdrop's foreground layer in front of him (default true). Off for a scene that
   * leaves its world's backdrop, like the mine train bursting out into daylight.
   */
  foreground?: boolean;
  script: SceneScript;
}

export const CUT_SCENES: Record<number, CutScene> = {
  // ---------- World 1: the Old Mine Shaft (layouts in art/obstacles/mineLayout.ts) ----------
  // Directed like a Saturday-morning cartoon (M7b): each threat lands with an impact and a beat
  // of hit-stop, the camera snaps to his face, a cut-in shows him deciding, the big move plays
  // in slow motion under focus lines and a tilted camera, and landings freeze, shake and sparkle.
  // A freeze starts a few frames after its impact (or it holds an empty burst), so where a ride
  // must not stop, its move is split into a short stretch at the same speed, then the freeze.

  // Level 1: the cart race (numbers match CART_RACE, anchor 500). The cart waits at 560 and
  // stops at the buffer at 2150; the pit spans 1500–1700. He rides with his feet on the cart
  // floor, 44px up. The ride moves chain (ease in, steady, steady) so the speed never jumps:
  // 0.8px/ms at full speed. The boulder lands at 150, 450ms after 'rumble'; it trails him by
  // 300px, so when he reaches 1900 ('drop') it is over the pit. Beats: the boulder slams down
  // behind him (hit-stop, his surprised face), a determined cut-in, a tilted chase under focus
  // lines, the trestle smashing in slow motion, a hit-stop at the buffer, a sparkling landing.
  1: {
    obstacle: 'cart-race',
    anchor: 500,
    width: 2500,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 480, ms: 1300 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 1300, amp: 6 },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'surprised' },
        { do: 'impact', x: 150, lift: 30, size: 1.15 },
        { do: 'hold', pose: 'brace', ms: 60 },
        { do: 'freeze', ms: 120 },
        { do: 'shake', ms: 700, amp: 16 },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.85, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 480, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'face', facing: 'right' },
        { do: 'cutin', ms: 760, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 760, expr: 'determined' },
        { do: 'caption' },
        { do: 'jump', x: 560, lift: 44, height: 70, ms: 450, pose: 'leap' },
        { do: 'prop', state: 'chase' },
        { do: 'camera', zoom: 1.12, tilt: -3, ms: 500 },
        { do: 'action', ms: 900 },
        { do: 'move', x: 1000, lift: 44, ms: 1100, pose: 'ride', ease: 'in' },
        { do: 'move', x: 1900, lift: 44, ms: 1100, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'drop' },
        { do: 'impact', x: 1600, lift: 0, size: 1 },
        { do: 'shake', ms: 800, amp: 14 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'slow', ms: 280, rate: 0.45 },
        { do: 'emote', emote: 'sweat' },
        { do: 'move', x: 2150, lift: 44, ms: 305, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'crash' },
        { do: 'impact', x: 2214, lift: 70, size: 0.9 },
        { do: 'hold', pose: 'ride', ms: 60 },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 450, amp: 10 },
        { do: 'jump', x: 2380, height: 150, ms: 750, pose: 'leap' },
        { do: 'impact', x: 2380, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 70 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.12, ms: 200 },
        { do: 'hold', pose: 'cheer', ms: 250 },
        { do: 'camera', zoom: 1, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1300 },
      ],
    },
  },

  // Level 2: the cart jump (CART_JUMP, anchor 300). The cart waits at 420; the ramp runs
  // 820–940 and rises 60px; the gap is 950–1310; the cart stops at 1560. Full speed is
  // 0.8px/ms, kept steady from the ramp through the flight to the braking (whose first 48px
  // are split off so the landing can freeze). Beats: he sees the broken track (a sweat drop),
  // a determined cut-in, the camera tilts as he hits the ramp, the flight over the gap in slow
  // motion under focus lines, a hit-stop on the landing, a sparkling hop out.
  2: {
    obstacle: 'cart-jump',
    anchor: 300,
    width: 1900,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 330, ms: 900 },
        { do: 'emote', emote: 'sweat' },
        { do: 'hold', pose: 'brace', ms: 400, expr: 'worried' },
        { do: 'cutin', ms: 700, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 700, expr: 'determined' },
        { do: 'caption' },
        { do: 'jump', x: 420, lift: 44, height: 70, ms: 420, pose: 'leap' },
        { do: 'prop', state: 'board' },
        { do: 'camera', zoom: 1.1, tilt: -2, ms: 600 },
        { do: 'move', x: 820, lift: 44, ms: 1000, pose: 'ride', ease: 'in' },
        { do: 'prop', state: 'launch' },
        { do: 'camera', zoom: 1.24, tilt: -6, ms: 250 },
        { do: 'action', ms: 1000 },
        { do: 'move', x: 940, lift: 104, ms: 150, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'fly' },
        { do: 'slow', ms: 280, rate: 0.4 },
        { do: 'jump', x: 1340, lift: 44, height: 110, ms: 500, pose: 'ride', expr: 'shout' },
        { do: 'prop', state: 'land' },
        { do: 'impact', x: 1340, lift: 25, size: 0.85 },
        { do: 'camera', zoom: 1, ms: 300 },
        { do: 'move', x: 1388, lift: 44, ms: 60, pose: 'ride', ease: 'linear' },
        { do: 'freeze', ms: 90 },
        { do: 'shake', ms: 500, amp: 12 },
        { do: 'move', x: 1560, lift: 44, ms: 430, pose: 'ride', ease: 'out' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 1740, height: 130, ms: 650, pose: 'leap' },
        { do: 'impact', x: 1740, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1450 },
      ],
    },
  },

  // Level 3: the wall smash (WALL_SMASH, anchor 300). He pushes the ore cart from 90px
  // behind it; its front meets the cave-in (1000–1110) when he reaches 850. After the smash he
  // runs on at the push's final speed, 0.83px/ms. Beats: a worried look at the cave-in, a
  // shouting cut-in, the push under a low tilted camera and focus lines, the wall bursting
  // (a big impact, hit-stop, then the run through the debris in slow motion), a cheer.
  3: {
    obstacle: 'wall-smash',
    anchor: 300,
    width: 1600,
    script: {
      startX: 100,
      steps: [
        { do: 'walk', x: 310, ms: 900 },
        { do: 'hold', pose: 'brace', ms: 250, expr: 'surprised' },
        { do: 'emote', emote: 'sweat' },
        { do: 'hold', pose: 'brace', ms: 350, expr: 'worried' },
        { do: 'cutin', ms: 720, expr: 'shout' },
        { do: 'hold', pose: 'brace', ms: 720, expr: 'determined' },
        { do: 'caption' },
        { do: 'prop', state: 'push' },
        { do: 'camera', zoom: 1.14, tilt: 3, ms: 500 },
        { do: 'action', ms: 1300 },
        { do: 'move', x: 850, lift: 0, ms: 1300, pose: 'run', ease: 'in', expr: 'shout' },
        { do: 'prop', state: 'smash' },
        { do: 'impact', x: 1040, lift: 170, size: 1.1 },
        { do: 'run', x: 900, ms: 60 },
        { do: 'freeze', ms: 130 },
        { do: 'shake', ms: 700, amp: 16 },
        { do: 'slow', ms: 300, rate: 0.45 },
        { do: 'run', x: 1150, ms: 300 },
        { do: 'camera', zoom: 1, ms: 300 },
        { do: 'move', x: 1280, lift: 0, ms: 310, pose: 'run', ease: 'out' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.1, ms: 200 },
        { do: 'hold', pose: 'cheer', ms: 300 },
        { do: 'camera', zoom: 1, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1200 },
      ],
    },
  },

  // Level 4: the rat swarm (RAT_SWARM, anchor 300). The chain hangs from 700 (295px to his
  // hands, which are 175px above his feet). He grabs it 30° left of straight down, swings
  // through the bottom, and lets go 30° right; the rats pour out of the hole at 900 at
  // 0.55px/ms, so he must be off the ground within about 700ms. Beats: a hit-stop and a
  // close-up of his surprised face as they pour out, a snap on the chain, the swing over them
  // slowing at the bottom under a tilted camera and focus lines, a sparkling landing.
  4: {
    obstacle: 'rat-swarm',
    anchor: 300,
    width: 1280,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 1000 },
        { do: 'prop', state: 'swarm' },
        { do: 'emote', emote: 'alert' },
        { do: 'hold', pose: 'brace', ms: 70, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 500, amp: 6 },
        { do: 'camera', zoom: 1.7, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 300, expr: 'surprised' },
        { do: 'camera', zoom: 1.1, ms: 180 },
        { do: 'caption' },
        { do: 'jump', x: 552.5, lift: 129.5, height: 60, ms: 450, pose: 'leap' },
        { do: 'prop', state: 'grab' },
        { do: 'impact', x: 552.5, lift: 304.5, size: 0.35 },
        { do: 'camera', zoom: 1.2, tilt: -4, ms: 350 },
        { do: 'action', ms: 1100 },
        { do: 'move', x: 700, lift: 90, ms: 550, pose: 'swing', ease: 'in' },
        { do: 'slow', ms: 300, rate: 0.4 },
        { do: 'move', x: 847.5, lift: 129.5, ms: 550, pose: 'swing', ease: 'out' },
        { do: 'prop', state: 'letgo' },
        { do: 'camera', zoom: 1, ms: 350 },
        { do: 'jump', x: 1100, height: 70, ms: 550, pose: 'leap' },
        { do: 'impact', x: 1100, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.12, ms: 200 },
        { do: 'hold', pose: 'cheer', ms: 200 },
        { do: 'camera', zoom: 1, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1300 },
      ],
    },
  },

  // Level 5: the crystal cavern (CRYSTAL_CAVERN, anchor 300). The chasm spans 320–940;
  // the spire tops are at 440, 600 and 760, standing 90px up. Each spire sinks as he leaves
  // it. Beats: the ledge cracks under his feet (hit-stop, a sweat drop, a close-up of his
  // worried face), a little burst on each spire he lands on, the last leap in slow motion
  // under a tilted camera and focus lines, a sparkling landing.
  5: {
    obstacle: 'crystal-cavern',
    anchor: 300,
    width: 1280,
    script: {
      startX: 100,
      steps: [
        { do: 'walk', x: 290, ms: 800 },
        { do: 'prop', state: 'crumble' },
        { do: 'impact', x: 290, lift: 0, size: 0.45 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 600, amp: 8 },
        { do: 'emote', emote: 'sweat' },
        { do: 'camera', zoom: 1.65, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 330, expr: 'worried' },
        { do: 'camera', zoom: 1.08, ms: 200 },
        { do: 'caption' },
        { do: 'jump', x: 440, lift: 90, height: 60, ms: 500, pose: 'leap' },
        { do: 'impact', x: 440, lift: 90, size: 0.3 },
        { do: 'hold', pose: 'idle', ms: 150, expr: 'determined' },
        { do: 'prop', state: 'sink1' },
        { do: 'jump', x: 600, lift: 90, height: 60, ms: 500, pose: 'leap' },
        { do: 'impact', x: 600, lift: 90, size: 0.3 },
        { do: 'hold', pose: 'idle', ms: 150, expr: 'determined' },
        { do: 'prop', state: 'sink2' },
        { do: 'jump', x: 760, lift: 90, height: 60, ms: 500, pose: 'leap' },
        { do: 'impact', x: 760, lift: 90, size: 0.3 },
        { do: 'hold', pose: 'idle', ms: 150, expr: 'determined' },
        { do: 'prop', state: 'sink3' },
        { do: 'camera', zoom: 1.18, tilt: -4, ms: 300 },
        { do: 'action', ms: 700 },
        { do: 'slow', ms: 300, rate: 0.4 },
        { do: 'jump', x: 1030, height: 100, ms: 560, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 1030, lift: 0, size: 0.55 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1450 },
      ],
    },
  },

  // Level 6: the bat storm (BAT_STORM, anchor 300). The lantern hangs at 400 and lands
  // about 390ms after 'crash'. He slides under the fallen beam (580–740, 155px clear) while
  // the bats sweep over him. Beats: the lantern smashes (impact, hit-stop), a close-up of his
  // surprised face as the bats burst out, a dash, the slide under the beam in slow motion
  // under a tilted camera and focus lines, a sparkle as he stands up past it.
  6: {
    obstacle: 'bat-storm',
    anchor: 300,
    width: 1280,
    script: {
      startX: 120,
      steps: [
        { do: 'walk', x: 280, ms: 800 },
        { do: 'prop', state: 'crash' },
        { do: 'hold', pose: 'brace', ms: 390, expr: 'surprised' },
        { do: 'impact', x: 400, lift: 14, size: 0.75 },
        { do: 'hold', pose: 'brace', ms: 60 },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 300, amp: 8 },
        { do: 'prop', state: 'bats' },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.7, ms: 180 },
        { do: 'hold', pose: 'brace', ms: 320, expr: 'surprised' },
        { do: 'camera', zoom: 1.1, tilt: 3, ms: 200 },
        { do: 'caption' },
        { do: 'run', x: 520, ms: 330, expr: 'determined' },
        { do: 'action', ms: 800 },
        { do: 'camera', zoom: 1.2, tilt: -4, ms: 250 },
        { do: 'slow', ms: 350, rate: 0.4 },
        { do: 'move', x: 900, lift: 0, ms: 750, pose: 'slide', ease: 'out' },
        { do: 'camera', zoom: 1, ms: 300 },
        { do: 'walk', x: 960, ms: 260 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 7: the runaway lift (RUNAWAY_LIFT, anchor 300). The cage is at 400, the chain at
  // 450, the pulley 560px up at 400, and the upper ledge starts at 490, 340px up. He ends
  // standing on the ledge. Beats: a happy ride up, a creak (a sweat drop and a close-up of his
  // worried face), the rope snaps at the pulley (impact, the camera pulls back, hit-stop), he
  // catches the chain with a burst, a determined cut-in as he climbs, a sparkle on the ledge.
  7: {
    obstacle: 'runaway-lift',
    anchor: 300,
    width: 1280,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'board' },
        { do: 'hold', pose: 'idle', ms: 300 },
        { do: 'move', x: 400, lift: 240, ms: 1800, pose: 'idle', expr: 'happy' },
        { do: 'prop', state: 'creak' },
        { do: 'shake', ms: 500, amp: 4 },
        { do: 'emote', emote: 'sweat' },
        { do: 'camera', zoom: 1.6, ms: 250 },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'worried' },
        { do: 'prop', state: 'snap' },
        { do: 'impact', x: 400, lift: 520, size: 0.6 },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 700, amp: 12 },
        { do: 'emote', emote: 'alert' },
        { do: 'caption' },
        { do: 'move', x: 450, lift: 250, ms: 250, pose: 'swing', ease: 'out', expr: 'shout' },
        { do: 'impact', x: 450, lift: 425, size: 0.35 },
        { do: 'cutin', ms: 650, expr: 'determined' },
        { do: 'move', x: 450, lift: 330, ms: 1000, pose: 'climb', ease: 'linear' },
        { do: 'jump', x: 560, lift: 340, height: 40, ms: 450 },
        { do: 'impact', x: 560, lift: 340, size: 0.45 },
        { do: 'hold', pose: 'idle', ms: 50 },
        { do: 'freeze', ms: 70 },
        { do: 'walk', x: 700, ms: 500, expr: 'happy' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.1, ms: 200 },
        { do: 'hold', pose: 'cheer', ms: 300 },
        { do: 'camera', zoom: 1, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1200 },
      ],
    },
  },

  // Level 8 (boss): escape the mine (MINE_TRAIN, anchor 300). The engine pushes the cart
  // from 170px behind. The tunnel mouth is at 1300, the canyon spans 1500–1850, and the cart
  // stops at 2150. Full speed is about 0.91px/ms (the braking's first 50px are split off so
  // the landing can freeze). Rocks fall where the train just was; the first one lands at 70,
  // 455ms after 'rumble'. Beats: the first rock crashes down (impact, hit-stop, his surprised
  // face), a determined cut-in, the escape under a tilted camera and focus lines, the leap
  // over the canyon in slow motion, a big landing (hit-stop, shake), a sparkling hop out.
  8: {
    obstacle: 'mine-train',
    anchor: 300,
    width: 2500,
    sign: { x: 2000, text: 'Whispering Forest' },
    foreground: false,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 330, ms: 800 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 1500, amp: 8 },
        { do: 'hold', pose: 'brace', ms: 455, expr: 'surprised' },
        { do: 'impact', x: 70, lift: 15, size: 1.1 },
        { do: 'hold', pose: 'brace', ms: 60 },
        { do: 'freeze', ms: 120 },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.8, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 300, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 180 },
        { do: 'cutin', ms: 750, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 750, expr: 'determined' },
        { do: 'jump', x: 400, lift: 44, height: 60, ms: 450, pose: 'leap' },
        { do: 'prop', state: 'board' },
        { do: 'camera', zoom: 1.12, tilt: -3, ms: 400 },
        { do: 'action', ms: 1000 },
        { do: 'move', x: 900, lift: 44, ms: 1100, pose: 'ride', ease: 'in' },
        { do: 'move', x: 1500, lift: 44, ms: 660, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'fly' },
        { do: 'caption' },
        { do: 'camera', zoom: 1.22, tilt: -6, ms: 300 },
        { do: 'action', ms: 1100 },
        { do: 'slow', ms: 420, rate: 0.35 },
        { do: 'jump', x: 1880, lift: 44, height: 170, ms: 640, pose: 'ride', expr: 'shout' },
        { do: 'prop', state: 'land' },
        { do: 'impact', x: 1880, lift: 30, size: 1.05 },
        { do: 'camera', zoom: 1, ms: 300 },
        { do: 'move', x: 1930, lift: 44, ms: 55, pose: 'ride', ease: 'linear' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 600, amp: 14 },
        { do: 'move', x: 2150, lift: 44, ms: 484, pose: 'ride', ease: 'out' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 2380, height: 140, ms: 700, pose: 'leap' },
        { do: 'impact', x: 2380, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'camera', zoom: 1.15, ms: 220 },
        { do: 'hold', pose: 'cheer', ms: 300 },
        { do: 'camera', zoom: 1, ms: 700 },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // ---------- World 2: the Whispering Forest (layouts in art/obstacles/forestLayout.ts) ----------
  // Directed like World 1 (M7b): impacts with hit-stops, close-ups of his face, cut-ins, slow
  // motion under focus lines and a tilted camera, sparkling landings, all timed to the props.

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

  // ---------- World 3: the Rushing River (layouts in art/obstacles/riverLayout.ts) ----------
  // Directed like Worlds 1 and 2 (M7b): impacts with hit-stops, close-ups of his face, cut-ins,
  // slow motion under focus lines and a tilted camera, sparkling landings, timed to the props.

  // Level 17: stepping stones (STONES, anchor 300). The river is 500–1300; the stones are at
  // 600, 780, 960 and 1140, 30px up; each dips as he lands and sinks once he's left it. The wave
  // rises from the left bank at 'surge' and rolls on to the far bank by 'crash', but never
  // closer than 190px behind him (it rears up while he stops). Beats: two happy hops, the wave
  // bursting up behind him (impact, hit-stop, a close-up as he looks back), a determined cut-in,
  // the hops on under focus lines, the leap to the bank in slow motion, the wave crashing.
  17: {
    obstacle: 'stepping-stones',
    anchor: 300,
    width: 1500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 450, ms: 1000 },
        { do: 'hold', pose: 'idle', ms: 250, expr: 'happy' },
        { do: 'caption' },
        { do: 'jump', x: 600, lift: 30, height: 70, ms: 450, pose: 'leap', expr: 'happy' },
        { do: 'prop', state: 's1' },
        { do: 'impact', x: 600, lift: 30, size: 0.3 },
        { do: 'jump', x: 780, lift: 30, height: 70, ms: 420, pose: 'leap', expr: 'happy' },
        { do: 'prop', state: 's2' },
        { do: 'impact', x: 780, lift: 30, size: 0.3 },
        { do: 'hold', pose: 'idle', ms: 120, expr: 'happy' },
        { do: 'prop', state: 'surge' },
        { do: 'impact', x: 540, lift: 90, size: 1 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 600, amp: 9 },
        { do: 'face', facing: 'left' },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.65, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 480, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'face', facing: 'right' },
        { do: 'cutin', ms: 600, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 600, expr: 'determined' },
        { do: 'camera', zoom: 1.15, tilt: -4, ms: 300 },
        { do: 'action', ms: 1300 },
        { do: 'jump', x: 960, lift: 30, height: 70, ms: 400, pose: 'leap', expr: 'shout' },
        { do: 'prop', state: 's3' },
        { do: 'impact', x: 960, lift: 30, size: 0.3 },
        { do: 'jump', x: 1140, lift: 30, height: 70, ms: 400, pose: 'leap', expr: 'shout' },
        { do: 'prop', state: 's4' },
        { do: 'impact', x: 1140, lift: 30, size: 0.3 },
        { do: 'slow', ms: 450, rate: 0.4 },
        { do: 'jump', x: 1400, height: 120, ms: 600, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 1400, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50, expr: 'happy' },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'hold', pose: 'cheer', ms: 120, expr: 'happy' },
        { do: 'prop', state: 'crash' },
        { do: 'impact', x: 1250, lift: 70, size: 0.85 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 500, amp: 9 },
        { do: 'hold', pose: 'brace', ms: 340, expr: 'surprised' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 18: the beaver dam (DAM, anchor 300). The dam top runs 480–1240, 80px up; the beavers
  // peek out of their doorways at 660 and 1020 as he comes. After 'burst' the logs pop out 110px
  // behind him wherever he is. Beats: a hop up and a wave to the beavers, water spurting through
  // the cracks (impact, hit-stop, a worried close-up), the dam bursting behind him (a bigger
  // impact), a determined cut-in, the run under focus lines, the leap off the end in slow motion.
  18: {
    obstacle: 'beaver-dam',
    anchor: 300,
    width: 1600,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 420, ms: 1000 },
        { do: 'jump', x: 540, lift: 80, height: 60, ms: 400, pose: 'leap', expr: 'happy' },
        { do: 'impact', x: 540, lift: 80, size: 0.3 },
        { do: 'walk', x: 640, ms: 450, expr: 'happy' },
        { do: 'hold', pose: 'cheer', ms: 500, expr: 'happy' },
        { do: 'prop', state: 'crack' },
        { do: 'impact', x: 720, lift: 40, size: 0.5 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 90 },
        { do: 'shake', ms: 600, amp: 7 },
        { do: 'emote', emote: 'sweat' },
        { do: 'camera', zoom: 1.6, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'worried' },
        { do: 'prop', state: 'burst' },
        { do: 'impact', x: 560, lift: 60, size: 1.1 },
        { do: 'camera', zoom: 1.1, tilt: -3, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 600, amp: 10 },
        { do: 'emote', emote: 'alert' },
        { do: 'caption' },
        { do: 'hold', pose: 'brace', ms: 200, expr: 'surprised' },
        { do: 'cutin', ms: 550, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 550, expr: 'determined' },
        { do: 'camera', zoom: 1.18, tilt: -4, ms: 300 },
        { do: 'action', ms: 1000 },
        { do: 'run', x: 1200, ms: 700, expr: 'shout' },
        { do: 'slow', ms: 350, rate: 0.4 },
        { do: 'jump', x: 1420, height: 110, ms: 600, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 1420, lift: 0, size: 0.55 },
        { do: 'hold', pose: 'cheer', ms: 50, expr: 'happy' },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 19: the rapids (RAPIDS, anchor 300). The log floats at 480; its top is 16px up before
  // the drop at 1400 and 24px down after it. Full speed is 0.93px/ms (each move starts at the
  // speed the last one ended; the 60ms after the splash is split off so it can freeze). Beats: a
  // happy hop on, the ride speeding up under focus lines and a tilted camera, a surprised cut-in
  // as the drop comes, the flight off the step in slow motion, the splash-down (impact,
  // hit-stop), a sparkling hop ashore.
  19: {
    obstacle: 'rapids',
    anchor: 300,
    width: 2500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 380, ms: 900 },
        { do: 'hold', pose: 'idle', ms: 250, expr: 'happy' },
        { do: 'jump', x: 480, lift: 16, height: 60, ms: 400, pose: 'leap', expr: 'happy' },
        { do: 'prop', state: 'board' },
        { do: 'impact', x: 480, lift: 16, size: 0.3 },
        { do: 'caption' },
        { do: 'camera', zoom: 1.12, tilt: -3, ms: 500 },
        { do: 'action', ms: 1400 },
        { do: 'move', x: 900, lift: 16, ms: 900, pose: 'ride', ease: 'in', expr: 'happy' },
        { do: 'emote', emote: 'alert' },
        { do: 'cutin', ms: 450, expr: 'surprised' },
        { do: 'move', x: 1360, lift: 16, ms: 495, pose: 'ride', ease: 'linear', expr: 'surprised' },
        { do: 'prop', state: 'drop' },
        { do: 'camera', zoom: 1.25, tilt: 5, ms: 250 },
        { do: 'slow', ms: 365, rate: 0.4 },
        { do: 'jump', x: 1700, lift: -24, height: 90, ms: 365, pose: 'ride', expr: 'shout' },
        { do: 'prop', state: 'splash' },
        { do: 'impact', x: 1690, lift: -44, size: 1 },
        { do: 'move', x: 1756, lift: -24, ms: 60, pose: 'ride', ease: 'linear', expr: 'shout' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 500, amp: 10 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'move', x: 1950, lift: -24, ms: 417, pose: 'ride', ease: 'out', expr: 'happy' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 2250, height: 140, ms: 700, pose: 'leap', expr: 'happy' },
        { do: 'impact', x: 2250, lift: 0, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 20: the rope bridge (ROPE_BRIDGE, anchor 300). The gorge is 450–1300; the planks at
  // 660–1060 fall. He hangs from the hand rope (80px up, so his feet are 95px down) and goes
  // hand over hand to 1080, then climbs back up onto the planks. Beats: careful steps, the
  // planks snapping away (impact, hit-stop, a surprised close-up), a determined cut-in, the
  // grab, the crossing under focus lines and a tilted camera (slowing over the deepest part),
  // a sparkle once he's safe.
  20: {
    obstacle: 'rope-bridge',
    anchor: 300,
    width: 1600,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 500, ms: 900 },
        { do: 'walk', x: 620, ms: 600, expr: 'worried' },
        { do: 'prop', state: 'snap' },
        { do: 'impact', x: 860, lift: 10, size: 0.9 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 600, amp: 8 },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.65, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'cutin', ms: 600, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 600, expr: 'determined' },
        { do: 'caption' },
        { do: 'move', x: 680, lift: -95, ms: 450, pose: 'swing', ease: 'in' },
        { do: 'impact', x: 680, lift: 80, size: 0.3 },
        { do: 'camera', zoom: 1.15, tilt: -4, ms: 300 },
        { do: 'action', ms: 1500 },
        { do: 'move', x: 870, lift: -95, ms: 710, pose: 'swing', ease: 'linear' },
        { do: 'emote', emote: 'sweat' },
        { do: 'slow', ms: 250, rate: 0.45 },
        {
          do: 'move',
          x: 1080,
          lift: -95,
          ms: 790,
          pose: 'swing',
          ease: 'linear',
          expr: 'determined',
        },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'move', x: 1110, lift: 0, ms: 500, pose: 'climb', ease: 'out' },
        { do: 'impact', x: 1110, lift: 0, size: 0.35 },
        { do: 'walk', x: 1340, ms: 500, expr: 'happy' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 21: the geyser (GEYSER, anchor 300). The hot springs are 500–1120. He stands on the
  // rock lid over the vent at 600 (30px up); the jet pushes the lid (and him) 380px up and the
  // other two blow as he flies over them. Beats: the springs boil (a sweat drop), a worried hop
  // onto the rock and a close-up as it rattles, the blast (impact, hit-stop), a happy cut-in at
  // the top, the hang time in slow motion under focus lines, a sparkling landing.
  21: {
    obstacle: 'geyser',
    anchor: 300,
    width: 1500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 470, ms: 1000 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 700, amp: 6 },
        { do: 'emote', emote: 'sweat' },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'worried' },
        { do: 'jump', x: 600, lift: 30, height: 60, ms: 400, pose: 'leap', expr: 'worried' },
        { do: 'impact', x: 600, lift: 30, size: 0.3 },
        { do: 'camera', zoom: 1.6, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 380, expr: 'surprised' },
        { do: 'prop', state: 'blast' },
        { do: 'impact', x: 600, lift: 20, size: 1.1 },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 500, amp: 10 },
        { do: 'caption' },
        { do: 'move', x: 620, lift: 380, ms: 500, pose: 'leap', ease: 'out', expr: 'shout' },
        { do: 'cutin', ms: 600, expr: 'happy' },
        { do: 'slow', ms: 300, rate: 0.4 },
        { do: 'camera', zoom: 1.15, tilt: -4, ms: 300 },
        { do: 'action', ms: 900 },
        { do: 'jump', x: 1250, height: 100, ms: 900, pose: 'leap', expr: 'happy' },
        { do: 'prop', state: 'land' },
        { do: 'impact', x: 1250, lift: 0, size: 0.6 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'shake', ms: 300, amp: 5 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 22: the waterfall slide (FALLS, anchor 300). Rock steps at 440, 520 and 600 (80, 160,
  // 240px up); the chute runs from 620 (240 up) to 1120 (20 up); the pool is 1150–1350. The
  // slide ends at 0.95px/ms and the flight off the lip goes on at that speed. Beats: hops up
  // the steps, a look at the view, the top rock cracking (impact, hit-stop, a surprised
  // close-up), the slide under focus lines and a tilted camera, the flight over the pool in slow
  // motion, a sparkling landing.
  22: {
    obstacle: 'waterfall-slide',
    anchor: 300,
    width: 1600,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 380, ms: 800 },
        { do: 'jump', x: 440, lift: 80, height: 50, ms: 350, pose: 'leap', expr: 'happy' },
        { do: 'impact', x: 440, lift: 80, size: 0.25 },
        { do: 'jump', x: 520, lift: 160, height: 50, ms: 350, pose: 'leap', expr: 'happy' },
        { do: 'impact', x: 520, lift: 160, size: 0.25 },
        { do: 'jump', x: 600, lift: 240, height: 50, ms: 350, pose: 'leap', expr: 'happy' },
        { do: 'impact', x: 600, lift: 240, size: 0.3 },
        { do: 'hold', pose: 'idle', ms: 350, expr: 'happy' },
        { do: 'prop', state: 'crack' },
        { do: 'impact', x: 575, lift: 235, size: 0.7 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 500, amp: 7 },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.6, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 420, expr: 'surprised' },
        { do: 'camera', zoom: 1.12, tilt: 5, ms: 300 },
        { do: 'caption' },
        { do: 'action', ms: 1200 },
        { do: 'move', x: 1120, lift: 20, ms: 1100, pose: 'slide', ease: 'in', expr: 'shout' },
        { do: 'prop', state: 'launch' },
        { do: 'camera', zoom: 1.2, tilt: -4, ms: 250 },
        { do: 'slow', ms: 380, rate: 0.4 },
        { do: 'jump', x: 1480, height: 140, ms: 380, pose: 'leap', expr: 'happy' },
        { do: 'impact', x: 1480, lift: 0, size: 0.55 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 23: the rising water (RISING, anchor 300). The cliff is at 600 with a ledge 300px up
  // running right; the root ladder hangs at 560. A wall of water rolls in from the left and
  // breaks just behind him; then the water rises, staying 60px below his feet. Beats: the wave
  // breaking (impact, hit-stop, a surprised close-up as he looks back), a determined cut-in,
  // the climb under focus lines with a sweat drop, the hop onto the ledge in slow motion, a
  // sparkle.
  23: {
    obstacle: 'rising-water',
    anchor: 300,
    width: 1400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 480, ms: 1000 },
        { do: 'prop', state: 'flood' },
        { do: 'shake', ms: 700, amp: 8 },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 600, expr: 'surprised' },
        { do: 'impact', x: 340, lift: 50, size: 0.9 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 500, amp: 9 },
        { do: 'emote', emote: 'alert' },
        { do: 'hold', pose: 'brace', ms: 200, expr: 'surprised' },
        { do: 'camera', zoom: 1.65, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 380, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'face', facing: 'right' },
        { do: 'cutin', ms: 600, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 600, expr: 'determined' },
        { do: 'caption' },
        { do: 'walk', x: 560, ms: 300, expr: 'determined' },
        { do: 'camera', zoom: 1.12, tilt: -3, ms: 400 },
        { do: 'action', ms: 1400 },
        { do: 'move', x: 560, lift: 150, ms: 672, pose: 'climb', ease: 'linear' },
        { do: 'emote', emote: 'sweat' },
        { do: 'move', x: 560, lift: 290, ms: 628, pose: 'climb', ease: 'linear' },
        { do: 'slow', ms: 300, rate: 0.45 },
        { do: 'jump', x: 680, lift: 300, height: 40, ms: 400, pose: 'leap', expr: 'happy' },
        { do: 'prop', state: 'safe' },
        { do: 'impact', x: 680, lift: 300, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50, expr: 'happy' },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'walk', x: 900, ms: 700, expr: 'happy' },
        { do: 'hold', pose: 'cheer', ms: 1300 },
      ],
    },
  },

  // Level 24 (boss): cross the river (RAFT, anchor 300). He builds the raft at 560 (the logs roll
  // in, the rope ties them, the sail pops up), sails at 0.88px/ms, rides a giant wave 160px up,
  // splashes down and runs aground on the beach at 2100. Beats: a thump as each log lands, a
  // proud sparkle, the push off, the wave rising under him (a "!", a determined cut-in, a tilted
  // camera), the ride down its face in slow motion, the splash-down (impact, hit-stop), a
  // sparkling leap ashore past the sign to the mountains (clear of the sail).
  24: {
    obstacle: 'raft',
    anchor: 300,
    width: 2500,
    sign: { x: 2200, text: 'Misty Mountains' },
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 480, ms: 1000 },
        { do: 'prop', state: 'build' },
        { do: 'hold', pose: 'brace', ms: 400, expr: 'determined' },
        { do: 'impact', x: 560, lift: 10, size: 0.25 },
        { do: 'hold', pose: 'brace', ms: 440, expr: 'determined' },
        { do: 'impact', x: 560, lift: 10, size: 0.3 },
        { do: 'hold', pose: 'brace', ms: 360, expr: 'determined' },
        { do: 'hold', pose: 'cheer', ms: 250, expr: 'happy' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 450, expr: 'happy' },
        { do: 'caption' },
        { do: 'jump', x: 560, lift: 20, height: 50, ms: 400, pose: 'leap', expr: 'happy' },
        { do: 'prop', state: 'sail' },
        { do: 'impact', x: 560, lift: 20, size: 0.3 },
        { do: 'camera', zoom: 1.1, tilt: -3, ms: 500 },
        { do: 'move', x: 1000, lift: 20, ms: 1000, pose: 'ride', ease: 'in', expr: 'happy' },
        { do: 'prop', state: 'wave' },
        { do: 'emote', emote: 'alert' },
        { do: 'cutin', ms: 450, expr: 'determined' },
        { do: 'camera', zoom: 1.22, tilt: -6, ms: 300 },
        { do: 'action', ms: 1300 },
        {
          do: 'move',
          x: 1500,
          lift: 160,
          ms: 570,
          pose: 'ride',
          ease: 'linear',
          expr: 'determined',
        },
        { do: 'camera', zoom: 1.28, tilt: 4, ms: 250 },
        { do: 'slow', ms: 300, rate: 0.4 },
        { do: 'move', x: 1900, lift: 20, ms: 455, pose: 'ride', ease: 'linear', expr: 'shout' },
        { do: 'prop', state: 'splash' },
        { do: 'impact', x: 1900, lift: 10, size: 1.1 },
        { do: 'move', x: 1953, lift: 20, ms: 60, pose: 'ride', ease: 'linear', expr: 'shout' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 500, amp: 10 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'move', x: 2100, lift: 20, ms: 334, pose: 'ride', ease: 'out', expr: 'happy' },
        { do: 'prop', state: 'beach' },
        { do: 'jump', x: 2430, height: 140, ms: 700, pose: 'leap', expr: 'happy' },
        { do: 'impact', x: 2430, lift: 0, size: 0.55 },
        { do: 'hold', pose: 'cheer', ms: 50 },
        { do: 'freeze', ms: 80 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1700 },
      ],
    },
  },

  // ---------- World 4: the Misty Mountains (layouts in art/obstacles/mountainLayout.ts) ----------

  // Level 25: the rock slide (ROCK_SLIDE, anchor 300). The overhang covers 750–1060 with
  // 150px clear under it. He dives under and waits while the rocks bounce over.
  25: {
    obstacle: 'rock-slide',
    anchor: 300,
    width: 1500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 420, ms: 900 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 900, amp: 8 },
        { do: 'hold', pose: 'brace', ms: 600 },
        { do: 'prop', state: 'slide' },
        { do: 'caption' },
        { do: 'run', x: 620, ms: 300 },
        { do: 'move', x: 880, lift: 0, ms: 550, pose: 'slide', ease: 'out' },
        { do: 'hold', pose: 'brace', ms: 1550 },
        { do: 'prop', state: 'clear' },
        { do: 'walk', x: 1260, ms: 700 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 26: the crumbling ledge (LEDGE, anchor 300). The gaps open at 700–780,
  // 1000–1100 and 1300–1480; each leap is a little longer than the last.
  26: {
    obstacle: 'crumbling-ledge',
    anchor: 300,
    width: 1700,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 380, ms: 900 },
        { do: 'prop', state: 'gust' },
        { do: 'shake', ms: 400, amp: 5 },
        { do: 'hold', pose: 'brace', ms: 700 },
        { do: 'prop', state: 'crumble' },
        { do: 'caption' },
        { do: 'shake', ms: 400, amp: 6 },
        { do: 'run', x: 640, ms: 350 },
        { do: 'jump', x: 820, height: 90, ms: 420, pose: 'leap' },
        { do: 'run', x: 960, ms: 180 },
        { do: 'jump', x: 1150, height: 100, ms: 420, pose: 'leap' },
        { do: 'run', x: 1240, ms: 130 },
        { do: 'jump', x: 1560, height: 150, ms: 620, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 27: the avalanche (AVALANCHE, anchor 300). He hangs from the branch 360px up (feet
  // 185–195px up) at 800 while the snow wave (150px tall) rushes under him, then drops onto
  // the 30px of new snow it leaves.
  27: {
    obstacle: 'avalanche',
    anchor: 300,
    width: 1500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 700, ms: 1200 },
        { do: 'prop', state: 'crack' },
        { do: 'shake', ms: 700, amp: 10 },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 700 },
        { do: 'face', facing: 'right' },
        { do: 'caption' },
        { do: 'jump', x: 800, lift: 185, height: 60, ms: 450, pose: 'leap' },
        { do: 'prop', state: 'grab' },
        { do: 'move', x: 800, lift: 195, ms: 1300, pose: 'swing', ease: 'linear' },
        { do: 'prop', state: 'settle' },
        { do: 'jump', x: 1000, lift: 30, height: 40, ms: 500, pose: 'leap' },
        { do: 'walk', x: 1120, ms: 300 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 28: the goat ride (GOAT, anchor 300). The goat stops at 620; he rides 90px above its
  // feet up the ledges at 900, 1100 and 1300 (100, 200 and 300px up), then hops off.
  28: {
    obstacle: 'goat-ride',
    anchor: 300,
    width: 1900,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 500, ms: 1000 },
        { do: 'prop', state: 'goat' },
        { do: 'hold', pose: 'brace', ms: 900 },
        { do: 'caption' },
        { do: 'jump', x: 620, lift: 90, height: 60, ms: 400, pose: 'leap' },
        { do: 'prop', state: 'ride' },
        { do: 'hold', pose: 'ride', ms: 250 },
        { do: 'jump', x: 900, lift: 190, height: 80, ms: 450, pose: 'ride' },
        { do: 'jump', x: 1100, lift: 290, height: 80, ms: 450, pose: 'ride' },
        { do: 'jump', x: 1300, lift: 390, height: 80, ms: 450, pose: 'ride' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 1450, lift: 300, height: 60, ms: 450, pose: 'leap' },
        { do: 'walk', x: 1600, ms: 350 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 29: the ice bridge (ICE_BRIDGE, anchor 300). The crevasse is 550–1300; after
  // 'shatter' the ice breaks up behind him as he slides across at 0.81px/ms.
  29: {
    obstacle: 'ice-bridge',
    anchor: 300,
    width: 1700,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 480, ms: 1000 },
        { do: 'walk', x: 600, ms: 400 },
        { do: 'prop', state: 'crack' },
        { do: 'shake', ms: 500, amp: 5 },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'prop', state: 'shatter' },
        { do: 'caption' },
        { do: 'run', x: 700, ms: 150 },
        { do: 'move', x: 1350, lift: 0, ms: 800, pose: 'slide', ease: 'linear' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 30: the icicle cave (ICICLES, anchor 300). The cave runs 500–1600; each icicle
  // drops once he is 70px past it.
  30: {
    obstacle: 'icicle-cave',
    anchor: 300,
    width: 1900,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 700, amp: 7 },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'prop', state: 'fall' },
        { do: 'caption' },
        { do: 'run', x: 1780, ms: 1380 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 31: the ice wall (ICE_WALL, anchor 300). The frozen waterfall stands at 600, 330px
  // tall. A foothold breaks halfway up and he drops 40px before climbing on.
  31: {
    obstacle: 'ice-wall',
    anchor: 300,
    width: 1500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 560, ms: 1100 },
        { do: 'prop', state: 'climb' },
        { do: 'caption' },
        { do: 'move', x: 580, lift: 160, ms: 1100, pose: 'climb', ease: 'linear' },
        { do: 'prop', state: 'slip' },
        { do: 'shake', ms: 300, amp: 6 },
        { do: 'move', x: 580, lift: 120, ms: 250, pose: 'fall', ease: 'in' },
        { do: 'hold', pose: 'climb', ms: 300 },
        { do: 'move', x: 580, lift: 320, ms: 1100, pose: 'climb', ease: 'linear' },
        { do: 'jump', x: 700, lift: 330, height: 40, ms: 400, pose: 'leap' },
        { do: 'walk', x: 900, ms: 600 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 32 (boss): over the peak (PEAK, anchor 300). Up the slope to the peak at 700–780
  // (220px up) in a storm, onto the sled, down to 1800 at 1.27px/ms, over the crevasse
  // (1900–2100) and to a stop at 2300. The storm clears as he lands.
  32: {
    obstacle: 'peak',
    anchor: 300,
    width: 2500,
    sign: { x: 2170, text: 'Canyon to Home' },
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 300, ms: 700 },
        { do: 'prop', state: 'storm' },
        { do: 'move', x: 700, lift: 220, ms: 1100, pose: 'run', ease: 'linear' },
        { do: 'hold', pose: 'brace', ms: 700 },
        { do: 'prop', state: 'sled' },
        { do: 'caption' },
        { do: 'jump', x: 780, lift: 240, height: 40, ms: 350, pose: 'leap' },
        { do: 'move', x: 1800, lift: 20, ms: 1600, pose: 'ride', ease: 'in' },
        { do: 'prop', state: 'jump' },
        { do: 'jump', x: 2150, lift: 20, height: 120, ms: 280, pose: 'ride' },
        { do: 'prop', state: 'land' },
        { do: 'shake', ms: 500, amp: 10 },
        { do: 'move', x: 2300, lift: 20, ms: 240, pose: 'ride', ease: 'out' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 2420, height: 80, ms: 500, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1800 },
      ],
    },
  },

  // ---------- World 5: Canyon to Home (layouts in art/obstacles/canyonLayout.ts) ----------

  // Level 33: the flash flood (FLASH_FLOOD, anchor 300). Rock steps at 600, 720 and 860
  // (80, 160 and 240px up); the ledge runs on from 790. The muddy water rises 120px.
  33: {
    obstacle: 'flash-flood',
    anchor: 300,
    width: 1400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 480, ms: 1000 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 700, amp: 7 },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 600 },
        { do: 'face', facing: 'right' },
        { do: 'prop', state: 'flood' },
        { do: 'caption' },
        { do: 'jump', x: 600, lift: 80, height: 50, ms: 350, pose: 'leap' },
        { do: 'jump', x: 720, lift: 160, height: 50, ms: 350, pose: 'leap' },
        { do: 'jump', x: 860, lift: 240, height: 50, ms: 380, pose: 'leap' },
        { do: 'walk', x: 1000, ms: 400 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 34: the zip line (ZIP, anchor 300). The line runs from 450 (380px up) to 1800
  // (200px up); his hands ride it 175px above his feet, so his feet go from 202 to 45 up.
  34: {
    obstacle: 'zip-line',
    anchor: 300,
    width: 2200,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 420, ms: 1000 },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'caption' },
        { do: 'jump', x: 470, lift: 202, height: 40, ms: 400, pose: 'leap' },
        { do: 'prop', state: 'zip' },
        { do: 'move', x: 1650, lift: 45, ms: 1500, pose: 'swing', ease: 'in' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 1900, height: 60, ms: 450, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 35: the dune surf (DUNE, anchor 300). Up the dune to the crest at 700–820 (200px
  // up), onto the board, down to 1600 at 1.2px/ms, over the bump at 1800 and to a stop at 2200.
  35: {
    obstacle: 'dune-surf',
    anchor: 300,
    width: 2400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 300, ms: 700 },
        { do: 'prop', state: 'storm' },
        { do: 'move', x: 700, lift: 200, ms: 1000, pose: 'run', ease: 'linear' },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'prop', state: 'board' },
        { do: 'caption' },
        { do: 'jump', x: 820, lift: 220, height: 40, ms: 350, pose: 'leap' },
        { do: 'move', x: 1600, lift: 20, ms: 1300, pose: 'ride', ease: 'in' },
        { do: 'move', x: 1720, lift: 20, ms: 100, pose: 'ride', ease: 'linear' },
        { do: 'move', x: 1800, lift: 80, ms: 67, pose: 'ride', ease: 'linear' },
        { do: 'jump', x: 2050, lift: 20, height: 80, ms: 210, pose: 'ride' },
        { do: 'prop', state: 'land' },
        { do: 'move', x: 2200, lift: 20, ms: 250, pose: 'ride', ease: 'out' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 2320, height: 60, ms: 450, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1600 },
      ],
    },
  },

  // Level 36: the tumbleweeds (TUMBLEWEEDS, anchor 300). Each one (60, 70 and 100px across
  // the middle) rolls in at 0.7px/ms and is right under him at the top of his jump.
  36: {
    obstacle: 'tumbleweeds',
    anchor: 300,
    width: 1600,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'wind' },
        { do: 'shake', ms: 300, amp: 4 },
        { do: 'hold', pose: 'brace', ms: 600 },
        { do: 'caption' },
        { do: 'prop', state: 'j1' },
        { do: 'jump', x: 600, height: 150, ms: 550, pose: 'leap' },
        { do: 'run', x: 720, ms: 200 },
        { do: 'prop', state: 'j2' },
        { do: 'jump', x: 920, height: 160, ms: 550, pose: 'leap' },
        { do: 'run', x: 1040, ms: 200 },
        { do: 'prop', state: 'j3' },
        { do: 'jump', x: 1320, height: 230, ms: 700, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 37: the crumbling arch (ARCH, anchor 300). The canyon is 500–1400; after 'crumble'
  // the arch breaks up behind him as he runs at 0.81px/ms.
  37: {
    obstacle: 'crumbling-arch',
    anchor: 300,
    width: 1800,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 480, ms: 1000 },
        { do: 'walk', x: 620, ms: 400 },
        { do: 'prop', state: 'crack' },
        { do: 'shake', ms: 500, amp: 6 },
        { do: 'hold', pose: 'brace', ms: 400 },
        { do: 'prop', state: 'crumble' },
        { do: 'caption' },
        { do: 'run', x: 1350, ms: 900 },
        { do: 'jump', x: 1600, height: 120, ms: 550, pose: 'leap' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 38: the canyon train (TRAIN, anchor 300). The flatcar (deck 120px up) comes up at
  // 0.9px/ms and is under him when he lands at 640; he rides it to 1900 and hops off onto the
  // station platform (2100–2600, 40px up).
  38: {
    obstacle: 'canyon-train',
    anchor: 300,
    width: 2500,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 420, ms: 900 },
        { do: 'prop', state: 'whistle' },
        { do: 'face', facing: 'left' },
        { do: 'hold', pose: 'brace', ms: 700 },
        { do: 'face', facing: 'right' },
        { do: 'caption' },
        { do: 'run', x: 560, ms: 300 },
        { do: 'jump', x: 640, lift: 120, height: 70, ms: 450, pose: 'leap' },
        { do: 'prop', state: 'board' },
        { do: 'move', x: 1900, lift: 120, ms: 1400, pose: 'ride', ease: 'linear' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 2200, lift: 40, height: 90, ms: 550, pose: 'leap' },
        { do: 'walk', x: 2300, ms: 250 },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 39: the last hill (HILL, anchor 300). The slope climbs from 300 to the top at 1200
  // (260px up). The wind pushes him back once; at the top he sees home far away.
  39: {
    obstacle: 'last-hill',
    anchor: 300,
    width: 2000,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 300, ms: 600 },
        { do: 'prop', state: 'wind' },
        { do: 'move', x: 600, lift: 87, ms: 1000, pose: 'run', ease: 'linear' },
        { do: 'move', x: 540, lift: 69, ms: 400, pose: 'stumble', ease: 'out' },
        { do: 'hold', pose: 'brace', ms: 500 },
        { do: 'caption' },
        { do: 'move', x: 1200, lift: 260, ms: 1700, pose: 'run', ease: 'linear' },
        { do: 'prop', state: 'calm' },
        { do: 'walk', x: 1400, ms: 500 },
        { do: 'hold', pose: 'cheer', ms: 1800 },
      ],
    },
  },

  // Level 40 (boss): home (HOME, anchor 300). A twister rises in the lane; he leaps the garden
  // fence (750–940), the twister spins away, and his family waves from the porch.
  40: {
    obstacle: 'home',
    anchor: 300,
    width: 2400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'storm' },
        { do: 'shake', ms: 800, amp: 8 },
        { do: 'hold', pose: 'brace', ms: 800 },
        { do: 'caption' },
        { do: 'run', x: 700, ms: 400 },
        { do: 'jump', x: 950, height: 160, ms: 600, pose: 'leap' },
        { do: 'prop', state: 'clear' },
        { do: 'hold', pose: 'cheer', ms: 700 },
        { do: 'run', x: 1350, ms: 450 },
        { do: 'prop', state: 'home' },
        { do: 'hold', pose: 'cheer', ms: 2600 },
      ],
    },
  },
};

export function getCutScene(levelId: number): CutScene | undefined {
  return CUT_SCENES[levelId];
}
