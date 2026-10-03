# src/art: SVG art

A **Saturday-morning cartoon** look (M7b; Pokémon is the reference), drawn in code. The hero and
the props he touches are lined and cel-shaded; backgrounds, and the ground around his props, are
painted. **No CSS or SVG `filter`**, blur or drop shadows: they are slow on tablets.

## Style kit (`style.ts`)

- Lined things get bold `INK` outlines on the silhouette (2.5 view units on the hero,
  `PROP_OUT` 3.2px on scene props) and thin ones inside (1.3, `PROP_IN` 1.5px): `{...ink(w)}`.
- One crisp shadow shape per part and a rim light, lit from the upper right, colored with
  `shade(c)` / `tint(c)` (or `mix`).
- Painted things (backgrounds, pits, ledges, rails, beams overhead) are gradients and soft shapes
  with no outlines, detailed with the paint kit (`worlds/paintKit.tsx`: leaves, grass, ferns,
  rocks, ivy, litter, glints). Still water is painted; water that acts (waves, splashes, jets) is
  cel-drawn with lines, like an effect.
- Shared effects in `fx.tsx` (dust, sparks, speed and dash lines, smears, impact bursts, emotes).

## The hero (`hero/`)

- `Hero.tsx` is the one avatar component, used everywhere (map, page strip, scenes, shop), driven
  by an `AvatarConfig` (`avatar.ts`), a `pose` and optionally an `expression` (`expressions.ts`;
  otherwise each pose wears its own face) and `wind`. He faces right in a 100×170 view with his
  feet at (52, 163).
- He stands in a three-quarter view: his near arm and leg (his right) hang on the left of his
  body, so a raised near arm goes up or back (angles near 180° or positive in `hero.css`), never
  across his face. Joints are in `body.ts`; scenes size him (`SCENE_SIZE`) so his hands reach
  175px up in the swing pose, the reach ropes and vines are laid out for.
- Poses (`poses.ts`) are CSS rotations of limbs hanging from their joints (`hero.css`). A new
  pose: add it to `HERO_POSES` and `POSE_EXPRESSION`, then its keyframes in `hero.css`.
- `CutIn.tsx` is the anime cut-in (a close-up of his face), pure in `dt`.
- Shop gear is one file per slot in `hero/gear/` (hats, capes, packs, pets; shared sizes in
  `kit.ts`, placement and icon frames in `layout.ts`). Hats are drawn in head units and ride
  inside `Head`; capes, packs and pets are in the hero's view. Pets stay out of cut scenes.

## World backdrops (`worlds/`)

- `registry.ts` gives each world id its `WorldArt`: theme colors (`themes.ts`), backdrop layers
  (`clouds`, `far`, `mid`, `near`, and an optional `front`), a painted sky (three stops), whether
  the top layer drifts, its chaser, and the timer (sun or lantern). An unknown id gets World 1's.
- Layers live in one file per kind (`mine.tsx`, `forest.tsx`, `river.tsx`, `mountain.tsx`,
  `canyon.tsx`); each gets `LayerProps<Theme>` (`sceneryKit.ts`). The painted worlds (mine,
  forest, river so far) take their colors from `minePalette.ts`, `forestPalette.ts`,
  `riverPalette.ts`. A new world can reuse a kind with a new theme, or add a kind: a theme in
  `themes.ts`, a palette, the layers in `<kind>.tsx`, and a `world(...)` entry in `registry.ts`.
- Each layer is a 1280px tile drawn twice side by side: ridges start and end at the same height,
  and anything at a tile's edge is drawn the same at both ends. Scenery is placed with the seeded
  RNG.
- Scenes and the page strip draw each layer once as an image (`WorldBackdrop raster`), so detail
  costs nothing per frame. The `front` layer (big leaves, dark rocks, reeds) passes in front of
  him in scenes only; a scene that leaves its world sets `foreground: false`.
- Chasers (`chasers.tsx`) are the dangers behind him on the page strip, drawn in `CHASER_BOX`
  and animated with CSS only. Thrilling, never scary.

## Repaint a world (how Worlds 1–3 were done)

Paint the layers with the paint kit and a palette file; line only what he touches and the animals,
painting the ground around them; then direct each script from its props' event times
(`src/content/cutscenes/CLAUDE.md`), check every beat with `#scene-N-ms` shots, then pick the
sticker moments. Obstacles: `obstacles/CLAUDE.md`.

## Checking art (dev server)

- `#gallery` shows everything; `#gallery-<section>` shows one section small enough for a 1280×800
  shot: `gear`, `poses`, `icons`, `gear-poses`, `hair`, `stickers`, `scenes`, `worlds`.
  `#gallery-worlds-1` shows World 1's backdrop as the scene, the map and the page strip draw it.
- `#scene-12` opens level 12's scene in the scrubber; `#scene-12-2600` is its frame at 2.6s of
  real time, without controls.
- `#strip` plays a page of answers on the page strip; `#strip-combo-300` holds one moment
  (`correct`, `combo`, `wrong` or `danger`); add `-L1` for level 1's world and obstacle.
- Screenshots: headless Chrome (a 1280×894 window gives a 1:1 stage). `#moments-A-B` is now too
  heavy to paint in time headless: check stickers as `#scene-N-ms` frames instead.
- Performance: measure over CDP (Chrome started from the shell with `--remote-debugging-port`;
  `Performance.getMetrics` task duration per frame at 5× CPU throttle). Runs vary ±25%: take the
  best of three. In the dev build React's element creation dominates a scene's cost.
