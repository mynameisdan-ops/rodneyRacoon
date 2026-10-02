import { describe, expect, it } from 'vitest';
import { EMOTE_MS, IMPACT_MS, buildTimeline, sampleTimeline } from './timeline';

/** The M7b cartoon beats: faces, squash and stretch, impacts, focus lines and emotes. */

const jumpScene = buildTimeline({
  startX: 0,
  steps: [
    { do: 'hold', pose: 'idle', ms: 500 },
    { do: 'jump', x: 300, height: 120, ms: 600, pose: 'leap' },
    { do: 'impact', x: 300, lift: 0, size: 0.5 },
    { do: 'emote', emote: 'sparkle' },
    { do: 'hold', pose: 'cheer', ms: 1200 },
  ],
});

describe('expressions', () => {
  it('follows the pose unless a step sets one', () => {
    const tl = buildTimeline({
      startX: 0,
      steps: [
        { do: 'walk', x: 100, ms: 100 },
        { do: 'hold', pose: 'brace', ms: 100 },
        { do: 'hold', pose: 'brace', ms: 100, expr: 'determined' },
        { do: 'hold', pose: 'cheer', ms: 100 },
      ],
    });
    expect(sampleTimeline(tl, 50).expr).toBe('calm');
    expect(sampleTimeline(tl, 150).expr).toBe('surprised');
    expect(sampleTimeline(tl, 250).expr).toBe('determined');
    expect(sampleTimeline(tl, 350).expr).toBe('happy');
  });

  it('settles a final walk into a calm idle', () => {
    const tl = buildTimeline({ startX: 0, steps: [{ do: 'run', x: 100, ms: 100 }] });
    expect(sampleTimeline(tl, 100)).toMatchObject({ pose: 'idle', expr: 'calm', speed: 0 });
  });
});

describe('squash and stretch', () => {
  const at = (t: number) => sampleTimeline(jumpScene, t).squash;

  it('stands normally away from any jump', () => {
    expect(at(100)).toEqual({ sx: 1, sy: 1 });
    expect(at(1800)).toEqual({ sx: 1, sy: 1 });
  });

  it('crouches just before a jump', () => {
    const crouch = at(495);
    expect(crouch.sy).toBeLessThan(0.92);
    expect(crouch.sx).toBeGreaterThan(1);
  });

  it('stretches on the way up and is round at the top of the arc', () => {
    expect(at(520).sy).toBeGreaterThan(1.05);
    expect(at(520).sx).toBeLessThan(1);
    expect(at(800).sy).toBeCloseTo(1, 1);
  });

  it('squashes on landing, springs back past normal, and settles', () => {
    expect(at(1105).sy).toBeLessThan(0.9);
    expect(at(1220).sy).toBeGreaterThan(1);
    expect(at(1400)).toEqual({ sx: 1, sy: 1 });
  });

  it('never squashes landing on a moving perch (a swing or a climb)', () => {
    const tl = buildTimeline({
      startX: 0,
      steps: [
        { do: 'jump', x: 100, lift: 100, height: 40, ms: 300 },
        { do: 'move', x: 200, lift: 60, ms: 400, pose: 'swing' },
      ],
    });
    expect(sampleTimeline(tl, 320).squash).toEqual({ sx: 1, sy: 1 });
  });
});

describe('impacts, focus lines and emotes', () => {
  it('shows an impact for a moment where the script puts it', () => {
    expect(sampleTimeline(jumpScene, 1099).impacts).toEqual([]);
    expect(sampleTimeline(jumpScene, 1150).impacts).toEqual([
      { x: 300, lift: 0, size: 0.5, dt: 50 },
    ]);
    expect(sampleTimeline(jumpScene, 1100 + IMPACT_MS).impacts).toEqual([]);
  });

  it('shows an emote over him for a while', () => {
    expect(sampleTimeline(jumpScene, 1300).emote).toEqual({ emote: 'sparkle', dt: 200 });
    expect(sampleTimeline(jumpScene, 1100 + EMOTE_MS).emote).toBeNull();
  });

  it('fades focus lines in and out', () => {
    const tl = buildTimeline({
      startX: 0,
      steps: [
        { do: 'action', ms: 1000 },
        { do: 'hold', pose: 'swing', ms: 1500 },
      ],
    });
    expect(sampleTimeline(tl, 60).action).toBeCloseTo(0.5);
    expect(sampleTimeline(tl, 500).action).toBe(1);
    expect(sampleTimeline(tl, 900).action).toBeCloseTo(0.5);
    expect(sampleTimeline(tl, 1200).action).toBe(0);
  });

  it('reports how fast he is moving', () => {
    const tl = buildTimeline({ startX: 0, steps: [{ do: 'run', x: 800, ms: 1000 }] });
    expect(sampleTimeline(tl, 500).speed).toBeCloseTo(0.8);
  });
});
