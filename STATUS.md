# Status: The Long Way Home (rodneyRacoon)

Last updated: Oct 2, 2026 (M7b: lean picked; the directed scene waits for the user's look).
milestone: `docs/decisions.md`.

## Goals

A timed mental-math adventure for the kids (ages 6 and 9), inspired by *Rodney the Raccoon*. The child's
own avatar travels home across 40 levels (5 worlds × 8, from addition within 5 up to all four operations).
Each level is a 60-second page of problems followed by an obstacle cut scene.

- An offline PWA (Vite + TypeScript + React, SVG art) for a Windows PC and an Android tablet, hosted
  on GitHub Pages.
- Adaptive difficulty with weak-fact practice, gentle retries and no "game over".
- Rewards: coins, stars, combos, an avatar shop and a sticker book.
- An avatar builder with an optional photo face that never leaves the device.
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
- **M7b style test (on `m7b-cartoon-look`, not merged):** the user wants a Saturday-morning
  cartoon look (Pokémon as the reference) before M8. Built apart from the game: a three-quarter-
  view hero with anime eyes, six expressions and two builds (`kid`, `lean`); a painted forest; level
  12's vine swing with squash and stretch, an impact burst, focus lines, emotes and a camera push.
  The user picked **lean** and asked for more dynamic animation: the scene is now *directed*
  (freeze frames, camera close-ups and tilts, an anime cut-in, slow motion, crouch and lean,
  cape and hair in the wind, afterimages, dust, a foreground layer). Open `#style` and
  `#style-scene-dynamic` (also `now` and `v1`) in a dev build. Cost at 5× CPU throttle: ~18 ms a
  frame against ~14 ms today (decisions.md).
- **M8 changed:** avatars drawn from photos the user provides (no builder, no photo feature).
- **Checks:** 357 unit tests, lint and build pass on the branch; CI runs them on every push.
- **Known gaps:** the parent controls for adaptive difficulty (and the unlock switch's final home)
  wait for Settings in M10; PNG icons
  and the Pages `base` path (M10).
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. The user plays `#style-scene-dynamic` and says how far to take it (worth trying on the tablet
   too: the dev pages are served only by `npm run dev -- --host`).
2. M7b Phase B: the new hero becomes `Hero` (with gear redrawn for it) and `CutSceneView` gets the
   cartoon beats; then Phase C, world by world (backdrop rasterized, obstacles, chaser, beats in
   the scripts); Phase D, the UI; Phase E, the tablet check.
3. M8 (avatars from the user's photos), then M9 and M10. The rewards play-through is still welcome
   any time (coin pace vs prices, gear at tablet size, sticker book speed).

## Handoff

- **Branch:** `m7b-cartoon-look`, pushed (the style test). `main` has M0–M7. Nothing uncommitted
  except the user's own `handover.md` (an old pre-M5 prompt, out of date). In the dev console, the store module is imported as
  `/src/state/store.ts?t=…` (see the page's resource list) to seed test progress.
- **Waiting on the user:** a look at the directed scene, then photos for M8 (after Phase B).
- **Gotchas:** in a hidden browser pane `requestAnimationFrame` stops and `document.hidden` is true, so
  pages auto-pause and scenes don't advance; scrub scenes with the gallery slider. The dev server's file
  watcher sometimes misses edits made by tools; `touch` the file. Long Bash heredocs fail on Windows;
  write a script file to the scratchpad and run it. Python edits need `encoding='utf-8'` (the files
  have −, × and ÷). Headless Chrome over CDP works for screenshots when the Chrome extension isn't
  connected (start Chrome with `--remote-debugging-port` from the shell, not from Node).
