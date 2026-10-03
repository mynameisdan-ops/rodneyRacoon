import { memo } from 'react';
import { SparkTrail, SpeedLines } from '../../fx';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { Saguaro } from '../../worlds/canyon';
import { circles, lerp, rollAngle, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { IRON, NS, P, RED, WOOD, WOOD_DARK } from './kit';
import { TRAIN } from './layout';
import { Gorge, SandBurst } from './parts';

// ---------- Level 38: canyon train ----------
// whistle (a steam train comes up behind him) → board (he lands on its flatcar; it carries him
// over the trestle across the gorge) → off (he leaps onto the station platform).

const GOLD = '#f2c14a';
const ENGINE = '#2f5a6a';
const BOX = '#c8402e';

function trainX(p: ObstacleProps) {
  const whistleAt = eventTime(p.events, 'whistle');
  const boardAt = eventTime(p.events, 'board');
  const offAt = eventTime(p.events, 'off');
  if (p.t < whistleAt) return null;
  if (p.t < boardAt)
    return lerp(TRAIN.start, p.heroAt(boardAt).x, (p.t - whistleAt) / (boardAt - whistleAt));
  if (p.t < offAt) return p.heroX;
  return p.heroAt(offAt).x + (p.t - offAt) * TRAIN.speed;
}

/** A wheel (lined), turned `spin` degrees. */
function Wheel({ x, r = 22, spin }: { x: number; r?: number; spin: number }) {
  return (
    <g transform={`translate(${x} ${-r}) rotate(${spin.toFixed(1)})`}>
      <circle r={r} fill={IRON} {...ink(IN + 1)} {...NS} />
      <circle r={r - 5} fill="none" stroke={tint(IRON, 0.35)} strokeWidth={2} />
      <path
        d={`M${-r + 5} 0 H${r - 5} M0 ${-r + 5} V${r - 5}`}
        stroke={tint(IRON, 0.4)}
        strokeWidth={3}
      />
      <circle r={5} fill={GOLD} {...ink(1.4)} />
    </g>
  );
}

/** The flatcar he rides (lined): a plank deck on an iron frame, its deck top at y = -deck. */
const Flatcar = memo(function Flatcar() {
  const d = -TRAIN.deck;
  return (
    <g>
      <rect x={-112} y={d + 18} width={224} height={40} rx={4} fill={IRON} {...ink(OUT)} />
      <rect x={-124} y={d} width={248} height={20} rx={4} fill={WOOD} {...ink(OUT)} />
      <path
        d={`M-116 ${d + 4} H116`}
        stroke={tint(WOOD, 0.5)}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d={`M-80 ${d} V${d + 20} M-36 ${d} V${d + 20} M8 ${d} V${d + 20} M52 ${d} V${d + 20} M96 ${d} V${d + 20}`}
        stroke={WOOD_DARK}
        strokeWidth={IN}
      />
      <path d={`M124 ${d + 38} H170`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      {/* A hay bale riding along at the back. */}
      <g transform={`translate(-88 ${d})`}>
        <rect x={-26} y={-34} width={52} height={34} rx={6} fill={GOLD} {...ink(IN + 1)} />
        <path d="M-20 -24 h40 M-20 -12 h40" stroke={shade(GOLD, 0.3)} strokeWidth={2} />
      </g>
    </g>
  );
});

/** The boxcar (lined): red, with a sliding door and gold trim. */
const Boxcar = memo(function Boxcar() {
  const d = -TRAIN.deck;
  return (
    <g>
      <rect x={-120} y={d + 18} width={240} height={40} rx={4} fill={IRON} {...ink(OUT)} />
      <rect x={-134} y={d - 120} width={268} height={140} rx={6} fill={BOX} {...ink(OUT)} />
      <rect x={-134} y={d - 120} width={40} height={140} rx={6} fill={shade(BOX, 0.25)} />
      <path d={`M-140 ${d - 124} H140`} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <path
        d={`M-140 ${d - 124} H140`}
        stroke={shade(BOX, 0.4)}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <rect
        x={-34}
        y={d - 104}
        width={70}
        height={110}
        rx={3}
        fill={tint(BOX, 0.12)}
        {...ink(IN + 1)}
      />
      <path
        d={`M-34 ${d - 50} H36 M-34 ${d - 104} L36 ${d + 6} M36 ${d - 104} L-34 ${d + 6}`}
        stroke={shade(BOX, 0.35)}
        strokeWidth={2.4}
      />
      <path d={`M-126 ${d - 80} H-44 M46 ${d - 80} H126`} stroke={GOLD} strokeWidth={4} />
      <path d={`M134 ${d + 38} H176`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
    </g>
  );
});

/** The engine (lined): a teal boiler with gold bands, a cab, a smokestack, a lamp, a cowcatcher. */
const Engine = memo(function Engine() {
  const d = -TRAIN.deck;
  return (
    <g>
      <rect x={-160} y={d + 18} width={300} height={40} rx={4} fill={IRON} {...ink(OUT)} />
      {/* The cab, with its window glowing. */}
      <rect x={-170} y={d - 130} width={110} height={150} rx={8} fill={ENGINE} {...ink(OUT)} />
      <path d={`M-182 ${d - 132} H-48`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d={`M-182 ${d - 132} H-48`} stroke={RED} strokeWidth={9} strokeLinecap="round" />
      <rect x={-150} y={d - 108} width={66} height={50} rx={6} fill="#ffe08a" {...ink(IN + 1)} />
      <path d={`M-150 ${d - 70} H-84`} stroke="#f2b84a" strokeWidth={3} />
      {/* The boiler, its bands and dome. */}
      <path
        d={`M-62 ${d - 80} H110 Q140 ${d - 80} 140 ${d - 30} Q140 ${d + 20} 110 ${d + 20} H-62 Z`}
        fill={ENGINE}
        {...ink(OUT)}
      />
      <path
        d={`M-62 ${d - 2} H110 Q132 ${d - 2} 138 ${d - 18} Q140 ${d + 20} 110 ${d + 20} H-62 Z`}
        fill={shade(ENGINE, 0.3)}
      />
      <path
        d={`M-50 ${d - 70} H100`}
        stroke={tint(ENGINE, 0.45)}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d={`M-10 ${d - 80} V${d + 20} M50 ${d - 80} V${d + 20}`}
        stroke={GOLD}
        strokeWidth={6}
      />
      <path
        d={`M10 ${d - 80} Q10 ${d - 108} 30 ${d - 108} Q50 ${d - 108} 50 ${d - 80} Z`}
        fill={GOLD}
        {...ink(IN + 1)}
      />
      {/* The smokestack and the headlamp. */}
      <path d={`M82 ${d - 80} L76 ${d - 140} H122 L116 ${d - 80} Z`} fill="#2a2a34" {...ink(OUT)} />
      <rect x={72} y={d - 152} width={54} height={16} rx={4} fill="#2a2a34" {...ink(OUT)} />
      <rect x={124} y={d - 66} width={30} height={30} rx={8} fill={GOLD} {...ink(IN + 1)} />
      <circle cx={146} cy={d - 51} r={9} fill="#fff6c8" {...ink(1.4)} />
      {/* The cowcatcher at the front. */}
      <path d={`M140 ${d + 20} L196 ${d + 58} H140 Z`} fill={RED} {...ink(OUT)} />
      <path
        d={`M150 ${d + 30} V${d + 56} M164 ${d + 40} V${d + 56} M178 ${d + 48} V${d + 56}`}
        stroke={shade(RED, 0.4)}
        strokeWidth={2}
      />
    </g>
  );
});

function Train({ x, t }: { x: number; t: number }) {
  const spin = rollAngle(x, 22);
  return (
    <g>
      <g transform={`translate(${x.toFixed(1)} 0)`}>
        <Flatcar />
        <Wheel x={-80} spin={spin} />
        <Wheel x={80} spin={spin} />
      </g>
      <g transform={`translate(${(x + 300).toFixed(1)} 0)`}>
        <Boxcar />
        <Wheel x={-84} spin={spin} />
        <Wheel x={84} spin={spin} />
      </g>
      <g transform={`translate(${(x + 640).toFixed(1)} 0)`}>
        <Engine />
        <Wheel x={-120} spin={spin} />
        <Wheel x={-40} r={30} spin={(spin * 22) / 30} />
        <Wheel x={36} r={30} spin={(spin * 22) / 30} />
        <Wheel x={110} spin={spin} />
        <path
          d={`M-120 -22 L110 -22`}
          stroke={INK}
          strokeWidth={8}
          strokeLinecap="round"
          transform={`translate(${(8 * Math.cos((spin * Math.PI) / 180)).toFixed(1)} ${(8 * Math.sin((spin * Math.PI) / 180)).toFixed(1)})`}
        />
      </g>
      {/* Puffs of smoke streaming back from the stack (cel-drawn). */}
      <path
        d={circles(
          [0, 1, 2, 3, 4].map((i) => {
            const k = (t / 520 + i * 0.2) % 1;
            return { x: x + 740 - k * 260, y: -TRAIN.deck - 168 - k * 110, r: 16 + k * 30 };
          }),
        )}
        fill="#f4f0ea"
        {...ink(IN)}
      />
    </g>
  );
}

/** The track, the trestle carrying it over the gorge, and the station (painted). */
const Line = memo(function Line() {
  const [g0, g1] = [500, 1300];
  const [p0, p1] = TRAIN.platform;
  return (
    <g>
      {/* The trestle: timber legs and cross braces down into the gorge. */}
      <g stroke={WOOD_DARK} strokeWidth={8} strokeLinecap="round">
        {Array.from({ length: 9 }, (_, i) => {
          const x = g0 + 20 + i * ((g1 - g0 - 40) / 8);
          return <path key={i} d={`M${x} -10 L${x - 14} 240 M${x} -10 L${x + 14} 240`} />;
        })}
      </g>
      <g stroke={WOOD} strokeWidth={5} strokeLinecap="round" opacity={0.9}>
        {Array.from({ length: 8 }, (_, i) => {
          const x = g0 + 20 + i * ((g1 - g0 - 40) / 8);
          const w = (g1 - g0 - 40) / 8;
          return (
            <path key={i} d={`M${x} 30 L${x + w} 120 M${x + w} 30 L${x} 120 M${x} 30 H${x + w}`} />
          );
        })}
      </g>
      <rect x={g0 - 10} y={-14} width={g1 - g0 + 20} height={10} fill={WOOD_DARK} />
      {/* The rails and ties along the whole line. */}
      <path
        d="M-1600 -10 H2800"
        stroke={shade(WOOD, 0.3)}
        strokeWidth={6}
        strokeDasharray="10 14"
      />
      <path d="M-1600 -13 H2800" stroke="#8a8f9a" strokeWidth={4} />
      <path d="M-1600 -15 H2800" stroke="#d0d4dc" strokeWidth={1.4} />
      {/* The station: the platform, a little station house and a water tower. */}
      <g transform={`translate(${p1 - 90} ${-TRAIN.platformTop})`}>
        <path
          d="M-40 0 L-30 -150 M40 0 L30 -150 M-34 -76 H34 M-36 -40 L34 -112 M36 -40 L-34 -112"
          stroke={WOOD_DARK}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <rect x={-48} y={-230} width={96} height={86} rx={8} fill={WOOD} />
        <rect x={-48} y={-230} width={30} height={86} rx={8} fill={shade(WOOD, 0.25)} />
        <path d="M-48 -206 H48 M-48 -176 H48" stroke={WOOD_DARK} strokeWidth={3} />
        <path d="M-56 -230 L0 -268 L56 -230 Z" fill={P.stoneDark} />
      </g>
      <g transform={`translate(${p0 + 150} ${-TRAIN.platformTop})`}>
        <rect x={-70} y={-100} width={140} height={100} fill="#e8c890" />
        <rect x={-70} y={-100} width={40} height={100} fill={shade('#e8c890', 0.2)} />
        <rect x={-20} y={-74} width={40} height={74} fill={WOOD_DARK} />
        <rect x={34} y={-74} width={26} height={26} fill="#ffe08a" />
        <path d="M-86 -96 L0 -140 L86 -96 Z" fill="#b8402e" />
        <path d="M-86 -96 L0 -140 L0 -130 L-70 -96 Z" fill={tint('#b8402e', 0.2)} />
        <circle cx={0} cy={-114} r={9} fill="#f6efe2" />
        <path d="M0 -114 V-120 M0 -114 L4 -112" stroke={INK} strokeWidth={1.4} />
      </g>
    </g>
  );
});

/** The platform he lands on (lined): planks on posts. */
const Platform = memo(function Platform() {
  const [p0, p1] = TRAIN.platform;
  const top = -TRAIN.platformTop;
  return (
    <g>
      <path
        d={`M${p0 + 20} ${top + 14} V4 M${p1 - 20} ${top + 14} V4 M${(p0 + p1) / 2} ${top + 14} V4`}
        stroke={WOOD_DARK}
        strokeWidth={10}
      />
      <rect x={p0} y={top} width={p1 - p0} height={16} rx={3} fill={WOOD} {...ink(OUT)} />
      <path
        d={`M${p0 + 6} ${top + 4} H${p1 - 6}`}
        stroke={tint(WOOD, 0.5)}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d={`M${p0} ${top + 10} H${p1}`}
        stroke={WOOD_DARK}
        strokeWidth={IN}
        strokeDasharray="40 6"
      />
    </g>
  );
});

export function TrainBack(p: ObstacleProps) {
  const x = trainX(p);
  return (
    <g>
      <Gorge a={500} b={1300} />
      <Saguaro x={-180} y={-14} h={100} />
      <Saguaro x={1500} y={-14} h={90} flip />
      <Line />
      {/* The train runs on the track behind him, so it never runs through him. */}
      {x !== null && <Train x={x} t={p.t} />}
      <Platform />
      <SandBurst
        x={TRAIN.platform[0] + 100}
        y={-TRAIN.platformTop}
        dt={since(p, 'off') - 550}
        size={0.4}
        ms={500}
      />
    </g>
  );
}

export function TrainFront(p: ObstacleProps) {
  const x = trainX(p);
  if (x === null) return null;
  const moving = since(p, 'whistle') >= 0;
  return (
    <g>
      {moving && <SpeedLines x={x - 140} t={p.t} ys={[-60, -100, -140]} />}
      {moving && <SparkTrail x={x - 80} y={-6} t={p.t} />}
    </g>
  );
}
