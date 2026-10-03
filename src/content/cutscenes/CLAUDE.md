# Cut-scene scripts

One file per world (`mine.ts` … `canyon.ts`), merged in `index.ts`: a `CutScene` per level id.
The pure `src/cutscenes/timeline.ts` compiles a script into a timeline; `CutSceneView` draws any
moment of it, so every frame can be drawn exactly. No per-level animation code: the obstacle's
motion is computed from scene time in its art (`src/art/obstacles/CLAUDE.md`).

## A scene

- `obstacle`: an id from `art/obstacles/registry.ts`, drawn with its local (0, 0) at `anchor` on
  the ground line (y = 640 in the 1280×800 scene). World x is px from the scene's left edge.
- `width`: 1280 to 2500; wider than 1280 makes the camera follow the hero.
- `sign`: an optional signpost (e.g. pointing to the next world). `foreground: false` hides the
  backdrop's front layer (for a scene that leaves its world, like the mine train into daylight).
- `script`: `startX` and steps (types in `timeline.ts`). Blocking steps run one after another:
  `walk`, `run` (to `x`), `move` (to `x` and `lift` with a `pose`; chain `ease: 'in'`,
  `'linear'`, `'out'` for one long ride at a steady speed), `jump` (an arc of `height`, landing
  at `lift`), `hold` (a pose for `ms`); each can set his face with `expr`. Instant steps: `prop`
  (sets the obstacle's state, e.g. `'chase'`), `caption` (the level's caption from `levels.ts`),
  `face`, `shake`.
- Directing steps (M7b): `impact` (a burst at x), `action` (focus lines), `emote`, `camera`
  (zoom and tilt, held until the next), `cutin` (a close-up panel), `slow` (the next `ms` at a
  `rate`) and `freeze` (a hit-stop). `CutSceneView` adds what follows from his motion (squash
  and stretch, leans, wind, smears, afterimages, dust).
- Slow motion and freezes stretch real time: screens run their clock to `realDuration` and draw
  `scriptTime(timeline, real)`. A freeze starts a few frames after its impact, and a slow or a
  freeze may not overlap the next. A cut-in counts scene time, so slow motion stretches it.
- `lift` is the height of his feet above the ground (up is positive). He is about 190px tall,
  sized so his hands reach 175px up in the swing pose.
- Only about 160px of the scene shows below the ground line: keep the action at or above it.

Each level's comment says which layout numbers (`art/obstacles/<world>/layout.ts`) the script
relies on. Things that must meet (his feet on a moving log, landing on a train) are computed
from `heroAt()` in the art rather than tuned by hand. Direct each beat from the props' own event
times (a throwaway test can print where each beat lands in real time).

## Rules (the tests check these)

- 4 to 14 seconds long, with a `caption` step.
- He ends past the obstacle (`anchor + art width`), standing (not mid-jump), on screen, in the
  `cheer` or `idle` pose; the camera stays inside the backdrop tile.
- Every frame draws without NaN.
- The story: a threat, an escalation, a hero action and a triumph ("the gully floods and he
  swings across on a vine", not "he hops a puddle"). Thrilling, never scary: nobody gets hurt,
  animals run off, and it ends in a cheer.

## Check a scene

`#scene-<level>` opens it in the scrubber; `#scene-<level>-<ms>` is one frame at that real time
(screenshot it to check a beat; a beat inside a close-up can fire off screen). `#demo/scene/<level>`
plays it in the game. `npm test` runs the checks above for every scene.
