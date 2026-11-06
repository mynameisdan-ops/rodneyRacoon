import { describe, expect, it } from 'vitest';
import {
  BASE_SKILL_IDS,
  generatePage,
  generateProblem,
  MIXES,
  SKILL_IDS,
  skillCovers,
  type BaseSkillId,
  type Problem,
  type SkillId,
} from './problems';
import { createRng } from './rng';

const SAMPLES = 2000;
const DIFFICULTIES = [0, 0.5, 1];

function sample(skill: SkillId, difficulty: number): Problem[] {
  const rng = createRng(1234);
  return Array.from({ length: SAMPLES }, () => generateProblem(skill, rng, difficulty));
}

const APPLY: Record<Problem['op'], (a: number, b: number) => number> = {
  '+': (a, b) => a + b,
  '−': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => a / b,
};

/** Whole numbers, nothing negative, the sum is right and the answer is the blank. */
function expectWellFormed(p: Problem, op: Problem['op'] = '+') {
  for (const n of [p.a, p.b, p.result, p.answer]) {
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThanOrEqual(0);
  }
  expect(p.op).toBe(op);
  expect(APPLY[p.op](p.a, p.b)).toBe(p.result);
  expect(p.answer).toBe(p.unknown === 'result' ? p.result : p.b);
}

const ones = (n: number) => n % 10;

describe('World 1 generators', () => {
  it.each(DIFFICULTIES)('add-within-5 (d=%s): sums 2..5', (d) => {
    for (const p of sample('add-within-5', d)) {
      expectWellFormed(p);
      expect(p.result).toBeGreaterThanOrEqual(2);
      expect(p.result).toBeLessThanOrEqual(5);
    }
  });

  it('add-within-5 only uses zero at low difficulty', () => {
    expect(sample('add-within-5', 1).some((p) => p.a === 0 || p.b === 0)).toBe(false);
    expect(sample('add-within-5', 0).some((p) => p.a === 0 || p.b === 0)).toBe(true);
  });

  it.each(DIFFICULTIES)('add-within-10 (d=%s): sums up to 10, no zeros', (d) => {
    for (const p of sample('add-within-10', d)) {
      expectWellFormed(p);
      expect(p.result).toBeLessThanOrEqual(10);
      expect(p.a).toBeGreaterThanOrEqual(1);
      expect(p.b).toBeGreaterThanOrEqual(1);
    }
  });

  it.each(DIFFICULTIES)('doubles (d=%s): a === b, up to 10+10', (d) => {
    for (const p of sample('doubles', d)) {
      expectWellFormed(p);
      expect(p.a).toBe(p.b);
      expect(p.a).toBeGreaterThanOrEqual(1);
      expect(p.a).toBeLessThanOrEqual(10);
    }
  });

  it('doubles reach 10+10 only at high difficulty', () => {
    expect(Math.max(...sample('doubles', 0).map((p) => p.a))).toBe(5);
    expect(Math.max(...sample('doubles', 1).map((p) => p.a))).toBe(10);
  });

  it('make-10: missing addend that makes 10', () => {
    for (const p of sample('make-10', 0.5)) {
      expectWellFormed(p);
      expect(p.unknown).toBe('b');
      expect(p.result).toBe(10);
      expect(p.answer).toBeGreaterThanOrEqual(1);
      expect(p.answer).toBeLessThanOrEqual(9);
    }
  });

  it.each(DIFFICULTIES)('add-within-20 (d=%s): sums 11..20, addends 1..10', (d) => {
    for (const p of sample('add-within-20', d)) {
      expectWellFormed(p);
      expect(p.result).toBeGreaterThanOrEqual(11);
      expect(p.result).toBeLessThanOrEqual(20);
      for (const n of [p.a, p.b]) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(10);
      }
    }
  });

  it('world1-review mixes several skills ', () => {
    const ps = sample('world1-review', 0.6);
    ps.forEach((p) => expectWellFormed(p));
    expect(ps.some((p) => p.unknown === 'b')).toBe(true);
    expect(ps.some((p) => p.result > 10)).toBe(true);
    expect(ps.some((p) => p.a === p.b)).toBe(true);
  });
});

