import { Dust, Glow, SparkBurst, SparkTrail, SpeedLines } from '../fx';
import { INK, ink, shade, tint } from '../style';
import { Cactus } from '../worlds/canyon';
import { ARCH, DUNE, FLASH_FLOOD, HILL, HOME, TRAIN, TUMBLEWEEDS, ZIP } from './canyonLayout';
import { clamp01, easeOut, fallen, lerp, noise, rollAngle, since } from './sceneKit';
import { eventTime, type ObstacleProps } from './types';

/*
 * World 5 (Canyon to Home) scenes, levels 33–40. Every motion is computed from `t`
 * and the prop schedule, so any frame can be drawn exactly.
 */

const RED = '#c8663f';
const RED_DARK = '#a24a33';
const SAND = '#e6c088';
const MUD = '#9a6a3e';
const WOOD = '#8a5a30';
const IRON = '#4a4f5a';

/** A canyon drop in front of the path from a to b, striped red rock down to the bottom. */
function Drop({ a, b }: { a: number; b: number }) {
  return (
    <g>
      <path
        d={`M${a - 10} -2 L${a} 18 L${a + 16} 240 L${b - 16} 240 L${b} 18 L${b + 10} -2 Z`}
        fill={RED_DARK}
        {...ink(3)}
      />
      <path
        d={`M${a + 6} 70 H${b - 6} M${a + 12} 140 H${b - 12}`}
        stroke={shade(RED_DARK, 0.3)}
        strokeWidth={6}
      />
      <path d={`M${a + 40} 240 Q${(a + b) / 2} 190 ${b - 40} 240 Z`} fill="#6b3a2a" />
    </g>
  );
}

/** Ground height along a piecewise-linear profile of [x, lift] points. */
function profileLift(profile: readonly (readonly [number, number])[], x: number) {
  if (x <= profile[0]![0]) return 0;
  for (let i = 1; i < profile.length; i++) {
    const [x0, l0] = profile[i - 1]!;
    const [x1, l1] = profile[i]!;
    if (x <= x1) return lerp(l0, l1, (x - x0) / (x1 - x0));
  }
  return 0;
}

/** Streaks of blowing sand. */
function SandStreaks({ t, strength, dir = 1 }: { t: number; strength: number; dir?: 1 | -1 }) {
  if (strength <= 0) return null;
  return (
    <g stroke={tint(SAND, 0.3)} strokeWidth={4} strokeLinecap="round" opacity={0.7 * strength}>
      {Array.from({ length: 18 }, (_, i) => {
        const span = 2600;
        const x = -400 + ((i * 151 + t * 1.1) % span);
        const y = -40 - ((i * 67) % 560);
        return (
          <path key={i} d={`M${dir > 0 ? x : 2200 - x} ${y} h ${dir * (40 + (i % 4) * 20)}`} />
        );
      })}
    </g>
  );
}

// ---------- Level 33: flash flood ----------
// rumble → flood (muddy water roars in from behind; he scrambles up the rock steps).

export function FlashFloodBack(p: ObstacleProps) {
  const flood = since(p, 'flood');
  const front = FLASH_FLOOD.floodStart + Math.max(0, flood) * FLASH_FLOOD.speed;
  const level = -FLASH_FLOOD.depth * easeOut(clamp01(flood / 900));
  const [, , [lastX, top]] = FLASH_FLOOD.steps;
  return (
    <g>
      {/* The rock steps up to a high ledge that runs on to the right. */}
      <path d={`M${lastX - 70} 4 V${-top} H3000 V4 Z`} fill={RED} {...ink(3.5)} />
      {FLASH_FLOOD.steps.slice(0, 2).map(([x, lift]) => (
        <path
          key={x}
          d={`M${x - 60} 4 V${-lift} H${lastX - 70} V4 Z`}
          fill={shade(RED, 0.1)}
          {...ink(3)}
        />
      ))}
      <path
        d={`M${lastX - 70} ${-top + 40} H3000 M${lastX - 70} ${-top + 110} H3000`}
        stroke={RED_DARK}
        strokeWidth={6}
        opacity={0.6}
      />
      {flood >= 0 && (
        <g>
          <path
            d={`M-900 240 V${level} H${front - 60} Q${front - 10} ${level - 30} ${front} ${level + 10} Q${front + 30} ${-10} ${front + 50} 240 Z`}
            fill={MUD}
            {...ink(3.5)}
          />
          <path d={`M-900 ${level + 16} H${front - 80}`} stroke={tint(MUD, 0.3)} strokeWidth={6} />
          {[0, 1].map((i) => {
            const x = front - 260 - i * 380;
            return (
              <g
                key={i}
                transform={`translate(${x} ${level - 4}) rotate(${Math.sin(p.t / 180 + i) * 8})`}
              >
                <rect x={-50} y={-12} width={100} height={22} rx={11} fill={WOOD} {...ink(2.5)} />
              </g>
            );
          })}
          <g fill={tint(MUD, 0.5)} {...ink(2)}>
            {[0, 1, 2, 3].map((i) => (
              <circle
                key={i}
                cx={front - 20 - i * 18}
                cy={level - 20 - 14 * Math.abs(Math.sin(p.t / 90 + i))}
                r={12 - i * 2}
              />
            ))}
          </g>
        </g>
      )}
      <Dust x={-200} y={-4} dt={since(p, 'rumble')} ms={900} color="#d8b890" />
    </g>
  );
}

