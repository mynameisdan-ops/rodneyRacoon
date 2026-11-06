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

/** Skills that make their own problems. */
export const BASE_SKILL_IDS = [
  // World 1: addition.
  'add-within-5',
  'add-within-10',
  'doubles',
  'make-10',
  'add-within-20',
  // World 2: subtraction and missing addends.
  'sub-within-10',
  'sub-within-20',
  'missing-addend',
  // World 3: two-digit adding and taking away.
  'add-sub-tens',
  'add-2digit',
  'sub-2digit',
  'add-2digit-regroup',
  'sub-2digit-regroup',
  // World 4: times tables.
  'mul-0-1-2-10',
  'mul-5',
  'mul-3-4',
  'mul-6-9',
  // World 5: division.
  'div-1-2-5-10',
  'div-3-4',
  'div-6-9',
] as const;
export type BaseSkillId = (typeof BASE_SKILL_IDS)[number];

/**
 * Mixed skills: each problem comes from one of the listed skills (a skill listed
 * twice comes up twice as often). Facts keep the skill that made them, so a missed
 * fact comes back on its own level and on every mix that includes it.
 */
export const MIXES = {
  'world1-review': ['add-within-10', 'doubles', 'make-10', 'add-within-20', 'add-within-20'],
  'add-sub-within-20': ['add-within-20', 'sub-within-20', 'sub-within-20', 'sub-within-10'],
  'world2-review': [
    'add-within-20',
    'sub-within-10',
    'sub-within-20',
    'sub-within-20',
    'missing-addend',
  ],
  'world3-review': [
    'add-sub-tens',
    'add-2digit',
    'sub-2digit',
    'add-2digit-regroup',
    'sub-2digit-regroup',
  ],
  'mul-review': ['mul-0-1-2-10', 'mul-5', 'mul-3-4', 'mul-3-4', 'mul-6-9', 'mul-6-9'],
  'mul-div-review': [
    'mul-5',
    'mul-3-4',
    'mul-6-9',
    'div-1-2-5-10',
    'div-3-4',
    'div-6-9',
    'div-6-9',
  ],
  'all-four': [
    'add-within-20',
    'sub-within-20',
    'add-2digit-regroup',
    'sub-2digit-regroup',
    'mul-3-4',
    'mul-6-9',
    'div-3-4',
    'div-6-9',
  ],
} as const satisfies Record<string, readonly BaseSkillId[]>;
export type MixId = keyof typeof MIXES;

export const SKILL_IDS = [...BASE_SKILL_IDS, ...(Object.keys(MIXES) as MixId[])];
export type SkillId = BaseSkillId | MixId;

export const isMix = (skill: string): skill is MixId => Object.hasOwn(MIXES, skill);

/** `difficulty` is 0..1 within a skill; the adaptive engine chooses it. */
type Generator = (rng: Rng, difficulty: number) => Problem;

function fact(skill: BaseSkillId, a: number, op: Op, b: number, result: number): Problem {
  return { a, op, b, result, unknown: 'result', answer: result, key: `${a}${op}${b}`, skill };
}

const add = (skill: BaseSkillId, a: number, b: number) => fact(skill, a, '+', b, a + b);
const sub = (skill: BaseSkillId, a: number, b: number) => fact(skill, a, '−', b, a - b);
/** `n × m` with the factors in a random order (7 × 3 and 3 × 7 both get practised). */
const mul = (skill: BaseSkillId, rng: Rng, n: number, m: number) =>
  rng.next() < 0.5 ? fact(skill, n, '×', m, n * m) : fact(skill, m, '×', n, n * m);
/** `divisor × quotient ÷ divisor = quotient`. */
const div = (skill: BaseSkillId, divisor: number, quotient: number) =>
  fact(skill, divisor * quotient, '÷', divisor, quotient);

function missingAddend(skill: BaseSkillId, a: number, total: number): Problem {
  const b = total - a;
  return { a, op: '+', b, result: total, unknown: 'b', answer: b, key: `${a}+_=${total}`, skill };
}

const lerpInt = (lo: number, hi: number, t: number) => Math.round(lo + (hi - lo) * t);

/** The other factor in a table fact: up to 5 when easy, up to 10 (and never 1) when hard. */
const tableFactor = (rng: Rng, d: number) => rng.int(d < 0.5 ? 1 : 2, lerpInt(5, 10, d));

