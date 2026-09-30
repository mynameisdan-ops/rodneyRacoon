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
      version: 3,
      lastProfileId: 'a',
      profiles: [
        {
          id: 'a',
          name: 'Sam',
          color: '#123456',
          createdAt: 5,
          autoSubmit: true,
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