// ---------- Level 34: zip line ----------
// zip (he grabs the handle and rides the line across the canyon) → off.

const ropeY = (x: number) =>
  -lerp(ZIP.from.lift, ZIP.to.lift, (x - ZIP.from.x) / (ZIP.to.x - ZIP.from.x));

export function ZipLineBack(p: ObstacleProps) {
  const [a, b] = ZIP.canyon;
  const zipAt = eventTime(p.events, 'zip');
  const offAt = eventTime(p.events, 'off');
  const riding = p.t >= zipAt && p.t < offAt;
  const handleX = p.t < zipAt ? ZIP.from.x + 30 : p.t < offAt ? p.heroX : ZIP.to.x - 30;
  const hy = ropeY(handleX);
  return (
    <g>
      <Drop a={a} b={b} />
      {/* The two posts and the line between them. */}
      {[ZIP.from, ZIP.to].map((post, i) => (
        <g key={i}>
          <rect
            x={post.x - 12}
            y={-post.lift - 30}
            width={24}
            height={post.lift + 34}
            rx={4}
            fill={WOOD}
            {...ink(3)}
          />
          <path
            d={`M${post.x} ${-post.lift - 30} L${post.x + (i ? 60 : -60)} 4`}
            stroke={WOOD}
            strokeWidth={8}
          />
        </g>
      ))}
      <path
        d={`M${ZIP.from.x} ${-ZIP.from.lift} L${ZIP.to.x} ${-ZIP.to.lift}`}
        stroke={INK}
        strokeWidth={7}
      />
      <path
        d={`M${ZIP.from.x} ${-ZIP.from.lift} L${ZIP.to.x} ${-ZIP.to.lift}`}
        stroke="#c9a66b"
        strokeWidth={3}
      />
      {/* The handle (a pulley and a bar). */}
      <g transform={`translate(${handleX} ${hy})`}>
        <circle r={10} fill={IRON} {...ink(2.5)} />
        <path d="M0 8 V26 M-22 28 H22" stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <path d="M-22 28 H22" stroke="#e8743b" strokeWidth={4} strokeLinecap="round" />
      </g>
      {riding && <SparkTrail x={handleX - 6} y={hy - 4} t={p.t} />}
    </g>
  );
}

export function ZipLineFront(p: ObstacleProps) {
  const riding = since(p, 'zip') >= 0 && since(p, 'off') < 0;
  return riding ? (
    <SpeedLines
      x={p.heroX - 80}
      t={p.t}
      ys={[-(p.heroLift + 60), -(p.heroLift + 110), -(p.heroLift + 150)]}
    />
  ) : null;
}

// ---------- Level 35: dune surf ----------
// storm (a sandstorm rolls in) → board (he jumps on at the crest) → land → off.

function boardPose(p: ObstacleProps) {
  const boardAt = eventTime(p.events, 'board');
  const offAt = eventTime(p.events, 'off');
  const riding = p.t >= boardAt && p.t < offAt;
  const x = p.t < boardAt ? DUNE.board : Math.min(p.heroX, DUNE.stop);
  const lift = riding ? p.heroLift - DUNE.seat : profileLift(DUNE.profile, x);
  const ground = profileLift(DUNE.profile, x);
  const onSlope = x > 520 && x < 1300 && lift - ground < 4;
  return { x, lift, tilt: onSlope ? 14 : 0, riding };
}