describe('World 2 generators', () => {
  it.each(DIFFICULTIES)('sub-within-10 (d=%s): from 10 or less, never below zero', (d) => {
    for (const p of sample('sub-within-10', d)) {
      expectWellFormed(p, '−');
      expect(p.a).toBeLessThanOrEqual(10);
      expect(p.b).toBeGreaterThanOrEqual(1);
    }
  });

  it('sub-within-10 only has a zero answer when easy', () => {
    expect(sample('sub-within-10', 0).some((p) => p.result === 0)).toBe(true);
    expect(sample('sub-within-10', 1).some((p) => p.result === 0)).toBe(false);
  });

  it.each(DIFFICULTIES)('sub-within-20 (d=%s): 11..20 take away 1..10', (d) => {
    for (const p of sample('sub-within-20', d)) {
      expectWellFormed(p, '−');
      expect(p.a).toBeGreaterThanOrEqual(11);
      expect(p.a).toBeLessThanOrEqual(20);
      expect(p.b).toBeGreaterThanOrEqual(1);
      expect(p.b).toBeLessThanOrEqual(10);
      expect(p.result).toBeGreaterThanOrEqual(1);
    }
  });

  it('sub-within-20 crosses ten more often when harder', () => {
    const crossing = (d: number) =>
      sample('sub-within-20', d).filter((p) => p.b > ones(p.a) && p.b < 10).length;
    expect(crossing(1)).toBeGreaterThan(crossing(0));
  });

  it.each(DIFFICULTIES)('missing-addend (d=%s): a + _ = total, addends 1..10', (d) => {
    for (const p of sample('missing-addend', d)) {
      expectWellFormed(p);
      expect(p.unknown).toBe('b');
      expect(p.result).toBeLessThanOrEqual(20);
      for (const n of [p.a, p.b]) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(10);
      }
    }
    if (d === 0) expect(Math.max(...sample('missing-addend', d).map((p) => p.result))).toBe(10);
    if (d === 1) expect(Math.min(...sample('missing-addend', d).map((p) => p.result))).toBe(11);
  });

  it('add-sub-within-20 mixes adding and taking away', () => {
    const ps = sample('add-sub-within-20', 0.5);
    for (const p of ps) expectWellFormed(p, p.op);
    expect(ps.some((p) => p.op === '+')).toBe(true);
    expect(ps.some((p) => p.op === '−')).toBe(true);
  });
});

