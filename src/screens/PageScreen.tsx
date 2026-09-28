import { useCallback, useEffect, useReducer, useState, type ReactNode } from 'react';
import { getWorld, type LevelDef } from '../content/levels';
import { CONFIG } from '../game/config';
import { generatePage, type Problem } from '../game/problems';
import { createRng, randomSeed } from '../game/rng';
import { evaluatePage, type PageEvaluation } from '../game/scoring';
import { createSession, currentProblem, sessionReducer, type SessionState } from '../game/session';
import { NumberPad, type PadKey } from '../ui/NumberPad';
import { TrailStrip } from '../ui/TrailStrip';

interface Props {
  level: LevelDef;
  onFinish: (evaluation: PageEvaluation) => void;
  onQuit: () => void;
}

/** Pause on the finished page before moving to results, in ms. */
const FINISH_PAUSE_MS = 1300;

export function PageScreen({ level, onFinish, onQuit }: Props) {
  const [countdown, setCountdown] = useState<number>(CONFIG.countdownSeconds);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  if (countdown > 0) {
    return (
      <PageLayout level={level} onQuit={onQuit} secondsLeft={CONFIG.pageSeconds} running={false}>
        <div className="countdown" key={countdown}>
          {countdown}
        </div>
      </PageLayout>
    );
  }
  return <TimedPage level={level} onFinish={onFinish} onQuit={onQuit} />;
}

function TimedPage({ level, onFinish, onQuit }: Props) {
  const [problems] = useState<Problem[]>(() =>
    generatePage(level.skill, level.problems, createRng(randomSeed()), level.difficulty),
  );
  const [startedAt] = useState(() => performance.now());
  const [state, dispatch] = useReducer(sessionReducer, startedAt, (t) =>
    createSession(problems, t),
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(CONFIG.pageSeconds);
  const done = state.phase === 'done';

  const remaining = useCallback(
    () => Math.max(0, CONFIG.pageSeconds - (performance.now() - startedAt) / 1000),
    [startedAt],
  );

  // Page clock.
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      const left = remaining();
      setSecondsLeft(left);
      if (left <= 0) dispatch({ type: 'timeUp' });
    }, 100);
    return () => clearInterval(id);
  }, [done, remaining]);

  // After a revealed answer, move on.
  useEffect(() => {
    if (state.phase !== 'revealing') return;
    const id = setTimeout(
      () => dispatch({ type: 'advance', now: performance.now() }),
      CONFIG.revealMs,
    );
    return () => clearTimeout(id);
  }, [state.phase, state.index]);

  // When the page ends, show it briefly, then report the result.
  useEffect(() => {
    if (!done) return;
    const evaluation = evaluatePage(state.results, problems.length, remaining());
    const id = setTimeout(() => onFinish(evaluation), FINISH_PAUSE_MS);
    return () => clearTimeout(id);
  }, [done, state.results, problems.length, remaining, onFinish]);

  const handleKey = useCallback((key: PadKey) => {
    const now = performance.now();
    if (key === 'back') dispatch({ type: 'backspace' });
    else if (key === 'enter') dispatch({ type: 'submit', now });
    else dispatch({ type: 'digit', digit: key, now });
  }, []);

  // Physical keyboard support.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
      if (/^[0-9]$/.test(e.key)) handleKey(Number(e.key));
      else if (e.key === 'Backspace') handleKey('back');
      else if (e.key === 'Enter') handleKey('enter');
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);

  const correct = state.results.filter((r) => r.correct).length;
  const misses = state.feedback && state.feedback.kind !== 'correct' ? state.feedback.seq : 0;

  return (
    <PageLayout
      level={level}
      onQuit={onQuit}
      secondsLeft={secondsLeft}
      running={!done}
      progress={correct / problems.length}
      stumbleKey={misses}
      counter={`${Math.min(state.index + 1, problems.length)} / ${problems.length}`}
      pad={<NumberPad onKey={handleKey} disabled={state.phase !== 'playing'} />}
    >
      {done ? (
        <div className="page-over">{state.timedOut ? "Time's up!" : 'Page done!'}</div>
      ) : (
        <ProblemView state={state} />
      )}
      {state.combo >= 3 && !done && (
        <div className="combo" key={`combo-${state.combo}`}>
          {state.combo} in a row!
        </div>
      )}
    </PageLayout>
  );
}

function ProblemView({ state }: { state: SessionState }) {
  const problem = currentProblem(state);
  if (!problem) return null;
  const fb = state.feedback;
  const boxClass = [
    'answer-box',
    state.phase === 'revealing' ? 'answer-box--reveal' : '',
    fb?.kind === 'wrong' ? 'answer-box--wrong' : '',
  ].join(' ');
  const box = (
    <span key={fb?.seq ?? 0} className={boxClass}>
      {state.input || ' '}
    </span>
  );

  return (
    <div className="problem-area">
      <div className="problem" key={`problem-${state.index}`}>
        <span>{problem.a}</span>
        <span className="problem__op">{problem.op}</span>
        {problem.unknown === 'b' ? box : <span>{problem.b}</span>}
        <span className="problem__op">=</span>
        {problem.unknown === 'result' ? box : <span>{problem.result}</span>}
      </div>
      {fb?.kind === 'correct' && (
        <div className="cheer" key={`cheer-${fb.seq}`}>
          ✓
        </div>
      )}
      {state.phase === 'revealing' && <div className="reveal-note">It's {problem.answer}!</div>}
      {state.phase === 'playing' && state.misses > 0 && (
        <div className="retry-note">Try again!</div>
      )}
    </div>
  );
}

interface LayoutProps {
  level: LevelDef;
  onQuit: () => void;
  secondsLeft: number;
  running: boolean;
  progress?: number;
  stumbleKey?: number;
  counter?: string;
  pad?: ReactNode;
  children: ReactNode;
}

function PageLayout({
  level,
  onQuit,
  secondsLeft,
  running,
  progress = 0,
  stumbleKey = 0,
  counter,
  pad,
  children,
}: LayoutProps) {
  const world = getWorld(level.world);
  const shown = Math.ceil(secondsLeft);
  return (
    <div className="page">
      <TrailStrip
        sky={world?.sky ?? '#bfe6ff'}
        ground={world?.ground ?? '#6cc36c'}
        obstacle={level.obstacle}
        progress={progress}
        stumbleKey={stumbleKey}
        running={running}
      />
      <div className="page__hud">
        <button type="button" className="icon-button" aria-label="Back to levels" onClick={onQuit}>
          ✕
        </button>
        <div className="page__level">Level {level.id}</div>
        {counter && <div className="page__counter">{counter}</div>}
        <div className={shown <= 10 && running ? 'timer timer--low' : 'timer'}>{shown}</div>
      </div>
      <div className="page__body">
        <div className="page__main">{children}</div>
        <div className="page__pad">{pad ?? <NumberPad onKey={() => {}} disabled />}</div>
      </div>
    </div>
  );
}
