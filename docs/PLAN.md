# Project Plan: "The Long Way Home" (working title)

Last updated Oct 3, 2026 (M9, audio, and M10's settings and PWA polish merged; the deploy waits
on turning GitHub Pages on, the tablet test on the user; M8 waits for the photos). The forward plan: design, milestones with their status, and open
questions. Update it when a design decision changes or a milestone moves. Current state:
`STATUS.md`. History: `docs/decisions.md` (older entries in `docs/archive/`). Where code lives
and how to extend it: `CLAUDE.md` and the area guides it lists.

A timed mental-math adventure inspired by the classic *Rodney the Raccoon* math game. The player
only does math; the game tells the story. Each correct answer moves the hero along the trail, and
each finished page ends in a cut scene where he gets past a big obstacle on his way home.

## 1. Decisions

| Topic | Decision |
|---|---|
| Hero | The child's own avatar: a young adventurer (tunic in the player's color, satchel, boots, cape) making his own journey home; from M7b a three-quarter view (the lean build) with anime eyes and expressions |
| Platforms | Windows PC and Android tablet, as one installable web app (PWA) that works offline |
| Stack | Vite, TypeScript, React; art drawn in code as SVG; CSS animation; cut scenes sample a pure timeline on a `requestAnimationFrame` clock (no animation library) |
| Art style | **Saturday-morning cartoon** (M7b, Oct 2, 2026; Pokémon is the reference), replacing M4b's cel-shaded adventure: painted, detailed backgrounds (drawn once as images) with only the hero and his props lined; directed scenes with squash and stretch, crouches and leans, wind in his cape and hair, smears and afterimages, impact bursts and freeze frames, focus lines, close-ups and tilts, slow motion, emotes and anime cut-ins. No `filter`. It should engage a 9-year-old, not look preschool |
| Avatar | **Drawn from photos the parent provides** (decided Oct 2, 2026, replacing an in-app builder with a photo-face crop). The likenesses become generic art parts and unnamed presets; a small Look picker chooses one and the clothing colors. The photos are never committed or stored by the app |
| Profiles | Local profiles on each device (IndexedDB). No accounts, no cloud |
| Page | A fixed number of problems in a **60-second** page; the count grows across levels |
| Failing | **Gentle retry**: the hero is knocked back, sees an encouraging message and replays the level with new problems. No lives, no game over |
| Structure | **5 worlds × 8 levels = 40 levels**; each level is 1 page + 1 obstacle cut scene; every 8th level is a bigger boss scene |
| Age tuning | Adaptive difficulty inside each level's allowed range. A parent sets each player's age (5 to 10+), which sets where every skill starts |
| Unlocking | Levels unlock strictly in order. A per-player "levels: one by one / all open" switch in Settings opens them all |
| Submitting | Enter / ✓ checks the answer; auto-submit is a per-profile switch |
| Rewards | Coins spent in an avatar shop, 1–3 stars per level, combo streaks, and a sticker per level |
| Audio | Sound effects and music only (no voice), all synthesized with Web Audio (M9): a theme per world plus the title, played without its tune on a timed page; stings for results and bosses; scene sounds worked out from each scene's beats. Volumes are per device. Scenes tell the story through visuals and very short captions |
| Parent tools | Stats and difficulty settings live in the normal **Settings** screen (⚙ on the players screen, not locked) |
| Hero look before M8 | The player's chosen shirt color on the default avatar, plus shop gear |

## 2. Core game loop

```
Profile select → Trail map → Level intro (3-2-1)
  → Timed page (60s, N problems; the hero walks the trail strip at the top)
     ├─ pass → reward tally (coins, stars, sticker) → obstacle cut scene → map (next level unlocked)
     │         (after a world's boss: "Next world ▶" → the overview of all worlds, where the hero
     │          walks on to the next world; tap a world to open its trail map)
     └─ fail → "knocked back" + encouragement → retry (new problems)
```

