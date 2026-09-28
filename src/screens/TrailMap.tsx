import { useState } from 'react';
import { LEVELS, WORLDS, getLevel } from '../content/levels';
import { currentLevel, isPassed, isUnlocked, totalStars } from '../game/progress';
import type { Profile } from '../state/schema';
import { PlaceholderHero } from '../ui/PlaceholderHero';
import { Stars } from '../ui/Stars';

interface Props {
  profile: Profile;
  saveFailed: boolean;
  onPlay: (levelId: number) => void;
  onSwitchPlayer: () => void;
}

type Point = readonly [number, number];

/** Where the 8 stops of a world sit on the 1280×800 map, start (bottom-left) to boss (top-right). */
const STOPS: Point[] = [
  [150, 660],
  [370, 610],
  [290, 455],
  [500, 385],
  [720, 455],
  [930, 390],
  [830, 250],
  [1100, 235],
];

/** Smooth curve through the points (Catmull-Rom converted to cubic Béziers). */
function smoothPath(points: readonly Point[]): string {
  const [first] = points;
  if (!first) return '';
  let d = `M ${first[0]} ${first[1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const ALL_IDS = LEVELS.map((l) => l.id);

export function TrailMap({ profile, saveFailed, onPlay, onSwitchPlayer }: Props) {
  const here = currentLevel(profile.progress, ALL_IDS);
  const [worldId, setWorldId] = useState(() => getLevel(here)?.world ?? 1);
  const world = WORLDS.find((w) => w.id === worldId) ?? WORLDS[0]!;
  const levels = LEVELS.filter((l) => l.world === world.id);
  const worldIndex = WORLDS.indexOf(world);
  const prevWorld = WORLDS[worldIndex - 1];
  const nextWorld = WORLDS[worldIndex + 1];
  const nextWorldFirst = LEVELS.find((l) => l.world === nextWorld?.id);
  const canGoNext = nextWorldFirst !== undefined && isUnlocked(profile.progress, nextWorldFirst.id);

  return (
    <div className="map" style={{ background: `linear-gradient(${world.sky}, #ffffff 90%)` }}>
      <svg className="map__land" viewBox="0 0 1280 800" aria-hidden>
        <path
          d="M0 300 Q 260 230 560 290 T 1280 250 V 800 H 0 Z"
          fill={world.ground}
          opacity={0.45}
        />
        <path
          d="M0 420 Q 360 340 700 420 T 1280 380 V 800 H 0 Z"
          fill={world.ground}
          opacity={0.7}
        />
        <path d="M0 560 Q 420 480 820 560 T 1280 520 V 800 H 0 Z" fill={world.ground} />
        <path
          d={smoothPath(STOPS.slice(0, levels.length))}
          fill="none"
          stroke="#e4c48a"
          strokeWidth={34}
          strokeLinecap="round"
        />
        <path
          d={smoothPath(STOPS.slice(0, levels.length))}
          fill="none"
          stroke="#c9a263"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray="4 22"
        />
      </svg>

      <div className="map__hud">
        <button type="button" className="player-chip" onClick={onSwitchPlayer}>
          <span className="player-chip__dot" style={{ background: profile.color }} />
          {profile.name}
          <span className="player-chip__switch">switch</span>
        </button>
        <div className="map__world">
          {prevWorld && (
            <button
              type="button"
              className="icon-button"
              aria-label={`Back to ${prevWorld.name}`}
              onClick={() => setWorldId(prevWorld.id)}
            >
              ◀
            </button>
          )}
          <span>{world.name}</span>
          {nextWorld && (
            <button
              type="button"
              className="icon-button"
              aria-label={`On to ${nextWorld.name}`}
              disabled={!canGoNext}
              onClick={() => setWorldId(nextWorld.id)}
            >
              ▶
            </button>
          )}
        </div>
        <div className="map__stars">★ {totalStars(profile.progress)}</div>
      </div>

      {levels.map((level, i) => {
        const [x, y] = STOPS[i] ?? STOPS[STOPS.length - 1]!;
        const unlocked = isUnlocked(profile.progress, level.id);
        const passed = isPassed(profile.progress, level.id);
        const isHere = level.id === here;
        const cls = [
          'stop',
          level.boss ? 'stop--boss' : '',
          passed ? 'stop--passed' : '',
          unlocked ? '' : 'stop--locked',
          isHere ? 'stop--here' : '',
        ].join(' ');
        return (
          <div key={level.id} className="stop-wrap" style={{ left: x, top: y }}>
            <button
              type="button"
              className={cls}
              disabled={!unlocked}
              aria-label={unlocked ? `Level ${level.id}` : `Level ${level.id}, locked`}
              onClick={() => onPlay(level.id)}
            >
              {unlocked ? level.id : <LockIcon />}
            </button>
            {passed && <Stars count={profile.progress[level.id]?.bestStars ?? 0} size={30} />}
            {level.boss && <div className="stop__label">{level.obstacle}</div>}
            {isHere && (
              <div className="map__hero">
                <PlaceholderHero color={profile.color} size={120} />
              </div>
            )}
          </div>
        );
      })}

      {saveFailed && (
        <div className="save-warning">Progress can't be saved on this device right now.</div>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg width={40} height={46} viewBox="0 0 40 46" aria-hidden>
      <path
        d="M10 20 V13 a10 10 0 0 1 20 0 V20"
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
      />
      <rect x={4} y={20} width={32} height={24} rx={6} fill="currentColor" />
    </svg>
  );
}