export function DuneBack(p: ObstacleProps) {
  const storm = clamp01(since(p, 'storm') / 900) - clamp01(since(p, 'land') / 1200);
  const profile = DUNE.profile.map(([x, l]) => `${x} ${-l}`).join(' L');
  return (
    <g>
      <rect x={-600} y={-900} width={3400} height={1200} fill="#b8783a" opacity={0.35 * storm} />
      {/* The sandstorm: a towering brown cloud rolling in behind him. */}
      {storm > 0 && (
        <g opacity={storm} fill="#c08850">
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={-500 + i * 140 + since(p, 'storm') * 0.15}
              cy={-160 - (i % 2) * 140}
              r={180 + noise(i) * 60}
            />
          ))}
        </g>
      )}
      <path d={`M-40 4 L${profile} L2600 0 V240 H-40 Z`} fill={SAND} {...ink(3.5)} />
      <path
        d={`M60 ${-profileLift(DUNE.profile, 60) + 24} Q300 -150 460 -176 M600 -170 Q900 -80 1240 ${-profileLift(DUNE.profile, 1240) + 20}`}
        stroke={shade(SAND, 0.15)}
        strokeWidth={10}
        fill="none"
      />
      <SandStreaks t={p.t} strength={storm} />
    </g>
  );
}

export function DuneFront(p: ObstacleProps) {
  const b = boardPose(p);
  const landAt = eventTime(p.events, 'land');
  return (
    <g>
      {b.riding && <SpeedLines x={b.x - 110} t={p.t} ys={[-30, -60, -90]} />}
      <g transform={`translate(${b.x} ${-b.lift}) rotate(${b.tilt})`}>
        <path d="M-70 -2 Q-80 -14 -60 -16 H60 Q80 -14 72 -2 Z" fill="#3a86ff" {...ink(3)} />
        <path d="M-50 -10 H50" stroke="#ffffff" strokeWidth={4} />
      </g>
      {b.riding && (
        <Dust x={b.x - 70} y={-b.lift} dt={p.t % 300} ms={300} size={0.35} color={SAND} />
      )}
      <Dust x={b.x} y={-b.lift} dt={p.t - landAt} ms={700} size={1.1} color={SAND} />
    </g>
  );
}

// ---------- Level 36: tumbleweeds ----------
// wind → j1..j3 (a tumbleweed rolls under him at the top of each jump).

function Tumbleweed({ x, r, spin }: { x: number; r: number; spin: number }) {
  const twig = '#a07844';
  return (
    <g transform={`translate(${x} ${-r}) rotate(${spin})`}>
      <circle r={r} fill="#c9a060" opacity={0.35} />
      <g stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round">
        <circle r={r} />
      </g>
      <g stroke={twig} strokeWidth={4} fill="none" strokeLinecap="round">
        <circle r={r - 2} />
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <path
              key={i}
              d={`M${Math.cos(a) * r * 0.9} ${Math.sin(a) * r * 0.9} Q0 0 ${Math.cos(a + 2) * r * 0.9} ${Math.sin(a + 2) * r * 0.9}`}
            />
          );
        })}
        <circle r={r * 0.5} />
      </g>
    </g>
  );
}

export function TumbleweedsBack(p: ObstacleProps) {
  const wind = since(p, 'wind');
  return (
    <g>
      <SandStreaks t={p.t} strength={clamp01(wind / 600)} dir={-1} />
      <g transform="translate(1100 0) scale(0.9)">
        <Cactus color="#4f9a52" />
      </g>
    </g>
  );
}

export function TumbleweedsFront(p: ObstacleProps) {
  if (since(p, 'wind') < 0) return null;
  return (
    <g>
      {TUMBLEWEEDS.radii.map((r, i) => {
        const jumpAt = eventTime(p.events, `j${i + 1}`);
        // Find the top of his jump: halfway through it.
        const jumpMs = [550, 550, 700][i]!;
        const apex = jumpAt + jumpMs / 2;
        const at = p.heroAt(apex).x;
        const x = at + TUMBLEWEEDS.speed * (apex - p.t);
        if (x > 2400 || x < -900) return null;
        const bounce = 30 * Math.abs(Math.sin((p.t - apex) / 180 + i));
        return (
          <g key={i} transform={`translate(0 ${-bounce})`}>
            <Tumbleweed x={x} r={r} spin={-rollAngle(apex - p.t, r) * TUMBLEWEEDS.speed} />
          </g>
        );
      })}
    </g>
  );
}

