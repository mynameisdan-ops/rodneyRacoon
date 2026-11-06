import type { Problem } from '../game/problems';

/**
 * The block picture of a problem (a parent's "Blocks" setting, Nov 2026 feedback): pure
 * geometry, tested in `blockLayout.test.ts` and drawn by `BlockAid`. Every block has a place at
 * the end of the move and, when it moves, the place it starts from.
 *
 * - `+`: the two numbers as two groups that slide together into rows of ten.
 * - `+` with a blank (`3 + _ = 10`): the total as rows of ten, the known part filled, the
 *   rest empty outlines to count.
 * - `−`: the first number; the second number's blocks fly away.
 * - `×`: both ways at once: `a` groups of `b` close up into an array, and `b` groups of `a`
 *   close up into the same array (grouped in rows on one side, columns on the other).
 * - `÷`: a pile that splits into `b` equal groups (each group is the answer).
 *
 * Past 20, numbers are tens rods and ones. For taking away with borrowing, the first number is
 * drawn already regrouped (a rod fewer, ten more ones), so the only motion is taking away; for
 * adding with carrying, the ones fill a column of ten, which looks like a rod.
 */

export const BLOCK_BOX = { w: 760, h: 250 } as const;

/** When blocks start moving and how long a move takes, in ms (the whole picture is < 1 s). */
export const BLOCK_TIMING = { start: 250, move: 600 } as const;

/** Colors by role: the first number, the second, and groups that alternate. */
export type BlockTone = 'a' | 'b' | 'c' | 'd';

export interface Block {
  /** Final place (top-left) and size, in design units inside `BLOCK_BOX`. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Where it starts, when it moves. */
  from?: { x: number; y: number };
  tone: BlockTone;
  /** Flies away (taking away). */
  leaves?: boolean;
  /** An empty place to count (a missing addend). */
  ghost?: boolean;
  /** A tens rod (ten ones tall). */
  rod?: boolean;
}

/** An outline around a group, shown once the blocks have moved. */
export interface GroupFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BlockPicture {
  blocks: Block[];
  frames: GroupFrame[];
}

/** Gap between blocks as a share of the pitch. */
const GAP = 0.16;
/** The largest pitch, so small problems don't get giant blocks. */
const MAX_PITCH = 56;

interface Cell {
  col: number;
  row: number;
}

/** Cells for `n` blocks in rows of `cols`. */
const rows = (n: number, cols: number): Cell[] =>
  Array.from({ length: n }, (_, i) => ({ col: i % cols, row: Math.floor(i / cols) }));

/** Cells for `n` blocks in columns of `per` (top to bottom, then the next column). */
const columns = (n: number, per: number): Cell[] =>
  Array.from({ length: n }, (_, i) => ({ col: Math.floor(i / per), row: i % per }));

const size = (cells: readonly Cell[]) => ({
  cols: cells.reduce((m, c) => Math.max(m, c.col + 1), 0),
  rows: cells.reduce((m, c) => Math.max(m, c.row + 1), 0),
});

/** Whether a problem is drawn with tens rods and ones. */
const usesTens = (p: Problem) => Math.max(p.a, p.b, p.result) > 20;

export function blockPicture(p: Problem): BlockPicture | null {
  switch (p.op) {
    case '+':
      if (p.unknown === 'b') return usesTens(p) ? null : missingAddend(p.a, p.result);
      return usesTens(p) ? addTens(p.a, p.b) : addOnes(p.a, p.b);
    case '−':
      return usesTens(p) ? subTens(p.a, p.b) : subOnes(p.a, p.b);
    case '×':
      return p.result === 0 ? null : times(p.a, p.b);
    case '÷':
      return p.result === 0 ? null : share(p.a, p.b);
  }
}

/** A block of one pitch at a cell, with an origin. */
function unit(cell: Cell, pitch: number, x0: number, y0: number) {
  return {
    x: x0 + cell.col * pitch,
    y: y0 + cell.row * pitch,
    w: pitch * (1 - GAP),
    h: pitch * (1 - GAP),
  };
}

/** Left/top origin that centers a `cols × rows` area of `pitch` in a span. */
const center = (span: number, count: number, pitch: number) =>
  (span - (count * pitch - pitch * GAP)) / 2;

// ---- Adding and taking away, up to 20: single blocks ----

