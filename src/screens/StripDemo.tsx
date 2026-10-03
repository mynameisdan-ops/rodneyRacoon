import { useEffect, useState } from 'react';
import { DEFAULT_AVATAR } from '../art/hero/avatar';
import { getCutScene } from '../content/cutscenes';
import { getLevel } from '../content/levels';
import type { SessionState } from '../game/session';
import { TrailStrip } from '../ui/TrailStrip';

/** A page's worth of answers, looping: five right (the combo cut-in), a slip, a reveal, more. */
const ANSWERS = 'cccccwccrcccccccc';
const PROBLEMS = 15;
const STEP_MS = 1100;

interface Demo {
  i: number;
  progress: number;
  combo: number;
  feedback: SessionState['feedback'];
}

const START: Demo = { i: 0, progress: 0, combo: 0, feedback: null };

function next(d: Demo): Demo {
  if (d.progress >= 1 - 1e-9) return START;
  const a = ANSWERS[d.i % ANSWERS.length];
  const seq = (d.feedback?.seq ?? 0) + 1;
  if (a === 'c') {
    return {
      i: d.i + 1,
      progress: Math.min(1, d.progress + 1 / PROBLEMS),
      combo: d.combo + 1,
      feedback: { kind: 'correct', seq },
    };
  }
  return { ...d, i: d.i + 1, combo: 0, feedback: { kind: a === 'w' ? 'wrong' : 'reveal', seq } };
}

/**
 * Dev-only (#strip): the page strip playing a page of answers on its own. `#strip-correct-200`
 * (or `combo`, `wrong`, `danger`) holds one moment for a screenshot; `#strip-L1` (or
 * `#strip-danger-0-L1`) uses level 1's world and obstacle instead of level 12's.
 */
export function StripDemo({
  still,
  level = 12,
}: {
  still?: { kind: string; dt: number };
  level?: number;
}) {
  const worldId = getLevel(level)?.world ?? 2;
  const obstacle = getCutScene(level)?.obstacle;
  const [demo, setDemo] = useState<Demo>(START);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (still) return;
    const id = setInterval(() => {
      setDemo(next);
      setElapsed((e) => (e >= 0.98 ? 0 : e + STEP_MS / 60000));
    }, STEP_MS);
    return () => clearInterval(id);
  }, [still]);

  if (still) {
    const seq = 7;
    const kind = still.kind === 'wrong' ? 'wrong' : 'correct';
    const danger = still.kind === 'danger';
    return (
      <div className="strip-demo">
        <TrailStrip
          worldId={worldId}
          obstacle={obstacle}
          avatar={DEFAULT_AVATAR}
          progress={0.4}
          elapsed={danger ? 0.52 : 0.25}
          feedback={danger ? null : { kind, seq }}
          combo={still.kind === 'combo' ? 5 : kind === 'correct' ? 3 : 0}
          running
          debug={danger ? undefined : { dt: still.dt, from: kind === 'correct' ? 0.333 : 0.4 }}
        />
      </div>
    );
  }
  return (
    <div className="strip-demo">
      <TrailStrip
        worldId={worldId}
        obstacle={obstacle}
        avatar={DEFAULT_AVATAR}
        progress={demo.progress}
        elapsed={elapsed}
        feedback={demo.feedback}
        combo={demo.combo}
        running
      />
      <div className="strip-demo__label">
        {demo.combo >= 3 ? `${demo.combo} in a row!` : 'Answers play by themselves'}
      </div>
    </div>
  );
}