// ---------- Level 37: crumbling arch ----------
// crack → crumble (the arch breaks up behind him as he runs across).

function chunkFallAt(p: ObstacleProps, x: number) {
  const crumbleAt = eventTime(p.events, 'crumble');
  const start = p.heroAt(crumbleAt).x - ARCH.lag;
  const [a] = ARCH.canyon;
  if (x <= start) return crumbleAt + ((x - a) / Math.max(1, start - a)) * 220;
  return crumbleAt + 220 + (x - start) / ARCH.run;
}

export function ArchBack(p: ObstacleProps) {
  const [a, b] = ARCH.canyon;
  const crack = since(p, 'crack');
  const chunks = [];
  for (let x = a; x < b; x += 60) chunks.push(x);
  const mid = (a + b) / 2;
  return (
    <g>
      <Drop a={a} b={b} />
      {chunks.map((x, i) => {
        const cx = x + 30;
        const dt = p.t - chunkFallAt(p, cx);
        const y = fallen(dt, 0.0026);
        if (y > 320) return null;
        // Each chunk is a slice of the arch: deep at the ends, thin in the middle.
        const depth = 30 + 90 * ((cx - mid) / (mid - a)) ** 2;
        return (
          <g
            key={x}
            transform={`translate(${cx} ${y}) rotate(${dt > 0 ? (noise(i) - 0.5) * dt * 0.3 : 0})`}
          >
            <path d={`M-31 -2 H31 V${depth} H-31 Z`} fill={RED} {...ink(2.5)} />
            <path d={`M-31 ${depth * 0.45} H31`} stroke={RED_DARK} strokeWidth={4} />
            <path d="M-31 -2 H31 V5 H-31 Z" fill={tint(RED, 0.3)} />
          </g>
        );
      })}
      {crack >= 0 && (
        <path
          d={`M${mid - 90} 4 l 20 14 l -10 18 l 26 16 M${mid + 80} 4 l -14 18 l 18 12`}
          stroke={INK}
          strokeWidth={3}
          fill="none"
          strokeDasharray={`${Math.min(140, crack * 0.4)} 200`}
        />
      )}
      <Dust x={mid} y={30} dt={since(p, 'crumble')} ms={1200} size={1.4} color="#d8a080" />
    </g>
  );
}

// ---------- Level 38: canyon train ----------
// whistle (the train comes up behind) → board (he lands on the flatcar) → off (onto the platform).

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

function Wheel({ x, spin }: { x: number; spin: number }) {
  return (
    <g transform={`translate(${x} -22) rotate(${spin})`}>
      <circle r={22} fill={IRON} {...ink(3)} />
      <path d="M-18 0 H18 M0 -18 V18" stroke={tint(IRON, 0.4)} strokeWidth={4} />
      <circle r={5} fill={tint(IRON, 0.5)} />
    </g>
  );
}

