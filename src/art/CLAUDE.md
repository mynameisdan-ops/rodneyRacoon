# src/art: SVG art

Cel-shaded adventure style ("between Math Pirates and Zelda"), drawn in code. Check art changes
in `#gallery` (every pose, item, sticker and scene) and the `#demo` screens.

## Style kit (`style.ts`)

- Every object gets the ink outline: `{...ink(width)}` (color `INK`).
- Shading and highlights are flat overlay shapes colored with `shade(c)` / `tint(c)` (or
  `mix`). **No CSS or SVG `filter`**, blur or drop shadows: they are slow on tablets. Glows are
  stacked translucent circles (`Glow` in `fx.tsx`).
- Shared effects in `fx.tsx`: `Glow`, `Dust`, `SparkBurst`, `SparkTrail`, `SpeedLines`, `Debris`.

## The hero (`hero/`)

- `Hero.tsx` is the one avatar component, used everywhere (map, page strip, scenes, shop), driven
  by an `AvatarConfig` (`avatar.ts`) and a `pose`. He faces right in a 100×170 view with his feet
  at (52, 163), so any screen can place him by his feet.
- Poses (`poses.ts`) are CSS rotations of limbs that hang from their joints (`hero.css`).
  A new pose: add it to `HERO_POSES`, then its keyframes in `hero.css`.
- Shop gear is drawn in the hero's view units, one file per slot in `hero/gear/` (hats, capes,
  packs, pets); `ItemIcon` draws an item alone. Pets stay out of cut scenes (`pet={false}`).

## World backdrops (`worlds/`)

- `registry.ts` gives each world id its `WorldArt`: theme colors (`themes.ts`), four backdrop
  layers (`clouds`, `far`, `mid`, `near`), whether the top layer drifts, its chaser, and the
  timer style (sun or lantern). An unknown id gets the first world's art.
- Layers live in one file per kind (`mine.tsx`, `forest.tsx`, `river.tsx`, `mountain.tsx`,
  `canyon.tsx`); each gets `LayerProps<Theme>` (`sceneryKit.ts`). A new world can reuse a kind
  with a new theme, or add a kind: a theme interface and colors in `themes.ts`, four layers in
  `<kind>.tsx`, and a `world(...)` entry in `registry.ts`.
- Each layer is a 1280px tile drawn twice side by side: ridges start and end at the same height
  (`ridgePath`), and details keep clear of the edges. Scenery is placed with the seeded RNG.
- Chasers (`chasers.tsx`) are the dangers behind the hero on the page strip, drawn in
  `CHASER_BOX` (`chaserData.ts`) and animated with CSS only. Thrilling, never scary.

Obstacles: `obstacles/CLAUDE.md`.
