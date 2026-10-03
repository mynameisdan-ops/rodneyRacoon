# Status: The Long Way Home (rodneyRacoon)

Last updated: Oct 3, 2026 (M7b finished and merged to `main`: all five worlds painted and
directed, the UI restyled). History: `docs/decisions.md`.

## Goals

A timed mental-math adventure for the kids (ages 6 and 9), inspired by *Rodney the Raccoon*. The
child's own avatar travels home across 40 levels (5 worlds × 8, from addition within 5 up to all
four operations); each level is a 60-second page of problems and then an obstacle cut scene.

- An offline PWA (Vite, TypeScript, React, SVG art) for a Windows PC and an Android tablet, hosted
  on GitHub Pages. No network calls, analytics or trackers.
- Adaptive difficulty with weak-fact practice, gentle retries and no "game over".
- Rewards: coins, stars, combos, an avatar shop and a sticker book.
- Each child's own avatar, drawn by Claude from photos the parent shares (no photo feature in
  the app).

**Done means:** M10 is finished: the game is installed on the PC and the tablet, and all 40 levels
are playable with rewards, audio and parent settings.

## Current state

- **On `main`:** M0–M7b. All 40 levels with cut scenes; adaptive difficulty with an age setting;
  a danger chasing the hero on each page; the world overview; the "all open" switch; coins, the
  21-item shop and the 40-sticker book (save format v5).
- **M7b, the Saturday-morning cartoon look, is done:** the three-quarter-view hero with anime
  eyes and expressions; all five worlds painted (mine, forest, river, mountains, canyon), their
  40 obstacles and five chasers repainted and every scene directed (impacts, hit-stops,
  close-ups, cut-ins, slow motion); the lively page strip; and the UI restyled to match
  (`styles/cartoon.css`). The tablet check (Phase E) moved to M10 at the user's request.
- **M8 changed (Oct 2):** avatars drawn from photos the user provides (no builder, no photo
  feature in the app).
- **Checks:** 421 unit tests, lint and build pass; CI runs them on every push.
- **Known gaps:** parent controls for adaptive difficulty and the unlock switch's final home wait
  for Settings (M10), as do PNG icons and the Pages `base` path. The repainted scenes haven't run
  on the tablet: in the dev build at 5× CPU throttle they cost 15–20 ms a frame and the first
  frame hitches 0.5–0.8 s while the backdrop is drawn into images (check in M10). The main JS
  chunk is 722 kB (201 kB gzipped): fine for a precached PWA; splitting the art per world is an
  M10 idea.
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. The user plays the new look (all 40 scenes; `#demo/scene/<level>` plays any one) and the
   rewards (coin pace against prices, gear at tablet size). Notes go in `docs/feedback.md`.
2. M8 (avatars drawn from the user's photos, a Look picker, save v6) on a new branch.
3. M9 (audio), then M10 (settings, PWA polish, deploy, tablet testing).

## Handoff

- **Branch:** `main`, pushed, with `m7b-cartoon-look` merged. On the user's PC, `handover.md` is
  the user's own old file (out of date; leave it).
- **Waiting on the user:** a play of the new look; photos for M8 whenever they're ready.
