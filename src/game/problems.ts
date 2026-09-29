import type { Rng } from './rng';

export type Op = '+' | '−' | '×' | '÷';

/**
 * A problem shown as `a op b = result`. `unknown` says which slot is blank;
 * `answer` is the value that goes in that slot.
 */
export interface Problem {
  a: number;
  op: Op;
  b: number;
  result: number;
  unknown: 'result' | 'b';
  answer: number;
  /** Stable identity of the fact, e.g. "7+8", used for de-duping and weak-fact tracking. */
  key: string;
  /** The skill that made it (a review page mixes several). */
  skill: BaseSkillId;
}

export const SKILL_IDS = [
  'add-within-5',
  'add-within-10',
  'doubles',
  'make-10',
  'add-within-20',
  'world1-review',
] as const;
export type SkillId = (typeof SKILL_IDS)[number];

export type BaseSkillId = Exclude<SkillId, 'world1-review'>;

/** `difficulty` is 0..1 within a skill; the adaptive engine (M6) will choose it. */
type Generator = (rng: Rng, difficulty: number) => Problem;

function add(skill: BaseSkillId, a: number, b: number): Problem {
  const key = `${a}+${b}`;
  return { a, op: '+', b, result: a + b, unknown: 'result', answer: a + b, key, skill };
}

function missingAddend(skill: BaseSkillId, a: number, total: number): Problem {
  const b = total - a;
  return { a, op: '+', b, result: total, unknown: 'b', answer: b, key: `${a}+_=${total}`, skill };
}

const lerpInt = (lo: number, hi: number, t: number) => Math.round(lo + (hi - lo) * t);

const GENERATORS: Record<BaseSkillId, Generator> = {
  // Sums from 2 to 5; zeros only appear at the easiest end.
  'add-within-5': (rng, d) => {
    const lo = d < 0.3 ? 0 : 1;
    const sum = rng.int(2, 5);
    const a = rng.int(lo, sum - lo);
    return add('add-within-5', a, sum - a);
  },
  // Sums up to 10; harder difficulty pushes sums toward 10.
  'add-within-10': (rng, d) => {
    const sum = rng.int(lerpInt(3, 7, d), 10);
    const a = rng.int(1, sum - 1);
    return add('add-within-10', a, sum - a);
  },
  // Doubles from 1+1 up to 10+10.
  doubles: (rng, d) => {
    const n = rng.int(1, lerpInt(5, 10, d));
    return add('doubles', n, n);
  },
  // Number bonds to 10: 7 + _ = 10.
  'make-10': (rng) => missingAddend('make-10', rng.int(1, 9), 10),
  // Sums 11..20 with addends up to 10; harder difficulty allows bigger sums.
  'add-within-20': (rng, d) => {
    const sum = rng.int(11, lerpInt(15, 20, d));
    const a = rng.int(Math.max(1, sum - 10), Math.min(10, sum - 1));
    return add('add-within-20', a, sum - a);
  },
};

const REVIEW_MIX: BaseSkillId[] = [
  'add-within-10',
  'doubles',
  'make-10',
  'add-within-20',
  'add-within-20',
];

/** Whether a page of `pageSkill` may include a fact made by `factSkill` (a review covers its mix). */
export function skillCovers(pageSkill: SkillId, factSkill: BaseSkillId): boolean {
  if (pageSkill === 'world1-review') return REVIEW_MIX.includes(factSkill);
  return pageSkill === factSkill;
}

export function generateProblem(skill: SkillId, rng: Rng, difficulty: number): Problem {
  const d = Math.min(1, Math.max(0, difficulty));
  if (skill === 'world1-review') return GENERATORS[rng.pick(REVIEW_MIX)](rng, d);
  return GENERATORS[skill](rng, d);
}

/**
 * Builds a page of `count` problems. Never repeats a fact back-to-back, and avoids
 * repeats altogether where the skill has enough variety (tiny skills like
 * add-within-5 will still repeat). `weak` facts (ones the player missed before) are
 * mixed in at random places; the caller decides how many.
 */
export function generatePage(
  skill: SkillId,
  count: number,
  rng: Rng,
  difficulty: number,
  weak: readonly Problem[] = [],
): Problem[] {
  const page: Problem[] = [];
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    const prevKey = page[page.length - 1]?.key;
    let p = generateProblem(skill, rng, difficulty);
    for (let attempt = 0; attempt < 50; attempt++) {
      const backToBack = p.key === prevKey;
      if (!backToBack && (!used.has(p.key) || attempt >= 10)) break;
      p = generateProblem(skill, rng, difficulty);
    }
    used.add(p.key);
    page.push(p);
  }
  return mixIn(page, weak, rng);
}

/** Puts each weak fact on the page once, never next to the same fact. */
function mixIn(page: Problem[], weak: readonly Problem[], rng: Rng): Problem[] {
  const out = [...page];
  const placed = new Set<number>();
  for (const w of weak) {
    if (placed.size >= out.length) break;
    const already = out.findIndex((p, i) => p.key === w.key && !placed.has(i));
    if (already >= 0) {
      placed.add(already);
      continue;
    }
    const slots = out
      .map((_, i) => i)
      .filter((i) => !placed.has(i) && out[i - 1]?.key !== w.key && out[i + 1]?.key !== w.key);
    if (slots.length === 0) continue;
    const i = rng.pick(slots);
    out[i] = w;
    placed.add(i);
  }
  return out;
}
