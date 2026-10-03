import type { AdaptiveState, WeakFact } from '../game/adaptive';
import { isMix, SKILL_IDS, type BaseSkillId, type Problem, type SkillId } from '../game/problems';
import type { LevelProgress, ProgressMap } from '../game/progress';
import { AGES } from '../content/skills';
import { GEAR_SLOTS, getItem, type Gear } from '../content/shop';

/**
 * Save format. Bump SAVE_VERSION and add a step to `migrate` whenever this shape changes.
 */
export const SAVE_VERSION = 6;

/** A player. The adaptive fields (`age`, `ratings`, `weakFacts`) were added in v3. */
export interface Profile extends AdaptiveState {
  id: string;
  name: string;
  /** Placeholder avatar color until the avatar builder (M8). */
  color: string;
  createdAt: number;
  /** Check answers as soon as enough digits are typed, instead of on Enter / ✓ (added in v2). */
  autoSubmit: boolean;
  /** A parent setting: every level is open, not just the next one (added in v4). */
  unlockAll: boolean;
  progress: ProgressMap;
  /** Coins to spend in the shop (added in v5). */
  coins: number;
  /** Shop item ids bought (added in v5). */
  owned: string[];
  /** What the hero wears, from `owned` (added in v5). */
  gear: Gear;
}

/** A volume step: 0 is off, 3 is loudest. */
export type VolumeLevel = 0 | 1 | 2 | 3;

/** This device's sound (not per player). */
export interface AudioSettings {
  sound: VolumeLevel;
  music: VolumeLevel;
  /** The speaker button on the map: silences both without losing the volumes. */
  muted: boolean;
}

export const DEFAULT_AUDIO: AudioSettings = { sound: 2, music: 2, muted: false };

export interface SaveData {
  version: typeof SAVE_VERSION;
  profiles: Profile[];
  lastProfileId: string | null;
  /** Sound settings for this device (added in v6). */
  audio: AudioSettings;
}

export const MAX_NAME_LENGTH = 12;

export function emptySave(): SaveData {
  return { version: SAVE_VERSION, profiles: [], lastProfileId: null, audio: DEFAULT_AUDIO };
}

/** Thrown when the save was written by a newer version of the game; it must not be overwritten. */
export class NewerSaveError extends Error {
  constructor(public readonly foundVersion: number) {
    super(`Save version ${foundVersion} is newer than this app (${SAVE_VERSION})`);
  }
}

/**
 * Turns whatever was stored into a valid current SaveData. Unknown or damaged
 * entries are dropped rather than failing the whole load.
 */
export function migrate(raw: unknown): SaveData {
  if (!isObject(raw)) return emptySave();
  const version = typeof raw.version === 'number' ? raw.version : 0;
  if (version > SAVE_VERSION) throw new NewerSaveError(version);
  if (version < 1) return emptySave();

  // Each version only added fields, and sanitizing fills in their defaults: v2 added
  // `autoSubmit` (Enter), v3 added `age` (not set), `ratings` and `weakFacts` (empty),
  // v4 added `unlockAll` (off), v5 added `coins` (0), `owned` and `gear` (none), v6 added
  // `audio` (the default volumes).
  const profiles = Array.isArray(raw.profiles)
    ? raw.profiles.map(sanitizeProfile).filter((p): p is Profile => p !== null)
    : [];
  const lastProfileId =
    typeof raw.lastProfileId === 'string' && profiles.some((p) => p.id === raw.lastProfileId)
      ? raw.lastProfileId
      : null;
  return { version: SAVE_VERSION, profiles, lastProfileId, audio: sanitizeAudio(raw.audio) };
}

function sanitizeAudio(raw: unknown): AudioSettings {
  if (!isObject(raw)) return DEFAULT_AUDIO;
  const level = (v: unknown, fallback: VolumeLevel): VolumeLevel =>
    v === 0 || v === 1 || v === 2 || v === 3 ? v : fallback;
  return {
    sound: level(raw.sound, DEFAULT_AUDIO.sound),
    music: level(raw.music, DEFAULT_AUDIO.music),
    muted: raw.muted === true,
  };
}

