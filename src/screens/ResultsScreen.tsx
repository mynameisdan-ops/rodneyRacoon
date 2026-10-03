import { useEffect, useState, type ReactNode } from 'react';
import type { AvatarConfig } from '../art/hero/avatar';
import { playSfx, playSting } from '../audio/engine';
import { useMusic } from '../audio/hooks';
import { Hero } from '../art/hero/Hero';
import type { LevelDef } from '../content/levels';
import { getSticker } from '../content/stickers';
import type { CoinReward } from '../game/rewards';
import type { PageEvaluation } from '../game/scoring';
import { BoltIcon, CheckIcon, Coin, FlagIcon, StarIcon, SunIcon } from '../ui/icons';
import { Stars } from '../ui/Stars';
import { Sticker } from '../ui/Sticker';

interface Props {
  level: LevelDef;
  avatar: AvatarConfig;
  evaluation: PageEvaluation;
  /** The coins this page paid. */
  reward: CoinReward;
  /** This page was the level's first pass: its sticker goes in the book. */
  newSticker: boolean;
  /** Continue after a pass: plays the cut scene. */
  onContinue: () => void;
  onRetry: () => void;
  onMap: () => void;
}

const PASS_CHEERS = ['Great job!', 'Awesome!', 'You did it!', 'Super speedy!'];
const RETRY_LINES = [
  'Whoops, a slippery patch! Let’s try again.',
  'So close! One more go?',
  'A little stumble — you’ve got this!',
];

/** How long the coin total takes to count up, and the gap between tally rows, in ms. */
const COUNT_MS = 1100;
const ROW_MS = 220;
/** When the new sticker swings in (its CSS animation delay). */
const STICKER_IN_MS = 700;

export function ResultsScreen({
  level,
  avatar,
  evaluation,
  reward,
  newSticker,
  onContinue,
  onRetry,
  onMap,
}: Props) {
  const { passed, stars, correct, total } = evaluation;
  const lines = passed ? PASS_CHEERS : RETRY_LINES;
  const line = lines[(level.id + correct) % lines.length];
  const sticker = newSticker ? getSticker(level.id) : undefined;

  const rows: { key: string; icon: ReactNode; label: string; coins: number }[] = [
    { key: 'answers', icon: <CheckIcon />, label: `${correct} right`, coins: reward.answers },
    { key: 'combo', icon: <BoltIcon />, label: 'In a row', coins: reward.combo },
    { key: 'time', icon: <SunIcon />, label: 'Time left', coins: reward.time },
    { key: 'first', icon: <FlagIcon />, label: 'First time!', coins: reward.firstPass },
    { key: 'stars', icon: <StarIcon />, label: 'New stars', coins: reward.newStars },
  ].filter((r) => r.coins > 0);
  const shown = useCountUp(reward.total, rows.length * ROW_MS);
  useResultSounds(passed, passed ? stars : 0, rows.length, sticker !== undefined);
  const counted = reward.total > 0 && shown === reward.total;
  useEffect(() => {
    if (counted) playSfx('coin');
  }, [counted]);

  return (
    <div className={passed ? 'results results--pass' : 'results results--retry'}>
      <h1 className="results__title">{line}</h1>

      <div className="results__body">
        <div className="results__hero">
          <Hero avatar={avatar} pose={passed ? 'cheer' : 'idle'} size={300} />
        </div>

        <div className="results__middle">
          {passed && <Stars count={stars} size={88} />}
          <div className="results__score">
            {correct} / {total} right
          </div>
          <div className="tally">
            {rows.map((r, i) => (
              <div key={r.key} className="tally__row" style={{ animationDelay: `${i * ROW_MS}ms` }}>
                {r.icon}
                <span className="tally__label">{r.label}</span>
                <span className="tally__coins">+{r.coins}</span>
              </div>
            ))}
            <div className="tally__total">
              <Coin size={52} />
              <span>+{shown}</span>
            </div>
          </div>
        </div>

        {sticker && (
          <div className="results__sticker">
            <div className="results__sticker-title">New sticker!</div>
            <Sticker levelId={level.id} avatar={avatar} width={300} />
            <div className="results__sticker-name">{sticker.name}</div>
          </div>
        )}
      </div>

      <div className="results__actions">
        {passed ? (
          <>
            <button type="button" className="big-button big-button--quiet" onClick={onRetry}>
              Play again
            </button>
            <button type="button" className="big-button" onClick={onContinue}>
              Continue ▶
            </button>
          </>
        ) : (
          <>
            <button type="button" className="big-button big-button--quiet" onClick={onMap}>
              Map
            </button>
            <button type="button" className="big-button" onClick={onRetry}>
              Try again ↻
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * A fanfare (or a gentle "let's go again"), a chime as each star lands, a tick per tally row
 * and a sparkle for a new sticker. Timers, like the tally's own animation delays.
 */
function useResultSounds(passed: boolean, stars: number, rows: number, sticker: boolean) {
  useMusic(null);
  useEffect(() => {
    playSting(passed ? 'win' : 'retry');
    const sounds: [number, () => void][] = [];
    for (let i = 0; i < stars; i++) sounds.push([350 + i * 220, () => playSfx('star', { n: i })]);
    for (let i = 0; i < rows; i++) sounds.push([120 + i * ROW_MS, () => playSfx('tally')]);
    if (sticker) sounds.push([STICKER_IN_MS, () => playSfx('sticker')]);
    const ids = sounds.map(([ms, play]) => window.setTimeout(play, ms));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [passed, stars, rows, sticker]);
}

/** Counts from 0 up to `target` after `delay` ms (a timer, so it runs in a hidden window too). */
function useCountUp(target: number, delay: number): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) return;
    const steps = Math.min(target, 30);
    let step = 0;
    let id: number | undefined;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        step += 1;
        setValue(Math.round((target * step) / steps));
        if (step >= steps) window.clearInterval(id);
      }, COUNT_MS / steps);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [target, delay]);
  return value;
}
