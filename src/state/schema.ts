import type { LevelProgress, ProgressMap } from '../game/progress';

/**
 * Save format. Bump SAVE_VERSION and add a step to `migrate` whenever this shape changes.
 */
export const SAVE_VERSION = 2;

export interface Profile {
  id: string;
  name: string;
  /** Placeholder avatar color until the avatar builder (M8). */
  color: string;
  createdAt: number;
  /** Check answers as soon as enough digits are typed, instead of on Enter / ✓ (added in v2). */
  autoSubmit: boolean;
  progress: ProgressMap;
}

export interface SaveData {
  version: typeof SAVE_VERSION;
  profiles: Profile[];
  lastProfileId: string | null;
}

export const MAX_NAME_LENGTH = 12;

export function emptySave(): SaveData {
  return { version: SAVE_VERSION, profiles: [], lastProfileId: null };
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

  // v1 → v2 added `autoSubmit`; sanitizing fills it in (Enter), so both versions load the same way.
  const profiles = Array.isArray(raw.profiles)
    ? raw.profiles.map(sanitizeProfile).filter((p): p is Profile => p !== null)
    : [];
  const lastProfileId =
    typeof raw.lastProfileId === 'string' && profiles.some((p) => p.id === raw.lastProfileId)
      ? raw.lastProfileId
      : null;
  return { version: SAVE_VERSION, profiles, lastProfileId };
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
    progress,
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