const timesTable = (skill: BaseSkillId, tables: readonly number[], rng: Rng, d: number) =>
  mul(skill, rng, rng.pick(tables), tableFactor(rng, d));

/** Division as the inverse of a table: `table × n ÷ table`. */
const divTable = (skill: BaseSkillId, tables: readonly number[], rng: Rng, d: number) =>
  div(skill, rng.pick(tables), tableFactor(rng, d));

/** A second two-digit number joins more often as the difficulty rises. */
const withTens = (rng: Rng, d: number, from: number) => rng.next() < from + (1 - from) * d;

const GENERATORS: Record<BaseSkillId, Generator> = {
  // ---- World 1 ----
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

  // ---- World 2 ----
  // Take away within 10, from bigger numbers when harder. A zero answer only when easy.
  'sub-within-10': (rng, d) => {
    const a = rng.int(lerpInt(3, 6, d), 10);
    const b = rng.int(1, d < 0.3 ? a : a - 1);
    return sub('sub-within-10', a, b);
  },
  // 11..20 take away up to 10. Harder: more of them cross ten (13 − 5).
  'sub-within-20': (rng, d) => {
    const a = rng.int(11, lerpInt(15, 20, d));
    const ones = a - 10;
    const crossTen = ones < 9 && rng.next() < 0.3 + 0.6 * d;
    const b = crossTen ? rng.int(ones + 1, 9) : rng.int(1, Math.min(10, a - 1));
    return sub('sub-within-20', a, b);
  },
  // 6 + _ = 13: totals up to 10 when easy, up to 20 when hard; addends up to 10.
  'missing-addend': (rng, d) => {
    const total = rng.int(lerpInt(5, 11, d), lerpInt(10, 20, d));
    const a = rng.int(Math.max(1, total - 10), Math.min(10, total - 1));
    return missingAddend('missing-addend', a, total);
  },

  // ---- World 3 ----
  // Adding and taking away tens: 30 + 40 when easy, 47 + 30 and 85 − 40 when harder.
  'add-sub-tens': (rng, d) => {
    const ones = rng.next() < d ? rng.int(1, 9) : 0;
    if (rng.next() < 0.5) {
      const tensA = rng.int(1, 8);
      return add('add-sub-tens', tensA * 10 + ones, rng.int(1, 9 - tensA) * 10);
    }
    const tensA = rng.int(2, 9);
    return sub('add-sub-tens', tensA * 10 + ones, rng.int(1, tensA - 1) * 10);
  },
  // No carrying: 23 + 4 when easy, 32 + 45 when harder.
  'add-2digit': (rng, d) => {
    const aTens = rng.int(1, 7);
    const aOnes = rng.int(0, 8);
    const bOnes = rng.int(aOnes === 0 ? 2 : 1, 9 - aOnes);
    const bTens = withTens(rng, d, 0.25) ? rng.int(1, 8 - aTens) : 0;
    return add('add-2digit', aTens * 10 + aOnes, bTens * 10 + bOnes);
  },
  // No borrowing: 38 − 5 when easy, 67 − 24 when harder.
  'sub-2digit': (rng, d) => {
    const aTens = rng.int(2, 9);
    const aOnes = rng.int(2, 9);
    const bOnes = rng.int(1, aOnes);
    const bTens = withTens(rng, d, 0.25) ? rng.int(1, aTens - 1) : 0;
    return sub('sub-2digit', aTens * 10 + aOnes, bTens * 10 + bOnes);
  },
  // Carrying: 27 + 5 when easy, 38 + 47 when harder (the sum stays under 100).
  'add-2digit-regroup': (rng, d) => {
    const aOnes = rng.int(2, 9);
    const bOnes = rng.int(11 - aOnes, 9);
    const aTens = rng.int(1, 7);
    const bTens = withTens(rng, d, 0.2) ? rng.int(1, 8 - aTens) : 0;
    return add('add-2digit-regroup', aTens * 10 + aOnes, bTens * 10 + bOnes);
  },
  // Borrowing: 32 − 5 when easy, 52 − 27 when harder.
  'sub-2digit-regroup': (rng, d) => {
    const aOnes = rng.int(0, 7);
    const bOnes = rng.int(aOnes + 1, 9);
    const aTens = rng.int(2, 9);
    const bTens = withTens(rng, d, 0.2) ? rng.int(1, aTens - 1) : 0;
    return sub('sub-2digit-regroup', aTens * 10 + aOnes, bTens * 10 + bOnes);
  },

  // ---- World 4 ----
  // The easy tables: × 1, × 2 and × 10 first; × 0 joins once it's harder.
  'mul-0-1-2-10': (rng, d) =>
    timesTable('mul-0-1-2-10', d < 0.4 ? [1, 2, 10] : [0, 1, 2, 2, 10], rng, d),
  'mul-5': (rng, d) => timesTable('mul-5', [5], rng, d),
  'mul-3-4': (rng, d) => timesTable('mul-3-4', [3, 4], rng, d),
  // × 6 and × 7 first; × 8 and × 9 join as it gets harder.
  'mul-6-9': (rng, d) => timesTable('mul-6-9', d < 0.4 ? [6, 7] : [6, 7, 8, 9], rng, d),

  // ---- World 5 ----
  'div-1-2-5-10': (rng, d) => divTable('div-1-2-5-10', d < 0.4 ? [2, 10] : [1, 2, 5, 10], rng, d),
  'div-3-4': (rng, d) => divTable('div-3-4', [3, 4], rng, d),
  'div-6-9': (rng, d) => divTable('div-6-9', d < 0.4 ? [6, 7] : [6, 7, 8, 9], rng, d),
};

