# Obstacle art

The big obstacle in each level's cut scene. One folder per world (`mine/`, `forest/`, `river/`,
`mountain/`, `canyon/`), each with:

| File | What |
| --- | --- |
| `<obstacleId>.tsx` | One obstacle (e.g. `logRoll.tsx` for `log-roll`): its `…Back` drawing (behind the hero) and optional `…Front` (in front of him) |
| `layout.ts` | Positions shared with the scripts in `content/cutscenes/<world>.ts`, so art and script agree |
| `kit.ts` | The world's shared colors and helpers |
| `parts.tsx` | The world's shared drawings (pits, rails, rivers, rocks) |
| `index.ts` | The world's obstacles by id: drawings, `width` (from the anchor) and `focus` |

`registry.ts` merges the worlds and derives `ObstacleId`; `sceneKit.ts` has motion helpers for
every world (`since`, `progress`, `fallen`, `bump`, eases, `noise`, `rollAngle`).

## How an obstacle is drawn

- It gets `ObstacleProps` (`types.ts`): scene time `t`, the current prop `state` and `since`,
  the whole prop schedule `events`, and the hero's feet now (`heroX`, `heroLift`) and at any
  time (`heroAt(t)`), all relative to the anchor: (0, 0) on the ground line, up is negative y.
- All motion is computed from `t` and the schedule, not CSS, so any frame can be drawn exactly
  (stickers are stills). To end a motion exactly when a later event fires, time it with
  `eventTime(events, 'drop')`.
- Only about 160px shows below the ground line: keep pits shallow and the action above it.
- `focus` is the local x the page-strip preview centers on (default 0, the anchor).
- Style rules: `src/art/CLAUDE.md` (ink outlines, flat shading, no `filter`).

## Add an obstacle

1. Positions the script needs go in the world's `layout.ts`.
2. Draw it in `<world>/<obstacleId>.tsx`, reusing the world's `kit.ts` and `parts.tsx`.
3. Add it to `<world>/index.ts` with its `width` (and `focus`).
4. Write the script (`src/content/cutscenes/CLAUDE.md`) and check it in `#gallery`.

A new world: a new folder with the same files, added to `registry.ts`.
