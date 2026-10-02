import { useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import type { AvatarConfig } from '../art/hero/avatar';
import type { HeroPose } from '../art/hero/Hero';
import { getCutScene } from '../content/cutscenes';
import type { LevelDef } from '../content/levels';
import { CONFIG } from '../game/config';
import type { Answer, PagePlan } from '../game/adaptive';
import { generatePage, type Problem } from '../game/problems';
import { createRng, randomSeed } from '../game/rng';
import { comboBonus } from '../game/rewards';
import { evaluatePage, type PageEvaluation } from '../game/scoring';
import { createSession, currentProblem, sessionReducer, type SessionState } from '../game/session';
import { Coin } from '../ui/icons';
import { NumberPad, type PadKey } from '../ui/NumberPad';
import { TrailStrip } from '../ui/TrailStrip';

interface Props {
  level: LevelDef;
  avatar: AvatarConfig;
  /** Check answers once enough digits are typed, instead of waiting for Enter / ✓. */
  autoSubmit: boolean;
  /** How many problems, how hard, and which missed facts to bring back (adaptive difficulty). */
  plan: PagePlan;
  onFinish: (evaluation: PageEvaluation, answers: Answer[]) => void;
  onQuit: () => void;
}

/** Pause on the finished page before moving to results, in ms. */
const FINISH_PAUSE_MS = 1300;

const PORTRAIT = '(orientation: portrait)';
const shouldAutoPause = () => document.hidden || window.matchMedia(PORTRAIT).matches;

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

function TimedPage({ level, avatar, autoSubmit, plan, onFinish, onQuit }: Props) {
  const [problems] = useState<Problem[]>(() =>
    generatePage(level.skill, plan.count, createRng(randomSeed()), plan.difficulty, plan.weak),
  );
  const [startedAt] = useState(() => performance.now());
  const [state, dispatch] = useReducer(sessionReducer, startedAt, (t) =>
    createSession(problems, t, { autoSubmit }),
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(CONFIG.pageSeconds);
  const done = state.phase === 'done';

  // Pausing: the clock stops, the problem is hidden, and it resumes only on Continue.
  // It pauses by itself when the app goes to the background or the tablet turns to portrait.
  const [pausedSince, setPausedSince] = useState<number | null>(() =>
    shouldAutoPause() ? performance.now() : null,
  );
  const pausedTotal = useRef(0);
  const paused = pausedSince !== null;

  const pause = useCallback(() => setPausedSince((p) => p ?? performance.now()), []);
  const resume = useCallback(() => {
    if (pausedSince === null || shouldAutoPause()) return;
    const ms = performance.now() - pausedSince;
    pausedTotal.current += ms;
    dispatch({ type: 'pausedFor', ms });
    setPausedSince(null);
  }, [pausedSince]);

  useEffect(() => {
    if (done) return;
    const onVisibility = () => document.hidden && pause();
    const portrait = window.matchMedia(PORTRAIT);
    const onOrientation = () => portrait.matches && pause();
    document.addEventListener('visibilitychange', onVisibility);
    portrait.addEventListener('change', onOrientation);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      portrait.removeEventListener('change', onOrientation);
    };
  }, [done, pause]);

  const remaining = useCallback(
    () =>
      Math.max(
        0,
        CONFIG.pageSeconds - (performance.now() - startedAt - pausedTotal.current) / 1000,
      ),
    [startedAt],
  );

  // Page clock.
  useEffect(() => {
    if (done || paused) return;
    const id = setInterval(() => {
      const left = remaining();
      setSecondsLeft(left);
      if (left <= 0) dispatch({ type: 'timeUp' });
    }, 100);
    return () => clearInterval(id);
  }, [done, paused, remaining]);

  // After a revealed answer, move on (the wait restarts after a pause).
  useEffect(() => {
    if (state.phase !== 'revealing' || paused) return;
    const id = setTimeout(
      () => dispatch({ type: 'advance', now: performance.now() }),
      CONFIG.revealMs,
    );
    return () => clearTimeout(id);
  }, [state.phase, state.index, paused]);

  // When the page ends, show it briefly, then report the result.
  useEffect(() => {
    if (!done) return;
    const evaluation = evaluatePage(state.results, problems.length, remaining());
    // Results line up with the problems they answer (unanswered ones have none).
    const answers = state.results.map((r, i) => ({ ...r, problem: problems[i]! }));
    const id = setTimeout(() => onFinish(evaluation, answers), FINISH_PAUSE_MS);
    return () => clearTimeout(id);
  }, [done, state.results, problems, remaining, onFinish]);

  const handleKey = useCallback(
    (key: PadKey) => {
      if (paused) return;
      const now = performance.now();
      if (key === 'back') dispatch({ type: 'backspace' });
      else if (key === 'enter') dispatch({ type: 'submit', now });
      else dispatch({ type: 'digit', digit: key, now });
    },
    [paused],
  );

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
      onPause={done ? undefined : pause}
      secondsLeft={secondsLeft}
      running={!done && !paused}
      progress={correct / problems.length}
      feedback={state.feedback}
      combo={state.combo}
      endPose={endPose}
      counter={`${Math.min(state.index + 1, problems.length)} / ${problems.length}`}
      pad={<NumberPad onKey={handleKey} disabled={paused || state.phase !== 'playing'} />}
    >
      {paused ? (
        <div className="paused">
          <div className="paused__title">Paused</div>
          <button type="button" className="big-button" onClick={resume}>
            Continue ▶
          </button>
        </div>
      ) : done ? (
        <div className="page-over">{state.timedOut ? "Time's up!" : 'Page done!'}</div>
      ) : (
        <ProblemView state={state} />
      )}
      {state.combo >= 3 && !done && !paused && <ComboBadge combo={state.combo} />}
    </PageLayout>
  );
}

