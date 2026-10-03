# Screens and UI

`src/App.tsx` is the router: a `Screen` union and a switch, with no URL routing. Screens get
data and callbacks as props; state changes go through the store (`src/state/store.ts`).
`src/ui/` holds pieces shared by screens (`Stage`, `NumberPad`, `TrailStrip`, `Stars`, `Sticker`,
`icons`). Everything is laid out on the 1280×800 design canvas that `Stage` scales to the screen.

## CSS

Each screen and UI piece has its own CSS file next to it, imported in cascade order by
`src/styles.css` (base, stage, shared bits, screens, then `styles/chrome.css`, which restyles
chips and titles, then the sticker, shop and book files, and last `styles/cartoon.css`, the M7b
cartoon look: sunburst backdrops, outlined titles, buttons and cards lit along their tops). A
later file wins over an earlier one, so keep that order; `cartoon.css` changes looks only, never
sizes or layout. Class names follow BEM (`block__part--state`). Art components import their own
CSS (`hero.css`, `chasers.css`, `backdrop.css`, `cutscene.css`).

## Add a screen

1. A component in `src/screens/` (and its CSS file, added to `src/styles.css` before
   `styles/chrome.css`).
2. A variant in the `Screen` union in `App.tsx` and a `case` in the switch. Screens that work
   before a player is picked go in `NO_PLAYER`.
3. A `#demo/<name>` case in `src/dev/demo.ts`, so it can be opened directly.

## Checking UI (dev server)

`#demo` opens the game with two made-up players in memory (Sam, 9, through level 19 with 640
coins and gear; Ava, 6, just starting). Nothing is saved. Reload after changing the hash:

`#demo` (map) · `#demo/profiles` · `#demo/editor` · `#demo/new` · `#demo/map/3` ·
`#demo/worlds/2` (walks on from world 2) · `#demo/shop` · `#demo/stickers/2` · `#demo/page/12` ·
`#demo/results/9` · `#demo/retry/9` · `#demo/scene/16`

Check at 1280×800 and a phone size such as 915×412. Kid-UX rules are in the root `CLAUDE.md`.
Art-only dev pages (`#gallery-<section>`, `#scene-<level>-<ms>`, `#strip`) are listed in
`src/art/CLAUDE.md`; `ArtGallery`, `ScenePreview` and `StripDemo` are those dev screens.
