import { createRng } from '../../game/rng';
import type { ObstacleProps } from './types';

/*
 * World 1 obstacles. Local coordinates: anchor (0, 0) on the ground line, up is
 * negative y, sized for a 200px-tall hero. Motion is computed from `t` so every
 * frame is deterministic.
 */

const TAU = Math.PI * 2;

// ---------- Tall grass ----------

const GRASS_W = 360;

function blades(seed: number, count: number, minH: number, maxH: number) {
  const rng = createRng(seed);
  return Array.from({ length: count }, (_, i) => ({
    x: -10 + (i / (count - 1)) * (GRASS_W + 20) + rng.int(-6, 6),
    h: rng.int(minH, maxH),
    lean: rng.int(-12, 12),
    phase: rng.next() * TAU,
  }));
}

const BACK_BLADES = blades(11, 30, 110, 170);
const FRONT_BLADES = blades(12, 26, 60, 115);

function Blades({
  list,
  color,
  width,
  p,
}: {
  list: typeof BACK_BLADES;
  color: string;
  width: number;
  p: ObstacleProps;
}) {
  const rustling = p.state === 'rustle';
  return (
    <g stroke={color} strokeWidth={width} strokeLinecap="round" fill="none">
      {list.map((b, i) => {
        const near = rustling && Math.abs(p.heroX - b.x) < 70;
        const sway = Math.sin(p.t / 260 + b.phase) * (near ? 22 : 5) + (near ? 10 : 0);
        const tip = b.lean + sway;
        return (
          <path key={i} d={`M${b.x} 6 Q${b.x + tip * 0.3} ${-b.h * 0.6} ${b.x + tip} ${-b.h}`} />
        );
      })}
    </g>
  );
}

export function TallGrassBack(p: ObstacleProps) {
  return <Blades list={BACK_BLADES} color="#3f9d4c" width={9} p={p} />;
}

export function TallGrassFront(p: ObstacleProps) {
  return <Blades list={FRONT_BLADES} color="#5cbf5f" width={8} p={p} />;
}

// ---------- Muddy puddle ----------

const DROPS = Array.from({ length: 9 }, (_, i) => ({
  angle: Math.PI * (0.15 + (0.7 * i) / 8),
  speed: 0.38 + (i % 3) * 0.08,
}));

export function PuddleArt({ t, state, since }: ObstacleProps) {
  const s = (t - since) / 1000;
  const splashing = state === 'splash' && s < 0.8;
  return (
    <g>
      <ellipse cx={120} cy={4} rx={128} ry={20} fill="#6b4a2b" />
      <ellipse cx={120} cy={2} rx={110} ry={14} fill="#8a6440" />
      <ellipse cx={92} cy={-1} rx={40} ry={4} fill="#c7a47c" opacity={0.6} />
      <ellipse
        cx={150}
        cy={3}
        rx={18 + ((t / 25) % 30)}
        ry={3 + ((t / 25) % 30) / 10}
        fill="none"
        stroke="#c7a47c"
        strokeWidth={2}
        opacity={1 - ((t / 25) % 30) / 30}
      />
      {splashing &&
        DROPS.map((d, i) => {
          const v = d.speed * 1000;
          const x = 60 + Math.cos(d.angle) * v * s * 0.4 - 20;
          const y = -Math.sin(d.angle) * v * s + 900 * s * s;
          return <circle key={i} cx={x} cy={Math.min(y, 0)} r={6} fill="#8a6440" />;
        })}
    </g>
  );
}

// ---------- Fence stile ----------

const WOOD = '#a0703f';
const WOOD_DARK = '#7a5230';

export function FenceStileArt() {
  return (
    <g>
      {/* Rails run off to both sides to suggest the fence line. */}
      {[-48, -96].map((y) => (
        <rect key={y} x={-120} y={y} width={360} height={12} rx={5} fill={WOOD} />
      ))}
      {[-110, 10, 110, 220].map((x) => (
        <rect key={x} x={x} y={-126} width={16} height={130} rx={5} fill={WOOD_DARK} />
      ))}
      {/* Steps on each side. */}
      <rect x={-52} y={-44} width={46} height={48} rx={6} fill={WOOD} />
      <rect x={-52} y={-44} width={46} height={10} rx={5} fill={WOOD_DARK} />
      <rect x={130} y={-44} width={46} height={48} rx={6} fill={WOOD} />
      <rect x={130} y={-44} width={46} height={10} rx={5} fill={WOOD_DARK} />
    </g>
  );
}