function addOnes(a: number, b: number): BlockPicture {
  // Before: two groups in rows of 5, apart. After: one group in rows of 10.
  const before = { a: rows(a, 5), b: rows(b, 5) };
  const after = rows(a + b, 10);
  const tallest = Math.max(size(before.a).rows, size(before.b).rows, size(after).rows);
  const pitch = Math.min(MAX_PITCH, BLOCK_BOX.h / tallest, BLOCK_BOX.w / 13);
  const split = 3 * pitch; // the space between the two groups at the start
  const startW = 10 * pitch + split;
  const sx = (BLOCK_BOX.w - startW) / 2;
  const sy = center(BLOCK_BOX.h, tallest, pitch);
  const ex = center(BLOCK_BOX.w, Math.min(10, a + b), pitch);
  const ey = center(BLOCK_BOX.h, size(after).rows, pitch);
  const blocks: Block[] = after.map((cell, i) => {
    const mine = i < a;
    const start = mine ? before.a[i]! : before.b[i - a]!;
    const from = unit(start, pitch, mine ? sx : sx + 5 * pitch + split, sy);
    return { ...unit(cell, pitch, ex, ey), from: { x: from.x, y: from.y }, tone: mine ? 'a' : 'b' };
  });
  return { blocks, frames: [] };
}

function missingAddend(a: number, total: number): BlockPicture {
  const cells = rows(total, 10);
  const pitch = Math.min(MAX_PITCH, BLOCK_BOX.h / size(cells).rows, BLOCK_BOX.w / 10);
  const x0 = center(BLOCK_BOX.w, Math.min(10, total), pitch);
  const y0 = center(BLOCK_BOX.h, size(cells).rows, pitch);
  const blocks: Block[] = cells.map((cell, i) => ({
    ...unit(cell, pitch, x0, y0),
    tone: 'a',
    ...(i >= a ? { ghost: true } : {}),
  }));
  return { blocks, frames: [] };
}

function subOnes(a: number, b: number): BlockPicture {
  const cells = rows(a, 10);
  const pitch = Math.min(MAX_PITCH, BLOCK_BOX.h / size(cells).rows, BLOCK_BOX.w / 10);
  const x0 = center(BLOCK_BOX.w, Math.min(10, a), pitch);
  const y0 = center(BLOCK_BOX.h, size(cells).rows, pitch);
  const blocks: Block[] = cells.map((cell, i) => ({
    ...unit(cell, pitch, x0, y0),
    tone: 'a',
    ...(i >= a - b ? { leaves: true } : {}),
  }));
  return { blocks, frames: [] };
}

// ---- Past 20: tens rods and ones ----

/** Places tens rods and ones in columns of ten (rods first), from a left edge. */
function tensAndOnes(
  tens: number,
  ones: number,
  pitch: number,
  x0: number,
  y0: number,
  tone: BlockTone,
): Block[] {
  const out: Block[] = [];
  for (let t = 0; t < tens; t++) {
    out.push({
      x: x0 + t * pitch,
      y: y0,
      w: pitch * (1 - GAP),
      h: 10 * pitch - pitch * GAP,
      tone,
      rod: true,
    });
  }
  for (const cell of columns(ones, 10))
    out.push({ ...unit(cell, pitch, x0 + (tens + cell.col) * pitch, y0), tone });
  return out;
}

const colsFor = (tens: number, ones: number) => tens + Math.ceil(ones / 10);

function addTens(a: number, b: number): BlockPicture {
  const [ta, oa, tb, ob] = [Math.floor(a / 10), a % 10, Math.floor(b / 10), b % 10];
  const startCols = colsFor(ta, oa) + colsFor(tb, ob);
  const pitch = Math.min(BLOCK_BOX.h / 10, BLOCK_BOX.w / (startCols + 4));
  const split = 3 * pitch;
  const sx = (BLOCK_BOX.w - (startCols * pitch + split)) / 2;
  const y0 = center(BLOCK_BOX.h, 10, pitch);
  const startA = tensAndOnes(ta, oa, pitch, sx, y0, 'a');
  const startB = tensAndOnes(tb, ob, pitch, sx + colsFor(ta, oa) * pitch + split, y0, 'b');
  // After: all the rods, then all the ones in columns of ten (a full column is a new ten).
  const endCols = ta + tb + Math.ceil((oa + ob) / 10);
  const ex = center(BLOCK_BOX.w, endCols, pitch);
  const rodsA = startA.filter((k) => k.rod);
  const rodsB = startB.filter((k) => k.rod);
  const onesA = startA.filter((k) => !k.rod);
  const onesB = startB.filter((k) => !k.rod);
  const blocks: Block[] = [];
  [...rodsA, ...rodsB].forEach((k, i) =>
    blocks.push({ ...k, x: ex + i * pitch, y: y0, from: { x: k.x, y: k.y } }),
  );
  const onesX = ex + (ta + tb) * pitch;
  columns(oa + ob, 10).forEach((cell, i) => {
    const k = i < oa ? onesA[i]! : onesB[i - oa]!;
    blocks.push({ ...k, ...unit(cell, pitch, onesX, y0), from: { x: k.x, y: k.y } });
  });
  return { blocks, frames: [] };
}