function Train({ x, t }: { x: number; t: number }) {
  const spin = rollAngle(x, 22);
  const deck = -TRAIN.deck;
  return (
    <g>
      {/* The flatcar he rides (its deck at x). */}
      <g transform={`translate(${x} 0)`}>
        <rect x={-120} y={deck} width={240} height={26} fill={WOOD} {...ink(3)} />
        <rect x={-110} y={deck + 26} width={220} height={40} fill={IRON} {...ink(3)} />
        {[-80, 80].map((wx) => (
          <Wheel key={wx} x={wx} spin={spin} />
        ))}
        <path d={`M120 ${deck + 40} H160`} stroke={INK} strokeWidth={6} />
      </g>
      {/* A boxcar and the engine ahead of it. */}
      <g transform={`translate(${x + 300} 0)`}>
        <rect x={-130} y={deck - 90} width={260} height={130} rx={6} fill={RED_DARK} {...ink(3)} />
        <path d={`M-100 ${deck - 60} H100`} stroke={shade(RED_DARK, 0.3)} strokeWidth={5} />
        <rect x={-120} y={deck + 40} width={240} height={26} fill={IRON} {...ink(3)} />
        {[-80, 80].map((wx) => (
          <Wheel key={wx} x={wx} spin={spin} />
        ))}
        <path d={`M130 ${deck + 40} H170`} stroke={INK} strokeWidth={6} />
      </g>
      <g transform={`translate(${x + 620} 0)`}>
        <rect
          x={-150}
          y={deck - 50}
          width={200}
          height={100}
          rx={40}
          fill="#2e4a5a"
          {...ink(3.5)}
        />
        <rect x={40} y={deck - 110} width={100} height={160} rx={8} fill="#2e4a5a" {...ink(3.5)} />
        <rect x={60} y={deck - 90} width={60} height={46} rx={6} fill="#ffd35a" {...ink(2.5)} />
        <rect x={-110} y={deck - 110} width={36} height={60} fill={IRON} {...ink(3)} />
        <path d={`M-160 ${deck + 40} L-190 ${deck + 64} H-140 Z`} fill="#c0392b" {...ink(2.5)} />
        {[-100, 0, 90].map((wx) => (
          <Wheel key={wx} x={wx} spin={spin} />
        ))}
        {/* Puffs of steam from the stack. */}
        {[0, 1, 2, 3].map((i) => {
          const k = (t / 500 + i * 0.25) % 1;
          return (
            <circle
              key={i}
              cx={-92 - k * 160}
              cy={deck - 130 - k * 120}
              r={18 + k * 30}
              fill="#ffffff"
              opacity={0.8 * (1 - k)}
              {...ink(2)}
            />
          );
        })}
      </g>
    </g>
  );
}

