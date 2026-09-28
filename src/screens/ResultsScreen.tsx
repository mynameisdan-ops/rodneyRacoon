import type { AvatarConfig } from '../art/hero/avatar';
import { Hero } from '../art/hero/Hero';
import type { LevelDef } from '../content/levels';
import type { PageEvaluation } from '../game/scoring';
import { Stars } from '../ui/Stars';

interface Props {
  level: LevelDef;
  avatar: AvatarConfig;
  evaluation: PageEvaluation;
  hasNext: boolean;
  onNext: () => void;
  onRetry: () => void;
  onMap: () => void;
}

const PASS_CHEERS = ['Great job!', 'Awesome!', 'You did it!', 'Super speedy!'];
const RETRY_LINES = [
  'Whoops, a slippery patch! Let’s try again.',
  'So close! One more go?',
  'A little stumble — you’ve got this!',
];

export function ResultsScreen({
  level,
  avatar,
  evaluation,
  hasNext,
  onNext,
  onRetry,
  onMap,
}: Props) {
  const { passed, stars, correct, total } = evaluation;
  const lines = passed ? PASS_CHEERS : RETRY_LINES;
  const line = lines[(level.id + correct) % lines.length];

  return (
    <div className={passed ? 'results results--pass' : 'results results--retry'}>
      <div className="results__hero">
        <Hero avatar={avatar} pose={passed ? 'cheer' : 'idle'} size={280} />
      </div>
      <h1 className="results__title">{line}</h1>
      {passed && <Stars count={stars} size={96} />}
      <div className="results__score">
        {correct} / {total} right
      </div>

      {passed && (
        // Placeholder for the obstacle cut scene (M4).
        <div className={level.boss ? 'scene-card scene-card--boss' : 'scene-card'}>
          <div className="scene-card__label">{level.obstacle}</div>
          <div className="scene-card__caption">{level.caption}</div>
        </div>
      )}

      <div className="results__actions">
        <button type="button" className="big-button big-button--quiet" onClick={onMap}>
          Map
        </button>
        {passed ? (
          <>
            <button type="button" className="big-button big-button--quiet" onClick={onRetry}>
              Play again
            </button>
            {hasNext && (
              <button type="button" className="big-button" onClick={onNext}>
                Next level ▶
              </button>
            )}
          </>
        ) : (
          <button type="button" className="big-button" onClick={onRetry}>
            Try again ↻
          </button>
        )}
      </div>
    </div>
  );
}
