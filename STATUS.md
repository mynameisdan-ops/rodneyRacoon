# Status: The Long Way Home (rodneyRacoon)

Last updated: Oct 2, 2026 (M7b Phase B: the cartoon hero, gear, scenes and page strip are the game's own).
History, session by session: `docs/decisions.md`.

## Goals

A timed mental-math adventure for the kids (ages 6 and 9), inspired by *Rodney the Raccoon*. The child's
own avatar travels home across 40 levels (5 worlds × 8, from addition within 5 up to all four operations).
Each level is a 60-second page of problems followed by an obstacle cut scene.

- An offline PWA (Vite + TypeScript + React, SVG art) for a Windows PC and an Android tablet, hosted
  on GitHub Pages.
- Adaptive difficulty with weak-fact practice, gentle retries and no "game over".
- Rewards: coins, stars, combos, an avatar shop and a sticker book.
- Each child's own avatar, drawn by Claude from photos the parent shares (no photo feature in
  the app).
- No network calls, analytics or trackers.

**Done means:** milestone M10 is finished. The game is installed on the PC and the tablet, and all
40 levels are playable with rewards, audio and parent settings.

## Current state

- **On `main` (pushed):** M0–M4b and M6, plus the Sep 30 feedback fixes: a danger chases the hero
  along the page strip (one per world), and older players get slightly harder pages (the band's top
  and the problem count rise a little per year past a skill's typical age). World 1 is the Old Mine
  Shaft. The tablet play-through went fine (no bugs, no stutter).
- **M5 merged to `main`:** all 40 levels are playable: Worlds 2–5 skills and generators, 32 level
  definitions, skill ages, four new backdrops and 32 cut scenes, ending at home.
- **Feedback fixes (merged):** an overview map of all five worlds (after a boss, "Next world ▶"
  goes there and the hero walks on; the trail map has a map button for it), and a per-player
  "Levels: one by one / all open" switch in the player editor (save format v4).
- **M7 merged to `main`** (at the user's request, before their play-through): coins (right answers, combo bursts, time left,
  first pass, new stars) with a results tally; an avatar shop of 21 hats, capes, packs and pets worn
  on the hero; a sticker book of 40 stickers (stills from each level's cut scene with the child's own
  hero). Save format v5. Map dock buttons open the book and the shop.
- **M7b, a Saturday-morning cartoon look (on `m7b-cartoon-look`, not merged):** the style test
  (lean build, directed scenes, smears, the lively strip, a painted forest) was approved, and
  **Phase B made it real**: the three-quarter-view hero with anime eyes and expressions is `Hero`
  everywhere, all 21 shop items are redrawn for him (hats ride on his head and tuck his hair),
  `CutSceneView` directs every scene (squash and stretch, leans, wind, smears, afterimages, dust,
  camera, impacts, emotes, cut-ins, slow motion and freezes on a real-time clock), every page has
  the lively strip (a dash, a stumble, a combo cut-in at 5/10/15), and the forest is painted.
  Level 12 plays the directed vine swing; the other scenes have the new hero and effects but no
  beats in their scripts yet, and the other four worlds and the forest's other obstacles are
  still flat (Phase C).
- **M8 changed:** avatars drawn from photos the user provides (no builder, no photo feature).
- **Checks:** 370 unit tests, lint and build pass on the branch; CI runs them on every push.
- **Known gaps:** the parent controls for adaptive difficulty (and the unlock switch's final home)
  wait for Settings in M10; PNG icons
  and the Pages `base` path (M10).
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. The user plays the branch (any level; level 12 is the directed one) and looks at the gear in
   the shop. Worth trying on the tablet: `npm run dev -- --host`.
2. M7b Phase C, world by world (Mine, Forest's obstacles, River, Mountains, Canyon): the painted
   backdrop, obstacles and chaser, and cartoon beats in the 8 scripts. Then Phase D (the UI) and
   Phase E (the tablet check: frame rate, and the backdrop-to-image hitch as a scene starts).
3. M8 (avatars from the user's photos), then M9 and M10. The rewards play-through is still welcome
   any time (coin pace vs prices, gear at tablet size, sticker book speed).

## Handoff

- **Branch:** `m7b-cartoon-look`, pushed (Phase B). `main` has M0–M7. Nothing uncommitted
  except the user's own `handover.md` (an old pre-M5 prompt, out of date). In the dev console, the store module is imported as
  `/src/state/store.ts?t=…` (see the page's resource list) to seed test progress.
- **Waiting on the user:** a play of Phase B; photos for M8 whenever they're ready (M8 follows M7b).
- **Gotchas:** in a hidden browser pane `requestAnimationFrame` stops and `document.hidden` is true, so
  pages auto-pause and scenes don't advance; scrub scenes with the gallery slider, or screenshot
  `#scene-12-2600` (a frame at 2.6 s of real time) and `#gallery-gear` (one gallery section) with
  headless Chrome. The dev server's file
  watcher sometimes misses edits made by tools; `touch` the file. Long Bash heredocs fail on Windows;
  write a script file to the scratchpad and run it. Python edits need `encoding='utf-8'` (the files
  have −, × and ÷). Headless Chrome over CDP works for screenshots when the Chrome extension isn't
  connected (start Chrome with `--remote-debugging-port` from the shell, not from Node).
