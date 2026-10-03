import type { CutScene } from './types';

/**
 * World 5 (Canyon to Home) cut scenes, levels 33–40. Positions the art shares are in
 * `art/obstacles/canyon/layout.ts`; each level's comment says which numbers it relies on.
 */
export const CANYON_SCENES: Record<number, CutScene> = {
  // Level 33: the flash flood (FLASH_FLOOD, anchor 300). Rock steps at 600, 720 and 860 (80, 160
  // and 240px up) rise out of the wash. At 'flood' a muddy wave rolls down it at 0.54px/ms and
  // crashes against the first step (540) 1400ms later, then fills the wash 120px deep. Beats: the
  // rumble (a surprised look back up the wash), the wave bursting into view (impact, hit-stop),
  // a determined cut-in, the scramble up under focus lines, the last leap in slow motion with the
  // wave crashing just under him, and a sparkle on top.
  33: {
    obstacle: 'flash-flood',
    anchor: 300,
    width: 1400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 480, ms: 1000 },
        { do: 'hold', pose: 'idle', ms: 150 },
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 700, amp: 5 },
        { do: 'face', facing: 'left' },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.6, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 550, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'prop', state: 'flood' },
        { do: 'impact', x: 40, lift: 140, size: 1 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 600, amp: 8 },
        { do: 'face', facing: 'right' },
        { do: 'caption' },
        { do: 'cutin', ms: 450, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'determined' },
        { do: 'camera', zoom: 1.15, tilt: -3, ms: 300 },
        { do: 'action', ms: 1300 },
        { do: 'jump', x: 600, lift: 80, height: 50, ms: 350, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 600, lift: 80, size: 0.3 },
        { do: 'jump', x: 720, lift: 160, height: 50, ms: 350, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 720, lift: 160, size: 0.3 },
        { do: 'camera', zoom: 1.2, tilt: 4, ms: 250 },
        { do: 'slow', ms: 380, rate: 0.4 },
        { do: 'jump', x: 860, lift: 240, height: 60, ms: 380, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 860, lift: 240, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50, expr: 'happy' },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'walk', x: 1000, ms: 400, expr: 'happy' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 34: the zip line (ZIP, anchor 300). The line runs from 450 (380px up) to 1800 (200px
  // up) over the gorge (600–1600); his hands ride it 175px above his feet, so his feet go from 202
  // up at 470 to 58 at 1550, speeding up to 1.42px/ms. A hawk glides alongside. At 'off' he lets go
  // and the handle runs on into the far post. Beats: a look across the gorge (a sweat drop), a
  // determined cut-in, the grab, the ride under focus lines and a tilted camera with sparks
  // flying off the pulley, a happy face for the hawk, the leap for the far rim in slow motion,
  // and a sparkling landing.
  34: {
    obstacle: 'zip-line',
    anchor: 300,
    width: 2200,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 420, ms: 1000 },
        { do: 'hold', pose: 'idle', ms: 200 },
        { do: 'emote', emote: 'sweat' },
        { do: 'camera', zoom: 1.4, ms: 260 },
        { do: 'hold', pose: 'idle', ms: 550, expr: 'worried' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'caption' },
        { do: 'cutin', ms: 450, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'determined' },
        { do: 'jump', x: 470, lift: 202, height: 40, ms: 400, pose: 'leap', expr: 'shout' },
        { do: 'prop', state: 'zip' },
        { do: 'impact', x: 470, lift: 377, size: 0.35 },
        { do: 'camera', zoom: 1.12, tilt: -4, ms: 300 },
        { do: 'action', ms: 1300 },
        { do: 'move', x: 1250, lift: 98, ms: 1100, pose: 'swing', ease: 'in', expr: 'shout' },
        { do: 'move', x: 1550, lift: 58, ms: 211, pose: 'swing', ease: 'linear', expr: 'happy' },
        { do: 'prop', state: 'off' },
        { do: 'camera', zoom: 1.2, tilt: 4, ms: 250 },
        { do: 'slow', ms: 250, rate: 0.35 },
        { do: 'jump', x: 1900, height: 80, ms: 250, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 1900, lift: 0, size: 0.55 },
        { do: 'hold', pose: 'cheer', ms: 50, expr: 'happy' },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 35: the dune surf (DUNE, anchor 300). Up the dune to the crest at 700–820 (200px up),
  // where the board stands in the sand; down to 1600 speeding up to 1.2px/ms, up the bump at
  // 1720–1800, over it and down at 2050, to a stop at 2200. A sandstorm towers up behind him and
  // blows over after 'land'. Beats: the storm (a surprised look back), the run up the dune, a
  // sparkle for the board, a determined cut-in, the surf down under focus lines and a tilted
  // camera, the jump in slow motion, the landing (impact, hit-stop) and the sun coming out.
  35: {
    obstacle: 'dune-surf',
    anchor: 300,
    width: 2400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 300, ms: 700 },
        { do: 'prop', state: 'storm' },
        { do: 'shake', ms: 500, amp: 4 },
        { do: 'face', facing: 'left' },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.6, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 500, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'face', facing: 'right' },
        { do: 'move', x: 700, lift: 200, ms: 1000, pose: 'run', ease: 'linear', expr: 'worried' },
        { do: 'hold', pose: 'brace', ms: 200, expr: 'worried' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'idle', ms: 350, expr: 'happy' },
        { do: 'prop', state: 'board' },
        { do: 'caption' },
        { do: 'cutin', ms: 450, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'determined' },
        { do: 'jump', x: 820, lift: 220, height: 40, ms: 350, pose: 'leap', expr: 'happy' },
        { do: 'impact', x: 820, lift: 210, size: 0.3 },
        { do: 'camera', zoom: 1.15, tilt: -5, ms: 300 },
        { do: 'action', ms: 1500 },
        { do: 'move', x: 1600, lift: 20, ms: 1300, pose: 'ride', ease: 'in', expr: 'shout' },
        { do: 'move', x: 1720, lift: 20, ms: 100, pose: 'ride', ease: 'linear', expr: 'shout' },
        { do: 'move', x: 1800, lift: 80, ms: 67, pose: 'ride', ease: 'linear', expr: 'shout' },
        { do: 'camera', zoom: 1.2, tilt: 4, ms: 250 },
        { do: 'slow', ms: 210, rate: 0.35 },
        { do: 'jump', x: 2050, lift: 20, height: 80, ms: 210, pose: 'ride', expr: 'shout' },
        { do: 'prop', state: 'land' },
        { do: 'impact', x: 2050, lift: 20, size: 0.9 },
        { do: 'move', x: 2090, lift: 20, ms: 34, pose: 'ride', ease: 'linear', expr: 'happy' },
        { do: 'freeze', ms: 100 },
        { do: 'shake', ms: 500, amp: 8 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'move', x: 2200, lift: 20, ms: 183, pose: 'ride', ease: 'out', expr: 'happy' },
        { do: 'prop', state: 'off' },
        { do: 'jump', x: 2320, height: 60, ms: 450, pose: 'leap', expr: 'happy' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1500 },
      ],
    },
  },

  // Level 36: the tumbleweeds (TUMBLEWEEDS, anchor 300). Each one (60, 70 and 100px across the
  // middle) rolls in from the right at 0.7px/ms and is right under him at the top of his jump.
  // Beats: the gale (a sweat drop as he braces), the first tumbleweed bouncing in (a surprised
  // close-up), a determined cut-in, two hurdles under focus lines and a tilted camera, the giant
  // third one cleared in slow motion, and a sparkling landing.
  36: {
    obstacle: 'tumbleweeds',
    anchor: 300,
    width: 1600,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 900 },
        { do: 'prop', state: 'wind' },
        { do: 'shake', ms: 300, amp: 3 },
        { do: 'emote', emote: 'sweat' },
        { do: 'hold', pose: 'brace', ms: 500, expr: 'worried' },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.55, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'caption' },
        { do: 'cutin', ms: 400, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 400, expr: 'determined' },
        { do: 'camera', zoom: 1.12, tilt: -3, ms: 300 },
        { do: 'action', ms: 1700 },
        { do: 'prop', state: 'j1' },
        { do: 'jump', x: 600, height: 150, ms: 550, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 600, lift: 0, size: 0.3 },
        { do: 'run', x: 720, ms: 200, expr: 'shout' },
        { do: 'prop', state: 'j2' },
        { do: 'jump', x: 920, height: 160, ms: 550, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 920, lift: 0, size: 0.3 },
        { do: 'run', x: 1040, ms: 200, expr: 'shout' },
        { do: 'camera', zoom: 1.2, tilt: 4, ms: 250 },
        { do: 'slow', ms: 700, rate: 0.45 },
        { do: 'prop', state: 'j3' },
        { do: 'jump', x: 1320, height: 230, ms: 700, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 1320, lift: 0, size: 0.6 },
        { do: 'hold', pose: 'cheer', ms: 50, expr: 'happy' },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 37: the crumbling arch (ARCH, anchor 300). A stone arch spans the gorge (500–1400).
  // After 'crumble' the arch behind him breaks up at once, then slice by slice as he gets 120px
  // past each, so it follows him however long he waits; he runs at 0.81px/ms. Beats: careful
  // steps onto the arch, cracks under his feet (impact, hit-stop, a worried close-up), the arch
  // breaking behind him (a bigger impact), a determined cut-in, the run under focus lines and a
  // tilted camera, the leap to the far side in slow motion, and a sparkling landing.
  37: {
    obstacle: 'crumbling-arch',
    anchor: 300,
    width: 1800,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 480, ms: 900 },
        { do: 'walk', x: 620, ms: 600, expr: 'worried' },
        { do: 'hold', pose: 'idle', ms: 200, expr: 'worried' },
        { do: 'prop', state: 'crack' },
        { do: 'impact', x: 640, lift: 0, size: 0.4 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 90 },
        { do: 'shake', ms: 500, amp: 5 },
        { do: 'emote', emote: 'sweat' },
        { do: 'camera', zoom: 1.6, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'worried' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'prop', state: 'crumble' },
        { do: 'impact', x: 520, lift: 0, size: 1 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'shake', ms: 600, amp: 9 },
        { do: 'emote', emote: 'alert' },
        { do: 'caption' },
        { do: 'cutin', ms: 500, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 500, expr: 'determined' },
        { do: 'camera', zoom: 1.15, tilt: -4, ms: 300 },
        { do: 'action', ms: 1100 },
        { do: 'run', x: 1180, ms: 690, expr: 'shout' },
        { do: 'camera', zoom: 1.2, tilt: 4, ms: 250 },
        { do: 'slow', ms: 520, rate: 0.4 },
        { do: 'jump', x: 1600, height: 120, ms: 520, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 1600, lift: 0, size: 0.55 },
        { do: 'hold', pose: 'cheer', ms: 50, expr: 'happy' },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 38: the canyon train (TRAIN, anchor 300). The track crosses the gorge (800–1600) on a
  // trestle. After 'whistle' the train comes up behind him and its flatcar (deck 120px up) is
  // under him when he lands at 640; it carries him at 0.9px/ms to 1900, and he leaps onto the
  // station platform (2100–2600, 40px up). Beats: the whistle (a surprised look back), a
  // determined cut-in, the run and the leap aboard in slow motion (impact, hit-stop), the ride
  // over the gorge under focus lines (a sparkle), the leap off in slow motion, and a cheer.
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
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.55, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 500, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'face', facing: 'right' },
        { do: 'caption' },
        { do: 'cutin', ms: 450, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 450, expr: 'determined' },
        { do: 'camera', zoom: 1.12, tilt: -3, ms: 300 },
        { do: 'action', ms: 900 },
        { do: 'run', x: 560, ms: 300, expr: 'shout' },
        { do: 'slow', ms: 450, rate: 0.5 },
        { do: 'jump', x: 640, lift: 120, height: 70, ms: 450, pose: 'leap', expr: 'shout' },
        { do: 'prop', state: 'board' },
        { do: 'impact', x: 640, lift: 120, size: 0.5 },
        { do: 'move', x: 676, lift: 120, ms: 40, pose: 'ride', ease: 'linear', expr: 'happy' },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1.1, tilt: 3, ms: 300 },
        { do: 'action', ms: 1200 },
        { do: 'move', x: 1270, lift: 120, ms: 660, pose: 'ride', ease: 'linear', expr: 'happy' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'move', x: 1900, lift: 120, ms: 700, pose: 'ride', ease: 'linear', expr: 'happy' },
        { do: 'prop', state: 'off' },
        { do: 'camera', zoom: 1.2, tilt: 4, ms: 250 },
        { do: 'slow', ms: 550, rate: 0.45 },
        { do: 'jump', x: 2200, lift: 40, height: 90, ms: 550, pose: 'leap', expr: 'shout' },
        { do: 'impact', x: 2200, lift: 40, size: 0.5 },
        { do: 'hold', pose: 'cheer', ms: 50, expr: 'happy' },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'walk', x: 2300, ms: 250, expr: 'happy' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 1400 },
      ],
    },
  },

  // Level 39: the last hill (HILL, anchor 300). The slope climbs from 300 to the top at 1200
  // (260px up). A gale blows down it and pushes him back once; at 'calm' the wind drops and home
  // comes into view far off (1720, 300px up), its window lit. Beats: the gale (a sweat drop), the
  // push back (a gust, a worried close-up), a determined cut-in, the climb under focus lines and
  // a tilted camera, the hush at the top (a surprised close-up as he sees home), a sparkle, a
  // happy walk on and a cheer.
  39: {
    obstacle: 'last-hill',
    anchor: 300,
    width: 2000,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 300, ms: 600 },
        { do: 'prop', state: 'wind' },
        { do: 'shake', ms: 400, amp: 3 },
        { do: 'move', x: 600, lift: 87, ms: 1000, pose: 'run', ease: 'linear', expr: 'worried' },
        { do: 'impact', x: 640, lift: 200, size: 0.5 },
        { do: 'emote', emote: 'sweat' },
        { do: 'move', x: 540, lift: 69, ms: 400, pose: 'stumble', ease: 'out', expr: 'surprised' },
        { do: 'camera', zoom: 1.5, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 500, expr: 'worried' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'caption' },
        { do: 'cutin', ms: 500, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 500, expr: 'determined' },
        { do: 'camera', zoom: 1.12, tilt: -3, ms: 300 },
        { do: 'action', ms: 1700 },
        { do: 'move', x: 1200, lift: 260, ms: 1700, pose: 'run', ease: 'linear', expr: 'shout' },
        { do: 'prop', state: 'calm' },
        { do: 'camera', zoom: 1.5, ms: 300 },
        { do: 'hold', pose: 'idle', ms: 600, expr: 'surprised' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'idle', ms: 500, expr: 'happy' },
        { do: 'camera', zoom: 1, ms: 500 },
        { do: 'walk', x: 1400, ms: 500, expr: 'happy' },
        { do: 'hold', pose: 'cheer', ms: 1600 },
      ],
    },
  },

  // Level 40 (boss): home (HOME, anchor 300). The lane runs up to the garden fence (790–956) and
  // the farmhouse (1500–1800). At 'storm' the sky darkens and a twister rises at 1200, between
  // him and home; he leaps the fence and lands at 1000 as it spins away at 'clear'. At 'home' the
  // porch light comes on, his family steps out waving and the dog bounds down to meet him, with
  // fireworks. Beats: a sparkle at the sight of home, the twister (impact, hit-stop, a surprised
  // close-up), a determined cut-in, the run and the leap over the fence in slow motion, the sun
  // breaking through, and the welcome home.
  40: {
    obstacle: 'home',
    anchor: 300,
    width: 2400,
    script: {
      startX: 150,
      steps: [
        { do: 'walk', x: 400, ms: 900, expr: 'happy' },
        { do: 'hold', pose: 'idle', ms: 300, expr: 'happy' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'idle', ms: 400, expr: 'happy' },
        { do: 'prop', state: 'storm' },
        { do: 'shake', ms: 800, amp: 8 },
        { do: 'impact', x: 1200, lift: 140, size: 1 },
        { do: 'hold', pose: 'brace', ms: 60, expr: 'surprised' },
        { do: 'freeze', ms: 110 },
        { do: 'emote', emote: 'alert' },
        { do: 'camera', zoom: 1.6, ms: 220 },
        { do: 'hold', pose: 'brace', ms: 500, expr: 'surprised' },
        { do: 'camera', zoom: 1.05, ms: 200 },
        { do: 'caption' },
        { do: 'cutin', ms: 500, expr: 'determined' },
        { do: 'hold', pose: 'brace', ms: 500, expr: 'determined' },
        { do: 'camera', zoom: 1.15, tilt: -4, ms: 300 },
        { do: 'action', ms: 1300 },
        { do: 'run', x: 700, ms: 400, expr: 'shout' },
        { do: 'camera', zoom: 1.22, tilt: 4, ms: 250 },
        { do: 'slow', ms: 600, rate: 0.4 },
        { do: 'jump', x: 1000, height: 170, ms: 600, pose: 'leap', expr: 'shout' },
        { do: 'prop', state: 'clear' },
        { do: 'impact', x: 1000, lift: 0, size: 0.6 },
        { do: 'hold', pose: 'cheer', ms: 50, expr: 'happy' },
        { do: 'freeze', ms: 80 },
        { do: 'camera', zoom: 1, ms: 400 },
        { do: 'hold', pose: 'cheer', ms: 650, expr: 'happy' },
        { do: 'run', x: 1350, ms: 450, expr: 'happy' },
        { do: 'prop', state: 'home' },
        { do: 'hold', pose: 'idle', ms: 500, expr: 'happy' },
        { do: 'emote', emote: 'sparkle' },
        { do: 'hold', pose: 'cheer', ms: 2400 },
      ],
    },
  },
};