// ---------- Bees ----------

const BEE_LIST = Array.from({ length: 7 }, (_, i) => ({
  r: 34 + (i % 3) * 22,
  speed: 0.0022 + (i % 4) * 0.0006,
  phase: (i / 7) * TAU,
  tilt: 0.45 + (i % 2) * 0.25,
}));

function Bee({ x, y, t }: { x: number; y: number; t: number }) {
  const flap = Math.abs(Math.sin(t / 30)) * 6 + 3;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={-3} cy={-8} rx={6} ry={flap} fill="#ffffff" opacity={0.85} />
      <ellipse cx={4} cy={-8} rx={6} ry={flap} fill="#ffffff" opacity={0.85} />
      <ellipse cx={0} cy={0} rx={11} ry={8} fill="#ffc53d" />
      <rect x={-3} y={-7.5} width={4} height={15} fill="#2b2118" />
      <circle cx={10} cy={-1} r={4} fill="#2b2118" />
    </g>
  );
}

export function BeesArt({ t, state, since, heroX, heroLift }: ObstacleProps) {
  // The swarm drifts toward the hero while 'curious', then settles back.
  const k = Math.min(1, (t - since) / 700);
  const pull = state === 'curious' ? k : state === 'home' ? 1 - k : 0;
  const cx = 150 + (heroX - 150) * 0.45 * pull;
  const cy = -120 - heroLift * 0.5 * pull + 20 * pull;
  return (
    <g>
      {/* Flower bush */}
      <g fill="#3f9d4c">
        <circle cx={80} cy={-40} r={42} />
        <circle cx={140} cy={-58} r={52} />
        <circle cx={205} cy={-40} r={42} />
      </g>
      {[
        [70, -60, '#ff70a6'],
        [120, -90, '#ffd23f'],
        [165, -70, '#ffffff'],
        [210, -52, '#ff9f43'],
        [100, -30, '#b388ff'],
        [180, -28, '#ff70a6'],
      ].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {[0, 1, 2, 3, 4].map((j) => (
            <circle
              key={j}
              cx={Math.cos((j / 5) * TAU) * 7}
              cy={Math.sin((j / 5) * TAU) * 7}
              r={6}
              fill={c as string}
            />
          ))}
          <circle r={5} fill="#f5b700" />
        </g>
      ))}
      {BEE_LIST.map((b, i) => {
        const a = t * b.speed + b.phase;
        return (
          <Bee
            key={i}
            x={cx + Math.cos(a) * b.r}
            y={cy + Math.sin(a * 1.3) * b.r * b.tilt}
            t={t + i * 40}
          />
        );
      })}
    </g>
  );
}

// ---------- Stepping logs over a stream ----------

/** Log centers and the height of their tops (scripts hop to these). */
const LOG_XS = [95, 235, 375];
const LOG_TOP = 20;

export function SteppingLogsArt({ t }: ObstacleProps) {
  return (
    <g>
      <rect x={0} y={-18} width={470} height={200} fill="#4aa8e0" />
      <rect x={0} y={-18} width={470} height={10} fill="#8fd3ff" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((i) => {
          const x = ((i * 110 + t * (0.05 + row * 0.02)) % 520) - 30;
          return (
            <path
              key={`${row}-${i}`}
              d={`M${x} ${6 + row * 24} q14 -7 28 0`}
              stroke="#d6f0ff"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              opacity={0.7}
            />
          );
        }),
      )}
      {LOG_XS.map((x) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <rect x={-30} y={-LOG_TOP} width={60} height={60} rx={10} fill="#8a5a33" />
          <ellipse cx={0} cy={-LOG_TOP} rx={30} ry={9} fill="#c79a6b" />
          <ellipse
            cx={0}
            cy={-LOG_TOP}
            rx={16}
            ry={4.5}
            fill="none"
            stroke="#8a5a33"
            strokeWidth={2}
          />
        </g>
      ))}
    </g>
  );
}

// ---------- Windy hill ----------

/** The hill's straight slopes meet at this peak (scripts walk along them). */
const HILL_PEAK_X = 320;
const HILL_PEAK = 160;

