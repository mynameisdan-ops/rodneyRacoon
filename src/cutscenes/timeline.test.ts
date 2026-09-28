import { describe, expect, it } from 'vitest';
import { buildTimeline, cameraFor, sampleTimeline, type SceneScript } from './timeline';

const script: SceneScript = {
  startX: 100,
  steps: [
    { do: 'caption' },
    { do: 'walk', x: 300, ms: 1000 },
    { do: 'prop', state: 'splash' },
    { do: 'jump', x: 500, height: 80, ms: 500 },
    { do: 'move', x: 600, lift: 40, ms: 400, pose: 'climb' },
    { do: 'face', facing: 'left' },
    { do: 'hold', pose: 'cheer', ms: 600 },
  ],
};

describe('cut-scene timeline', () => {
  const tl = buildTimeline(script);

  it('adds up blocking steps and records instant ones', () => {
    expect(tl.duration).toBe(2500);
    expect(tl.captionAt).toBe(0);
    expect(tl.propEvents).toEqual([{ at: 1000, state: 'splash' }]);
  });

  it('walks at a steady speed', () => {
    expect(sampleTimeline(tl, 0)).toMatchObject({ x: 100, lift: 0, pose: 'walk' });
    expect(sampleTimeline(tl, 500)).toMatchObject({ x: 200, lift: 0, pose: 'walk' });
  });

  it('jumps in an arc and lands on the ground', () => {
    const mid = sampleTimeline(tl, 1250);
    expect(mid).toMatchObject({ x: 400, lift: 80, floor: 0, pose: 'jump', propState: 'splash' });
    expect(mid.propSince).toBe(1000);
    expect(sampleTimeline(tl, 1499.9).lift).toBeCloseTo(0, 0);
  });

  it('eases moves and holds poses in place', () => {
    const climbHalf = sampleTimeline(tl, 1700);
    expect(climbHalf.pose).toBe('climb');
    expect(climbHalf.x).toBeCloseTo(550);
    expect(climbHalf.lift).toBeCloseTo(20);
    const cheer = sampleTimeline(tl, 2200);
    expect(cheer).toMatchObject({ x: 600, lift: 40, pose: 'cheer', facing: 'left' });
  });

  it('clamps before the start and after the end', () => {
    expect(sampleTimeline(tl, -50)).toMatchObject({ x: 100, propState: 'idle' });
    expect(sampleTimeline(tl, 99999)).toMatchObject({ x: 600, lift: 40, pose: 'cheer' });
  });

  it('settles a final walk into idle', () => {
    const walkOnly = buildTimeline({ startX: 0, steps: [{ do: 'walk', x: 100, ms: 100 }] });
    expect(sampleTimeline(walkOnly, 50).pose).toBe('walk');
    expect(sampleTimeline(walkOnly, 100)).toMatchObject({ x: 100, pose: 'idle' });
  });

  it('has no caption unless the script asks for one', () => {
    const quiet = buildTimeline({ startX: 0, steps: [{ do: 'hold', pose: 'idle', ms: 10 }] });
    expect(quiet.captionAt).toBeNull();
    expect(sampleTimeline(quiet, 5).showCaption).toBe(false);
  });
});

describe('cameraFor', () => {
  it('stays put in a one-screen scene and follows in a wide one', () => {
    expect(cameraFor(900, 1280)).toBe(0);
    expect(cameraFor(200, 2200)).toBe(0);
    expect(cameraFor(1000, 2200)).toBeCloseTo(1000 - 1280 * 0.38);
    expect(cameraFor(5000, 2200)).toBe(920);
  });
});