/** Whether a page of `pageSkill` may include a fact made by `factSkill` (a mix covers its parts). */
export function skillCovers(pageSkill: SkillId, factSkill: BaseSkillId): boolean {
  if (isMix(pageSkill)) return (MIXES[pageSkill] as readonly BaseSkillId[]).includes(factSkill);
  return pageSkill === factSkill;
}

export function generateProblem(skill: SkillId, rng: Rng, difficulty: number): Problem {
  const d = Math.min(1, Math.max(0, difficulty));
  if (isMix(skill)) return GENERATORS[rng.pick(MIXES[skill])](rng, d);
  return GENERATORS[skill](rng, d);
}

/**
 * Other skills mixed into a page (the parent's "× and ÷ in every page"): `count` places on
 * the page get a problem from one of `skills`, each at its own difficulty.
 */
export interface PageMix {
  count: number;
  skills: readonly { skill: BaseSkillId; difficulty: number }[];
}

/**
 * Builds a page of `count` problems. Never repeats a fact back-to-back, and avoids
 * repeats altogether where the skill has enough variety (tiny skills like
 * add-within-5 will still repeat). `mix` puts problems of other skills in random places.
 * `weak` facts (ones the player missed before) are mixed in at random places; the caller
 * decides how many.
 */
export function generatePage(
  skill: SkillId,
  count: number,
  rng: Rng,
  difficulty: number,
  weak: readonly Problem[] = [],
  mix?: PageMix,
): Problem[] {
  const page: Problem[] = [];
  const used = new Set<string>();
  const mixed = mixSlots(count, mix, rng);
  for (let i = 0; i < count; i++) {
    const prevKey = page[page.length - 1]?.key;
    const make =
      mixed.has(i) && mix ? pickMix(mix, rng) : () => generateProblem(skill, rng, difficulty);
    let p = make();
    for (let attempt = 0; attempt < 50; attempt++) {
      const backToBack = p.key === prevKey;
      if (!backToBack && (!used.has(p.key) || attempt >= 10)) break;
      p = make();
    }
    used.add(p.key);
    page.push(p);
  }
  return mixIn(page, weak, rng);
}

/** The places on a page that get a mixed-in skill (none without a mix). */
function mixSlots(count: number, mix: PageMix | undefined, rng: Rng): Set<number> {
  if (!mix || mix.count <= 0 || mix.skills.length === 0) return new Set();
  const free = Array.from({ length: count }, (_, i) => i);
  const slots = new Set<number>();
  while (slots.size < Math.min(mix.count, count)) {
    const at = Math.floor(rng.next() * free.length);
    slots.add(free.splice(at, 1)[0]!);
  }
  return slots;
}

/** A maker for one mixed-in place: one of the mix's skills, kept for that place's retries. */
function pickMix(mix: PageMix, rng: Rng): () => Problem {
  const { skill, difficulty } = rng.pick(mix.skills);
  return () => generateProblem(skill, rng, difficulty);
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
