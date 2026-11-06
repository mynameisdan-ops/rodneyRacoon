import { describe, expect, it } from 'vitest';
import { DEFAULT_AUDIO, emptySave, migrate, NewerSaveError, SAVE_VERSION } from './schema';

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
      version: 8,
      lastProfileId: 'a',
      audio: { sound: 3, music: 0, muted: true },
      profiles: [
        {
          id: 'a',
          name: 'Sam',
          color: '#123456',
          createdAt: 5,
          autoSubmit: true,
          unlockAll: true,
          age: 9,
          ratings: { doubles: 0.4, 'add-within-5': 1 },
          weakFacts: [
            {
              problem: {
                a: 7,
                op: '+',
                b: 8,
                result: 15,
                unknown: 'result',
                answer: 15,
                key: '7+8',
                skill: 'add-within-20',
              },
              misses: 2,
              streak: 1,
              lastSeen: 50,
            },
          ],
          progress: { 1: { bestStars: 2, plays: 3, passes: 1, lastPlayedAt: 9 } },
          coins: 42,
          owned: ['bandana', 'puppy'],
          gear: { hat: 'bandana', pet: 'puppy' },
          pageSeconds: 90,
          adapts: false,
          hardest: 0.5,
          mixMulDiv: true,
          blocks: true,
          stats: {
            skills: { doubles: { answered: 10, right: 9, firstTry: 7, ms: 31000 } },
            recent: [{ at: 9, level: 1, right: 9, total: 10, stars: 2, passed: true, seconds: 41 }],
          },
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
    expect(out.version).toBe(SAVE_VERSION);
    expect(out.lastProfileId).toBe('a');
    expect(out.profiles[0]).toMatchObject({
      autoSubmit: false,
      unlockAll: false,
      age: null,
      ratings: {},
      weakFacts: [],
    });
  });

  it('migrates a v2 save: no age yet, ratings start empty', () => {
    const out = migrate({
      version: 2,
      lastProfileId: null,
      profiles: [{ id: 'a', name: 'Sam', autoSubmit: true, progress: {} }],
    });
    expect(out.profiles[0]).toMatchObject({ autoSubmit: true, age: null, ratings: {} });
  });

  it('migrates a v3 save: levels still unlock in order', () => {
    const out = migrate({
      version: 3,
      lastProfileId: null,
      profiles: [{ id: 'a', name: 'Sam', autoSubmit: true, age: 6, progress: {} }],
    });
    expect(out.version).toBe(SAVE_VERSION);
    expect(out.profiles[0]).toMatchObject({ autoSubmit: true, age: 6, unlockAll: false });
  });

  it('migrates a v4 save: no coins, nothing bought or worn', () => {
    const out = migrate({
      version: 4,
      lastProfileId: null,
      profiles: [{ id: 'a', name: 'Sam', unlockAll: true, progress: {} }],
    });
    expect(out.profiles[0]).toMatchObject({ unlockAll: true, coins: 0, owned: [], gear: {} });
  });

  it('migrates a v5 save: the sound starts at the default volumes', () => {
    const out = migrate({ version: 5, lastProfileId: null, profiles: [] });
    expect(out.audio).toEqual(DEFAULT_AUDIO);
  });

  it('migrates a v6 save: the standard timer, adapting, no ceiling, no stats yet', () => {
    const out = migrate({ version: 6, profiles: [{ id: 'a', name: 'Sam', progress: {} }] });
    expect(out.profiles[0]).toMatchObject({
      pageSeconds: 60,
      adapts: true,
      hardest: 1,
      stats: { skills: {}, recent: [] },
    });
  });

  it('migrates a v7 save: × and ÷ stay in their levels, no blocks', () => {
    const out = migrate({ version: 7, profiles: [{ id: 'a', name: 'Sam', progress: {} }] });
    expect(out.profiles[0]).toMatchObject({ mixMulDiv: false, blocks: false });
  });

  it('cleans up damaged player settings and stats', () => {
    const out = migrate({
      version: 7,
      profiles: [
        {
          id: 'a',
          name: 'Sam',
          pageSeconds: 75,
          adapts: 'no',
          hardest: 7,
          mixMulDiv: 'yes',
          blocks: 1,
          stats: {
            skills: {
              doubles: { answered: 4, right: 9, firstTry: 5, ms: -3 },
              nonsense: { answered: 1 },
              'make-10': { answered: 0 },
            },
            recent: [{ level: 2, total: 5, right: 8, stars: 9 }, { level: 'x' }, null],
          },
        },
        { id: 'b', name: 'Kim', stats: 'junk' },
      ],
    });
    const [a, b] = out.profiles;
    expect(a).toMatchObject({
      pageSeconds: 60,
      adapts: true,
      hardest: 1,
      mixMulDiv: false,
      blocks: false,
    });
    expect(a!.stats.skills).toEqual({ doubles: { answered: 4, right: 4, firstTry: 4, ms: 0 } });
    expect(a!.stats.recent).toEqual([
      { at: 0, level: 2, right: 5, total: 5, stars: 0, passed: false, seconds: 0 },
    ]);
    expect(b!.stats).toEqual({ skills: {}, recent: [] });
  });

  it('cleans up damaged sound settings', () => {
    expect(migrate({ version: 6, profiles: [], audio: 'loud' }).audio).toEqual(DEFAULT_AUDIO);
    const out = migrate({ version: 6, profiles: [], audio: { sound: 7, music: 1, muted: 'yes' } });
    expect(out.audio).toEqual({ sound: DEFAULT_AUDIO.sound, music: 1, muted: false });
  });

  it('drops bad coins, unknown items, and gear that is not owned or in the wrong slot', () => {
    const out = migrate({
      version: 5,
      profiles: [
        {
          id: 'a',
          name: 'Sam',
          coins: 12.8,
          owned: ['bandana', 'bandana', 'jetski', 7, 'puppy'],
          gear: { hat: 'puppy', cape: 'star-cape', pet: 'puppy', pack: 'jetski' },
        },
        { id: 'b', name: 'Kim', coins: -5, owned: 'bandana', gear: 'x' },
      ],
    });
    const [a, b] = out.profiles;
    expect(a).toMatchObject({ coins: 12, owned: ['bandana', 'puppy'], gear: { pet: 'puppy' } });
    expect(b).toMatchObject({ coins: 0, owned: [], gear: {} });
  });

  it('drops bad ages, ratings and weak facts', () => {
    const fact = (over: object) => ({
      problem: {
        a: 2,
        op: '+',
        b: 3,
        result: 5,
        unknown: 'result',
        answer: 5,
        key: '2+3',
        skill: 'add-within-5',
        ...over,
      },
      misses: 1,
      streak: 0,
      lastSeen: 1,
    });
    const out = migrate({
      version: 3,
      profiles: [
        {
          id: 'a',
          name: 'Sam',
          age: 42,
          ratings: { doubles: 7, nonsense: 0.5, 'make-10': 'x', 'add-within-10': 0.25 },
          weakFacts: [
            fact({}),
            fact({ result: 6 }),
            fact({ skill: 'world1-review' }),
            fact({ a: -1 }),
            fact({ a: 7, op: '×', b: 8, result: 56, answer: 56, key: '7×8', skill: 'mul-6-9' }),
            fact({ a: 7, op: '×', b: 8, result: 54, answer: 54, key: '7×8', skill: 'mul-6-9' }),
            fact({ a: 56, op: '÷', b: 8, result: 7, answer: 7, key: '56÷8', skill: 'div-6-9' }),
            fact({
              a: 13,
              op: '−',
              b: 5,
              result: 9,
              answer: 9,
              key: '13−5',
              skill: 'sub-within-20',
            }),
            null,
          ],
        },
      ],
    });
    const [p] = out.profiles;
    expect(p!.age).toBeNull();
    expect(p!.ratings).toEqual({ doubles: 1, 'add-within-10': 0.25 });
    expect(p!.weakFacts.map((w) => w.problem.key)).toEqual(['2+3', '7×8', '56÷8']);
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
