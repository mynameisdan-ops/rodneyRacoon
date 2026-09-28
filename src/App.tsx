import { useCallback, useState } from 'react';
import { getLevel } from './content/levels';
import type { PageEvaluation } from './game/scoring';
import { LevelSelect } from './screens/LevelSelect';
import { PageScreen } from './screens/PageScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { Stage } from './ui/Stage';

type Screen =
  | { name: 'levels' }
  /** `attempt` remounts the page so a retry gets fresh problems. */
  | { name: 'page'; levelId: number; attempt: number }
  | { name: 'results'; levelId: number; evaluation: PageEvaluation };

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'levels' });
  // In-memory only until profiles and saving arrive in M2.
  const [bestStars, setBestStars] = useState<Record<number, number>>({});

  const play = useCallback(
    (levelId: number) => setScreen({ name: 'page', levelId, attempt: Date.now() }),
    [],
  );
  const toLevels = useCallback(() => setScreen({ name: 'levels' }), []);

  const levelId = screen.name === 'levels' ? undefined : screen.levelId;
  const finish = useCallback(
    (evaluation: PageEvaluation) => {
      if (levelId === undefined) return;
      if (evaluation.passed) {
        setBestStars((b) => ({ ...b, [levelId]: Math.max(b[levelId] ?? 0, evaluation.stars) }));
      }
      setScreen({ name: 'results', levelId, evaluation });
    },
    [levelId],
  );

  let content;
  if (screen.name === 'levels') {
    content = <LevelSelect bestStars={bestStars} onPlay={play} />;
  } else {
    const level = getLevel(screen.levelId);
    if (!level) {
      content = <LevelSelect bestStars={bestStars} onPlay={play} />;
    } else if (screen.name === 'page') {
      content = (
        <PageScreen key={screen.attempt} level={level} onFinish={finish} onQuit={toLevels} />
      );
    } else {
      const next = getLevel(level.id + 1);
      content = (
        <ResultsScreen
          level={level}
          evaluation={screen.evaluation}
          hasNext={next !== undefined}
          onNext={() => next && play(next.id)}
          onRetry={() => play(level.id)}
          onLevels={toLevels}
        />
      );
    }
  }

  return <Stage>{content}</Stage>;
}
