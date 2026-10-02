import type { HeroPose } from './poses';

/** The hero's faces (M7b). Scenes can set one per step; otherwise each pose wears its own. */
export const EXPRESSIONS = [
  'calm',
  'determined',
  'happy',
  'surprised',
  'worried',
  'shout',
] as const;
export type Expression = (typeof EXPRESSIONS)[number];

/** The face each pose wears unless a scene asks for another. */
export const POSE_EXPRESSION: Record<HeroPose, Expression> = {
  idle: 'calm',
  walk: 'calm',
  run: 'determined',
  jump: 'determined',
  leap: 'shout',
  climb: 'determined',
  cheer: 'happy',
  stumble: 'worried',
  brace: 'surprised',
  ride: 'determined',
  slide: 'determined',
  swing: 'shout',
  fall: 'surprised',
};

/** Little cartoon signs that pop up over his head: a "!", a sweat drop, sparkles. */
export const EMOTES = ['alert', 'sweat', 'sparkle'] as const;
export type Emote = (typeof EMOTES)[number];
