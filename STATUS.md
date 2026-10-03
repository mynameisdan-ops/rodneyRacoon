# Status: The Long Way Home (rodneyRacoon)

Last updated: Oct 3, 2026 (M7b Phase C: Worlds 1–3 painted and directed; `main`'s restructure
merged into this branch). History: `docs/decisions.md`.

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

- **On `main`:** M0–M7 (all 40 levels, adaptive difficulty, the world overview, the "all open"
  switch, coins, the 21-item shop and the 40-sticker book; save format v5), plus the Oct 3
  restructure (area guides, one file per obstacle and a script file per world, a world art
  registry, a CSS file per screen, `#demo` links, `npm run check`).
- **M7b, a Saturday-morning cartoon look (`m7b-cartoon-look`, pushed, not merged):** Phase B made
  the three-quarter-view hero with anime eyes and expressions, the 21 shop items redrawn for him,
  scenes directed on a real-time clock (squash and stretch, smears, impacts, cut-ins, slow
  motion, freezes) and the lively page strip. **Phase C, world by world:** Worlds 1–3 (mine,
  forest, river) are painted, their 24 obstacles and three chasers repainted, and levels 1–24
  directed. Still to come: Mountains, Canyon. `main`'s restructure is merged in (nothing a player
  sees changed).
- **M8 changed:** avatars drawn from photos the user provides (no builder, no photo feature).
- **Checks:** 419 unit tests, lint and build pass on the branch; CI runs them on every push.
- **Known gaps:** parent controls for adaptive difficulty and the unlock switch's final home wait
  for Settings (M10), as do PNG icons and the Pages `base` path. A scene's first frame draws the
  backdrop into images (0.2–1s under 5× CPU throttle, the forest heaviest): check it on the
  tablet (Phase E). The main JS chunk is past Vite's 500 kB advisory (613 kB, 176 kB gzipped):
  harmless for a precached PWA, but splitting the art per world is worth a look in M10.
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. The user plays the branch (Worlds 1–3 are directed) and looks at the gear in the shop. On the
   tablet: `npm run dev -- --host`.
2. M7b Phase C continues, one world per commit: Mountains, then Canyon ("Repaint a world" in
   `src/art/CLAUDE.md`). Then Phase D (the UI) and Phase E (the tablet check), then merge.
3. M8 (avatars from the user's photos), then M9 and M10. The rewards play-through is still welcome
   any time (coin pace against prices, gear at tablet size, sticker book speed).

## Handoff

- **Branch:** `m7b-cartoon-look`, pushed, with `main` merged in. On the user's PC, `handover.md`
  is the user's own old file (out of date; leave it).
- **Waiting on the user:** a play of Worlds 1–3; photos for M8 whenever they're ready (M8 follows
  M7b).
