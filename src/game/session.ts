import { CONFIG } from './config';
import type { Problem } from './problems';
import type { ProblemResult } from './scoring';

/**
 * The state of one timed page, as a pure reducer. The UI owns the clock and
 * passes `now` (ms) into actions so this stays testable.
 */
export interface SessionState {
  problems: Problem[];
  index: number;
  input: string;
  /** Wrong tries on the current problem. */
  misses: number;
  results: ProblemResult[];
  phase: 'playing' | 'revealing' | 'done';
  problemStartedAt: number;
  combo: number;
  bestCombo: number;
  timedOut: boolean;
  /** Bumped on every answer check so the UI can replay feedback animations. */
  feedback: { kind: 'correct' | 'wrong' | 'reveal'; seq: number } | null;
}

export type SessionAction =
  | { type: 'digit'; digit: number; now: number }
  | { type: 'backspace' }
  | { type: 'submit'; now: number }
  | { type: 'advance'; now: number }
  | { type: 'timeUp' }
  /** Time spent paused: pushes the current problem's start later so it isn't counted. */
  | { type: 'pausedFor'; ms: number };

export function createSession(problems: Problem[], now: number): SessionState {
  return {
    problems,
    index: 0,
    input: '',
    misses: 0,
    results: [],
    phase: problems.length > 0 ? 'playing' : 'done',
    problemStartedAt: now,
    combo: 0,
    bestCombo: 0,
    timedOut: false,
    feedback: null,
  };
}

export function currentProblem(state: SessionState): Problem | undefined {
  return state.problems[state.index];
}

const MAX_INPUT_DIGITS = 4;

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  if (action.type === 'timeUp') {
    return state.phase === 'done' ? state : { ...state, phase: 'done', timedOut: true };
  }
  if (action.type === 'pausedFor') {
    return { ...state, problemStartedAt: state.problemStartedAt + action.ms };
  }
  if (action.type === 'advance') {
    return state.phase === 'revealing' ? nextProblem(state, action.now) : state;
  }
  if (state.phase !== 'playing') return state;

  switch (action.type) {
    case 'digit': {
      if (state.input.length >= MAX_INPUT_DIGITS) return state;
      const input = state.input === '0' ? String(action.digit) : state.input + action.digit;
      const problem = currentProblem(state);
      // Auto-submit once the typed answer is as long as the correct one.
      if (problem && input.length >= String(problem.answer).length) {
        return check({ ...state, input }, action.now);
      }
      return { ...state, input };
    }
    case 'backspace':
      return { ...state, input: state.input.slice(0, -1) };
    case 'submit':
      return state.input === '' ? state : check(state, action.now);
  }
}

function check(state: SessionState, now: number): SessionState {
  const problem = currentProblem(state);
  if (!problem) return state;
  const seq = (state.feedback?.seq ?? 0) + 1;

  if (Number(state.input) === problem.answer) {
    const combo = state.combo + 1;
    const result: ProblemResult = {
      correct: true,
      tries: state.misses + 1,
      ms: now - state.problemStartedAt,
    };
    return nextProblem(
      {
        ...state,
        results: [...state.results, result],
        combo,
        bestCombo: Math.max(state.bestCombo, combo),
        feedback: { kind: 'correct', seq },
      },
      now,
    );
  }

  const misses = state.misses + 1;
  if (misses < CONFIG.triesPerProblem) {
    return { ...state, input: '', misses, combo: 0, feedback: { kind: 'wrong', seq } };
  }
  const result: ProblemResult = { correct: false, tries: misses, ms: now - state.problemStartedAt };
  return {
    ...state,
    input: String(problem.answer),
    misses,
    combo: 0,
    results: [...state.results, result],
    phase: 'revealing',
    feedback: { kind: 'reveal', seq },
  };
}

function nextProblem(state: SessionState, now: number): SessionState {
  const index = state.index + 1;
  return {
    ...state,
    index,
    input: '',
    misses: 0,
    problemStartedAt: now,
    phase: index >= state.problems.length ? 'done' : 'playing',
  };
}
