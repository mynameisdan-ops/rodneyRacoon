import { describe, expect, it } from 'vitest';
import { ridgeLine, ridgePath, W } from './sceneryKit';

describe('ridges', () => {
  it('start and end at the same height, so tiles join', () => {
    for (const smooth of [false, true]) {
      const d = ridgePath(3, 100, 20, 150, 240, smooth);
      expect(d.startsWith('M0 240 L0 100')).toBe(true);
      expect(d.endsWith(`L${W} 100 L${W} 240 Z`)).toBe(true);
    }
  });

  it('outlines only the top edge', () => {
    const d = ridgeLine(3, 100, 20, 150, 240);
    expect(d.startsWith('M0 100')).toBe(true);
    expect(d.endsWith(`L${W} 100`)).toBe(true);
    expect(d).not.toContain(' 240');
  });
});
