import { describe, expect, it } from 'vitest';
import { generateProblem, BASE_SKILL_IDS, type Op, type Problem } from '../game/problems';
import { createRng } from '../game/rng';
import { BLOCK_BOX, blockPicture, type Block, type BlockPicture } from './blockLayout';

const make = (a: number, op: Op, b: number, unknown: Problem['unknown'] = 'result'): Problem => {
  const result = op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b;
  return {
    a,
    op,
    b: unknown === 'b' ? result - a : b,
    result: unknown === 'b' ? b : result,
    unknown,
    answer: unknown === 'b' ? b - a : result,
    key: `${a}${op}${b}`,
    skill: 'add-within-20',
  };
};

/** How many ones a set of blocks is worth (a rod is ten). */
const worth = (blocks: readonly Block[]) => blocks.reduce((n, k) => n + (k.rod ? 10 : 1), 0);
const solid = (pic: BlockPicture) => pic.blocks.filter((k) => !k.ghost && !k.leaves);

const inside = (x: number, y: number, w: number, h: number) =>
  x >= -0.01 && y >= -0.01 && x + w <= BLOCK_BOX.w + 0.01 && y + h <= BLOCK_BOX.h + 0.01;

describe('blockPicture', () => {
  it('adds: two groups that join into the total', () => {
    const pic = blockPicture(make(2, '+', 2))!;
    expect(pic.blocks).toHaveLength(4);
    expect(pic.blocks.filter((k) => k.tone === 'a')).toHaveLength(2);
    expect(pic.blocks.every((k) => k.from)).toBe(true);
  });

  it('shows a missing addend as empty places to count', () => {
    const pic = blockPicture(make(3, '+', 10, 'b'))!;
    expect(pic.blocks).toHaveLength(10);
    expect(pic.blocks.filter((k) => k.ghost)).toHaveLength(7);
  });

  it('takes away: the second number leaves, the answer stays', () => {
    const pic = blockPicture(make(9, '−', 4))!;
    expect(pic.blocks).toHaveLength(9);
    expect(solid(pic)).toHaveLength(5);
  });

  it('takes away with borrowing, drawn already regrouped', () => {
    const pic = blockPicture(make(52, '−', 17))!;
    expect(worth(pic.blocks)).toBe(52);
    expect(worth(solid(pic))).toBe(35);
    expect(pic.blocks.filter((k) => k.rod)).toHaveLength(4); // 4 tens and 12 ones
  });

  it('adds past 20 with rods: the total, with a carried ten as a full column', () => {
    const pic = blockPicture(make(38, '+', 47))!;
    expect(worth(pic.blocks)).toBe(85);
    expect(pic.blocks.filter((k) => !k.rod)).toHaveLength(15);
  });

  it('multiplies both ways: a groups of b and b groups of a', () => {
    const pic = blockPicture(make(2, '×', 3))!;
    expect(pic.blocks).toHaveLength(12);
    const left = pic.blocks.filter((k) => k.tone === 'a' || k.tone === 'c');
    expect(left).toHaveLength(6);
    expect(new Set(left.map((k) => k.y)).size).toBe(2); // 2 rows of 3
    // The same 2 × 3 array, as 3 columns of 2 that start apart.
    const right = pic.blocks.filter((k) => k.tone === 'b' || k.tone === 'd');
    expect(new Set(right.map((k) => k.y)).size).toBe(2);
    expect(new Set(right.map((k) => k.x)).size).toBe(3);
    expect(new Set(right.map((k) => k.from!.x)).size).toBe(3);
    expect(right.filter((k) => k.tone === 'b')).toHaveLength(4); // columns 1 and 3
  });

  it('shares: b groups, each the size of the answer', () => {
    const pic = blockPicture(make(12, '÷', 3))!;
    expect(pic.blocks).toHaveLength(12);
    expect(pic.frames).toHaveLength(3);
    const byRow = new Map<number, number>();
    for (const k of pic.blocks) byRow.set(k.y, (byRow.get(k.y) ?? 0) + 1);
    expect([...byRow.values()]).toEqual([4, 4, 4]);
  });

  it('draws nothing for a zero product', () => {
    expect(blockPicture(make(0, '×', 7))).toBeNull();
  });

  it('every skill: blocks worth the right amount, all inside the box, never overlapping', () => {
    for (const skill of BASE_SKILL_IDS) {
      for (let seed = 0; seed < 40; seed++) {
        const p = generateProblem(skill, createRng(seed), seed / 39);
        const pic = blockPicture(p);
        if (!pic) continue;
        // What's left at the end is worth the answer, or the total for a missing addend.
        const expected =
          p.op === '×' ? 2 * p.result : p.op === '÷' ? p.a : p.unknown === 'b' ? p.a : p.result;
        expect(worth(solid(pic)), `${skill} ${p.key}`).toBe(expected);
        for (const k of pic.blocks) {
          expect(inside(k.x, k.y, k.w, k.h), `${skill} ${p.key} end`).toBe(true);
          if (k.from)
            expect(inside(k.from.x, k.from.y, k.w, k.h), `${skill} ${p.key} start`).toBe(true);
        }
        const ends = new Set(pic.blocks.map((k) => `${Math.round(k.x)},${Math.round(k.y)}`));
        expect(ends.size, `${skill} ${p.key} overlap`).toBe(pic.blocks.length);
      }
    }
  });
});
