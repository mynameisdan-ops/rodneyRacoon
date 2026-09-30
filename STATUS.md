# Status: The Long Way Home (rodneyRacoon)

Last updated: Sep 30, 2026 (M7 rewards built on `m7-rewards`, waiting for a play-through before merging).
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
- **M7 built on `m7-rewards` (pushed, not merged):** coins (right answers, combo bursts, time left,
  first pass, new stars) with a results tally; an avatar shop of 21 hats, capes, packs and pets worn
  on the hero; a sticker book of 40 stickers (stills from each level's cut scene with the child's own
  hero). Save format v5. Map dock buttons open the book and the shop.
- **Checks:** 323 unit tests, lint and build pass on `m7-rewards`; CI runs them on every push.
- **Known gaps:** the parent controls for adaptive difficulty (and the unlock switch's final home)
  wait for Settings in M10; PNG icons
  and the Pages `base` path (M10).
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. The user plays `m7-rewards` (and Worlds 2–5 if not done yet): PC with `npm run dev`, tablet with
   the LAN preview (`npm run build`, then `npm run preview -- --host`). Worth a look: coin pace vs
   prices, whether the pets and gear read well at tablet size, and how the sticker book runs on the
   tablet (each page draws 8 scene stills). Feedback goes in `docs/feedback.md`.
2. Merge `m7-rewards` to `main` after that check, then M8 (avatar builder + photo face), M9, M10.

## Handoff

- **Branch:** `m7-rewards`, pushed; `main` has M0–M6 and M5's feedback fixes. Nothing uncommitted
  except the user's own `handover.md`. In the dev console, the store module is imported as
  `/src/state/store.ts?t=…` (see the page's resource list) to seed test progress.
- **Waiting on the user:** a play-through of the rewards (and of Worlds 2–5), then the go-ahead to merge.
- **Gotchas:** in a hidden browser pane `requestAnimationFrame` stops and `document.hidden` is true, so
  pages auto-pause and scenes don't advance; scrub scenes with the gallery slider. The dev server's file
  watcher sometimes misses edits made by tools; `touch` the file. Long Bash heredocs fail on Windows;
  write a script file to the scratchpad and run it. Python edits need `encoding='utf-8'` (the files
  have −, × and ÷). Headless Chrome over CDP works for screenshots when the Chrome extension isn't
  connected (start Chrome with `--remote-debugging-port` from the shell, not from Node).
