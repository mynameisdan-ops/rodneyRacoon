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
- Each child's own avatar, drawn by Claude from photos the parent shares (no photo feature in the app).
- No network calls, analytics or trackers.

**Done means:** milestone M10 is finished. The game is installed on the PC and the tablet, and all
40 levels are playable with rewards, audio and parent settings.

## Current state

- **On `main` (pushed): M0–M7.** All 40 levels are playable (5 worlds, each with its danger chasing
  the hero along the page strip), with adaptive difficulty, the world overview map, the per-player
  "all levels open" switch, and the rewards (coins, a 21-item shop, a 40-sticker book). Save format v5.
- **M7b, a Saturday-morning cartoon look (`m7b-cartoon-look`, pushed, not merged):** the style test
  was approved and **Phase B made it real**. The three-quarter-view hero with anime eyes and
  expressions is `Hero` everywhere; all 21 shop items are redrawn for him; `CutSceneView` directs
  every scene on a real-time clock (squash and stretch, leans, wind, smears, dust, camera, impacts,
  emotes, cut-ins, slow motion, freezes); every page has the lively strip (a dash, a stumble, a combo
  cut-in at 5/10/15); the forest is painted. Level 12 plays the directed vine swing. Still to come
  (Phase C): beats in the other 39 scripts, and painted versions of the other four worlds and the
  forest's other seven obstacles.
- **M8 changed:** avatars drawn from photos the user provides (no builder, no photo feature).
- **Checks:** 370 unit tests, lint and build pass on the branch; CI runs them on every push.
- **Known gaps:** parent controls for adaptive difficulty and the unlock switch's final home wait for
  Settings (M10), as do PNG icons and the Pages `base` path. A scene's first frame draws the backdrop
  into images (~430 ms under 5× CPU throttle): check it on the tablet (Phase E).
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. The user plays the branch (any level; level 12 is the directed one) and looks at the gear in the
   shop. On the tablet: `npm run dev -- --host`.
2. M7b Phase C, one world per commit (Mine, the forest's obstacles, River, Mountains, Canyon): the
   painted backdrop, obstacles and chaser, and cartoon beats in its 8 scripts. Then Phase D (the UI)
   and Phase E (the tablet check), then merge.
3. M8 (avatars from the user's photos), then M9 and M10. The rewards play-through is still welcome
   any time (coin pace vs prices, gear at tablet size, sticker book speed).

## Handoff

- **Branch:** `m7b-cartoon-look` at `5ee3439`, pushed. Nothing uncommitted except the user's own
  `handover.md` (an old pre-M5 prompt, out of date; leave it).
- **Waiting on the user:** a play of Phase B; photos for M8 whenever they're ready (M8 follows M7b).
- **Gotchas:** in a hidden browser pane `requestAnimationFrame` barely runs, so pages auto-pause and
  scenes crawl; screenshot `#scene-12-2600`, `#strip-combo-300` or `#gallery-gear` with headless
  Chrome instead, and measure playback over CDP (Chrome started from the shell with
  `--remote-debugging-port`). The dev server's watcher sometimes misses tool edits; `touch` the file.
  Long Bash heredocs fail on Windows; write a script to the scratchpad. Python edits need
  `encoding='utf-8'` and `newline=''`. To seed test progress, import `/src/state/store.ts?t=…` in the
  dev console (see the page's resource list).
