# Status: The Long Way Home (rodneyRacoon)

Last updated: Nov 6, 2026 (live on GitHub Pages; feedback: × and ÷ in every page, and blocks).
History: `docs/decisions.md`.

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

- **On `main`:** M0–M7b, M9 and most of M10. All 40 levels with cut scenes; adaptive difficulty;
  a danger chasing the hero on each page; the world overview; coins, the 21-item shop and the
  40-sticker book; the Saturday-morning cartoon look (M7b) in all five worlds and the UI.
- **M9, audio:** synthesized effects for every screen and cut scene, a theme per world (no tune
  under a timed page), stings, per-device volumes and a mute button on the map (save v6).
  `#sounds` plays and measures everything.
- **M10 so far:** Settings (⚙ on the players screen): sound; per player the age, answers,
  levels, time per page, difficulty adapts/stays put and a ceiling, start over and delete; a
  Progress view (by fact family, the facts to practise, recent pages) (save v7). PNG icons drawn
  from the hero's cut-in, a polished manifest, an Install button, and a Pages build under
  `/rodneyRacoon/` that Chrome reports installable. `deploy.yml` deploys on pushes to `main`
  once Pages is on.
- **Nov 6 feedback (save v8):** two per-player settings: **× and ÷ in every page** (30% of
  pages on levels 1–24) and **Blocks** (each problem drawn as blocks that join, leave, close up
  or split; `#demo/page/12/blocks`, `#demo/page/3/mix`).
- **M8 (avatars from the user's photos)** waits for the photos; it will be save v9.
- **Checks:** 518 unit tests, lint and build pass; CI runs them on every push.
- **Live:** https://mynameisdan-ops.github.io/rodneyRacoon/ (public repo, Pages Source: GitHub
  Actions, since Nov 6). Every push to `main` deploys. The game, manifest, service worker and
  icons load there with no console errors.
- **Known gaps:** nothing has run on the tablet yet: the repainted scenes cost 15–20 ms a frame in
  the dev build at 5× CPU throttle and their first frame hitches 0.5–0.8 s; the audio is
  untested on a real tablet speaker. The main JS chunk is 760 kB (about 210 kB gzipped), fine
  for a precached PWA.
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. Install on the PC and the tablet from the Pages URL and play: scene frame rate and the
   first-frame hitch, sound levels, Settings at tablet size. Notes go in `docs/feedback.md`.
2. Try the new settings with the kids: is 30% × ÷ the right amount, and are the blocks
   readable and quick enough on the tablet (tune in `config.ts` / `blockLayout.ts`)?
3. M8 (avatars from the user's photos) when the photos are ready.

## Handoff

- **Branch:** `main`, pushed, with `fb-mul-div-blocks` (Nov 6 feedback) merged. On the user's
  PC, `handover.md` is the user's own old file (out of date; leave it).
- **Waiting on the user:** installing and playing on the PC and the tablet, photos for M8.