export function WindyHillArt({ t, state }: ObstacleProps) {
  const gust = state === 'gust' ? 1.8 : 1;
  const slope = `M-60 0 L${HILL_PEAK_X - 24} ${-HILL_PEAK + 5} Q${HILL_PEAK_X} ${-HILL_PEAK - 7} ${HILL_PEAK_X + 24} ${-HILL_PEAK + 5} L700 0`;
  return (
    <g>
      {/* A rounded mound, lighter than the field so it stands out. */}
      <path
        d={`M-110 30 Q-40 20 40 -60 Q${HILL_PEAK_X} ${-HILL_PEAK * 1.9} 600 -60 Q680 20 750 30 Z`}
        fill="#86d17e"
        stroke="#4e9e52"
        strokeWidth={5}
      />
      {[40, 150, 470, 560, 250, 390].map((x, i) => (
        <path
          key={x}
          transform={`translate(${x} ${-40 - (i % 3) * 30})`}
          d="M-7 0 Q-6 -8 -9 -14 M0 0 Q0 -10 1 -17 M7 0 Q6 -8 10 -13"
          stroke="#4e9e52"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {/* The dirt path runs up and over; the hero walks on its center line. */}
      <path d={slope} stroke="#e4c48a" strokeWidth={26} strokeLinejoin="round" fill="none" />
      <path d={slope} stroke="#c9a263" strokeWidth={3} strokeDasharray="3 26" fill="none" />
      {/* Wind streaks blowing right to left */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 900 - ((t * 0.45 * gust + i * 190) % 1200);
        const y = -210 - (i % 3) * 60;
        return (
          <path
            key={i}
            d={`M${x} ${y} q40 -14 80 0 t80 0`}
            stroke="#ffffff"
            strokeWidth={5}
            strokeLinecap="round"
            fill="none"
            opacity={0.75}
          />
        );
      })}
      {/* Leaves tumbling in the wind */}
      {[0, 1, 2].map((i) => {
        const x = 800 - ((t * 0.6 * gust + i * 400) % 1100);
        const y = -80 - i * 60 + Math.sin(t / 200 + i) * 20;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx={9}
            ry={5}
            fill="#e9c46a"
            transform={`rotate(${(t / 5 + i * 90) % 360} ${x} ${y})`}
          />
        );
      })}
    </g>
  );
}

// ---------- Sleeping bull ----------

