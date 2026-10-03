# Cut-scene scripts

One file per world (`mine.ts` … `canyon.ts`), merged in `index.ts`: a `CutScene` per level id.
The pure `src/cutscenes/timeline.ts` compiles a script into a timeline; `CutSceneView` samples it
at any time `t`, so every frame can be drawn exactly. No per-level animation code: the motion of
the obstacle is computed from scene time in its art (`src/art/obstacles/CLAUDE.md`).

## A scene

- `obstacle`: an id from `art/obstacles/registry.ts`, drawn with its local (0, 0) at `anchor` on
  the ground line (y = 640 in the 1280×800 scene). World x is px from the scene's left edge.
- `width`: 1280 to 2500; wider than 1280 makes the camera follow the hero.
- `sign`: an optional signpost (e.g. pointing to the next world).
- `script`: `startX` and steps. Blocking steps run one after another: `walk`, `run` (to `x`),
  `move` (to `x` and `lift` with a `pose`; chain `ease: 'in'`, `'linear'`, `'out'` for one long
  ride at a steady speed), `jump` (an arc of `height`, landing at `lift`), `hold` (a pose for
  `ms`). Instant steps: `prop` (sets the obstacle's state, e.g. `'chase'`), `caption` (shows the
  level's caption from `levels.ts`), `face`, `shake` (camera shake for `ms`, from `amp` px).
- `lift` is the height of his feet above the ground (up is positive). He is about 200px tall.
- Only about 160px of the scene shows below the ground line: keep the action at or above it.

Each level's comment says which layout numbers (`art/obstacles/<world>/layout.ts`) the script
relies on. Things that must meet (his feet on a moving log, landing on a train) are computed
from `heroAt()` in the art rather than tuned by hand.

## Rules (the tests check these)

- 4 to 14 seconds long, with a `caption` step.
- He ends past the obstacle (`anchor + art width`), standing (not mid-jump), on screen, in the
  `cheer` or `idle` pose; the camera stays inside the backdrop tile.
- Every frame draws without NaN.
- The story: a threat, an escalation, a hero action and a triumph ("the gully floods and he
  swings across on a vine", not "he hops a puddle"). Thrilling, never scary: nobody gets hurt,
  animals run off, and it ends in a cheer.

## Check a scene

`#gallery` has every scene with a scrub slider and Play; `#demo/scene/<level>` plays it in the
game. `npm test` runs the checks above for every scene.
