# Status: The Long Way Home (rodneyRacoon)

Last updated: Oct 2, 2026 (M7b Phase C: World 1, the mine, is painted and directed).
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
  cut-in at 5/10/15); the forest is painted. Level 12 plays the directed vine swing.
- **Phase C, world by world:** **World 1 is done**: the painted mine (a glowing cavern, lanterns,
  crystals, timber sets, a daylight shaft), its 8 obstacles and the boulder chaser repainted (lined
  props, painted ground), and levels 1–8 directed with hit-stops, close-ups, cut-ins, slow motion
  and sparkling landings. Still to come: the forest's other 7 scenes, then River, Mountains, Canyon.
- **M8 changed:** avatars drawn from photos the user provides (no builder, no photo feature).
- **Checks:** 371 unit tests, lint and build pass on the branch; CI runs them on every push.
- **Known gaps:** parent controls for adaptive difficulty and the unlock switch's final home wait for
  Settings (M10), as do PNG icons and the Pages `base` path. A scene's first frame draws the backdrop
  into images (~430 ms under 5× CPU throttle): check it on the tablet (Phase E). The main JS chunk
  is past Vite's 500 kB advisory (536 kB, 157 kB gzipped) as the art grows: harmless for a
  precached PWA, but splitting the art per world is worth a look in M10.
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. The user plays the branch (World 1 and level 12 are directed) and looks at the gear in the shop.
   On the tablet: `npm run dev -- --host`.
2. M7b Phase C continues, one world per commit: the forest's other 7 scenes (its backdrop is
   painted), then River, Mountains, Canyon: the painted backdrop, obstacles and chaser, and cartoon
   beats in its 8 scripts. Then Phase D (the UI) and Phase E (the tablet check), then merge.
3. M8 (avatars from the user's photos), then M9 and M10. The rewards play-through is still welcome
   any time (coin pace vs prices, gear at tablet size, sticker book speed).

## Handoff

- **Branch:** `m7b-cartoon-look`, pushed (the last commit is Phase C's World 1). Nothing uncommitted
  except the user's own `handover.md` (an old pre-M5 prompt, out of date; leave it).
- **Waiting on the user:** a play of Phase B and World 1; photos for M8 whenever they're ready (M8
  follows M7b).
- **How World 1 was done** (a recipe for the next worlds): paint the layers with the paint kit and a
  palette file; line only what he touches (`PROP_OUT`/`PROP_IN`), paint the ground around it; then
  direct each script from its props' own event times (print where each beat lands in real time
  with a throwaway test), and check every beat with `#scene-N-ms` shots, then `#moments-A-B` for
  stickers. Memoize the static parts of anything drawn many times (rats, bats): it halved their cost.
- **Gotchas:** in a hidden browser pane `requestAnimationFrame` barely runs, so pages auto-pause and
  scenes crawl; screenshot `#scene-12-2600`, `#strip-combo-300` or `#gallery-gear` with headless
  Chrome instead (a 1280×894 window gives a 1:1 stage), and measure playback over CDP (Chrome started
  from the shell with `--remote-debugging-port`; `Performance.getMetrics` TaskDuration per frame at
  5× throttle). A freeze must start a few frames after its impact, and a slow or freeze may not
  overlap the next. The dev server's watcher sometimes misses tool edits; `touch` the file. Long
  Bash heredocs fail on Windows; write a script to the scratchpad. Python edits need
  `encoding='utf-8'` and `newline=''`. To seed test progress, import `/src/state/store.ts?t=…` in the
  dev console (see the page's resource list).
