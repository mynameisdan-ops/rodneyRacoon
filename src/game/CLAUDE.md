# src/game: pure game logic

Plain TypeScript: **no React, no DOM**, deterministic, and every module has a `*.test.ts` next to
it. Randomness comes from the seeded RNG in `rng.ts` (`createRng(seed)`), so tests can pin it.

| File | What |
| --- | --- |
| `config.ts` | Every tunable number: page time, pass and star rules, coins, combo steps, adaptive steps |
| `problems.ts` | Skills (`BASE_SKILL_IDS`, `MIXES`), one generator per skill, `generatePage` |
| `adaptive.ts` | Ratings per skill, start rating from age, older-player reach, `planPage`, weak facts |
| `session.ts` | The page reducer: answers, second tries, reveals, pause time |
| `scoring.ts` | `evaluatePage`: pass and stars |
| `rewards.ts` | Coins for a page (`pageCoins`), combo bursts |
| `progress.ts` | Unlocks (strictly in order, or all open), best stars, current level |
| `shop.ts` | Buying and wearing items |
| `stats.ts` | The parent's stats: answers by fact family, recent pages, the facts to practise |

A problem is `a op b = result` with one blank (`unknown`: the result, or `b` for missing
addends) and a whole-number answer typed on the pad. Its `key` (e.g. `7×8`) identifies the fact
for de-duping and weak-fact tracking; `skill` is the base skill that made it.

## Add a skill

1. `problems.ts`: add the id to `BASE_SKILL_IDS` (in its world's group) and a generator to
   `GENERATORS`. `difficulty` runs 0..1 inside the skill: widen ranges as it rises. Answers are
   whole numbers, never negative, at most 100 so far. A review level is a mix instead: add it to
   `MIXES` as a list of base skills (list one twice to weight it).
2. `content/skills.ts`: the age the skill is typically mastered at, and its name in the parent's
   stats (`SKILL_LABEL`); TypeScript requires both.
3. `problems.test.ts`: cover operand ranges, correct answers, no negative or fractional results,
   and how difficulty moves the ranges (copy a neighbouring skill's tests).
4. Use it in a level row (`content/levels.ts`). Saves accept any skill id automatically; a new
   operator also needs `Op` here and the fact checks in `state/schema.ts` (`sanitizeWeakFact`).

Answers that aren't whole numbers on a number pad (money, time, fractions) need a new problem
shape and input: design that in `docs/PLAN.md` first.

## Tune difficulty or rewards

Global rules are numbers in `config.ts`, including the parent's choices: `pageChoices` (the
timer; the 3-star time and time coins scale with it), `hardestChoices` (a ceiling on the
rating) and `mulDiv` (the share, skills and ages of "× and ÷ in every page", which `planPage`
turns into a `PageMix` for `generatePage`). A level's page size and difficulty range are its row
in `content/levels.ts` (`problems`, `band`). Typical ages per skill are in `content/skills.ts`.
