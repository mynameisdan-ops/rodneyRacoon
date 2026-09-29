import type { LevelDef } from '../content/levels';
import { DEFAULT_AGE, SKILL_AGE } from '../content/skills';
import { CONFIG } from './config';
import { skillCovers, type Problem, type SkillId } from './problems';
import type { Rng } from './rng';
import type { PageEvaluation, ProblemResult } from './scoring';

/**
 * Adaptive difficulty (PLAN §4). Each player has a rating from 0 to 1 per skill.
 * A level turns the rating into a problem count and a difficulty inside its band.
 * Pages move the rating up or down, and facts the player missed come back more
 * often until they're answered right and quickly a few times in a row.
 */

export interface WeakFact {
  problem: Problem;
  /** Times missed (a second try or a revealed answer both count). */
  misses: number;
  /** Right-and-quick answers in a row since the last miss. */
  streak: number;
  lastSeen: number;
}

/** The part of a player's save that adaptive difficulty reads and writes. */
export interface AdaptiveState {
  /** Null until a parent sets it; `DEFAULT_AGE` is used meanwhile. */
  age: number | null;
  /** Ratings for the skills played so far; others start from the age. */
  ratings: Partial<Record<SkillId, number>>;
  weakFacts: WeakFact[];
}

/** One answered problem on a finished page. */
export interface Answer extends ProblemResult {
  problem: Problem;
}

export interface PagePlan {
  count: number;
  difficulty: number;
  /** Missed facts to mix into the page. */
  weak: Problem[];
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (lo: number, hi: number, t: number) => lo + (hi - lo) * t;

/** Where a new player starts on a skill: harder for older kids, easier for younger. */
export function startRating(skill: SkillId, age: number | null): number {
  const { startAtTypicalAge, startPerYear } = CONFIG.adaptive;
  return clamp01(startAtTypicalAge + ((age ?? DEFAULT_AGE) - SKILL_AGE[skill]) * startPerYear);
}

export function skillRating(state: AdaptiveState, skill: SkillId): number {
  return state.ratings[skill] ?? startRating(skill, state.age);
}

/** Facts this level may bring back, most-missed (then longest-unseen) first. */
export function weakFactsFor(state: AdaptiveState, skill: SkillId): WeakFact[] {
  return state.weakFacts
    .filter((w) => skillCovers(skill, w.problem.skill))
    .sort((a, b) => b.misses - a.misses || a.lastSeen - b.lastSeen);
}

/** The page a player gets on a level: size and difficulty from their rating, plus weak facts. */
export function planPage(level: LevelDef, state: AdaptiveState, rng: Rng): PagePlan {
  const rating = skillRating(state, level.skill);
  const count = Math.round(lerp(level.problems[0], level.problems[1], rating));
  const difficulty = lerp(level.band[0], level.band[1], rating);
  const room = Math.floor(count * CONFIG.adaptive.weakShare);
  // Take the top candidates, with a little shuffle so the same few don't always win.
  const weak = weakFactsFor(state, level.skill)
    .slice(0, room * 2)
    .map((w, i) => ({ w, order: i + rng.next() * room }))
    .sort((a, b) => a.order - b.order)
    .slice(0, room)
    .map(({ w }) => w.problem);
  return { count, difficulty, weak };
}

/** A skill's rating after a page: up a step for 3 stars, a little for a pass, down for a miss. */
export function nextRating(rating: number, evaluation: PageEvaluation): number {
  const { step } = CONFIG.adaptive;
  if (!evaluation.passed) return clamp01(rating + step.fail);
  return clamp01(rating + (evaluation.stars === 3 ? step.threeStars : step.pass));
}

/** Updates the weak-fact list with a page's answers. */
export function updateWeakFacts(
  list: readonly WeakFact[],
  answers: readonly Answer[],
  now: number,
): WeakFact[] {
  const { fastMs, retireStreak, maxWeakFacts } = CONFIG.adaptive;
  const byKey = new Map(list.map((w) => [w.problem.key, { ...w }]));
  for (const a of answers) {
    const key = a.problem.key;
    const known = byKey.get(key);
    const missed = !a.correct || a.tries > 1;
    if (missed) {
      byKey.set(key, {
        problem: a.problem,
        misses: (known?.misses ?? 0) + 1,
        streak: 0,
        lastSeen: now,
      });
    } else if (known) {
      const quick = a.ms <= fastMs;
      const streak = quick ? known.streak + 1 : known.streak;
      if (streak >= retireStreak) byKey.delete(key);
      else byKey.set(key, { ...known, streak, lastSeen: now });
    }
  }
  return [...byKey.values()].sort((a, b) => b.lastSeen - a.lastSeen).slice(0, maxWeakFacts);
}

/** Everything adaptive difficulty learns from one finished page. */
export function applyPage(
  state: AdaptiveState,
  level: LevelDef,
  evaluation: PageEvaluation,
  answers: readonly Answer[],
  now: number,
): AdaptiveState {
  return {
    ...state,
    ratings: {
      ...state.ratings,
      [level.skill]: nextRating(skillRating(state, level.skill), evaluation),
    },
    weakFacts: updateWeakFacts(state.weakFacts, answers, now),
  };
}
