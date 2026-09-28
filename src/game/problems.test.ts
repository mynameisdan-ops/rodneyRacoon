import { describe, expect, it } from 'vitest';
import { generatePage, generateProblem, type Problem, type SkillId } from './problems';
import { createRng } from './rng';

const SAMPLES = 2000;
const DIFFICULTIES = [0, 0.5, 1];

function sample(skill: SkillId, difficulty: number): Problem[] {
  const rng = createRng(1234);
  return Array.from({ length: SAMPLES }, () => generateProblem(skill, rng, difficulty));
}

function expectWellFormed(p: Problem) {
  for (const n of [p.a, p.b, p.result, p.answer]) {
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThanOrEqual(0);
  }
  expect(p.op).toBe('+');
  expect(p.a + p.b).toBe(p.result);
  expect(p.answer).toBe(p.unknown === 'result' ? p.result : p.b);
}

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

  it('world1-review mixes several skills', () => {
    const ps = sample('world1-review', 0.6);
    ps.forEach(expectWellFormed);
    expect(ps.some((p) => p.unknown === 'b')).toBe(true);
    expect(ps.some((p) => p.result > 10)).toBe(true);
    expect(ps.some((p) => p.a === p.b)).toBe(true);
  });
});

describe('generatePage', () => {
  const skills: SkillId[] = [
    'add-within-5',
    'add-within-10',
    'doubles',
    'make-10',
    'add-within-20',
    'world1-review',
  ];

  it.each(skills)('%s: right length, never the same fact back-to-back', (skill) => {
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

  it('is deterministic for a given seed', () => {
    const a = generatePage('world1-review', 16, createRng(42), 0.5);
    const b = generatePage('world1-review', 16, createRng(42), 0.5);
    expect(a).toEqual(b);
  });
});
