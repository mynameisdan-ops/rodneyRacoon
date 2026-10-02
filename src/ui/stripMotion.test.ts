import { describe, expect, it } from 'vitest';
import { STRIP_MS, stripMotion } from './stripMotion';

const { crouch, dash, land, stumble, shake } = STRIP_MS;

describe('page strip motion', () => {
  it('stands at his spot before any answer', () => {
    expect(stripMotion(null, 0, 0.2, 0.3)).toMatchObject({ pos: 0.3, pose: 'idle', dash: null });
    expect(stripMotion(null, 0, 0.2, 0.3, 'cheer').pose).toBe('cheer');
  });

  it('crouches, then dashes from the old spot to the new one', () => {
    const c = stripMotion('correct', crouch / 2, 0.2, 0.3);
    expect(c).toMatchObject({ pos: 0.2, pose: 'crouch' });
    expect(c.squash.sy).toBeLessThan(1);
    const mid = stripMotion('correct', crouch + dash / 2, 0.2, 0.3);
    expect(mid.pose).toBe('run');
    expect(mid.pos).toBeGreaterThan(0.25);
    expect(mid.lean).toBeGreaterThan(0);
    expect(mid.dash).toBeCloseTo(0.5);
  });

  it('overshoots a touch, never far, and ends exactly on the new spot', () => {
    let most = 0;
    for (let t = crouch; t < crouch + dash; t += 5) {
      most = Math.max(most, stripMotion('correct', t, 0.2, 0.3).pos);
    }
    expect(most).toBeGreaterThan(0.3);
    expect(most).toBeLessThan(0.31);
    expect(stripMotion('correct', crouch + dash, 0.2, 0.3).pos).toBe(0.3);
  });

  it('lands with a springy squash, then stands still', () => {
    const l = stripMotion('correct', crouch + dash + 10, 0.2, 0.3);
    expect(l.landing).toBe(10);
    expect(l.squash.sy).toBeLessThan(1);
    expect(stripMotion('correct', crouch + dash + land + 1, 0.2, 0.3)).toMatchObject({
      pose: 'idle',
      squash: { sx: 1, sy: 1 },
      landing: null,
    });
  });

  it('stumbles and shakes the strip on a wrong answer, without moving', () => {
    const w = stripMotion('wrong', 20, 0.3, 0.3);
    expect(w).toMatchObject({ pos: 0.3, pose: 'stumble' });
    expect(Math.abs(w.shake)).toBeGreaterThan(0);
    expect(stripMotion('reveal', shake + 1, 0.3, 0.3).shake).toBe(0);
    expect(stripMotion('wrong', stumble + 1, 0.3, 0.3).pose).toBe('idle');
  });
});