describe('World 3 generators', () => {
  it.each(DIFFICULTIES)(
    'add-sub-tens (d=%s): adds or takes away whole tens, stays under 100',
    (d) => {
      for (const p of sample('add-sub-tens', d)) {
        expect(['+', '−']).toContain(p.op);
        expectWellFormed(p, p.op);
        expect(ones(p.b)).toBe(0);
        expect(p.b).toBeGreaterThanOrEqual(10);
        expect(Math.max(p.a, p.result)).toBeLessThan(100);
        expect(ones(p.result)).toBe(ones(p.a));
      }
    },
  );

  it('add-sub-tens uses only whole tens when easiest, and other numbers when hardest', () => {
    expect(sample('add-sub-tens', 0).every((p) => ones(p.a) === 0)).toBe(true);
    expect(sample('add-sub-tens', 1).every((p) => ones(p.a) !== 0)).toBe(true);
  });

  it.each(DIFFICULTIES)('add-2digit (d=%s): two-digit sums with no carrying', (d) => {
    for (const p of sample('add-2digit', d)) {
      expectWellFormed(p);
      expect(p.a).toBeGreaterThanOrEqual(10);
      expect(p.b).toBeGreaterThanOrEqual(1);
      expect(ones(p.a) + ones(p.b)).toBeLessThanOrEqual(9);
      expect(p.result).toBeLessThan(100);
    }
  });

  it.each(DIFFICULTIES)('sub-2digit (d=%s): two-digit take-aways with no borrowing', (d) => {
    for (const p of sample('sub-2digit', d)) {
      expectWellFormed(p, '−');
      expect(p.a).toBeGreaterThanOrEqual(20);
      expect(p.b).toBeGreaterThanOrEqual(1);
      expect(ones(p.b)).toBeLessThanOrEqual(ones(p.a));
      expect(p.result).toBeGreaterThanOrEqual(1);
    }
  });

  it.each(DIFFICULTIES)('add-2digit-regroup (d=%s): always carries, stays under 100', (d) => {
    for (const p of sample('add-2digit-regroup', d)) {
      expectWellFormed(p);
      expect(p.a).toBeGreaterThanOrEqual(10);
      expect(ones(p.a) + ones(p.b)).toBeGreaterThanOrEqual(10);
      expect(p.result).toBeLessThan(100);
    }
  });

  it.each(DIFFICULTIES)('sub-2digit-regroup (d=%s): always borrows, never below zero', (d) => {
    for (const p of sample('sub-2digit-regroup', d)) {
      expectWellFormed(p, '−');
      expect(p.a).toBeGreaterThanOrEqual(20);
      expect(ones(p.b)).toBeGreaterThan(ones(p.a));
      expect(p.result).toBeGreaterThanOrEqual(1);
    }
  });

  it.each(['add-2digit', 'sub-2digit', 'add-2digit-regroup', 'sub-2digit-regroup'] as const)(
    '%s: mostly one-digit second numbers when easy, mostly two-digit when hard',
    (skill) => {
      const twoDigit = (d: number) => sample(skill, d).filter((p) => p.b >= 10).length / SAMPLES;
      expect(twoDigit(0)).toBeLessThan(0.35);
      expect(twoDigit(1)).toBeGreaterThan(0.95);
    },
  );
});

describe('World 4 and 5 generators', () => {
  const tables: [BaseSkillId, number[]][] = [
    ['mul-0-1-2-10', [0, 1, 2, 10]],
    ['mul-5', [5]],
    ['mul-3-4', [3, 4]],
    ['mul-6-9', [6, 7, 8, 9]],
  ];

  it.each(tables)('%s: facts from its tables, other factor up to 10', (skill, ts) => {
    for (const d of DIFFICULTIES) {
      for (const p of sample(skill, d)) {
        expectWellFormed(p, '×');
        expect(ts.includes(p.a) || ts.includes(p.b)).toBe(true);
        expect(Math.max(p.a, p.b)).toBeLessThanOrEqual(10);
      }
    }
    // Both orders show up, and the top of the table only when harder.
    const easy = sample(skill, 0);
    expect(easy.some((p) => ts.includes(p.a) && !ts.includes(p.b))).toBe(true);
    expect(easy.some((p) => ts.includes(p.b) && !ts.includes(p.a))).toBe(true);
    // The factor that isn't from the table (skipping facts like 2 × 10 where both are).
    const other = (p: Problem) => (ts.includes(p.a) ? p.b : p.a);
    const single = (p: Problem) => !(ts.includes(p.a) && ts.includes(p.b));
    expect(Math.max(...easy.filter(single).map(other))).toBeLessThanOrEqual(5);
    expect(sample(skill, 1).some((p) => other(p) === 10 || other(p) === 9)).toBe(true);
  });

  it('× 0 and × 8/9 only join at higher difficulty', () => {
    const has = (skill: SkillId, d: number, n: number) =>
      sample(skill, d).some((p) => p.a === n || p.b === n);
    expect(has('mul-0-1-2-10', 0, 0)).toBe(false);
    expect(has('mul-0-1-2-10', 1, 0)).toBe(true);
    expect(has('mul-6-9', 0, 9)).toBe(false);
    expect(has('mul-6-9', 1, 9)).toBe(true);
  });

  const divTables: [BaseSkillId, number[]][] = [
    ['div-1-2-5-10', [1, 2, 5, 10]],
    ['div-3-4', [3, 4]],
    ['div-6-9', [6, 7, 8, 9]],
  ];

  it.each(divTables)('%s: whole-number answers from a known table', (skill, ts) => {
    for (const d of DIFFICULTIES) {
      for (const p of sample(skill, d)) {
        expectWellFormed(p, '÷');
        expect(ts).toContain(p.b);
        expect(p.b * p.result).toBe(p.a);
        expect(p.result).toBeGreaterThanOrEqual(1);
        expect(p.result).toBeLessThanOrEqual(10);
      }
    }
  });

  it('all-four uses every operation', () => {
    const ops = new Set(sample('all-four', 0.7).map((p) => p.op));
    expect([...ops].sort()).toEqual(['+', '×', '÷', '−'].sort());
  });
});

