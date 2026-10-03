import { useState } from 'react';
import { useMusic } from '../audio/hooks';
import { LEVELS, WORLDS, getLevel } from '../content/levels';
import { worldSong } from '../content/music';
import { currentLevel, isPassed, isUnlocked, totalStars } from '../game/progress';
import type { Profile } from '../state/schema';
import { avatarForProfile } from '../art/hero/avatar';
import { Hero } from '../art/hero/Hero';
import { getWorldArt } from '../art/worlds/registry';
import { WorldBackdrop } from '../art/worlds/WorldBackdrop';
import { BagIcon, BookIcon, Coin, SpeakerIcon } from '../ui/icons';
import { Stars } from '../ui/Stars';

interface Props {
  profile: Profile;
  /** The world to show first; defaults to the one the player is up to. */
  initialWorld?: number;
  saveFailed: boolean;
  /** The sound is off (the speaker button turns it back on). */
  muted: boolean;
  onToggleSound: () => void;
  onPlay: (levelId: number) => void;
  /** Open the overview of all the worlds. */
  onWorlds: () => void;
  /** Open the shop or the sticker book (they come back to this world). */
  onShop: (worldId: number) => void;
  onStickers: (worldId: number) => void;
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

export function TrailMap({
  profile,
  initialWorld,
  saveFailed,
  muted,
  onToggleSound,
  onPlay,
  onWorlds,
  onShop,
  onStickers,
  onSwitchPlayer,
}: Props) {
  const here = currentLevel(profile.progress, ALL_IDS);
  const [worldId, setWorldId] = useState(() => initialWorld ?? getLevel(here)?.world ?? 1);
  const world = WORLDS.find((w) => w.id === worldId) ?? WORLDS[0]!;
  const levels = LEVELS.filter((l) => l.world === world.id);
  const worldIndex = WORLDS.indexOf(world);
  const prevWorld = WORLDS[worldIndex - 1];
  const nextWorld = WORLDS[worldIndex + 1];
  const nextWorldFirst = LEVELS.find((l) => l.world === nextWorld?.id);
  const canGoNext =
    nextWorldFirst !== undefined &&
    isUnlocked(profile.progress, nextWorldFirst.id, profile.unlockAll);
  const { theme } = getWorldArt(world.id);
  useMusic(worldSong(world.id));

  return (
    <div className="map">
      <WorldBackdrop worldId={world.id} height={800} horizon={190} groundTop={290}>
        <path
          d={smoothPath(STOPS.slice(0, levels.length))}
          fill="none"
          stroke={theme.path}
          strokeWidth={34}
          strokeLinecap="round"
        />
        <path
          d={smoothPath(STOPS.slice(0, levels.length))}
          fill="none"
          stroke={theme.pathEdge}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray="4 22"
        />
      </WorldBackdrop>

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
        <div className="map__right">
          <button
            type="button"
            className="icon-button map__sound-button"
            aria-label={muted ? 'Sound on' : 'Sound off'}
            aria-pressed={!muted}
            onClick={onToggleSound}
          >
            <SpeakerIcon size={44} on={!muted} />
          </button>
          <button
            type="button"
            className="icon-button map__worlds-button"
            aria-label="All the worlds"
            onClick={onWorlds}
          >
            <WorldsIcon />
          </button>
          <div className="map__stars">★ {totalStars(profile.progress)}</div>
        </div>
      </div>

      {levels.map((level, i) => {
        const [x, y] = STOPS[i] ?? STOPS[STOPS.length - 1]!;
        const unlocked = isUnlocked(profile.progress, level.id, profile.unlockAll);
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
                <Hero avatar={avatarForProfile(profile)} size={124} />
              </div>
            )}
          </div>
        );
      })}

      <div className="map__dock">
        <button
          type="button"
          className="dock-button"
          aria-label="Sticker book"
          onClick={() => onStickers(world.id)}
        >
          <BookIcon size={56} />
        </button>
        <button
          type="button"
          className="dock-button"
          aria-label={`Shop, ${profile.coins} coins`}
          onClick={() => onShop(world.id)}
        >
          <BagIcon size={56} />
          <Coin size={40} />
          {profile.coins}
        </button>
      </div>

      {saveFailed && (
        <div className="save-warning">Progress can't be saved on this device right now.</div>
      )}
    </div>
  );
}

/** A folded paper map: opens the overview of all the worlds. */
function WorldsIcon() {
  return (
    <svg width={44} height={40} viewBox="0 0 44 40" aria-hidden>
      <path
        d="M3 7 L15 3 L29 7 L41 3 V33 L29 37 L15 33 L3 37 Z"
        fill="#f3e2b8"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M15 3 V33 M29 7 V37" stroke="currentColor" strokeWidth={3} />
      <path
        d="M8 28 Q 14 18 22 22 T 36 12"
        fill="none"
        stroke="#c8553d"
        strokeWidth={3}
        strokeDasharray="3 4"
        strokeLinecap="round"
      />
    </svg>
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
