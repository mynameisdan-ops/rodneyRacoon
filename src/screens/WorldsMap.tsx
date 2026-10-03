import { useEffect, useState } from 'react';
import { playSfx } from '../audio/engine';
import { useMusic } from '../audio/hooks';
import { LEVELS, WORLDS, getLevel } from '../content/levels';
import { currentLevel, isPassed, isUnlocked, totalStars } from '../game/progress';
import type { Profile } from '../state/schema';
import { avatarForProfile } from '../art/hero/avatar';
import { Hero } from '../art/hero/Hero';
import { INK } from '../art/style';
import { WorldBackdrop } from '../art/worlds/WorldBackdrop';

interface Props {
  profile: Profile;
  /** The world the hero just finished: he walks from there to the next one. */
  from?: number;
  onOpenWorld: (worldId: number) => void;
  onSwitchPlayer: () => void;
}

type Point = readonly [number, number];

/** Center of each world's card on the 1280×800 overview, left to right, zig-zagging. */
const CARDS: Point[] = [
  [205, 590],
  [430, 370],
  [660, 590],
  [900, 370],
  [1080, 590],
];
const HOME: Point = [1170, 200];

/** Thumbnail size; the backdrop is drawn at the full 1280×800 and scaled down. */
const THUMB_W = 230;
const THUMB_SCALE = THUMB_W / 1280;
const THUMB_H = 800 * THUMB_SCALE;

const ALL_IDS = LEVELS.map((l) => l.id);
const LAST_ID = ALL_IDS[ALL_IDS.length - 1]!;

/** Where the hero stands at a stop: just left of a world's card, or in front of home. */
function heroSpot(stop: number): Point {
  const [x, y] = CARDS[stop - 1] ?? HOME;
  return stop > CARDS.length ? [x - 150, y - 20] : [x - THUMB_W / 2 - 70, y - 40];
}

export function WorldsMap({ profile, from, onOpenWorld, onSwitchPlayer }: Props) {
  const { progress, unlockAll } = profile;
  const home = isPassed(progress, LAST_ID);
  // The hero's stop: the world he is up to, or home (one past the last world) at the end.
  const here = home ? WORLDS.length + 1 : (getLevel(currentLevel(progress, ALL_IDS))?.world ?? 1);
  const [stop, setStop] = useState(from ?? here);
  const walking = stop !== here;
  useMusic('title');

  useEffect(() => {
    // Let the first frame draw him where he was, then walk to where he is now.
    // (A timer, not requestAnimationFrame, which stops while the window is hidden.)
    const id = window.setTimeout(() => {
      setStop(here);
      if (from !== undefined && from !== here) playSfx('steps');
    }, 400);
    return () => window.clearTimeout(id);
  }, [here, from]);

  const [hx, hy] = heroSpot(stop);
  const trail = [...CARDS, HOME];
  const trailPath = trail.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');

  return (
    <div className="worlds">
      <svg className="worlds__paper" viewBox="0 0 1280 800" aria-hidden>
        <rect width={1280} height={800} fill="#f3e2b8" />
        <rect
          x={14}
          y={14}
          width={1252}
          height={772}
          rx={30}
          fill="none"
          stroke="#c9a66b"
          strokeWidth={6}
          strokeDasharray="2 14"
          strokeLinecap="round"
        />
        <path
          d={trailPath}
          fill="none"
          stroke="#d9b77c"
          strokeWidth={34}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={trailPath}
          fill="none"
          stroke="#9c6b3a"
          strokeWidth={6}
          strokeDasharray="4 22"
          strokeLinecap="round"
        />
        <HomeHouse x={HOME[0]} y={HOME[1]} />
      </svg>

      <div className="map__hud">
        <button type="button" className="player-chip" onClick={onSwitchPlayer}>
          <span className="player-chip__dot" style={{ background: profile.color }} />
          {profile.name}
          <span className="player-chip__switch">switch</span>
        </button>
        <div className="map__world">The Long Way Home</div>
        <div className="map__stars">★ {totalStars(progress)}</div>
      </div>

      {WORLDS.map((world, i) => {
        const [x, y] = CARDS[i]!;
        const levels = LEVELS.filter((l) => l.world === world.id);
        const first = levels[0];
        const open = first !== undefined && isUnlocked(progress, first.id, unlockAll);
        const done = levels.every((l) => isPassed(progress, l.id));
        const stars = levels.reduce((sum, l) => sum + (progress[l.id]?.bestStars ?? 0), 0);
        const cls = [
          'world-card',
          open ? '' : 'world-card--locked',
          done ? 'world-card--done' : '',
          world.id === here && !walking ? 'world-card--here' : '',
        ].join(' ');
        return (
          <button
            key={world.id}
            type="button"
            className={cls}
            style={{ left: x - THUMB_W / 2, top: y - THUMB_H / 2, width: THUMB_W }}
            disabled={!open}
            aria-label={open ? world.name : `${world.name}, locked`}
            onClick={() => onOpenWorld(world.id)}
          >
            <span className="world-card__thumb" style={{ height: THUMB_H }}>
              <span
                className="world-card__art"
                style={{ transform: `scale(${THUMB_SCALE})` }}
                aria-hidden
              >
                <WorldBackdrop worldId={world.id} height={800} horizon={190} groundTop={290} />
              </span>
              <span className="world-card__number">{world.id}</span>
              {!open && <span className="world-card__lock">🔒</span>}
            </span>
            <span className="world-card__name">{world.name}</span>
            {stars > 0 && <span className="world-card__stars">★ {stars}</span>}
          </button>
        );
      })}

      <div className="worlds__hero" style={{ transform: `translate(${hx}px, ${hy}px)` }}>
        <Hero
          avatar={avatarForProfile(profile)}
          pose={walking ? 'walk' : home ? 'cheer' : 'idle'}
          size={130}
        />
      </div>
    </div>
  );
}

/** The family's house at the end of the trail. */
function HomeHouse({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
      <rect x={-62} y={-40} width={124} height={86} rx={4} fill="#f6d9a0" />
      <path d="M-82 -36 L0 -104 L82 -36 Z" fill="#c8553d" />
      <rect x={34} y={-96} width={20} height={38} fill="#a0473a" />
      <rect x={-16} y={2} width={32} height={44} rx={3} fill="#7a4a2a" />
      <rect x={-50} y={-22} width={28} height={26} rx={3} fill="#ffe27a" />
      <rect x={22} y={-22} width={28} height={26} rx={3} fill="#ffe27a" />
      <circle cx={9} cy={26} r={2.5} fill={INK} stroke="none" />
    </g>
  );
}
