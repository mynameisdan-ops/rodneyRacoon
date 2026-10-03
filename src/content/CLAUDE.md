# src/content: game data

**Data only** (types, tables and lookups; no game logic). Changing content never needs a logic
change. `content.test.ts` checks that every world and level has everything it needs.

| File | What |
| --- | --- |
| `levels.ts` | `WORLDS`, and one row per level: world, skill, `problems` (page size at the lowest and highest rating), `band` (the slice of the skill's 0..1 difficulty), `obstacle` (title on the map's boss stop), `caption`, `boss` |
| `skills.ts` | The age each skill is typically mastered at, and the ages a parent can pick |
| `stickers.ts` | One sticker per level: a name and a `moment` (0..1 through the level's cut scene) |
| `shop.ts` | One row per shop item: slot, `art` (which drawing), name, price, colors |
| `cutscenes/` | One cut-scene script file per world (see `cutscenes/CLAUDE.md`) |
| `avatar.ts`, `profiles.ts` | Avatar options and player colors |
| `music.ts` | The themes (title and one per world) and stings, in the notation of `audio/notation.ts` |
| `sounds.ts` | What each cut-scene prop state and emote sounds like (every prop state needs a row) |

Ids are saved in players' progress, so never renumber or reorder levels, and never rename a shop
item id. New levels go at the end (in a new world).

## Add a world

1. `levels.ts`: a `WORLDS` row and its level rows (ids continue from the last level; the last
   one has `boss: true`). New skills first: `src/game/CLAUDE.md`.
2. `stickers.ts`: a row per level (pick moments later with the `#moments-<from>-<to>` sheet).
3. `cutscenes/<world>.ts`: a script per level, added to `cutscenes/index.ts`.
4. `art/obstacles/<world>/`: the obstacle art, added to `art/obstacles/registry.ts`
   (`src/art/obstacles/CLAUDE.md`).
5. `art/worlds/`: a theme in `themes.ts`, backdrop layers in `<kind>.tsx` (or reuse a kind with
   new colors), a chaser in `art/chasers.tsx`, and an entry in `registry.ts` (`src/art/CLAUDE.md`).
6. Screens: `WorldsMap.tsx` has a card spot per world (5 now) and `TrailMap.tsx` has 8 stops per
   world; more of either needs a layout change there.
7. `npm test` (content.test.ts names anything missing), then check `#demo/map/<world>` and
   `#gallery`.

## Add a shop item

A row in `shop.ts` (cheapest first within its slot). A new look also needs its `art` key in the
slot's type (`HatArt`, `CapePattern`, `PackArt`, `PetArt`) and a drawing in
`art/hero/gear/<slot>.tsx`. Check it in `#gallery` and `#demo/shop`.

## Writing rules

Captions are a few words (24 characters at most; a test checks) and never needed to play.
Scenes are thrilling but never scary for a 6-year-old.
