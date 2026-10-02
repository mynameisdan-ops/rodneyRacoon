# Project Plan — "The Long Way Home" (working title)

Last updated Oct 2, 2026 (M7b cartoon-look style test built; M8 changed to avatars drawn from photos). This is the forward plan: design, milestones with their status, and open
questions. Update it whenever a design decision changes or a milestone moves (see the end-of-session
checklist in `CLAUDE.md`). Current state in a few lines: `STATUS.md`. Session history: `docs/decisions.md`.

A timed mental-math adventure inspired by the classic *Rodney the Raccoon* math game.
The player only does math; the game tells the story. Each correct answer moves the
hero along the trail, and each finished page ends in a cut scene where he gets past
a big obstacle on his way home.

## 1. Decisions so far

| Topic | Decision |
|---|---|
| Hero | A little boy (the child's own avatar) replaces Rodney and makes his own journey home |
| Platforms | Windows PC and Android tablet, as one **web app / PWA** (installable, works offline) |
| Stack | Vite + TypeScript + React, art drawn in code as SVG, animation with CSS; cut scenes sample a pure timeline on a `requestAnimationFrame` clock (decided in M4: no animation library) |
| Avatar | Each child's avatar is **drawn from photos the parent provides** (decided Oct 2, 2026, replacing the in-app builder with a photo-face crop). The likeness becomes generic art parts and unnamed presets; a small Look picker chooses one and the clothing colors. The photos are never committed or stored by the app |
| Profiles | Local profiles saved on each device (IndexedDB). No accounts, no cloud |
| Page | A fixed number of problems in a **60-second** page; the count grows across levels |
| Failing | **Gentle retry**: the hero gets knocked back, sees an encouraging message and replays the level with new problems. No lives, no game over |
| Age tuning | **Adaptive difficulty** that stays inside each level's allowed range |
| Structure | **5 worlds × 8 levels = 40 levels**; each level is 1 page + 1 obstacle cut scene; every 8th level has a bigger "boss obstacle" scene |
| Rewards | Coins spent in an avatar shop, 1–3 stars per level, combo streaks, and journey stickers (one per level) |
| Audio | Sound effects + music only (no voice). Cut scenes tell the story mostly through visuals, with very short captions |
| Parent tools | Stats and difficulty settings live in the normal **Settings** screen (not locked) |
| Unlocking | Levels unlock **strictly in order** (decided in M2). A per-player "Levels: one by one / all open" switch in the player editor opens every level (added Sep 30, 2026 from feedback; it moves into Settings in M10) |
| Submitting | Enter / ✓ checks the answer; auto-submit is a per-profile switch (decided after the M4 playtest) |
| Art style | **Cel-shaded adventure** ("between Math Pirates and Zelda"), still drawn in code as SVG: ink outlines, two-tone shading as overlay shapes (no `filter`), dramatic light. The target is engaging a 9-year-old, not a preschool look (M4b). **M7b** (Oct 2, 2026): a **Saturday-morning cartoon** look (Pokémon as the reference): a three-quarter-view hero (the **lean** build, picked Oct 2) with anime eyes and expressions, painted backgrounds with only the hero and his props lined, and directed scenes: squash and stretch, crouches and leans, cape and hair in the wind, smears and afterimages, impact bursts and freeze frames, focus lines, camera close-ups and tilts, slow motion, emotes and anime cut-ins. Backgrounds are detailed (a paint kit of leaves, grass, ferns, rocks, ivy, litter) and drawn once as images. The page strip makes each answer a moment (a dash, a stumble, a combo cut-in). Style test at `#style`, `#style-scene-dynamic`, `#style-page` and `?toon` |
| Hero | A **young adventurer**: taller proportions, tunic in the player's color, satchel, boots, cape; still the child's own avatar (M4b) |
| Age | Each player has an age (5–10+), set by a parent in the player editor. It sets where every skill's difficulty starts (decided in M6) |
| Hero look before M8 | The hero wears the player's chosen shirt color on the default avatar until the builder stores a full avatar (M3) |

## 2. Core game loop

```
Profile select → Trail map → Level intro (3-2-1)
  → Timed page (60s, N problems; the hero walks the trail strip at the top)
     ├─ pass → reward tally (coins, stars, sticker) → obstacle cut scene → map (next level unlocked)
     │         (after a world's boss: "Next world ▶" → the overview of all worlds, where the hero
     │          walks on to the next world; tap a world to open its trail map)
     └─ fail → "knocked back" mini scene + encouragement → retry (new problems)
```

**Page screen layout (landscape):**
- **Top strip (about 30%)**: the world scene. The hero walks toward the obstacle a step for
  every correct answer and stumbles on a wrong one. The timer is a sun moving across the sky,
  with a small numeric countdown next to it. A **danger chases him** from behind (a boulder, a bee
  swarm, a flood wave, a snowball, a dust devil: one per world). It moves at 85% of the pace that
  finishes the page right at time's up, so a child on pace pulls away and a slow one sees it close
  in, but it never reaches him; after a passed page it falls back and fades (from the Sep 30 feedback).
- **Center**: the current problem in very large type (`7 × 8 = __`), with a small "3 / 15" progress count.
- **Bottom/right**: a big on-screen number pad (buttons at least 72px) with ⌫. A physical
  keyboard works too (digits, Backspace, Enter).
- **Submitting**: the answer is checked when the child presses ✓ or Enter (changed after the M4 playtest:
  checking the first thing typed felt wrong). A per-profile switch in the player editor turns on
  auto-submit (checked as soon as the typed digit count matches the answer). The switch moves to
  Settings in M10.

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
| 1. Old Mine Shaft | 1–8 | + within 5 → within 10 → doubles → make-10 → within 20 | cart race, cart jump, wall smash, rat swarm | Escaping the mine and jumping the **canyon** in a mine train |
| 2. Whispering Forest | 9–16 | − within 10 → within 20 → mixed +/− within 20 → missing addend (`3 + _ = 8`) | fallen log, thorny bramble, dark hollow, owl's riddle gate | Finding a way **through the deep forest** by following fireflies |
| 3. Rushing River | 17–24 | 2-digit +/−, first without and then with regrouping; +/− by 10s | stepping stones, beaver dam, waterfall mist, reed maze | **Crossing the river** on a raft he builds |
| 4. Misty Mountains | 25–32 | × ×0/1/2/10 → ×5 → ×3/4 → ×6–9 → mixed up to 10×10 | rock slide, narrow ledge, snowy pass, goat trail | **Over the peak** in a storm, then sledding down |
| 5. Canyon to Home | 33–40 | ÷ as the inverse of known facts → mixed ×/÷ → final mixed all four operations | dry canyon, zip line, sand dunes, the last hill | **Home**: family, porch light, celebration |

The full list of 40 obstacles, captions and sticker names goes in `src/content/levels.ts`
(data only), so it can be tweaked without touching game code.

**Scene recipe (from the M4 playtest: obstacles must be epic).** Every cut scene has a *threat*, an
*escalation*, a *hero action* and a *triumph*: not "hop over a puddle" but "the gully floods and he swings
across on a vine". Thrilling but never scary for a 6-year-old: nobody gets hurt, animals run off, and it
ends in a cheer. Every scene in Worlds 2–5 follows it (built in M5; the lineup is below).

World 1 became the **Old Mine Shaft** (decided Sep 28, 2026, replacing the Sunny Meadow). Its lineup for
M4b; levels 2–7 are proposals built around the samples above:

| Lv | Epic version |
|---|---|
| 1 | **Cart race**: the tunnel rumbles and a boulder crashes down behind him. He leaps into a mine cart and races it along the rails, the boulder rolling after him, until it smashes through a trestle and drops into a pit. The cart slams into the buffer and flings him clear |
| 2 | **Cart jump**: the track ends at a broken gap; the cart launches off the ramp and lands on the far rails in a shower of sparks |
| 3 | **Wall smash**: a cave-in blocks the tunnel; he rams a loaded ore cart into the cracked wall and bursts through |
| 4 | **Rat swarm**: a flood of rats pours out of a side tunnel; he jumps for a hanging chain and swings over them |
| 5 | **Crystal cavern**: the ledge crumbles under him; he leaps across falling glowing crystals |
| 6 | **Bat storm**: a lantern falls and a storm of bats bursts out; he slides under a low beam as they sweep past |
| 7 | **Runaway lift**: the mine lift's rope snaps; he grabs the chain and climbs out as it drops away |
| 8 | **Boss: escape the mine**: rockfall chases the mine train out of the tunnel mouth, and it jumps the canyon to the far side |

Worlds 2–5 as built in M5 (skills per level in `content/levels.ts`, scenes in `content/cutscenes.ts`):

| World | Skills (levels) | Scenes |
|---|---|---|
| 2. Whispering Forest | − within 10 (9–10), − within 20 (11–12), mixed +/− within 20 (13), missing addend (14–15), review (16) | log roll, bramble vault on a sapling pole, root slide, vine swing over a flooding gully, boar charge (up a tree), mushroom bounce over mud, falling bridge; **boss**: night falls and fireflies lead him over, under and across rising roots |
| 3. Rushing River | ± whole tens (17), 2-digit + and − without regrouping (18–19), with regrouping (20–23), review (24) | stepping stones ahead of a wave, bursting beaver dam, rapids ride on a log, hand over hand along a rope bridge, geyser launch, waterfall slide, climbing away from rising water; **boss**: he builds a raft and surfs a giant wave |
| 4. Misty Mountains | × 0/1/2/10 (25), × 5 (26), × 3/4 (27–28), × 6–9 (29–30), mixed tables (31–32) | rock slide (dive under an overhang), crumbling ledge, avalanche (hang from a branch), goat ride up the ledges, ice bridge slide, icicle cave dash, ice wall climb; **boss**: up the peak in a storm and down on a sled over a crevasse |
| 5. Canyon to Home | ÷ by 1/2/5/10 (33), ÷ 3/4 (34), ÷ 6–9 (35–36), mixed × and ÷ (37), all four operations (38–40) | flash flood (up the rock steps), zip line, dune surf in a sandstorm, tumbleweeds, crumbling arch, hopping a canyon train, the last hill into the wind (home in sight); **boss**: a twister clears, and his family waves from the porch with fireworks |

World 3 puts ± tens first (easier than 2-digit sums), and the typical ages in `content/skills.ts` run
from 6 (− within 10) to 10 (÷ 6–9 and the final mixes).

## 4. Adaptive difficulty

- Each profile keeps a rating (0–1) for each **skill**. A level turns that rating into concrete
  parameters within its band: operand ranges, the problem count and the mix of problem types.
  Each level has a problem range and a difficulty band (`content/levels.ts`); two levels on the
  same skill split the band, so the same rating plays harder on the later one.
- **Starting point from age** (built in M6): a skill starts at 0.5 for a child of the skill's typical
  age (`content/skills.ts`), plus 0.25 for each year older, minus 0.25 for each year younger.
  Changing a player's age restarts their ratings from the new age. Players saved before
  ages existed use age 7 until a parent picks one.
- **Older players reach further** (from the Sep 30 feedback): for each year a player is older than a
  skill's typical age, the level's band top rises 0.1 (at most 0.3) and the page gets one more
  problem (at most 3). It scales with the rating, so a struggling older child still starts easy.
  Numbers in `CONFIG.adaptive.olderReach`.
- After each page: 3 stars → rating up a step; pass → up a small step; fail → rating down.
  The 60-second timer never changes by default. A setting can override the time for a
  profile (for example 90s for a 6-year-old just starting out).
- **Weak-fact weighting**: every missed fact (such as `7×8`) is logged, and the generator
  brings missed facts back more often until they're answered correctly and quickly several
  times. This is the main thing that builds mental-math fluency.
- Leaving a page with ✕ records nothing, on purpose: quitting shouldn't lower a rating.
- The Settings screen (M10) shows the ratings and lets a parent pin a minimum or maximum, or turn adapting off.
  The numbers (steps, weak-fact share, "quick" time, retire streak) live in `CONFIG.adaptive`.

## 5. Avatar

- **Drawn from photos** (M8, changed Oct 2, 2026): the parent shares photos of each child with
  Claude (in chat, or from a folder outside the repo). Claude draws each child's head in the M7b
  style from what reads at cartoon size (face shape, hair, eyes, brows, skin tone, freckles,
  glasses, smile), and the parent approves each one in `#gallery`. The likenesses become generic
  art parts (hair styles, eye shapes, glasses, freckles) and unnamed presets in
  `content/avatar.ts`, so no names or photos are in the repo. The photos are never committed or
  stored by the app, which has no camera or photo feature.
- **Look picker** in the player editor: pick a preset, then the shirt, pants and shoe colors.
  Shop items (hats, capes, backpacks, pets) are extra layers on top. Save v6 adds `avatar`.
- The same `<Hero>` component is used everywhere: map, page strip, cut scenes and shop preview.
  It takes poses (idle, walk, run, jump, leap, climb, cheer, stumble, brace, ride, slide, swing, fall) as props,
  and (from M7b) an expression.

## 6. Rewards

Built in M7 (numbers in `CONFIG.coins`, logic in `game/rewards.ts` and `game/shop.ts`):

- **Coins**: +1 per right answer (even on a page that needs a retry, so trying always pays), combo
  bonuses at 5, 10 and 15 right first try in a row (+2, +3, +5), and on a passed page +1 per 5 seconds
  left, +10 for a level's first pass (+25 for a boss) and +5 for each star above the level's best.
  Replays pay too: replaying is practice. A great first page pays about 50 coins.
- **Results tally**: after a page, each kind of coin is a row with an icon (✓, bolt, sun, flag,
  star) that pops in, then the total counts up; a first pass also shows the new sticker.
- **Avatar Shop** (`content/shop.ts`, data only): 21 items in four slots (6 hats, 5 capes, 4 packs,
  6 pets) from 20 to 350 coins, cheapest first. Tapping an item tries it on the big hero; buying
  puts it straight on; owned items can be worn or taken off. Items are layers on `<Hero>`
  (`art/hero/gear.tsx`): hats ride on the head, shop capes are longer than the default one so they
  show from the side, packs sit on his back, and the pet trots (or flies) just ahead of him. Pets
  are left out of cut scenes, where he leaps and swings.
- **Stars**: 1–3 per level, shown on the map. Replaying keeps the best result.
- **Combo streaks**: "N in a row!" from 3; at 5, 10 and 15 a gold burst shows the coin bonus.
  The rising chime comes with audio in M9.
- **Journey sticker book**: one sticker per level (`content/stickers.ts`: a name and a moment),
  collected on the first pass and shown by world, 8 to a page. A sticker is a still from the
  level's cut scene at its best moment, with the player's own hero (and gear) in it; tap one to
  see it large. Moments are picked with the dev contact sheet (`#moments-1-4`).

## 7. Settings (includes the parent tools)

Profiles (add, rename, delete, change avatar, age) · per-profile timer override · adaptive on/off and
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

- **Cut scenes are data**: each is a short script of steps (`walk`, `move`, `jump`, `hold`,
  `prop`, `caption`, `face`) compiled into a timeline and drawn by one `CutSceneView`; the camera
  follows the hero automatically in scenes wider than the screen. 40 scenes are assembled from
  about 10 reusable obstacle templates plus 5 bespoke boss scenes.
- **Rendering**: fixed 16:10 design canvas (1280×800) scaled to fit, landscape only. SVG for
  art; CSS keyframes and transitions for animation, a rAF-driven timeline for cut scenes. Target 60fps on a mid-range Android tablet.
- **Offline/PWA**: `vite-plugin-pwa` precaches everything. After the first load no network is needed.
- **Hosting**: GitHub Pages (HTTPS is required for PWA install and camera access on the tablet).
  On Windows, install from Edge or Chrome as an app; on Android, use Chrome → "Add to Home screen".
  An optional later step is wrapping it with Capacitor for a real APK.
- **Privacy**: no analytics, no network calls at runtime, and photos only in local IndexedDB.

## 9. Milestones

Each milestone ends in something playable and gets checked in the browser before moving on. Work happens
on a branch per milestone (`mN-short-name`), pushed as it goes, and merged to `main` after the browser
check. Status: ✅ merged, 🟡 built on its branch, ⬜ not started.

| # | Milestone | Playable result | Status |
|---|---|---|---|
| M0 | Scaffold: Vite+TS+React, ESLint/Prettier, Vitest, PWA plugin, `.claude/launch.json` | Blank app runs, tests run | ✅ |
| M1 | Core loop: generators for World 1 skills, 60s page, number pad and keyboard, auto-submit, pass/retry, placeholder art | Play levels 1–8 as plain pages | ✅ |
| M2 | Profiles + persistence + trail map + level unlocks | Two kids with separate saved progress | ✅ |
| M3 | Art system: `<Hero>` paper doll with poses, world backgrounds, trail strip on the page | The hero walks as you answer | ✅ |
| M4 | Cut-scene player + obstacle templates + World 1 scenes; **pause** (see below); **a preview deploy to GitHub Pages and a first check on the real tablet** | Full World 1 experience end to end, smooth on the tablet | ✅ merged Sep 28, 2026 at the user's request, before the tablet check (now a known gap, below) |
| M4b | Art direction: cel-shaded adventure style kit, young-adventurer hero with new poses, dramatic scene steps (run, swing, slide, shake, zoom, fx, slow-mo), UI chrome, and epic World 1 obstacles. Starts with a style test approved in `#gallery`; ends with a tablet check | World 1 looks and plays like an adventure | ✅ merged Sep 28, 2026 at the user's request, before the tablet check (now a known gap, below) |
| M5 | Skills for Worlds 2–5 + all 40 level definitions + remaining cut scenes | All 40 levels playable | ✅ merged Sep 30, 2026 at the user's request; the world overview and the unlock switch followed from feedback |
| M6 | Adaptive difficulty + weak-fact weighting, and an age setting for the starting point | Difficulty adjusts for each kid | ✅ merged; the parent controls (see the ratings, pin, turn off) come with Settings in M10 |
| M7 | Rewards: coins, stars, combos, shop, sticker book | Full reward loop | ✅ merged Sep 30, 2026 at the user's request, before their play-through |
| M7b | Saturday-morning cartoon look: style test (approval) → new hero and animation beats → each world's backdrop, obstacles and chaser repainted → UI to match → tablet check | The game looks and moves like a cartoon | 🟡 style test on `m7b-cartoon-look`: lean build picked; the directed scene, smears, the lively strip and detailed forest wait for approval (Oct 2, 2026) |
| M8 | Avatars drawn from the parent's photos, a Look picker, save v6 (changed Oct 2, 2026) | Kids play as themselves | ⬜ |
| M9 | Audio: synthesized SFX + music loops | Sound on | ⬜ |
| M10 | Settings/stats (moving the unlock-all switch there), PWA polish (PNG icons 192/512, Pages `base` path), final deploy, tablet testing | Installed on PC and tablet | ⬜ |

### Known gaps, scheduled

| Gap | Where it gets fixed |
|---|---|
| ~~No pause~~ Done in M4: a ⏸ button, auto-pause on `visibilitychange` and portrait, problem hidden, Continue to resume. | ✅ M4 |
| ~~Tablet performance is untested.~~ The user played World 1 on the tablet (LAN preview): no bugs, no stutter. Worth a second look with the busier World 2–5 scenes. | ✅ Sep 30, 2026 |
| ~~Leaving a page with ✕ records nothing.~~ Decided in M6: it stays that way (quitting shouldn't lower a rating). | ✅ M6 |
| PNG icons (192/512) for the best Android install; GitHub Pages `base` path. | M10 (the path is needed earlier for the M4 preview) |

## 10. Open items to confirm later

- Game title (placeholder: "The Long Way Home") and the hero's story opening (for example, a
  balloon ride carries him far from home).
- Extensions after level 40 (fractions, money, time, bigger numbers, "endless" mode).

Decided (no longer open): levels unlock strictly in order, with a per-player "all open" switch.
