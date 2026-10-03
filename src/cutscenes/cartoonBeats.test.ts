import { describe, expect, it } from 'vitest';
import {
  EMOTE_MS,
  IMPACT_MS,
  buildTimeline,
  realTime,
  sampleTimeline,
  scriptTime,
} from './timeline';

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

describe('direction: time, camera and cut-ins', () => {
  const tl = buildTimeline({
    startX: 0,
    steps: [
      { do: 'walk', x: 100, ms: 1000 },
      { do: 'freeze', ms: 100 },
      { do: 'cutin', ms: 600, expr: 'shout' },
      { do: 'camera', zoom: 1.4, tilt: -4, ms: 300 },
      { do: 'slow', ms: 400, rate: 0.5 },
      { do: 'walk', x: 200, ms: 1000 },
      { do: 'camera', zoom: 1, ms: 400 },
      { do: 'hold', pose: 'cheer', ms: 600 },
    ],
  });

  it('adds freezes and slow motion to the real running time', () => {
    expect(tl.duration).toBe(2600);
    expect(tl.realDuration).toBe(2600 + 100 + 400);
  });

  it('maps real time to scene time through a freeze and slow motion', () => {
    expect(scriptTime(tl, 500)).toBe(500);
    expect(scriptTime(tl, 1050)).toBe(1000); // frozen
    expect(scriptTime(tl, 1100)).toBe(1000);
    expect(scriptTime(tl, 1300)).toBe(1100); // half speed
    expect(scriptTime(tl, 1900)).toBe(1400); // slow motion over
    expect(scriptTime(tl, 2000)).toBe(1500);
    expect(scriptTime(tl, 99999)).toBe(2600);
  });

  it('maps scene time back to real time (a freeze starts after the moment it holds)', () => {
    expect(realTime(tl, 500)).toBe(500);
    expect(realTime(tl, 1000)).toBe(1000);
    expect(realTime(tl, 1001)).toBe(1102); // after the freeze, at half speed
    expect(realTime(tl, 1100)).toBe(1300); // half speed
    expect(realTime(tl, 1400)).toBe(1900);
    expect(realTime(tl, 2600)).toBe(tl.realDuration);
    for (const t of [0, 300, 999, 1050, 1250, 1399, 1700, 2600]) {
      expect(scriptTime(tl, realTime(tl, t))).toBeCloseTo(t);
    }
  });

  it('eases the camera in with a little overshoot, holds, and eases back', () => {
    expect(sampleTimeline(tl, 900).camera).toEqual({ zoom: 1, tilt: 0 });
    const mid = sampleTimeline(tl, 1150).camera;
    expect(mid.zoom).toBeGreaterThan(1);
    expect(mid.zoom).toBeLessThan(1.45);
    const peak = Math.max(
      ...[1200, 1220, 1250, 1280].map((t) => sampleTimeline(tl, t).camera.zoom),
    );
    expect(peak).toBeGreaterThan(1.4);
    expect(sampleTimeline(tl, 1800).camera).toEqual({ zoom: 1.4, tilt: -4 });
    expect(sampleTimeline(tl, 2600).camera.zoom).toBeCloseTo(1);
  });

  it('starts a camera move from wherever the last one had got to', () => {
    const quick = buildTimeline({
      startX: 0,
      steps: [
        { do: 'camera', zoom: 2, ms: 1000 },
        { do: 'hold', pose: 'idle', ms: 100 },
        { do: 'camera', zoom: 1, ms: 100 },
        { do: 'hold', pose: 'idle', ms: 100 },
      ],
    });
    const at100 = sampleTimeline(quick, 99.9).camera.zoom;
    expect(sampleTimeline(quick, 100.1).camera.zoom).toBeCloseTo(at100, 1);
  });

  it('shows a cut-in for its time', () => {
    expect(sampleTimeline(tl, 999).cutin).toBeNull();
    expect(sampleTimeline(tl, 1200).cutin).toEqual({ dt: 200, ms: 600, expr: 'shout' });
    expect(sampleTimeline(tl, 1600).cutin).toBeNull();
  });
});

describe('body dynamics', () => {
  const tl = buildTimeline({
    startX: 0,
    steps: [
      { do: 'run', x: 800, ms: 1000 },
      { do: 'jump', x: 1200, height: 150, ms: 600, pose: 'leap' },
      { do: 'hold', pose: 'cheer', ms: 800 },
    ],
  });

  it('leans into a run', () => {
    expect(sampleTimeline(tl, 500).lean).toBeGreaterThan(8);
  });

  it('tilts back on the way up a jump, forward on the way down, upright at the ends', () => {
    const up = sampleTimeline(tl, 1150).lean;
    const down = sampleTimeline(tl, 1450).lean;
    expect(down).toBeGreaterThan(up);
    expect(Math.abs(sampleTimeline(tl, 1001).lean)).toBeLessThan(1);
    expect(sampleTimeline(tl, 1700).lean).toBe(0);
  });

  it('crouches just before the jump and reports the landing', () => {
    expect(sampleTimeline(tl, 800).crouch).toBe(false);
    expect(sampleTimeline(tl, 950).crouch).toBe(true);
    expect(sampleTimeline(tl, 1300).crouch).toBe(false);
    expect(sampleTimeline(tl, 1650).landing).toBe(50);
    expect(sampleTimeline(tl, 2300).landing).toBeNull();
  });
});
