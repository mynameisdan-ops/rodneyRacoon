# Status: The Long Way Home (rodneyRacoon)

Last updated: Oct 2, 2026 (M7b Phase C: Worlds 1–3, the mine, the forest and the river, are painted and directed).
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
- **Phase C, world by world:** **Worlds 1–3 are done**: the painted mine (a glowing cavern,
  lanterns, crystals, timber sets, a daylight shaft), the painted forest and the painted river (a
  waterfall with a rainbow, willows, ducks, a sandy shore), all 24 obstacles and three chasers
  repainted (lined props and animals, painted ground, cel-drawn splashes and waves), and levels
  1–24 directed with hit-stops, close-ups, cut-ins, slow motion and sparkling landings. Still to
  come: Mountains, Canyon.
- **M8 changed:** avatars drawn from photos the user provides (no builder, no photo feature).
- **Checks:** 372 unit tests, lint and build pass on the branch; CI runs them on every push.
- **Known gaps:** parent controls for adaptive difficulty and the unlock switch's final home wait for
  Settings (M10), as do PNG icons and the Pages `base` path. A scene's first frame draws the backdrop
  into images (0.2–1 s under 5× CPU throttle, the forest heaviest): check it on the tablet (Phase E). The main JS chunk
  is past Vite's 500 kB advisory (613 kB, 176 kB gzipped) as the art grows: harmless for a
  precached PWA, but splitting the art per world is worth a look in M10.
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. The user plays the branch (Worlds 1–3 are directed) and looks at the gear in the shop.
   On the tablet: `npm run dev -- --host`.
2. M7b Phase C continues, one world per commit: Mountains, then Canyon: the painted backdrop,
   obstacles and chaser, and cartoon beats in its 8 scripts. Then Phase D (the UI) and Phase E
   (the tablet check), then merge.
3. M8 (avatars from the user's photos), then M9 and M10. The rewards play-through is still welcome
   any time (coin pace vs prices, gear at tablet size, sticker book speed).

## Handoff

- **Branch:** `m7b-cartoon-look`, pushed (the last commit is Phase C's World 3). Nothing uncommitted
  except the user's own `handover.md` (an old pre-M5 prompt, out of date; leave it).
- **Waiting on the user:** a play of Worlds 1–3; photos for M8 whenever they're ready (M8
  follows M7b).
- **How Worlds 1–3 were done** (a recipe for the next worlds): paint the layers with the paint
  kit and a palette file; line only what he touches and the animals (`PROP_OUT`/`PROP_IN`), paint
  the ground around them (moving water that acts is cel-drawn); then direct each script from its
  props' own event times (print where each beat lands in real time with a throwaway test), check
  every beat with `#scene-N-ms` shots (a beat inside a close-up can fire off screen; a cut-in
  counts scene time, so slow motion stretches it), then the sticker moments. Props that must wait
  for him use `heroPasses()`. Memoize static parts, sway things with a transform, and draw clouds
  of small moving pieces (foam, drops) as one path (`circles()`); each roughly halved the extra
  cost.
- **Gotchas:** in a hidden browser pane `requestAnimationFrame` barely runs, so pages auto-pause and
  scenes crawl; screenshot `#scene-12-2600`, `#strip-combo-300` or `#gallery-gear` with headless
  Chrome instead (a 1280×894 window gives a 1:1 stage), and measure playback over CDP (Chrome started
  from the shell with `--remote-debugging-port`; `Performance.getMetrics` TaskDuration per frame at
  5× throttle). A freeze must start a few frames after its impact, and a slow or freeze may not
  overlap the next. The dev server's watcher sometimes misses tool edits; `touch` the file. Long
  Bash heredocs fail on Windows; write a script to the scratchpad. Python edits need
  `encoding='utf-8'` and `newline=''`. To seed test progress, import `/src/state/store.ts?t=…` in the
  dev console (see the page's resource list). `#moments-A-B` is now too heavy for headless Chrome
  to paint in time (half-drawn tiles): check stickers as single `#scene-N-ms` frames at the
  moment's real time. Frame costs vary ±25% between identical runs: take the best of three. In
  the dev build React's element creation dominates a scene's cost, so count elements per frame.