describe('mixes', () => {
  it.each(Object.keys(MIXES) as (keyof typeof MIXES)[])(
    '%s: every fact is well formed and covered by the mix',
    (mix) => {
      for (const d of DIFFICULTIES) {
        for (const p of sample(mix, d)) {
          expectWellFormed(p, p.op);
          expect(skillCovers(mix, p.skill)).toBe(true);
        }
      }
    },
  );

  it('a base skill covers only itself', () => {
    for (const s of BASE_SKILL_IDS) {
      expect(skillCovers(s, s)).toBe(true);
      expect(skillCovers(s, s === 'doubles' ? 'mul-5' : 'doubles')).toBe(false);
    }
  });

  it('every answer fits in three digits', () => {
    for (const s of SKILL_IDS) {
      for (const p of sample(s, 1)) expect(p.answer).toBeLessThan(1000);
    }
  });
});

describe('generatePage', () => {
  it.each(SKILL_IDS)('%s: right length, never the same fact back-to-back', (skill) => {
    for (let seed = 0; seed < 50; seed++) {
      const page = generatePage(skill, 16, createRng(seed), 0.5);
      expect(page).toHaveLength(16);
      for (let i = 1; i < page.length; i++) expect(page[i]!.key).not.toBe(page[i - 1]!.key);
    }
  });

  it('avoids repeats when the skill has enough variety', () => {
    const page = generatePage('add-within-20', 15, createRng(7), 1);
    expect(new Set(page.map((p) => p.key)).size).toBe(15);
  });

  it('mixes in exactly `mix.count` problems from the mix skills', () => {
    const mix = {
      count: 4,
      skills: [
        { skill: 'mul-5', difficulty: 0.5 },
        { skill: 'div-3-4', difficulty: 0 },
      ],
    } as const;
    for (let seed = 0; seed < 30; seed++) {
      const page = generatePage('add-within-10', 12, createRng(seed), 0.5, [], mix);
      expect(page).toHaveLength(12);
      const mixed = page.filter((p) => p.skill === 'mul-5' || p.skill === 'div-3-4');
      expect(mixed).toHaveLength(4);
      expect(page.filter((p) => p.skill === 'add-within-10')).toHaveLength(8);
      for (let i = 1; i < page.length; i++) expect(page[i]!.key).not.toBe(page[i - 1]!.key);
    }
  });

  it('is unchanged without a mix', () => {
    const plain = generatePage('add-within-20', 14, createRng(5), 0.5);
    const empty = generatePage('add-within-20', 14, createRng(5), 0.5, [], {
      count: 0,
      skills: [],
    });
    expect(empty).toEqual(plain);
  });

  it('is deterministic for a given seed', () => {
    const a = generatePage('world1-review', 16, createRng(42), 0.5);
    const b = generatePage('world1-review', 16, createRng(42), 0.5);
    expect(a).toEqual(b);
  });
});
