import { describe, expect, it } from 'vitest';
import { emptySave, migrate, NewerSaveError, SAVE_VERSION } from './schema';

describe('migrate', () => {
  it('returns an empty save for nothing or junk', () => {
    expect(migrate(undefined)).toEqual(emptySave());
    expect(migrate('hello')).toEqual(emptySave());
    expect(migrate([])).toEqual(emptySave());
    expect(migrate({ version: 0 })).toEqual(emptySave());
  });

  it('refuses saves from a newer app version', () => {
    expect(() => migrate({ version: SAVE_VERSION + 1, profiles: [] })).toThrow(NewerSaveError);
  });

  it('keeps valid data unchanged', () => {
    const save = {
      version: 2,
      lastProfileId: 'a',
      profiles: [
        {
          id: 'a',
          name: 'Sam',
          color: '#123456',
          createdAt: 5,
          autoSubmit: true,
          progress: { 1: { bestStars: 2, plays: 3, passes: 1, lastPlayedAt: 9 } },
        },
      ],
    };
    expect(migrate(structuredClone(save))).toEqual(save);
  });

  it('migrates a v1 save: players wait for Enter', () => {
    const out = migrate({
      version: 1,
      lastProfileId: 'a',
      profiles: [{ id: 'a', name: 'Sam', color: '#123456', createdAt: 5, progress: {} }],
    });
    expect(out.version).toBe(2);
    expect(out.lastProfileId).toBe('a');
    expect(out.profiles[0]!.autoSubmit).toBe(false);
  });

  it('drops damaged profiles and progress entries', () => {
    const out = migrate({
      version: 1,
      lastProfileId: 'gone',
      profiles: [
        null,
        { id: 7, name: 'bad id' },
        {
          id: 'b',
          name: 'A very long name indeed',
          progress: {
            1: { bestStars: 9, plays: -2, passes: 'x' },
            abc: { bestStars: 1 },
            2: 'nope',
          },
        },
      ],
    });
    expect(out.lastProfileId).toBeNull();
    expect(out.profiles).toHaveLength(1);
    const [p] = out.profiles;
    expect(p!.name).toBe('A very long ');
    expect(p!.color).toBe('#e63946');
    expect(p!.progress).toEqual({ 1: { bestStars: 0, plays: 0, passes: 0, lastPlayedAt: 0 } });
  });
});
