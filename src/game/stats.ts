import type { WeakFact, Answer } from './adaptive';
import { CONFIG } from './config';
import { BASE_SKILL_IDS, type BaseSkillId } from './problems';
import type { PageEvaluation } from './scoring';

/**
 * The parent's stats (PLAN §7): answers by fact family (the base skill that made each problem,
 * so a review level counts toward its parts), the most-missed facts, and recent pages.
 */

export interface SkillStats {
  /** Problems answered (a revealed answer counts; one left unanswered at time's up doesn't). */
  answered: number;
  /** Answered right, on either try. */
  right: number;
  /** Answered right on the first try. */
  firstTry: number;
  /** Time spent on them, ms. */
  ms: number;
}

/** One finished page. */
export interface PageRecord {
  at: number;
  level: number;
  right: number;
  total: number;
  stars: PageEvaluation['stars'];
  passed: boolean;
  /** Seconds the page took. */
  seconds: number;
}

export interface PlayerStats {
  skills: Partial<Record<BaseSkillId, SkillStats>>;
  /** Newest first, at most `CONFIG.recentPages`. */
  recent: PageRecord[];
}

export function emptyStats(): PlayerStats {
  return { skills: {}, recent: [] };
}

/** Adds a finished page to the stats. */
export function recordStats(
  stats: PlayerStats,
  level: number,
  evaluation: PageEvaluation,
  answers: readonly Answer[],
  now: number,
): PlayerStats {
  const skills = { ...stats.skills };
  for (const a of answers) {
    const s = skills[a.problem.skill] ?? { answered: 0, right: 0, firstTry: 0, ms: 0 };
    skills[a.problem.skill] = {
      answered: s.answered + 1,
      right: s.right + (a.correct ? 1 : 0),
      firstTry: s.firstTry + (a.correct && a.tries === 1 ? 1 : 0),
      ms: s.ms + a.ms,
    };
  }
  const page: PageRecord = {
    at: now,
    level,
    right: evaluation.correct,
    total: evaluation.total,
    stars: evaluation.stars,
    passed: evaluation.passed,
    seconds: Math.max(0, evaluation.pageSeconds - evaluation.secondsLeft),
  };
  return { skills, recent: [page, ...stats.recent].slice(0, CONFIG.recentPages) };
}

export interface SkillRow {
  skill: BaseSkillId;
  answered: number;
  /** Share right (either try) and right first try, 0..1. */
  right: number;
  firstTry: number;
  /** Average seconds per answer. */
  seconds: number;
}

/** A row per fact family played, in the order the game teaches them. */
export function skillRows(stats: PlayerStats): SkillRow[] {
  return BASE_SKILL_IDS.flatMap((skill) => {
    const s = stats.skills[skill];
    if (!s || s.answered === 0) return [];
    return [
      {
        skill,
        answered: s.answered,
        right: s.right / s.answered,
        firstTry: s.firstTry / s.answered,
        seconds: s.ms / s.answered / 1000,
      },
    ];
  });
}

/** Totals over every fact family. */
export function overall(stats: PlayerStats): { answered: number; right: number; seconds: number } {
  let answered = 0;
  let right = 0;
  let ms = 0;
  for (const s of Object.values(stats.skills)) {
    answered += s.answered;
    right += s.right;
    ms += s.ms;
  }
  return {
    answered,
    right: answered ? right / answered : 0,
    seconds: answered ? ms / answered / 1000 : 0,
  };
}

/** The facts missed most (then most recently): what to practise. */
export function weakestFacts(weakFacts: readonly WeakFact[], count = 10): WeakFact[] {
  return [...weakFacts]
    .sort((a, b) => b.misses - a.misses || b.lastSeen - a.lastSeen)
    .slice(0, count);
}