/** "N in a row!", and at 5, 10, 15 in a row a burst that pays coins. */
function ComboBadge({ combo }: { combo: number }) {
  const bonus = comboBonus(combo);
  if (bonus === 0) {
    return (
      <div className="combo" key={`combo-${combo}`}>
        {combo} in a row!
      </div>
    );
  }
  return (
    <div className="combo combo--burst" key={`combo-${combo}`}>
      {combo} in a row! +{bonus} <Coin size={40} />
    </div>
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
    state.input.length > 2 ? 'answer-box--3' : '',
  ].join(' ');
  // Size by the numbers on show (never the hidden answer, so the size gives nothing away).
  const shown = [problem.a, problem.unknown === 'b' ? problem.result : problem.b];
  const long = shown.join('').length >= 4;
  const box = (
    <span key={fb?.seq ?? 0} className={boxClass}>
      {state.input || ' '}
    </span>
  );

  return (
    <div className="problem-area">
      <div className={long ? 'problem problem--long' : 'problem'} key={`problem-${state.index}`}>
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
  /** Shows the pause button when set. */
  onPause?: () => void;
  secondsLeft: number;
  running: boolean;
  progress?: number;
  feedback?: SessionState['feedback'];
  combo?: number;
  endPose?: HeroPose;
  counter?: string;
  pad?: ReactNode;
  children: ReactNode;
}

function PageLayout({
  level,
  avatar,
  onQuit,
  onPause,
  secondsLeft,
  running,
  progress = 0,
  feedback,
  combo,
  endPose,
  counter,
  pad,
  children,
}: LayoutProps) {
  const shown = Math.ceil(secondsLeft);
  const strip = {
    worldId: level.world,
    obstacle: getCutScene(level.id)?.obstacle,
    avatar,
    progress,
    elapsed: 1 - secondsLeft / CONFIG.pageSeconds,
    feedback,
    running,
    endPose,
    combo,
  };
  return (
    <div className="page">
      <TrailStrip {...strip} />
      <div className="page__hud">
        <button type="button" className="icon-button" aria-label="Back to levels" onClick={onQuit}>
          ✕
        </button>
        {onPause && (
          <button type="button" className="icon-button" aria-label="Pause" onClick={onPause}>
            ⏸
          </button>
        )}
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