function subTens(a: number, b: number): BlockPicture {
  let [tens, ones] = [Math.floor(a / 10), a % 10];
  const [tb, ob] = [Math.floor(b / 10), b % 10];
  // Borrow up front: one rod is already ten ones, so taking away is the only motion.
  if (ones < ob) [tens, ones] = [tens - 1, ones + 10];
  const cols = colsFor(tens, ones);
  const pitch = Math.min(BLOCK_BOX.h / 10, BLOCK_BOX.w / (cols + 2));
  const x0 = center(BLOCK_BOX.w, cols, pitch);
  const y0 = center(BLOCK_BOX.h, 10, pitch);
  const placed = tensAndOnes(tens, ones, pitch, x0, y0, 'a');
  const rods = placed.filter((k) => k.rod);
  const units = placed.filter((k) => !k.rod);
  // The last rods and the last ones leave.
  const blocks = [
    ...rods.map((k, i) => (i >= rods.length - tb ? { ...k, leaves: true } : k)),
    ...units.map((k, i) => (i >= units.length - ob ? { ...k, leaves: true } : k)),
  ];
  return { blocks, frames: [] };
}

// ---- Times and sharing ----

/**
 * Two pictures of the same array side by side: `a` groups of `b` and `b` groups of `a`, each
 * group closing up. The array is always wider than tall (the smaller number is its height), so
 * one side groups it in rows and the other in columns: the same blocks, counted two ways.
 */
function times(a: number, b: number): BlockPicture {
  const half = (BLOCK_BOX.w - 40) / 2;
  const spread = 0.5; // extra space between groups at the start, in pitches
  const [tall, wide] = [Math.min(a, b), Math.max(a, b)];
  const pitch = Math.min(
    MAX_PITCH * 0.75,
    BLOCK_BOX.h / (tall + (tall - 1) * spread),
    half / (wide + (wide - 1) * spread),
  );
  const panel = (groups: number, per: number, left: number, tones: [BlockTone, BlockTone]) => {
    // Groups are columns when there are more groups than blocks in each.
    const asColumns = groups > per;
    const ex = left + center(half, wide, pitch);
    const ey = center(BLOCK_BOX.h, tall, pitch);
    const sx = left + center(half, wide + (asColumns ? (wide - 1) * spread : 0), pitch);
    const sy = center(BLOCK_BOX.h, tall + (asColumns ? 0 : (tall - 1) * spread), pitch);
    return rows(groups * per, per).map(({ col, row }): Block => {
      // `row` is the group and `col` the place in it; columns swap them on screen.
      const cell = asColumns ? { col: row, row: col } : { col, row };
      const end = unit(cell, pitch, ex, ey);
      const from = asColumns
        ? { x: sx + cell.col * pitch * (1 + spread), y: end.y }
        : { x: end.x, y: sy + cell.row * pitch * (1 + spread) };
      return { ...end, from, tone: tones[row % 2]! };
    });
  };
  return {
    blocks: [...panel(a, b, 0, ['a', 'c']), ...panel(b, a, half + 40, ['b', 'd'])],
    frames: [],
  };
}

/** A pile of `a` that splits into `b` equal groups (rows), each group framed. */
function share(a: number, b: number): BlockPicture {
  const q = a / b;
  const pileCols = a > 50 ? 20 : 10;
  const pile = rows(a, pileCols);
  const spread = 0.5;
  const pitch = Math.min(
    MAX_PITCH * 0.75,
    BLOCK_BOX.h / (b + (b - 1) * spread),
    BLOCK_BOX.h / size(pile).rows,
    BLOCK_BOX.w / pileCols,
  );
  const px = center(BLOCK_BOX.w, Math.min(pileCols, a), pitch);
  const py = center(BLOCK_BOX.h, size(pile).rows, pitch);
  const gx = center(BLOCK_BOX.w, q, pitch);
  const gy = center(BLOCK_BOX.h, b + (b - 1) * spread, pitch);
  const rowY = (r: number) => gy + r * pitch * (1 + spread);
  // Dealt out like cards: block i goes to group i mod b.
  const blocks: Block[] = pile.map((cell, i) => {
    const group = i % b;
    const slot = Math.floor(i / b);
    const end = unit({ col: slot, row: 0 }, pitch, gx, rowY(group));
    const from = unit(cell, pitch, px, py);
    return { ...end, from: { x: from.x, y: from.y }, tone: group % 2 ? 'b' : 'a' };
  });
  const pad = pitch * 0.12;
  const frames = Array.from({ length: b }, (_, r) => ({
    x: gx - pad,
    y: rowY(r) - pad,
    w: q * pitch - pitch * GAP + 2 * pad,
    h: pitch * (1 - GAP) + 2 * pad,
  }));
  return { blocks, frames };
}
