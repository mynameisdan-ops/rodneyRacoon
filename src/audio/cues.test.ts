import { describe, expect, it } from 'vitest';
import { CUT_SCENES } from '../content/cutscenes';
import { SCENE_SOUNDS } from '../content/sounds';
import { buildTimeline } from '../cutscenes/timeline';
import { SFX_NAMES, sceneCues, type SceneSounds } from './cues';

const sounds: SceneSounds = {
  emotes: { alert: 'alert', sweat: 'sweat', sparkle: 'sparkle' },
  props: { rumble: { sound: 'rumble', ms: 1000 }, crash: { sound: 'crash' }, quiet: null },
};

describe('sceneCues', () => {
  it('sounds a jump going up, and a landing unless an impact lands there', () => {
    const tl = buildTimeline({
      startX: 0,
      steps: [
        { do: 'jump', x: 200, height: 100, ms: 500 },
        { do: 'jump', x: 400, height: 100, ms: 500 },
        { do: 'impact', x: 400, lift: 0, size: 0.8 },
        { do: 'hold', pose: 'cheer', ms: 500 },
      ],
    });
    expect(sceneCues(tl, sounds).map((c) => [c.at, c.sound])).toEqual([
      [0, 'jump'],
      [500, 'land'],
      [500, 'jump'],
      [1000, 'impact'],
    ]);
  });

  it("rumbles for a shake that isn't an impact's, and plays props, emotes and cut-ins", () => {
    const tl = buildTimeline({
      startX: 0,
      steps: [
        { do: 'prop', state: 'rumble' },
        { do: 'shake', ms: 600, amp: 6 },
        { do: 'emote', emote: 'alert' },
        { do: 'hold', pose: 'idle', ms: 400 },
        { do: 'prop', state: 'quiet' },
        { do: 'cutin', ms: 500 },
        { do: 'hold', pose: 'idle', ms: 400 },
        { do: 'impact', x: 0, lift: 0 },
        { do: 'prop', state: 'crash' },
        { do: 'shake', ms: 500, amp: 12 },
        { do: 'hold', pose: 'cheer', ms: 400 },
      ],
    });
    const cues = sceneCues(tl, sounds);
    expect(cues.map((c) => c.sound)).toEqual(['rumble', 'alert', 'cutin', 'impact', 'crash']);
    // The shake's rumble and the prop's rumble are one sound, as big as the bigger.
    expect(cues[0]).toMatchObject({ at: 0, ms: 1000, size: 1 });
  });

  it('times cues in real time, through freezes and slow motion', () => {
    const tl = buildTimeline({
      startX: 0,
      steps: [
        { do: 'hold', pose: 'idle', ms: 500 },
        { do: 'impact', x: 0, lift: 0 },
        { do: 'freeze', ms: 200 },
        { do: 'slow', ms: 400, rate: 0.5 },
        { do: 'hold', pose: 'idle', ms: 400 },
        { do: 'cutin', ms: 300 },
        { do: 'hold', pose: 'cheer', ms: 300 },
      ],
    });
    const at = Object.fromEntries(sceneCues(tl, sounds).map((c) => [c.sound, c.at]));
    expect(at.impact).toBe(500); // as the hit-stop begins
    expect(at.cutin).toBe(500 + 200 + 800);
  });
});

describe('the scenes', () => {
  it('give every prop state a sound or a silence', () => {
    for (const [level, scene] of Object.entries(CUT_SCENES)) {
      for (const step of scene.script.steps) {
        if (step.do === 'prop') {
          expect(SCENE_SOUNDS.props, `level ${level}: ${step.state}`).toHaveProperty(step.state);
        }
      }
    }
  });

  it.each(Object.entries(CUT_SCENES))('level %s: cues in order, inside the scene', (_, scene) => {
    const tl = buildTimeline(scene.script);
    const cues = sceneCues(tl, SCENE_SOUNDS);
    expect(cues.length).toBeGreaterThan(2);
    cues.forEach((c, i) => {
      expect(SFX_NAMES).toContain(c.sound);
      expect(c.at).toBeGreaterThanOrEqual(i ? cues[i - 1]!.at : 0);
      expect(c.at).toBeLessThanOrEqual(tl.realDuration);
    });
  });
});
