# Status: The Long Way Home (rodneyRacoon)

Last updated: Sep 30, 2026 (M5 merged to main; world overview and unlock switch from feedback).
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
- **Checks:** 304 unit tests, lint and build pass on `main`; CI runs them on every push.
- **Known gaps:** the parent controls for adaptive difficulty (and the unlock switch's final home)
  wait for Settings in M10; PNG icons
  and the Pages `base` path (M10).
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. The user plays Worlds 2–5 (PC with `npm run dev`, tablet with the LAN preview: `npm run build`,
   then `npm run preview -- --host`). To jump ahead, set "Levels: all open" in the player editor (✎).
   Feedback goes in `docs/feedback.md`.
2. M7 (rewards: coins, stars, combos, shop, sticker book), then M8–M10 as `docs/PLAN.md` §9 lists.

## Handoff

- **Branch:** `main`, pushed, with `m5-worlds` and `fb-world-progress` merged; nothing uncommitted
  except the user's own `handover.md`. In the dev console, the store module is imported as
  `/src/state/store.ts?t=…` (see the page's resource list) to seed test progress.
- **Waiting on the user:** a play-through of Worlds 2–5 (and a tablet look at the busier scenes).
- **Gotchas:** in a hidden browser pane `requestAnimationFrame` stops and `document.hidden` is true, so
  pages auto-pause and scenes don't advance; scrub scenes with the gallery slider. The dev server's file
  watcher sometimes misses edits made by tools; `touch` the file. Long Bash heredocs fail on Windows;
  write a script file to the scratchpad and run it. Python edits need `encoding='utf-8'` (the files
  have −, × and ÷). Headless Chrome over CDP works for screenshots when the Chrome extension isn't
  connected (start Chrome with `--remote-debugging-port` from the shell, not from Node).
