import { useCallback, useEffect, useReducer, useState, type ReactNode } from 'react';
import type { AvatarConfig } from '../art/hero/avatar';
import type { HeroPose } from '../art/hero/Hero';
import type { LevelDef } from '../content/levels';
import { CONFIG } from '../game/config';
import { generatePage, type Problem } from '../game/problems';
import { createRng, randomSeed } from '../game/rng';
import { evaluatePage, type PageEvaluation } from '../game/scoring';
import { createSession, currentProblem, sessionReducer, type SessionState } from '../game/session';
import { NumberPad, type PadKey } from '../ui/NumberPad';
import { TrailStrip } from '../ui/TrailStrip';

interface Props {
  level: LevelDef;
  avatar: AvatarConfig;
  onFinish: (evaluation: PageEvaluation) => void;
  onQuit: () => void;
}

/** Pause on the finished page before moving to results, in ms. */
const FINISH_PAUSE_MS = 1300;

export function PageScreen(props: Props) {
  const { level, avatar, onQuit } = props;
  const [countdown, setCountdown] = useState<number>(CONFIG.countdownSeconds);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  if (countdown > 0) {
    return (
      <PageLayout
        level={level}
        avatar={avatar}
        onQuit={onQuit}
        secondsLeft={CONFIG.pageSeconds}
        running={false}
      >
        <div className="countdown" key={countdown}>
          {countdown}
        </div>
      </PageLayout>
    );
  }
  return <TimedPage {...props} />;
}

function TimedPage({ level, avatar, onFinish, onQuit }: Props) {
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
  // Cheer at the end if the page is a pass (stars don't matter here, so time left is 0).
  const endPose: HeroPose | undefined = done
    ? evaluatePage(state.results, problems.length, 0).passed
      ? 'cheer'
      : 'idle'
    : undefined;

  return (
    <PageLayout
      level={level}
      avatar={avatar}
      onQuit={onQuit}
      secondsLeft={secondsLeft}
      running={!done}
      progress={correct / problems.length}
      feedback={state.feedback}
      endPose={endPose}
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
  avatar: AvatarConfig;
  onQuit: () => void;
  secondsLeft: number;
  running: boolean;
  progress?: number;
  feedback?: SessionState['feedback'];
  endPose?: HeroPose;
  counter?: string;
  pad?: ReactNode;
  children: ReactNode;
}

function PageLayout({
  level,
  avatar,
  onQuit,
  secondsLeft,
  running,
  progress = 0,
  feedback,
  endPose,
  counter,
  pad,
  children,
}: LayoutProps) {
  const shown = Math.ceil(secondsLeft);
  return (
    <div className="page">
      <TrailStrip
        worldId={level.world}
        obstacle={level.obstacle}
        avatar={avatar}
        progress={progress}
        feedback={feedback}
        running={running}
        endPose={endPose}
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
