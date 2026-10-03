# Obstacle art

The big obstacle in each level's cut scene. One folder per world (`mine/`, `forest/`, `river/`,
`mountain/`, `canyon/`), each with:

| File | What |
| --- | --- |
| `<obstacleId>.tsx` | One obstacle (e.g. `logRoll.tsx` for `log-roll`): its `…Back` drawing (behind the hero) and optional `…Front` (in front of him) |
| `layout.ts` | Positions shared with the scripts in `content/cutscenes/<world>.ts`, so art and script agree |
| `kit.ts` | The world's shared colors and helpers |
| `parts.tsx` | The world's shared drawings (pits, rails, rivers, rocks, waves) |
| `index.ts` | The world's obstacles by id: drawings, `width` (from the anchor) and `focus` |

`registry.ts` merges the worlds and derives `ObstacleId`; `sceneKit.ts` has helpers for every
world: motion (`since`, `progress`, `fallen`, `bump`, eases, `noise`, `rollAngle`),
`heroPasses`, `roundPath`, and `circles()` / `ellipses()`.

## How an obstacle is drawn

- It gets `ObstacleProps` (`types.ts`): scene time `t`, the current prop `state` and `since`,
  the whole prop schedule `events`, and the hero's feet now (`heroX`, `heroLift`) and at any
  time (`heroAt(t)`), all relative to the anchor: (0, 0) on the ground line, up is negative y.
- All motion is computed from `t` and the schedule, not CSS, so any frame can be drawn exactly
  (stickers are stills). Time a motion to end when a later event fires with
  `eventTime(events, 'drop')`. A prop that waits for him (a stone that sinks once he's left it)
  uses `heroPasses()` (cached), so a script can hold him for a close-up without the ground
  vanishing under him.
- The style (`src/art/CLAUDE.md`): line only what he touches and the animals (`PROP_OUT`,
  `PROP_IN`), and paint the ground around them; moving water that acts is cel-drawn.
- Obstacles are drawn every frame: memoize the static parts of anything drawn many times (a swarm
  of rats or bats), sway or turn things with a transform rather than rebuilding their shapes, and
  draw a cloud of small moving pieces (foam, drops, bubbles) as one path (`circles()`).
- Only about 160px shows below the ground line: keep pits shallow and the action above it.
- `focus` is the local x the page-strip preview centers on (default 0, the anchor).

## Add an obstacle

1. Positions the script needs go in the world's `layout.ts`.
2. Draw it in `<world>/<obstacleId>.tsx`, reusing the world's `kit.ts` and `parts.tsx`.
3. Add it to `<world>/index.ts` with its `width` (and `focus`).
4. Write the script (`src/content/cutscenes/CLAUDE.md`) and check it with `#scene-<level>`.

A new world: a new folder with the same files, added to `registry.ts`.
