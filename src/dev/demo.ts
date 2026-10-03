import type { Screen } from '../App';
import { getLevel } from '../content/levels';
import { planPage, type Answer } from '../game/adaptive';
import { generatePage } from '../game/problems';
import type { ProgressMap } from '../game/progress';
import { pageCoins } from '../game/rewards';
import { createRng } from '../game/rng';
import { evaluatePage } from '../game/scoring';
import { useGame } from '../state/store';
import { DEFAULT_AUDIO, SAVE_VERSION, type Profile, type SaveData } from '../state/schema';

/*
 * Dev-only shortcuts for checking screens (never in a production build). `#demo` opens the
 * game with two made-up players kept in memory (nothing is saved, so a real save in this
 * browser is untouched); `#demo/<screen>/<n>` opens a screen directly. Reload after changing
 * the hash.
 *
 *   #demo  #demo/profiles  #demo/editor  #demo/new  #demo/map/3  #demo/worlds/2
 *   #demo/shop  #demo/stickers/2  #demo/page/12  #demo/results/9  #demo/retry/9  #demo/scene/16
 */

/** Levels 1..`upTo` passed, with a mix of stars. */
function passed(upTo: number): ProgressMap {
  const progress: ProgressMap = {};
  for (let id = 1; id <= upTo; id++) {
    progress[id] = {
      bestStars: ([3, 2, 3, 1] as const)[id % 4] ?? 1,
      plays: 2,
      passes: 1,
      lastPlayedAt: 0,
    };
  }
  return progress;
}

const base = { createdAt: 0, autoSubmit: false, unlockAll: false, ratings: {}, weakFacts: [] };

const SAM: Profile = {
  ...base,
  id: 'demo-sam',
  name: 'Sam',
  color: '#3a86ff',
  age: 9,
  progress: passed(19),
  coins: 640,
  owned: ['explorer-hat', 'leaf-cape', 'star-cape', 'backpack', 'fox'],
  gear: { hat: 'explorer-hat', cape: 'star-cape', pet: 'fox' },
};

const AVA: Profile = {
  ...base,
  id: 'demo-ava',
  name: 'Ava',
  color: '#ff70a6',
  age: 6,
  progress: passed(3),
  coins: 45,
  owned: ['bandana'],
  gear: { hat: 'bandana' },
};

/** A finished page of `levelId` for Sam: a clean pass, or a page that needs a retry. */
function results(levelId: number, pass: boolean): Screen {
  const level = getLevel(levelId) ?? getLevel(1)!;
  const rng = createRng(levelId);
  const plan = planPage(level, SAM, rng);
  const problems = generatePage(level.skill, plan.count, rng, plan.difficulty);
  const answers: Answer[] = problems.map((problem, i) => ({
    problem,
    correct: pass || i % 2 === 0,
    tries: pass ? 1 : 2,
    ms: 2500,
  }));
  const evaluation = evaluatePage(answers, problems.length, pass ? 18 : 0);
  const reward = pageCoins(answers, evaluation, SAM.progress[level.id], level.boss);
  return { name: 'results', levelId: level.id, evaluation, reward, newSticker: pass };
}

/** The screen a `#demo/...` hash asks for. */
function screenFor(hash: string): Screen {
  const [, name = 'map', arg] = hash.split('/');
  const n = arg === undefined ? undefined : Number(arg);
  const levelId = n ?? 1;
  switch (name) {
    case 'profiles':
      return { name: 'profiles' };
    case 'editor':
      return { name: 'editProfile', profileId: SAM.id };
    case 'new':
      return { name: 'editProfile' };
    case 'worlds':
      return { name: 'worlds', from: n };
    case 'shop':
      return { name: 'shop', worldId: n ?? 1 };
    case 'stickers':
      return { name: 'stickers', worldId: n ?? 1 };
    case 'page': {
      const level = getLevel(levelId) ?? getLevel(1)!;
      return {
        name: 'page',
        levelId: level.id,
        attempt: 1,
        plan: planPage(level, SAM, createRng(1)),
      };
    }
    case 'results':
      return results(levelId, true);
    case 'retry':
      return results(levelId, false);
    case 'scene':
      return { name: 'scene', levelId };
    default:
      return { name: 'map', worldId: n };
  }
}

/** Puts the demo players in the store (in memory only) and returns the screen to open. */
export function startDemo(hash: string): Screen {
  const data: SaveData = {
    version: SAVE_VERSION,
    profiles: [SAM, AVA],
    lastProfileId: SAM.id,
    audio: DEFAULT_AUDIO,
  };
  useGame.setState({ status: 'ready', persist: false, data, activeProfileId: SAM.id });
  return screenFor(hash);
}
