import { CONFIG } from '../game/config';

interface Props {
  sky: string;
  ground: string;
  obstacle: string;
  /** 0..1, how far along the trail the hero is. */
  progress: number;
  /** Changes on every miss so the stumble animation replays. */
  stumbleKey: number;
  /** Whether the sun (the page timer) is moving. */
  running: boolean;
}

const WIDTH = 1280;
const HEIGHT = 240;
const TRAIL_START = 90;
const TRAIL_END = 1080;

/**
 * Placeholder scene for the top of the page (real art arrives in M3).
 * The hero walks toward the obstacle as answers come in; the sun crossing the
 * sky is the 60-second timer.
 */
export function TrailStrip({ sky, ground, obstacle, progress, stumbleKey, running }: Props) {
  const heroX = TRAIL_START + (TRAIL_END - TRAIL_START) * progress;
  return (
    <div className="trail" style={{ background: `linear-gradient(${sky}, #ffffff 160%)` }}>
      <div
        className="trail__sun"
        style={{
          animationDuration: `${CONFIG.pageSeconds}s`,
          animationPlayState: running ? 'running' : 'paused',
        }}
      />
      <svg className="trail__land" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden>
        <path
          d={`M0 150 Q 200 110 420 140 T 860 130 T ${WIDTH} 140 V ${HEIGHT} H 0 Z`}
          fill={ground}
          opacity={0.6}
        />
        <path d={`M0 180 Q 320 160 640 185 T ${WIDTH} 175 V ${HEIGHT} H 0 Z`} fill={ground} />
        <path
          d={`M${TRAIL_START - 40} 200 L ${TRAIL_END + 60} 200`}
          stroke="#d9b779"
          strokeWidth={22}
          strokeLinecap="round"
          strokeDasharray="1 34"
        />
        {/* Obstacle marker */}
        <g transform={`translate(${TRAIL_END + 90} 118)`}>
          <rect x={-6} y={0} width={10} height={88} rx={4} fill="#7a4a24" />
          <path d="M4 4 L 74 22 L 4 42 Z" fill="#e8743b" />
        </g>
      </svg>
      <div className="trail__obstacle">{obstacle}</div>
      <div className="trail__hero" style={{ transform: `translateX(${heroX}px)` }}>
        <div key={stumbleKey} className={stumbleKey > 0 ? 'hero hero--stumble' : 'hero'}>
          <PlaceholderHero />
        </div>
      </div>
    </div>
  );
}

function PlaceholderHero() {
  return (
    <svg width={70} height={110} viewBox="0 0 70 110" aria-label="Hero">
      <rect x={20} y={70} width={11} height={34} rx={5} fill="#2d4a7a" />
      <rect x={39} y={70} width={11} height={34} rx={5} fill="#2d4a7a" />
      <rect x={14} y={38} width={42} height={40} rx={14} fill="#e63946" />
      <circle cx={35} cy={24} r={20} fill="#f1c29b" />
      <path d="M15 22 Q 18 2 35 4 Q 54 4 55 22 Q 44 12 30 14 Q 20 16 15 22 Z" fill="#6b3e1e" />
      <circle cx={28} cy={25} r={2.6} fill="#1d3557" />
      <circle cx={42} cy={25} r={2.6} fill="#1d3557" />
      <path
        d="M28 33 Q 35 38 42 33"
        stroke="#1d3557"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