**Page layout (landscape):**
- **Top strip (about 30%)**: the world scene. The hero dashes toward the obstacle a step per
  correct answer (a crouch, a dash with dust and a smear, a springy landing) and stumbles on a
  wrong one while the strip shakes; 5, 10 and 15 in a row slam in a cut-in of his face, and his
  face watches the danger behind him (M7b). The timer is a sun crossing the sky (a lantern glow
  in the mine), with a small countdown. A **danger chases him** (boulder, bee swarm, flood wave,
  snowball, dust devil: one per world) at 85% of the pace that finishes the page at time's up, so
  a child on pace pulls away and a slow one sees it close in, but it never reaches him; after a
  passed page it falls back and fades.
- **Center**: the problem in very large type (`7 × 8 = __`), with a small "3 / 15" count.
- **Bottom/right**: a big number pad (keys at least 72px) with ⌫ and ✓; a keyboard works too.

**Answer rules:**
- Correct: a chime, coins, the combo counter goes up, the hero steps forward.
- Wrong: a gentle buzz, the input shakes, one more try. A second miss briefly shows the answer,
  moves on, counts as a miss and goes to the weak-facts tracker.
- **Pass** = every problem answered before time runs out, with at least 80% correct.
- **Stars**: ★ pass · ★★ at least 90% · ★★★ 100% first try with at least 10s left.
- A ⏸ button pauses; the page also pauses when the app is hidden or the tablet turns to portrait.
  Leaving with ✕ records nothing (quitting shouldn't lower a rating).

All thresholds live in `src/game/config.ts`.

## 3. Worlds and math progression

Each level has a fixed *skill* and a *difficulty band* that the adaptive engine moves within
(`src/content/levels.ts`); pages grow from about 10 to about 20 problems (8–13 for two-digit
mental math). Typical ages per skill run from 5 to 10 (`src/content/skills.ts`).

| World | Levels | Skills | Boss (levels 8/16/24/32/40) |
|---|---|---|---|
| 1. Old Mine Shaft | 1–8 | + within 5 → within 10 → doubles → make-10 → within 20 → review | Escape the mine: the mine train jumps the canyon |
| 2. Whispering Forest | 9–16 | − within 10 → within 20 → mixed +/− → missing addend (`3 + _ = 8`) → review | Night falls; fireflies lead him through the deep forest |
| 3. Rushing River | 17–24 | ± whole tens → 2-digit +/− without, then with regrouping → review | He builds a raft and surfs a giant wave |
| 4. Misty Mountains | 25–32 | × 0/1/2/10 → × 5 → × 3/4 → × 6–9 → mixed tables | Up the peak in a storm, then down on a sled |
| 5. Canyon to Home | 33–40 | ÷ by 1/2/5/10 → ÷ 3/4 → ÷ 6–9 → mixed × and ÷ → all four operations | Home: a twister clears, family, porch light, fireworks |

Every level's scene is described in its script (`src/content/cutscenes/`) and its obstacle's
layout comments (`src/art/obstacles/<world>/layout.ts`).

**Scene recipe (from the M4 playtest: obstacles must be epic).** Every cut scene has a threat, an
escalation, a hero action and a triumph: not "hop over a puddle" but "the gully floods and he
swings across on a vine". Thrilling but never scary for a 6-year-old: nobody gets hurt, animals
run off, and it ends in a cheer.

## 4. Adaptive difficulty

- Each profile keeps a rating (0–1) per **skill**. A level turns it into a problem count and a
  difficulty inside its band; two levels on one skill split the band, so the same rating plays
  harder on the later one.
- **Start from age**: 0.5 for a child of the skill's typical age, ±0.25 per year older or younger.
  Changing a player's age restarts their ratings. Players saved before ages existed use age 7.
- **Older players reach further**: per year past a skill's typical age, the band's top rises 0.1
  (at most 0.3) and the page gets one more problem (at most 3), scaled by the rating.
- After each page: 3 stars → up a step; pass → up a small step; fail → down.
- **Weak facts**: every missed fact is logged and comes back more often (up to 30% of a page)
  until it's answered right and quickly 3 times in a row. This is what builds fluency.
- The 60-second timer never changes by default; a setting can override it per profile (for
  example 90s for a 6-year-old starting out).
- Settings (M10) shows the ratings and lets a parent pin a minimum or maximum, or turn adapting off.

Numbers in `CONFIG.adaptive`.

## 5. Avatar (M8, changed Oct 2, 2026)

- **Drawn from photos**: the parent shares photos of each child with Claude (in chat, or from a
  folder outside the repo). Claude draws each child's head in the M7b style from what reads at
  cartoon size (face shape, hair, eyes, brows, skin tone, freckles, glasses, smile), and the
  parent approves each one in `#gallery`. The likenesses become generic art parts (hair styles,
  eye shapes, glasses, freckles) and unnamed presets in `content/avatar.ts`, so no names or photos
  are in the repo. The app has no camera or photo feature.
- **Look picker** in the player editor: pick a preset, then the shirt, pants and shoe colors.
  Shop items (hats, capes, packs, pets) are extra layers on top. A new save version adds
  `avatar` (v6 went to M9's sound settings, v8 to the × ÷ and blocks settings, so it is v9).
- The same `<Hero>` is used everywhere (map, page strip, cut scenes, shop), posed by a prop and
  (from M7b) given an expression.

## 6. Rewards (built in M7)

- **Coins**: +1 per right answer (even on a page that needs a retry), combo bursts at 5, 10 and 15
  right first try in a row (+2, +3, +5), and on a pass +1 per 5 seconds left, +10 for a level's
  first pass (+25 for a boss) and +5 per star above the level's best. Replays pay too. A great
  first page pays about 50; the shop's items total about 2,800.
- **Results tally**: a row per kind of coin, then the total counts up; a first pass shows the new
  sticker.
- **Avatar shop**: hats, capes, packs and pets worn on the hero (pets stay out of cut scenes).
  Tap to try on, tap again to buy; owned items can be worn or taken off.
- **Sticker book**: one sticker per level, collected on the first pass: a still of the level's
  cut scene with the player's own hero (and gear) in it, shown by world, 8 to a page.

## 7. Settings (built in M10, includes the parent tools)

- **Sound** (this device): effects and music, each off / low / medium / high. The map's speaker
  button mutes both.
- **Each player**: age (a new age restarts the difficulty), answers (press ✓ / automatic), levels
  (one by one / all open), time per page (60 / 90 / 120 s: the 3-star time and time coins scale
  with it, so more time doesn't pay more), difficulty (adapts / stays put; missed facts are
  practised either way) and the hardest it gets (easy / medium / hard / no limit). Added Nov 6
  (save v8): **× and ÷** (in their levels / in every page: 30% of a page on levels 1–24 is
  times and sharing, each table at the player's own rating, the easier tables only for younger
  players) and **blocks** (off / show each problem: + joins two groups into rows of ten, −
  sends blocks away, a missing number shows empty places, × shows the same array grouped both
  ways, ÷ deals a pile into equal groups; past 20, tens rods and ones). Name & color
  (the player editor), **start over** (levels, stars, stickers, difficulty and stats; coins, gear
  and settings are kept) and delete, each confirmed.
- **Progress**: levels passed, stars, pages played, right %, seconds per answer; a row per fact
  family (answered, right, right first try, seconds per answer); the 10 most-missed facts; the
  last 10 pages. Stats begin with save v7 (older pages count in levels and stars only).
- **The app**: an Install button where the browser offers one, what offline and privacy mean, the
  build date.

## 8. Technical notes

- **Rendering**: a fixed 1280×800 (16:10) design canvas scaled to fit, landscape only. Target
  60fps on a mid-range Android tablet.
- **Offline/PWA**: `vite-plugin-pwa` precaches everything, including the bundled font. After the
  first load no network is needed.
- **Hosting**: GitHub Pages (HTTPS is needed to install). `deploy.yml` builds with
  `--base=/<repo>/` and publishes on every push to `main` once Pages is on (Settings → Pages →
  Source: GitHub Actions); until then it skips. The repo is private, so Pages needs a paid plan or
  a public repo (a Pages site is public either way). On Windows, install from Edge or Chrome; on
  Android, Chrome → "Install app" / "Add to Home screen". A later option is Capacitor for an APK.
- **Install polish (M10)**: PNG icons drawn from the hero's cut-in (192 and 512, a maskable 512,
  the Apple touch icon, a favicon; `npm run icons`), a manifest with a stable `id`, fullscreen
  landscape, and relative `start_url`/`scope` so any base path works. Chrome reports it
  installable with no errors. A new version installs in the background and takes over on the
  next launch, never mid-page.
- **Privacy**: no analytics, no network calls at runtime, photos only in local IndexedDB.

## 9. Milestones

Each milestone ends in something playable and gets a browser check before moving on, on a branch
per milestone (`mN-short-name`) merged to `main` afterwards. Status: ✅ merged, 🟡 on its
branch, ⬜ not started.

| # | Milestone | Playable result | Status |
|---|---|---|---|
| M0 | Scaffold: Vite, TS, React, ESLint, Prettier, Vitest, PWA plugin | Blank app runs, tests run | ✅ |
| M1 | Core loop: World 1 generators, 60s page, pad and keyboard, pass/retry | Levels 1–8 as plain pages | ✅ |
| M2 | Profiles, saving, trail map, level unlocks | Two kids with separate progress | ✅ |
| M3 | Art system: `<Hero>` with poses, world backdrops, trail strip | The hero walks as you answer | ✅ |
| M4 | Cut-scene player, obstacle art, World 1 scenes, pause | World 1 end to end | ✅ |
| M4b | Art direction: cel-shaded style kit, adventurer hero, dramatic scene steps, epic World 1 | World 1 looks like an adventure | ✅ |
| M5 | Skills for Worlds 2–5, all 40 levels, the remaining scenes, world overview | All 40 levels playable | ✅ |
| M6 | Adaptive difficulty, weak facts, the age setting | Difficulty adjusts for each kid | ✅ (parent controls in M10) |
| M7 | Rewards: coins, stars, combos, shop, sticker book | Full reward loop | ✅ |
| M7b | Saturday-morning cartoon look: style test (approved) → the new hero and animation beats (Phase B) → each world's backdrop, obstacles, chaser and scenes repainted (Phase C) → the UI to match (D) → the tablet check (E) | The game looks and moves like a cartoon | ✅ (Phase E, the tablet check, moved to M10's tablet testing at the user's request) |
| M8 | Avatars drawn from the parent's photos, a Look picker, a new save version | Kids play as themselves | ⬜ (waits for the photos; M9 and M10 went first, Oct 3) |
| M9 | Audio: synthesized SFX and music loops, the map's speaker button, save v6 | Sound on | ✅ |
| M10 | Settings and stats (with the unlock switch), PWA polish (PNG icons 192/512, Pages `base` path), final deploy, tablet testing (including M7b's: scene frame rate and the first-frame hitch) | Installed on PC and tablet | 🟡 Settings, stats and PWA polish merged (Oct 3); deployed to GitHub Pages (public repo, Nov 6); the tablet test is the user's |

**Open gaps:** none for the deploy (live on Pages since Nov 6; every push to `main` deploys). The repainted scenes
and the new audio haven't been checked on the tablet yet (M10); if the first frame of a scene
hitches there, warm its backdrop images during the results screen.

## 10. Open items

- The game title (placeholder: "The Long Way Home") and the hero's story opening (for example, a
  balloon ride carries him far from home).
- After level 40: fractions, money, time, bigger numbers, an "endless" mode.