export function TrainBack(p: ObstacleProps) {
  const x = trainX(p);
  const [p0, p1] = TRAIN.platform;
  return (
    <g>
      {/* The track along the canyon floor. */}
      <rect x={-1600} y={-12} width={4400} height={8} fill="#a9b4c0" {...ink(2)} />
      {/* The station platform and its water tower. */}
      <rect
        x={p0}
        y={-TRAIN.platformTop}
        width={p1 - p0}
        height={TRAIN.platformTop + 4}
        fill={WOOD}
        {...ink(3)}
      />
      <path
        d={`M${p0 + 10} ${-TRAIN.platformTop + 10} H${p1 - 10}`}
        stroke={shade(WOOD, 0.3)}
        strokeWidth={4}
      />
      <g transform={`translate(${p1 - 120} ${-TRAIN.platformTop})`}>
        <path d="M-40 0 L-30 -160 M40 0 L30 -160 M-34 -80 H34" stroke={WOOD} strokeWidth={9} />
        <rect
          x={-50}
          y={-250}
          width={100}
          height={100}
          rx={10}
          fill={shade(WOOD, 0.2)}
          {...ink(3)}
        />
        <path d="M-56 -250 L0 -290 L56 -250 Z" fill={RED_DARK} {...ink(3)} />
      </g>
      {/* The train runs on the track behind him, so it never runs through him. */}
      {x !== null && <Train x={x} t={p.t} />}
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

// ---------- Level 39: the last hill ----------
// wind (it pushes him back) → calm (at the top, he sees home far away).

export function HillBack(p: ObstacleProps) {
  const { top, height, home } = HILL;
  const wind = clamp01(since(p, 'wind') / 500) - clamp01(since(p, 'calm') / 600);
  const calm = clamp01(since(p, 'calm') / 900);
  return (
    <g>
      <path d={`M-40 4 L0 0 L${top} ${-height} H3000 V240 H-40 Z`} fill={SAND} {...ink(3.5)} />
      <path
        d={`M120 ${-height * (120 / top) + 24} L${top - 60} ${-height + 22}`}
        stroke={shade(SAND, 0.15)}
        strokeWidth={10}
      />
      <g transform={`translate(${top + 420} ${-height})`}>
        <Cactus color="#4f9a52" />
      </g>
      {/* Home, far away on the horizon, with its light on. */}
      <g opacity={calm} transform={`translate(${home.x} ${home.y})`}>
        <Glow x={0} y={-20} r={120} color="#ffd35a" />
        <rect x={-40} y={-40} width={80} height={50} fill="#e8d4b0" {...ink(2.5)} />
        <path d="M-50 -40 L0 -80 L50 -40 Z" fill="#c0392b" {...ink(2.5)} />
        <rect x={-10} y={-26} width={20} height={20} fill="#ffd35a" {...ink(2)} />
      </g>
      <SandStreaks t={p.t} strength={wind} dir={-1} />
    </g>
  );
}

// ---------- Level 40 (boss): home ----------
// storm (a twister rises between him and home) → clear (it spins away) → home
// (the porch light, his family waving, fireworks).

function Person({
  x,
  color,
  wave,
  t,
  s = 1,
}: {
  x: number;
  color: string;
  wave: number;
  t: number;
  s?: number;
}) {
  const arm = -40 - 30 * Math.sin(t / 150 + wave);
  return (
    <g transform={`translate(${x} 0) scale(${s})`}>
      <path d="M-14 0 V-60 M14 0 V-60" stroke="#3a3a5a" strokeWidth={12} strokeLinecap="round" />
      <path d="M-26 -60 Q-28 -120 0 -124 Q28 -120 26 -60 Z" fill={color} {...ink(3)} />
      <path d="M-24 -110 L-44 -70" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <path
        d={`M24 -110 l ${30 * Math.cos((arm * Math.PI) / 180)} ${30 * Math.sin((arm * Math.PI) / 180)}`}
        stroke={INK}
        strokeWidth={9}
        strokeLinecap="round"
      />
      <circle cx={0} cy={-148} r={24} fill="#e8b48a" {...ink(3)} />
      <path d="M-24 -154 Q0 -182 24 -154 Q10 -164 -24 -154 Z" fill="#5a3a26" {...ink(2)} />
      <path
        d="M-8 -142 q 8 8 16 0"
        stroke={INK}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={-8} cy={-152} r={3} fill={INK} />
      <circle cx={8} cy={-152} r={3} fill={INK} />
    </g>
  );
}

function Dog({ x, t }: { x: number; t: number }) {
  const hop = 14 * Math.abs(Math.sin(t / 160));
  return (
    <g transform={`translate(${x} ${-hop})`}>
      <ellipse cx={0} cy={-26} rx={30} ry={18} fill="#c9954c" {...ink(3)} />
      <circle cx={30} cy={-44} r={16} fill="#c9954c" {...ink(3)} />
      <path d="M26 -58 q -10 -12 -2 -18 q 8 6 6 16" fill="#8a5a30" {...ink(2)} />
      <circle cx={36} cy={-46} r={2.5} fill={INK} />
      <path
        d={`M-30 -32 q -16 ${-10 + 8 * Math.sin(t / 60)} -22 -20`}
        stroke={INK}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <path d="M-18 -12 V0 M16 -12 V0" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    </g>
  );
}

const FIREWORKS = [
  { x: 900, y: -560, at: 0, color: '#ffd35a' },
  { x: 1500, y: -620, at: 500, color: '#ff70a6' },
  { x: 1180, y: -500, at: 1000, color: '#43e0cf' },
  { x: 1750, y: -520, at: 1500, color: '#a07bff' },
];

function Firework({ x, y, dt, color }: { x: number; y: number; dt: number; color: string }) {
  if (!(dt >= 0 && dt < 1400)) return null;
  const r = 20 + easeOut(clamp01(dt / 700)) * 110;
  return (
    <g opacity={1 - clamp01((dt - 700) / 700)} stroke={color} strokeWidth={6} strokeLinecap="round">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = x + Math.cos(a) * r * 0.6;
        const y1 = y + Math.sin(a) * r * 0.6 + 0.00004 * dt * dt;
        return (
          <path
            key={i}
            d={`M${x1} ${y1} L${x + Math.cos(a) * r} ${y + Math.sin(a) * r + 0.00004 * dt * dt}`}
          />
        );
      })}
    </g>
  );
}