export function SleepingBullArt({ t, state }: ObstacleProps) {
  const awake = state === 'peek';
  const breathe = Math.sin(t / 700) * 3;
  return (
    <g transform="translate(0 -26)">
      {/* Tail */}
      <path
        d="M18 -40 Q-10 -30 -8 -2"
        stroke="#6b3e22"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      {/* Body */}
      <ellipse cx={110} cy={-44 - breathe / 2} rx={100} ry={48 + breathe} fill="#7a4a2a" />
      <ellipse cx={90} cy={-60} rx={34} ry={20} fill="#8f5a35" />
      {/* Tucked legs */}
      <ellipse cx={60} cy={-2} rx={26} ry={10} fill="#5e3820" />
      <ellipse cx={150} cy={-2} rx={26} ry={10} fill="#5e3820" />
      {/* Head */}
      <g transform="translate(215 -62)">
        <path
          d="M-18 -28 Q-34 -52 -14 -60"
          stroke="#f1e3c6"
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M18 -28 Q34 -52 14 -60"
          stroke="#f1e3c6"
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx={0} cy={0} rx={38} ry={34} fill="#7a4a2a" />
        <ellipse cx={-36} cy={-12} rx={14} ry={8} fill="#6b3e22" />
        <ellipse cx={12} cy={20} rx={30} ry={18} fill="#e8a79a" />
        <circle cx={4} cy={20} r={4} fill="#5e3820" />
        <circle cx={22} cy={20} r={4} fill="#5e3820" />
        {awake ? (
          <g>
            <circle cx={-6} cy={-8} r={8} fill="#fff" />
            <circle cx={-10} cy={-7} r={4} fill="#1d2433" />
            <path
              d="M10 -8 q7 4 14 0"
              stroke="#3a2415"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ) : (
          <path
            d="M-14 -8 q7 5 14 0 M10 -8 q7 5 14 0"
            stroke="#3a2415"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </g>
      {!awake &&
        [0, 1, 2].map((i) => {
          const k = (t / 1400 + i / 3) % 1;
          return (
            <text
              key={i}
              x={250 + k * 40}
              y={-110 - k * 90}
              fontSize={22 + k * 16}
              fontWeight={900}
              fill="#1d3557"
              opacity={Math.sin(k * Math.PI)}
              fontFamily="inherit"
            >
              z
            </text>
          );
        })}
    </g>
  );
}

// ---------- Rope bridge over a ravine (boss) ----------

const RAVINE_W = 560;
const REST_SAG = 26;

/** How far the deck hangs below the ground line at local x, given the hero's position. */
function deckSag(x: number, t: number, heroX: number, heroLift: number, wobble: boolean): number {
  if (x <= 0 || x >= RAVINE_W) return 0;
  const sway = wobble ? Math.sin(t / 260) * 4 : 0;
  const rest = (REST_SAG + sway) * Math.sin((Math.PI * x) / RAVINE_W);
  const onBridge = heroX > 0 && heroX < RAVINE_W;
  if (!onBridge) return rest;
  const s = Math.max(0, -heroLift);
  const loaded =
    x < heroX
      ? s * Math.sin((Math.PI / 2) * (x / heroX))
      : s * Math.sin((Math.PI / 2) * ((RAVINE_W - x) / (RAVINE_W - heroX)));
  return Math.max(rest, loaded);
}

function deckPath(t: number, heroX: number, heroLift: number, wobble: boolean, raise: number) {
  const pts: string[] = [];
  for (let x = 0; x <= RAVINE_W; x += 20) {
    pts.push(`${x} ${deckSag(x, t, heroX, heroLift, wobble) - raise}`);
  }
  return `M${pts.join(' L')}`;
}

export function RopeBridgeBack({ t, state, heroX, heroLift }: ObstacleProps) {
  const wobble = state === 'wobble';
  const planks = [];
  for (let x = 14; x < RAVINE_W; x += 28) {
    const y = deckSag(x, t, heroX, heroLift, wobble);
    planks.push(<rect key={x} x={x - 11} y={y - 4} width={22} height={10} rx={2} fill="#a0703f" />);
  }
  return (
    <g>
      {/* The gorge runs back into the landscape, narrowing toward the horizon… */}
      <path d={`M-6 -22 L170 -170 L${RAVINE_W - 170} -170 L${RAVINE_W + 6} -22 Z`} fill="#6e5238" />
      <path
        d={`M60 -22 L215 -168 L${RAVINE_W - 215} -168 L${RAVINE_W - 60} -22 Z`}
        fill="#3b2a20"
      />
      <path
        d={`M150 -22 L250 -150 L${RAVINE_W - 250} -150 L${RAVINE_W - 150} -22 Z`}
        fill="#241811"
      />
      {/* …and cuts through the near ground and the path. */}
      <path d={`M-6 -22 L${RAVINE_W + 6} -22 L${RAVINE_W - 30} 200 L30 200 Z`} fill="#3b2a20" />
      <path d={`M40 60 L${RAVINE_W - 40} 60 L${RAVINE_W - 60} 200 L60 200 Z`} fill="#2a1d16" />
      <path d="M-6 -22 L30 -22 L50 40 L20 90 L30 200 L-6 200 Z" fill="#8a6a4a" />
      <path
        d={`M${RAVINE_W + 6} -22 L${RAVINE_W - 30} -22 L${RAVINE_W - 50} 50 L${RAVINE_W - 22} 110 L${RAVINE_W - 30} 200 L${RAVINE_W + 6} 200 Z`}
        fill="#8a6a4a"
      />
      <path
        d={`M60 150 Q${RAVINE_W / 2} 138 ${RAVINE_W - 60} 150`}
        stroke="#4aa8e0"
        strokeWidth={8}
        fill="none"
      />
      {/* Posts */}
      {[-14, RAVINE_W + 2].map((x) => (
        <rect key={x} x={x} y={-100} width={14} height={104} rx={4} fill="#7a5230" />
      ))}
      {/* Back handrail, deck support rope, planks */}
      <path
        d={deckPath(t, heroX, heroLift, wobble, 84)}
        stroke="#c9a263"
        strokeWidth={5}
        fill="none"
      />
      {[40, 120, 200, 280, 360, 440, 520].map((x) => {
        const y = deckSag(x, t, heroX, heroLift, wobble);
        return <path key={x} d={`M${x} ${y} L${x} ${y - 84}`} stroke="#c9a263" strokeWidth={3} />;
      })}
      <path
        d={deckPath(t, heroX, heroLift, wobble, 0)}
        stroke="#7a5230"
        strokeWidth={5}
        fill="none"
      />
      {planks}
    </g>
  );
}

export function RopeBridgeFront({ t, state, heroX, heroLift }: ObstacleProps) {
  return (
    <path
      d={deckPath(t, heroX, heroLift, state === 'wobble', 64)}
      stroke="#d8b377"
      strokeWidth={6}
      fill="none"
    />
  );
}
