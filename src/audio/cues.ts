import type { Emote } from '../art/hero/expressions';
import { realTime, type Timeline } from '../cutscenes/timeline';

/**
 * The sound effects by name (pure: `sfx.ts` synthesizes each one) and the cues a cut scene
 * plays, worked out from its timeline. Tested in `cues.test.ts`.
 */
export const SFX_NAMES = [
  // Buttons and the number pad.
  'tap',
  'key',
  'erase',
  // A timed page.
  'count',
  'go',
  'correct',
  'wrong',
  'reveal',
  'combo',
  'tick',
  'done',
  'timeUp',
  // Results, the shop and the maps.
  'star',
  'tally',
  'coin',
  'sticker',
  'buy',
  'wear',
  'steps',
  // Cut scenes: the hero and the directing beats...
  'jump',
  'land',
  'impact',
  'rumble',
  'whoosh',
  'cutin',
  'alert',
  'sweat',
  'sparkle',
  // ...and the obstacles.
  'crash',
  'crack',
  'crumble',
  'water',
  'splash',
  'wind',
  'thunder',
  'whistle',
  'flutter',
  'creak',
  'boom',
  'fall',
  'bloop',
  'boing',
  'grab',
  'grow',
  'snort',
  'shatter',
  'zip',
] as const;
export type SfxName = (typeof SFX_NAMES)[number];

/** How a sound plays: `size` scales it (0..about 1.2), `ms` stretches long ones, `n` steps pitch. */
export interface SfxOptions {
  size?: number;
  ms?: number;
  n?: number;
}

export interface SfxCue extends SfxOptions {
  sound: SfxName;
}

/** A cue in a scene, at real time `at` (ms). */
export interface SceneCue extends SfxCue {
  at: number;
}

/** What a scene's prop states and emotes sound like (`content/sounds.ts`). */
export interface SceneSounds {
  /** A prop state's sound, or null for a silent one. */
  props: Record<string, SfxCue | null>;
  emotes: Record<Emote, SfxName>;
}

/** Cues closer than this (scene ms) count as the same moment. */
const SAME_MOMENT = 80;

/**
 * Every sound a scene plays, in real-time order: a whoosh up for each jump and a thud where it
 * lands (unless an impact lands there), impacts sized like their bursts, rumbles for camera
 * shakes that aren't an impact's, focus-line whooshes, cut-in slashes, emotes and the props'
 * own sounds. A sound repeated at the same moment plays once (as big and long as the biggest).
 */
export function sceneCues(tl: Timeline, sounds: SceneSounds): SceneCue[] {
  const cues: SceneCue[] = [];
  const impactNear = (t: number) => tl.impacts.some((i) => Math.abs(i.at - t) < SAME_MOMENT);

  for (const s of tl.segments) {
    if (s.arc <= 0) continue;
    cues.push({ at: s.start, sound: 'jump', size: Math.min(1, 0.5 + s.arc / 300) });
    if (!impactNear(s.end)) cues.push({ at: s.end, sound: 'land', size: 0.6 });
  }
  for (const i of tl.impacts) cues.push({ at: i.at, sound: 'impact', size: i.size });
  for (const s of tl.shakes) {
    if (!impactNear(s.at)) {
      cues.push({ at: s.at, sound: 'rumble', ms: s.ms, size: Math.min(1, s.amp / 12) });
    }
  }
  for (const a of tl.actions) cues.push({ at: a.at, sound: 'whoosh' });
  for (const c of tl.cutins) cues.push({ at: c.at, sound: 'cutin' });
  for (const e of tl.emotes) cues.push({ at: e.at, sound: sounds.emotes[e.emote] });
  for (const p of tl.propEvents) {
    const cue = sounds.props[p.state];
    if (cue) cues.push({ at: p.at, ...cue });
  }

  cues.sort((a, b) => a.at - b.at);
  const kept: SceneCue[] = [];
  for (const cue of cues) {
    const twin = kept.find((k) => k.sound === cue.sound && cue.at - k.at < SAME_MOMENT);
    if (!twin) kept.push(cue);
    else {
      twin.size = Math.max(twin.size ?? 1, cue.size ?? 1);
      if (twin.ms !== undefined || cue.ms !== undefined) {
        twin.ms = Math.max(twin.ms ?? 0, cue.ms ?? 0);
      }
    }
  }
  return kept.map((cue) => ({ ...cue, at: realTime(tl, cue.at) }));
}