export function HomeBack(p: ObstacleProps) {
  const [h0, h1] = HOME.house;
  const storm = clamp01(since(p, 'storm') / 800) - clamp01(since(p, 'clear') / 900);
  const home = since(p, 'home');
  const lit = clamp01(home / 400);
  const hw = h1 - h0;
  return (
    <g>
      <rect x={-600} y={-900} width={3400} height={1200} fill="#5a3a48" opacity={0.4 * storm} />
      {/* The mailbox at the start of the lane. */}
      <g transform="translate(150 0)">
        <rect x={-5} y={-80} width={10} height={84} fill={WOOD} {...ink(2.5)} />
        <rect x={-26} y={-110} width={52} height={32} rx={14} fill="#3a86ff" {...ink(3)} />
        <path d="M24 -106 V-130 H40 V-120 H28" fill="#c0392b" stroke={INK} strokeWidth={2} />
      </g>
      {/* The garden fence and gate. */}
      <g stroke={INK} strokeWidth={3}>
        {Array.from({ length: 6 }, (_, i) => (
          <rect
            key={i}
            x={HOME.gate - 150 + i * 30}
            y={-80}
            width={16}
            height={84}
            fill="#f3e6cf"
          />
        ))}
        <rect x={HOME.gate - 160} y={-56} width={190} height={10} fill="#f3e6cf" />
      </g>
      {/* The house: walls, roof, the door and the porch light. */}
      <g>
        <rect x={h0} y={-260} width={hw} height={264} fill="#e8d4b0" {...ink(3.5)} />
        <path
          d={`M${h0 - 30} -260 L${(h0 + h1) / 2} -400 L${h1 + 30} -260 Z`}
          fill="#c0392b"
          {...ink(3.5)}
        />
        <rect x={h1 - 70} y={-380} width={30} height={70} fill={RED_DARK} {...ink(3)} />
        <rect
          x={h0 + 30}
          y={-200}
          width={70}
          height={60}
          fill={lit > 0 ? '#ffd35a' : '#8aa0b8'}
          {...ink(3)}
        />
        <path
          d={`M${h0 + 65} -200 V-140 M${h0 + 30} -170 H${h0 + 100}`}
          stroke={INK}
          strokeWidth={3}
        />
        <rect x={h0 + 150} y={-150} width={70} height={154} rx={6} fill="#6b4226" {...ink(3)} />
        <circle cx={h0 + 206} cy={-76} r={5} fill="#ffd35a" />
        <path d={`M${h0 - 20} -160 H${h1 + 20}`} stroke={shade('#e8d4b0', 0.3)} strokeWidth={8} />
        <g opacity={lit}>
          <Glow x={h0 + 250} y={-170} r={160} color="#ffd35a" />
        </g>
        <circle
          cx={h0 + 250}
          cy={-170}
          r={10}
          fill={lit > 0 ? '#fff3b0' : '#b0a080'}
          {...ink(2.5)}
        />
      </g>
      {/* His family on the porch, waving. */}
      {home >= 0 && (
        <g>
          <Person x={h0 + 60} color="#2a9d5c" wave={0} t={p.t} />
          <Person x={h1 + 70} color="#6a4c93" wave={1.5} t={p.t} />
          <Dog x={h1 + 150} t={p.t} />
        </g>
      )}
      {FIREWORKS.map((f, i) => (
        <Firework key={i} x={f.x} y={f.y} dt={home - f.at} color={f.color} />
      ))}
      {home >= 0 && <SparkBurst x={(h0 + h1) / 2} y={-420} dt={home % 800} ms={700} count={12} />}
    </g>
  );
}

export function HomeFront(p: ObstacleProps) {
  const stormT = since(p, 'storm');
  const clear = since(p, 'clear');
  if (stormT < 0) return null;
  // The twister grows between him and home, then spins away up into the sky.
  const grow = easeOut(clamp01(stormT / 700));
  const leave = clamp01(clear / 900);
  const x = HOME.twister + leave * 700;
  const y = -leave * 500;
  const s = grow * (1 - leave * 0.6);
  if (s <= 0.02 || leave >= 1) return null;
  return (
    <g transform={`translate(${x} ${y})`} opacity={1 - leave}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const w = (40 + i * 26) * s;
        const yy = -i * 70 * s;
        const wob = 16 * Math.sin(p.t / 90 + i);
        return (
          <g key={i}>
            <ellipse
              cx={wob}
              cy={yy}
              rx={w}
              ry={16 * s + 4}
              fill={i % 2 ? '#c8a070' : tint('#c8a070', 0.25)}
              {...ink(3)}
            />
            <path
              d={`M${wob - w * 0.6} ${yy} Q${wob} ${yy + 8} ${wob + w * 0.6} ${yy}`}
              stroke={shade('#c8a070', 0.35)}
              strokeWidth={3}
              fill="none"
            />
          </g>
        );
      })}
      <Dust x={0} y={-4} dt={stormT % 500} ms={500} size={0.6 * s + 0.1} color="#d8b890" />
    </g>
  );
}
