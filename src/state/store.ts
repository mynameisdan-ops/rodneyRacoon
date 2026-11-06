import { create } from 'zustand';
import type { LevelDef } from '../content/levels';
import { applyPage, type Answer } from '../game/adaptive';
import { getItem } from '../content/shop';
import { recordPlay } from '../game/progress';
import { pageCoins, type CoinReward } from '../game/rewards';
import type { PageEvaluation } from '../game/scoring';
import { buy, toggleWear } from '../game/shop';
import { emptyStats, recordStats } from '../game/stats';
import { CONFIG } from '../game/config';
import { loadSave, requestPersistentStorage, writeSave } from './persistence';
import {
  emptySave,
  MAX_NAME_LENGTH,
  NewerSaveError,
  type AudioSettings,
  type Profile,
  type SaveData,
} from './schema';

/** The per-player settings a parent picks in Settings (age also in the new-player editor). */
export type ProfileSettings = Pick<
  Profile,
  'autoSubmit' | 'age' | 'unlockAll' | 'pageSeconds' | 'adapts' | 'hardest' | 'mixMulDiv' | 'blocks'
>;
/** Everything that can be changed about a player. */
export type ProfileFields = Pick<Profile, 'name' | 'color'> & ProfileSettings;

interface GameStore {
  status: 'loading' | 'ready' | 'blocked';
  /** Set when the last write failed (e.g. private browsing); gameplay continues in memory. */
  saveFailed: boolean;
  /** Write changes to disk (off for the dev-only `#demo` players, who live in memory). */
  persist: boolean;
  data: SaveData;
  activeProfileId: string | null;

  init(): Promise<void>;
  createProfile(name: string, color: string, settings?: Partial<ProfileSettings>): string;
  /** Changing `age` restarts the skill ratings from the new age (weak facts are kept). */
  updateProfile(id: string, patch: Partial<ProfileFields>): void;
  deleteProfile(id: string): void;
  /**
   * Starts a player's journey over: levels, stars, stickers, difficulty, missed facts and stats
   * are cleared; name, settings, coins and gear are kept.
   */
  resetProgress(id: string): void;
  selectProfile(id: string | null): void;
  /** Records a finished page and pays its coins; returns what it paid (undefined if no player). */
  recordResult(
    level: LevelDef,
    evaluation: PageEvaluation,
    answers: readonly Answer[],
  ): CoinReward | undefined;
  /** Buys a shop item for the active player and puts it on (if they have the coins). */
  buyItem(itemId: string): void;
  /** Puts an owned item on, or takes it off. */
  toggleItem(itemId: string): void;
  /** Changes this device's sound settings. */
  setAudio(patch: Partial<AudioSettings>): void;
}

function newId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function cleanName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH);
}

export const useGame = create<GameStore>()((set, get) => {
  /** Applies a change to the save data and writes it to disk. */
  const commit = (update: (data: SaveData) => SaveData) => {
    if (get().status === 'blocked') return;
    const data = update(get().data);
    set({ data });
    if (!get().persist) return;
    writeSave(data).then(
      () => get().saveFailed && set({ saveFailed: false }),
      (err: unknown) => {
        console.warn('Saving progress failed', err);
        set({ saveFailed: true });
      },
    );
  };

  const updateProfiles = (fn: (p: Profile) => Profile, id: string) =>
    commit((d) => ({ ...d, profiles: d.profiles.map((p) => (p.id === id ? fn(p) : p)) }));

  return {
    status: 'loading',
    saveFailed: false,
    persist: true,
    data: emptySave(),
    activeProfileId: null,

    async init() {
      // Already set up (e.g. the dev-only #demo players).
      if (get().status !== 'loading') return;
      try {
        const data = await loadSave();
        set({ data, status: 'ready' });
        void requestPersistentStorage();
      } catch (err) {
        if (err instanceof NewerSaveError) {
          // Never overwrite a save from a newer version of the game.
          set({ status: 'blocked' });
        } else {
          // Storage unavailable: play in memory.
          console.warn('Loading progress failed', err);
          set({ status: 'ready', saveFailed: true });
        }
      }
    },

    createProfile(name, color, settings = {}) {
      const id = newId();
      const profile: Profile = {
        id,
        name: cleanName(name),
        color,
        createdAt: Date.now(),
        autoSubmit: settings.autoSubmit ?? false,
        age: settings.age ?? null,
        unlockAll: settings.unlockAll ?? false,
        ratings: {},
        weakFacts: [],
        progress: {},
        coins: 0,
        owned: [],
        gear: {},
        pageSeconds: settings.pageSeconds ?? CONFIG.pageSeconds,
        adapts: settings.adapts ?? true,
        hardest: settings.hardest ?? 1,
        mixMulDiv: settings.mixMulDiv ?? false,
        blocks: settings.blocks ?? false,
        stats: emptyStats(),
      };
      commit((d) => ({ ...d, profiles: [...d.profiles, profile], lastProfileId: id }));
      set({ activeProfileId: id });
      return id;
    },

    updateProfile(id, patch) {
      updateProfiles(
        (p) => ({
          ...p,
          ...patch,
          ...(patch.name !== undefined && { name: cleanName(patch.name) }),
          ...(patch.age !== undefined && patch.age !== p.age && { ratings: {} }),
        }),
        id,
      );
    },

    deleteProfile(id) {
      commit((d) => ({
        ...d,
        profiles: d.profiles.filter((p) => p.id !== id),
        lastProfileId: d.lastProfileId === id ? null : d.lastProfileId,
      }));
      if (get().activeProfileId === id) set({ activeProfileId: null });
    },

    resetProgress(id) {
      updateProfiles(
        (p) => ({ ...p, progress: {}, ratings: {}, weakFacts: [], stats: emptyStats() }),
        id,
      );
    },

    selectProfile(id) {
      set({ activeProfileId: id });
      if (id) commit((d) => ({ ...d, lastProfileId: id }));
    },

    recordResult(level, evaluation, answers) {
      const id = get().activeProfileId;
      const profile = get().data.profiles.find((p) => p.id === id);
      if (!id || !profile) return undefined;
      const now = Date.now();
      const reward = pageCoins(answers, evaluation, profile.progress[level.id], level.boss);
      updateProfiles(
        (p) => ({
          ...p,
          ...applyPage(p, level, evaluation, answers, now),
          progress: recordPlay(p.progress, level.id, evaluation, now),
          stats: recordStats(p.stats, level.id, evaluation, answers, now),
          coins: p.coins + reward.total,
        }),
        id,
      );
      return reward;
    },

    buyItem(itemId) {
      const id = get().activeProfileId;
      const item = getItem(itemId);
      if (id && item) updateProfiles((p) => buy(p, item), id);
    },

    toggleItem(itemId) {
      const id = get().activeProfileId;
      const item = getItem(itemId);
      if (id && item) updateProfiles((p) => toggleWear(p, item), id);
    },

    setAudio(patch) {
      commit((d) => ({ ...d, audio: { ...d.audio, ...patch } }));
    },
  };
});

export function useActiveProfile(): Profile | undefined {
  return useGame((s) => s.data.profiles.find((p) => p.id === s.activeProfileId));
}