function sanitizeProfile(raw: unknown): Profile | null {
  if (!isObject(raw) || typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;
  const progress: ProgressMap = {};
  if (isObject(raw.progress)) {
    for (const [key, value] of Object.entries(raw.progress)) {
      const id = Number(key);
      const p = sanitizeLevelProgress(value);
      if (Number.isInteger(id) && id > 0 && p) progress[id] = p;
    }
  }
  return {
    id: raw.id,
    name: raw.name.slice(0, MAX_NAME_LENGTH),
    color: typeof raw.color === 'string' ? raw.color : '#e63946',
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : 0,
    autoSubmit: raw.autoSubmit === true,
    unlockAll: raw.unlockAll === true,
    age: sanitizeAge(raw.age),
    ratings: sanitizeRatings(raw.ratings),
    weakFacts: Array.isArray(raw.weakFacts)
      ? raw.weakFacts.map(sanitizeWeakFact).filter((w): w is WeakFact => w !== null)
      : [],
    progress,
    ...sanitizeShop(raw),
  };
}

/** Coins, owned items and gear. Unknown items are dropped, and only owned items can be worn. */
function sanitizeShop(raw: Record<string, unknown>): Pick<Profile, 'coins' | 'owned' | 'gear'> {
  const coins =
    typeof raw.coins === 'number' && Number.isFinite(raw.coins) && raw.coins > 0
      ? Math.floor(raw.coins)
      : 0;
  const owned = Array.isArray(raw.owned)
    ? [...new Set(raw.owned.filter((id): id is string => typeof id === 'string' && !!getItem(id)))]
    : [];
  const gear: Gear = {};
  if (isObject(raw.gear)) {
    for (const slot of GEAR_SLOTS) {
      const id = raw.gear[slot];
      if (typeof id === 'string' && owned.includes(id) && getItem(id)?.slot === slot) {
        gear[slot] = id;
      }
    }
  }
  return { coins, owned, gear };
}

function sanitizeAge(raw: unknown): number | null {
  return typeof raw === 'number' && (AGES as readonly number[]).includes(raw) ? raw : null;
}

const isSkill = (v: unknown): v is SkillId =>
  typeof v === 'string' && (SKILL_IDS as readonly string[]).includes(v);

function sanitizeRatings(raw: unknown): Partial<Record<SkillId, number>> {
  const out: Partial<Record<SkillId, number>> = {};
  if (!isObject(raw)) return out;
  for (const [skill, value] of Object.entries(raw)) {
    if (isSkill(skill) && typeof value === 'number' && Number.isFinite(value)) {
      out[skill] = Math.min(1, Math.max(0, value));
    }
  }
  return out;
}

/** Whether `a op b = result` is true (so a corrupt fact never comes back with a wrong answer). */
function factHolds(a: number, op: Problem['op'], b: number, result: number): boolean {
  if (op === '+') return a + b === result;
  if (op === '−') return a - b === result;
  if (op === '×') return a * b === result;
  return b !== 0 && a / b === result;
}

function sanitizeWeakFact(raw: unknown): WeakFact | null {
  if (!isObject(raw) || !isObject(raw.problem)) return null;
  const p = raw.problem;
  const nums = [p.a, p.b, p.result, p.answer];
  if (!nums.every((n) => typeof n === 'number' && Number.isInteger(n) && n >= 0)) return null;
  if (p.op !== '+' && p.op !== '−' && p.op !== '×' && p.op !== '÷') return null;
  if (p.unknown !== 'result' && p.unknown !== 'b') return null;
  if (typeof p.key !== 'string' || !isSkill(p.skill) || isMix(p.skill)) return null;
  if (!factHolds(p.a as number, p.op, p.b as number, p.result as number)) return null;
  if (p.answer !== (p.unknown === 'result' ? p.result : p.b)) return null;
  const count = (v: unknown) => (typeof v === 'number' && v >= 0 ? Math.floor(v) : 0);
  const problem: Problem = {
    a: p.a as number,
    op: p.op,
    b: p.b as number,
    result: p.result as number,
    unknown: p.unknown,
    answer: p.answer as number,
    key: p.key,
    skill: p.skill as BaseSkillId,
  };
  return {
    problem,
    misses: Math.max(1, count(raw.misses)),
    streak: count(raw.streak),
    lastSeen: count(raw.lastSeen),
  };
}

function sanitizeLevelProgress(raw: unknown): LevelProgress | null {
  if (!isObject(raw)) return null;
  const stars = Number(raw.bestStars);
  const count = (v: unknown) => (typeof v === 'number' && v >= 0 ? Math.floor(v) : 0);
  return {
    bestStars: (stars >= 0 && stars <= 3 ? Math.floor(stars) : 0) as LevelProgress['bestStars'],
    plays: count(raw.plays),
    passes: count(raw.passes),
    lastPlayedAt: count(raw.lastPlayedAt),
  };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
