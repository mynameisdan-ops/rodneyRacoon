# Project Plan — "The Long Way Home" (working title)

A timed mental-math adventure inspired by the classic *Rodney the Raccoon* math game.
The player only does math; the game tells the story. Each correct answer moves the
hero along the trail, and each finished page ends in a cut scene where he gets past
a big obstacle on his way home.

## 1. Decisions so far

| Topic | Decision |
|---|---|
| Hero | A little boy (the child's own avatar) replaces Rodney and makes his own journey home |
| Platforms | Windows PC and Android tablet, as one **web app / PWA** (installable, works offline) |
| Stack | Vite + TypeScript + React, art drawn in code as SVG, animation with `motion` |
| Avatar | Cartoon **avatar builder** (skin, hair, eyes, clothes), plus an **optional photo face** that is cropped into a circle and stays on the device |
| Profiles | Local profiles saved on each device (IndexedDB). No accounts, no cloud |
| Page | A fixed number of problems in a **60-second** page; the count grows across levels |
| Failing | **Gentle retry**: the hero gets knocked back, sees an encouraging message and replays the level with new problems. No lives, no game over |
| Age tuning | **Adaptive difficulty** that stays inside each level's allowed range |
| Structure | **5 worlds × 8 levels = 40 levels**; each level is 1 page + 1 obstacle cut scene; every 8th level has a bigger "boss obstacle" scene |
| Rewards | Coins spent in an avatar shop, 1–3 stars per level, combo streaks, and journey stickers (one per level) |
| Audio | Sound effects + music only (no voice). Cut scenes tell the story mostly through visuals, with very short captions |
| Parent tools | Stats and difficulty settings live in the normal **Settings** screen (not locked) |

## 2. Core game loop

```
Profile select → Trail map → Level intro (3-2-1)
  → Timed page (60s, N problems; the hero walks the trail strip at the top)
     ├─ pass → reward tally (coins, stars, sticker) → obstacle cut scene → map (next level unlocked)
     └─ fail → "knocked back" mini scene + encouragement → retry (new problems)
```

**Page screen layout (landscape):**
- **Top strip (about 30%)**: the world scene. The hero walks toward the obstacle a step for
  every correct answer and stumbles on a wrong one. The timer is a sun moving across the sky,
  with a small numeric countdown next to it.
- **Center**: the current problem in very large type (`7 × 8 = __`), with a small "3 / 15" progress count.
- **Bottom/right**: a big on-screen number pad (buttons at least 72px) with ⌫. A physical
  keyboard works too (digits, Backspace, Enter).
- **Auto-submit**: the answer is checked as soon as the number of typed digits matches
  the correct answer, so there's no Enter step and the game stays fast.

**Answer rules:**
- Correct: a chime, +coins, the combo counter goes up, the hero steps forward.
- Wrong: a gentle buzz, the input shakes, and the child gets one more try. A second miss
  briefly shows the correct answer, moves on and counts as a miss. The miss also goes to the
  weak-facts tracker.
- **Pass** = every problem answered before time runs out, with at least 80% correct.
- **Stars**: ★ pass · ★★ at least 90% · ★★★ 100% with at least 10s left. All thresholds live in one config file.

## 3. Worlds, math progression and obstacles

Each level has a *skill* (fixed) and a *difficulty band* (min to max) that the adaptive
engine moves within. The number of problems per page ramps from about 10 to about 20.

| World | Levels | Skill progression | Sample obstacles (cut scenes) | Boss obstacle (Lv 8/16/24/32/40) |
|---|---|---|---|---|
| 1. Sunny Meadow | 1–8 | + within 5 → within 10 → doubles → make-10 → within 20 | tall grass, muddy puddle, fence stile, bee swarm | Crossing the **ravine** on a rope bridge |
| 2. Whispering Forest | 9–16 | − within 10 → within 20 → mixed +/− within 20 → missing addend (`3 + _ = 8`) | fallen log, thorny bramble, dark hollow, owl's riddle gate | Finding a way **through the deep forest** by following fireflies |
| 3. Rushing River | 17–24 | 2-digit +/−, first without and then with regrouping; +/− by 10s | stepping stones, beaver dam, waterfall mist, reed maze | **Crossing the river** on a raft he builds |
| 4. Misty Mountains | 25–32 | × ×0/1/2/10 → ×5 → ×3/4 → ×6–9 → mixed up to 10×10 | rock slide, narrow ledge, snowy pass, goat trail | **Over the peak** in a storm, then sledding down |
| 5. Canyon to Home | 33–40 | ÷ as the inverse of known facts → mixed ×/÷ → final mixed all four operations | dry canyon, zip line, sand dunes, the last hill | **Home**: family, porch light, celebration |

The full list of 40 obstacles, captions and sticker names goes in `src/content/levels.ts`
(data only), so it can be tweaked without touching game code.

## 4. Adaptive difficulty

- Each profile keeps a rating (0–1) for each **skill**. A level turns that rating into concrete
  parameters within its band: operand ranges, the problem count and the mix of problem types.
- After each page: 3 stars → rating up a step; pass → up a small step; fail → rating down.
  The 60-second timer never changes by default. A setting can override the time for a
  profile (for example 90s for a 6-year-old just starting out).
- **Weak-fact weighting**: every missed fact (such as `7×8`) is logged, and the generator
  brings missed facts back more often until they're answered correctly and quickly several
  times. This is the main thing that builds mental-math fluency.
- The Settings screen shows the ratings and lets a parent pin a minimum or maximum, or turn adapting off.

## 5. Avatar

- **Builder**: layered SVG "paper doll" with skin tone, hair style and color, eyes, shirt,
  pants and shoes. Shop items (hats, capes, backpacks, pets) are extra layers.
- **Optional photo face**: take a photo with the camera or pick a file
  (`<input type="file" accept="image/*" capture="user">`), then drag and zoom it into a
  circular crop. It's saved as a small (256px) image in IndexedDB and replaces the drawn
  face. **It never leaves the device.**
- The same `<Hero>` component is used everywhere: map, page strip, cut scenes and shop preview.
  It takes poses (idle, walk, jump, climb, cheer, stumble) as props.

## 6. Rewards

- **Coins**: +1 per correct answer, plus combo bonuses (5, 10 and 15 in a row) and a bonus for
  time left over. Spent in the **Avatar Shop**.
- **Stars**: 1–3 per level, shown on the map. Replaying keeps the best result.
- **Combo streaks**: visual bursts and a rising chime pitch at 5, 10 and 15 correct in a row.
- **Journey sticker book**: one sticker per level (such as the rope bridge or the river otter),
  collected when the level is passed, and shown by world.

## 7. Settings (includes the parent tools)

Profiles (add, rename, delete, change avatar) · per-profile timer override · adaptive on/off and
limits · unlock or replay any level · stats: accuracy and average answer time by fact family,
the 10 weakest facts, recent sessions · sound and music volume · reset progress.

## 8. Technical architecture

```
src/
  main.tsx, App.tsx            app shell, screen router (simple state machine, no URL routing)
  game/                        PURE TypeScript, no React; all unit-tested
    problems.ts                problem generators per skill (seeded RNG)
    levels.ts                  level → skill + band + page size (reads content/)
    adaptive.ts                ratings, weak-fact weighting
    scoring.ts                 pass/stars/coins/combo rules
    config.ts                  all tunable numbers (timer, thresholds, rewards)
  content/                     data only: levels.ts (40 levels), shop.ts, stickers.ts, worlds.ts
  state/                       store (zustand) + persistence (IndexedDB via idb-keyval, versioned schema + migrations)
  screens/                     ProfileSelect, TrailMap, Page, Results, CutScene, Shop, StickerBook, Settings, AvatarBuilder
  art/                         SVG React components
    hero/                      layered paper-doll + poses
    worlds/                    parallax background layers per world
    obstacles/                 reusable obstacle props (bridge, river, log, rocks...)
  cutscenes/                   timeline-driven scene player + per-level scene scripts (data)
  audio/                       Web Audio synthesized SFX + simple music loops (no audio files needed)
  ui/                          NumberPad, Timer, Buttons, StarRow, CoinCounter
```

- **Cut scenes are data**: each is a short script of steps (`walkTo`, `jump`, `useProp`,
  `camera`, `caption`, `wait`) played by one `CutScenePlayer`. 40 scenes are assembled from
  about 10 reusable obstacle templates plus 5 bespoke boss scenes.
- **Rendering**: fixed 16:10 design canvas (1280×800) scaled to fit, landscape only. SVG for
  art; CSS and `motion` for animation. Target 60fps on a mid-range Android tablet.
- **Offline/PWA**: `vite-plugin-pwa` precaches everything. After the first load no network is needed.
- **Hosting**: GitHub Pages (HTTPS is required for PWA install and camera access on the tablet).
  On Windows, install from Edge or Chrome as an app; on Android, use Chrome → "Add to Home screen".
  An optional later step is wrapping it with Capacitor for a real APK.
- **Privacy**: no analytics, no network calls at runtime, and photos only in local IndexedDB.

## 9. Milestones

Each milestone ends in something playable and gets checked in the browser before moving on.

| # | Milestone | Playable result |
|---|---|---|
| M0 | Scaffold: Vite+TS+React, ESLint/Prettier, Vitest, PWA plugin, `.claude/launch.json` | Blank app runs, tests run |
| M1 | Core loop: generators for World 1 skills, 60s page, number pad and keyboard, auto-submit, pass/retry, placeholder art | Play levels 1–8 as plain pages |
| M2 | Profiles + persistence + trail map + level unlocks | Two kids with separate saved progress |
| M3 | Art system: `<Hero>` paper doll with poses, world backgrounds, trail strip on the page | The hero walks as you answer |
| M4 | Cut-scene player + obstacle templates + World 1 scenes | Full World 1 experience end to end |
| M5 | Skills for Worlds 2–5 + all 40 level definitions + remaining cut scenes | All 40 levels playable |
| M6 | Adaptive difficulty + weak-fact weighting | Difficulty adjusts for each kid |
| M7 | Rewards: coins, stars, combos, shop, sticker book | Full reward loop |
| M8 | Avatar builder + photo-face crop | Kids play as themselves |
| M9 | Audio: synthesized SFX + music loops | Sound on |
| M10 | Settings/stats, PWA polish, GitHub Pages deploy, tablet testing | Installed on PC and tablet |

## 10. Open items to confirm later

- Game title (placeholder: "The Long Way Home") and the hero's story opening (for example, a
  balloon ride carries him far from home).
- Whether levels should unlock strictly in order or whole worlds can be browsed.
- Extensions after level 40 (fractions, money, time, bigger numbers, "endless" mode).
