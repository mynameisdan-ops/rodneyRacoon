import { Dust, Glow, SpeedLines } from '../fx';
import { INK, ink, shade, tint } from '../style';
import {
  BOAR,
  BRAMBLE,
  FALLING_BRIDGE,
  FIREFLIES,
  LOG_ROLL,
  MUSHROOMS,
  ROOT_SLIDE,
  VINE_SWING,
  vineEnd,
} from './forestLayout';
import {
  bump,
  clamp01,
  easeOut,
  fallen,
  lerp,
  noise,
  progress,
  rollAngle,
  since,
} from './sceneKit';
import { eventTime, type ObstacleProps } from './types';

/*
 * World 2 (Whispering Forest) scenes, levels 9–16. Every motion is computed from
 * `t` and the prop schedule, so any frame can be drawn exactly.
 */

const BARK = '#6b4a32';
const WOOD = '#9a6a3e';
const LEAF = '#3d8c4f';
const ROOT = '#5a3a26';
const EARTH = '#3b2a1e';
const WATER = '#3aa0d8';
const FOAM = '#e8f8ff';
const SPEED_YS = [-60, -90, -120, -40];

/** Leaves bursting out from (x, y) and fluttering down. */
function LeafBurst({ x, y, dt, count = 10 }: { x: number; y: number; dt: number; count?: number }) {
  if (!(dt >= 0 && dt < 1400)) return null;
  return (
    <g opacity={1 - dt / 1400}>
      {Array.from({ length: count }, (_, i) => {
        const a = -Math.PI * (0.1 + 0.8 * noise(i, 3));
        const d = dt * (0.25 + 0.2 * noise(i, 5));
        const px = x + Math.cos(a) * d + 12 * Math.sin(dt / 120 + i);
        const py = y + Math.sin(a) * d + 0.0004 * dt * dt;
        return (
          <path
            key={i}
            transform={`translate(${px} ${py}) rotate(${dt * 0.3 + i * 40})`}
            d="M-8 0 Q0 -7 8 0 Q0 7 -8 0 Z"
            fill={i % 2 ? LEAF : tint(LEAF, 0.3)}
            {...ink(1.5)}
          />
        );
      })}
    </g>
  );
}

/** A dark cutaway hole in the ground from a to b, `depth` px deep. */
function Hollow({ a, b, depth }: { a: number; b: number; depth: number }) {
  return (
    <g>
      <path
        d={`M${a - 10} -2 L${a + 10} ${depth + 50} Q${(a + b) / 2} ${depth + 90} ${b - 10} ${depth + 50} L${b + 10} -2 Z`}
        fill={EARTH}
        {...ink(3)}
      />
      <path
        d={`M${a + 10} 10 L${a + 24} ${depth + 50} L${a + 50} ${depth + 60} Z`}
        fill={shade(EARTH, 0.4)}
      />
    </g>
  );
}

// ---------- Level 9: log roll ----------
// rumble (a huge log rolls up behind him) → ride (he runs on top) → hit (it slams into a stump).

function logX(p: ObstacleProps) {
  const rumbleAt = eventTime(p.events, 'rumble');
  const rideAt = eventTime(p.events, 'ride');
  const hitAt = eventTime(p.events, 'hit');
  if (p.t < rumbleAt) return null;
  if (p.t < rideAt) {
    const target = p.heroAt(rideAt).x;
    return lerp(LOG_ROLL.logStart, target, (p.t - rumbleAt) / (rideAt - rumbleAt));
  }
  if (p.t < hitAt) return Math.min(p.heroX, LOG_ROLL.stop);
  return LOG_ROLL.stop - 18 * bump(p.t - hitAt, 350);
}

function Log({ x }: { x: number }) {
  const { r } = LOG_ROLL;
  const spin = rollAngle(x - LOG_ROLL.logStart, r);
  return (
    <g transform={`translate(${x} ${-r})`}>
      <circle r={r} fill={BARK} {...ink(4)} />
      <circle r={r - 10} fill="#d9a86a" {...ink(2)} />
      <g transform={`rotate(${spin})`} fill="none" stroke={shade('#d9a86a', 0.35)} strokeWidth={3}>
        <circle r={r - 24} />
        <circle r={r - 38} />
        <path d={`M0 0 L${r - 12} 6`} strokeWidth={4} stroke={shade('#d9a86a', 0.5)} />
        <circle r={5} fill={shade('#d9a86a', 0.4)} />
      </g>
      <path
        d={`M${-r * 0.7} ${r * 0.55} A${r} ${r} 0 0 0 ${r * 0.55} ${r * 0.7}`}
        stroke={shade(BARK, 0.4)}
        strokeWidth={8}
        fill="none"
      />
    </g>
  );
}

function Stump({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-50 4 L-44 -96 L44 -96 L52 4 Z" fill={BARK} {...ink(3.5)} />
      <path d="M10 -96 L44 -96 L52 4 L18 4 Z" fill={shade(BARK, 0.35)} />
      <ellipse cx={0} cy={-96} rx={44} ry={12} fill="#d9a86a" {...ink(3)} />
      <ellipse
        cx={0}
        cy={-96}
        rx={26}
        ry={6}
        fill="none"
        stroke={shade('#d9a86a', 0.35)}
        strokeWidth={2}
      />
      <path
        d="M-50 4 Q-70 -4 -76 6 M52 4 Q70 -2 78 8"
        stroke={BARK}
        strokeWidth={8}
        strokeLinecap="round"
      />
    </g>
  );
}

export function LogRollBack(p: ObstacleProps) {
  const x = logX(p);
  return (
    <g>
      <Stump x={LOG_ROLL.stump} />
      {x !== null && <Log x={x} />}
      <Dust x={LOG_ROLL.logStart + 300} y={-4} dt={since(p, 'rumble') - 200} ms={900} size={1.2} />
      <Dust x={LOG_ROLL.stump - 60} y={-10} dt={since(p, 'hit')} ms={800} size={1.2} />
      <LeafBurst x={LOG_ROLL.stump} y={-120} dt={since(p, 'hit')} count={12} />
    </g>
  );
}

export function LogRollFront(p: ObstacleProps) {
  const riding = since(p, 'ride') >= 0 && since(p, 'hit') < 0;
  return riding ? <SpeedLines x={p.heroX - 80} t={p.t} ys={SPEED_YS} /> : null;
}

// ---------- Level 10: bramble vault ----------
// grow (thorny brambles grow into a wall) → grab (he picks up a sapling pole)
// → plant (he plants it and vaults) → land.

const BRAMBLE_STEMS = Array.from({ length: 9 }, (_, i) => ({
  x: BRAMBLE.wall[0] + ((BRAMBLE.wall[1] - BRAMBLE.wall[0]) * (i + 0.5)) / 9,
  h: 0.7 + 0.3 * noise(i, 2),
  lean: (noise(i, 4) - 0.5) * 60,
}));

function Brambles({ height, t }: { height: number; t: number }) {
  return (
    <g>
      {BRAMBLE_STEMS.map((s, i) => {
        const h = height * s.h;
        const sway = Math.sin(t / 300 + i) * 4;
        const dir = i % 2 ? 1 : -1;
        const top = { x: s.x + s.lean * (h / BRAMBLE.wallHeight) + sway, y: -h };
        // An S-shaped, curling stem.
        const d = `M${s.x} 4 C${s.x + dir * 40} ${-h * 0.3} ${top.x - dir * 50} ${-h * 0.65} ${top.x} ${top.y} q ${dir * 22} -4 ${dir * 16} 16`;
        const at = (f: number) => ({
          x: lerp(s.x, top.x, f) + dir * 26 * Math.sin(Math.PI * 2 * f),
          y: lerp(0, top.y, f),
        });
        return (
          <g key={i}>
            <path d={d} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
            <path d={d} stroke="#5d6b28" strokeWidth={9} fill="none" strokeLinecap="round" />
            {[0.18, 0.34, 0.5, 0.66, 0.82].map((f, j) => {
              const pt = at(f);
              const side = j % 2 ? 1 : -1;
              return (
                <path
                  key={f}
                  d={`M${pt.x} ${pt.y - 4} l${side * 14} -6 l${-side * 12} 10 Z`}
                  fill="#f0e6c8"
                  {...ink(1.5)}
                />
              );
            })}
            {h > 80 && (
              <path
                transform={`translate(${at(0.45).x} ${at(0.45).y}) rotate(${dir * 30})`}
                d="M0 0 Q14 -12 26 0 Q14 10 0 0 Z"
                fill="#4f7a2e"
                {...ink(1.5)}
              />
            )}
            {h > 60 && (
              <g fill="#b03a5a" {...ink(1.5)}>
                <circle cx={top.x} cy={top.y} r={7} />
                <circle cx={top.x + 9} cy={top.y + 6} r={5} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** When the vault carries him past the pole's foot (he lets go there). */
function releaseTime(p: ObstacleProps, plantAt: number) {
  for (let t = plantAt; t < plantAt + 2000; t += 16) {
    if (p.heroAt(t).x >= BRAMBLE.plant + 10) return t;
  }
  return plantAt + 2000;
}

function Pole({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const d = `M${x1} ${y1} L${x2} ${y2}`;
  return (
    <g strokeLinecap="round" fill="none">
      <path d={d} stroke={INK} strokeWidth={12} />
      <path d={d} stroke={WOOD} strokeWidth={7} />
      <circle cx={x2} cy={y2} r={9} fill={LEAF} {...ink(2)} />
    </g>
  );
}

export function BrambleBack(p: ObstacleProps) {
  const grow = easeOut(progress(p, 'grow', 1100));
  const height = 50 + (BRAMBLE.wallHeight - 50) * grow;
  return (
    <g>
      <Brambles height={height} t={p.t} />
      <Dust x={(BRAMBLE.wall[0] + BRAMBLE.wall[1]) / 2} y={-6} dt={since(p, 'grow')} ms={900} />
    </g>
  );
}

export function BrambleFront(p: ObstacleProps) {
  const grabAt = eventTime(p.events, 'grab');
  const plantAt = eventTime(p.events, 'plant');
  const len = BRAMBLE.poleLength;
  const hands = { x: p.heroX + 14, y: -(p.heroLift + 118) };
  if (p.t < grabAt)
    return <Pole x1={BRAMBLE.pole - len / 2} y1={-6} x2={BRAMBLE.pole + len / 2} y2={-8} />;
  if (p.t < plantAt) {
    return <Pole x1={hands.x - 90} y1={hands.y + 14} x2={hands.x + len - 90} y2={hands.y - 20} />;
  }
  const foot = { x: BRAMBLE.plant, y: 0 };
  const releaseAt = releaseTime(p, plantAt);
  let angle: number;
  if (p.t < releaseAt) {
    angle = Math.atan2(hands.x - foot.x, foot.y - hands.y);
  } else {
    // Topples forward onto the brambles.
    const dt = p.t - releaseAt;
    angle = Math.min(Math.PI / 2 - 0.25, 0.1 + 0.000004 * dt * dt);
  }
  return (
    <Pole
      x1={foot.x}
      y1={foot.y}
      x2={foot.x + len * Math.sin(angle)}
      y2={foot.y - len * Math.cos(angle)}
    />
  );
}

// ---------- Level 11: root slide ----------
// crack (the leafy ground gives way) → he slides through the root chute → out.

const COVER = Array.from({ length: 8 }, (_, i) => ({
  x: ROOT_SLIDE.hole[0] + 40 + i * 90,
  delay: Math.abs(i - 1) * 60,
  spin: (noise(i, 7) - 0.5) * 0.5,
}));

function chuteY(x: number) {
  const pts = ROOT_SLIDE.chute;
  for (let i = 1; i < pts.length; i++) {
    const [x0, l0] = pts[i - 1]!;
    const [x1, l1] = pts[i]!;
    if (x <= x1) return -lerp(l0, l1, clamp01((x - x0) / (x1 - x0)));
  }
  return 0;
}

export function RootSlideBack(p: ObstacleProps) {
  const [a, b] = ROOT_SLIDE.hole;
  const crack = since(p, 'crack');
  const open = crack >= 0;
  const chute = ROOT_SLIDE.chute.map(([x, l]) => `${x} ${-l}`).join(' L');
  return (
    <g>
      {open && (
        <g>
          <Hollow a={a} b={b} depth={ROOT_SLIDE.depth} />
          {/* Glowing mushrooms down in the hollow. */}
          {[300, 520, 740].map((x, i) => (
            <g key={x}>
              <Glow x={x} y={chuteY(x) + 40} r={70} color={i % 2 ? '#8af0ff' : '#c8ff8a'} />
              <path
                d={`M${x - 12} ${chuteY(x) + 44} Q${x} ${chuteY(x) + 26} ${x + 12} ${chuteY(x) + 44} Z`}
                fill={i % 2 ? '#8af0ff' : '#c8ff8a'}
                {...ink(2)}
              />
            </g>
          ))}
          {/* The chute: a thick smooth root he slides along. */}
          <path
            d={`M${chute}`}
            stroke={INK}
            strokeWidth={30}
            fill="none"
            strokeLinejoin="round"
            transform="translate(0 15)"
          />
          <path
            d={`M${chute}`}
            stroke={ROOT}
            strokeWidth={24}
            fill="none"
            strokeLinejoin="round"
            transform="translate(0 15)"
          />
          <path
            d={`M${chute}`}
            stroke={tint(ROOT, 0.3)}
            strokeWidth={5}
            fill="none"
            transform="translate(0 8)"
          />
        </g>
      )}
      {/* The leafy ground over the hollow, which falls in when it cracks. */}
      {COVER.map((c, i) => {
        const dt = crack - c.delay;
        const y = fallen(dt, 0.003);
        if (y > 300) return null;
        return (
          <g key={i} transform={`translate(${c.x} ${y}) rotate(${dt > 0 ? c.spin * dt : 0})`}>
            <path d="M-46 -4 L46 -4 L40 14 L-40 14 Z" fill="#4a7a34" {...ink(2.5)} />
            <path
              d="M-40 -4 Q-30 -12 -20 -4 M10 -4 Q20 -14 30 -4"
              stroke="#5e8f45"
              strokeWidth={4}
              fill="none"
            />
          </g>
        );
      })}
      <Dust x={(a + b) / 2 - 200} y={-4} dt={crack} ms={800} color="#8a7050" />
      <LeafBurst x={b} y={-20} dt={since(p, 'out')} count={14} />
    </g>
  );
}

// ---------- Level 12: vine swing ----------
// flood (water roars into the gully) → grab (he swings on a vine) → letgo.

function Water({ a, b, level, t }: { a: number; b: number; level: number; t: number }) {
  const n = 8;
  let top = `M${a} ${level}`;
  for (let i = 1; i <= n; i++) {
    const x = lerp(a, b, i / n);
    top += ` Q${x - (b - a) / n / 2} ${level + 8 * Math.sin(t / 150 + i)} ${x} ${level}`;
  }
  return (
    <g>
      <path d={`${top} L${b} 220 L${a} 220 Z`} fill={WATER} {...ink(3)} />
      <path d={`${top} L${b} ${level + 14} L${a} ${level + 14} Z`} fill={tint(WATER, 0.35)} />
      <g stroke={FOAM} strokeWidth={4} strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => {
          const x = a + (((t * 0.35 + i * 110) % (b - a - 40)) + 20);
          return <path key={i} d={`M${x} ${level + 24 + (i % 2) * 16} h 26`} />;
        })}
      </g>
    </g>
  );
}

export function VineSwingBack(p: ObstacleProps) {
  const { pivot, gully } = VINE_SWING;
  const [a, b] = gully;
  const flood = since(p, 'flood');
  const level = flood < 0 ? 150 : lerp(150, -6, easeOut(clamp01(flood / 900)));
  const end = vineEnd(p);
  const logX = flood < 0 ? -1000 : a - 120 + flood * 0.3;
  return (
    <g>
      <Hollow a={a} b={b} depth={120} />
      <Water a={a + 8} b={b - 8} level={level} t={p.t} />
      {logX > a && logX < b - 60 && (
        <g transform={`translate(${logX} ${level - 4}) rotate(${Math.sin(p.t / 200) * 6})`}>
          <rect x={-60} y={-16} width={120} height={28} rx={14} fill={BARK} {...ink(3)} />
          <ellipse cx={60} cy={-2} rx={8} ry={14} fill="#d9a86a" {...ink(2)} />
        </g>
      )}
      {/* The surge: a tall wall of spray bursting up as the water roars in. */}
      {flood >= 0 && flood < 1200 && (
        <g fill={FOAM} {...ink(2.5)} opacity={1 - flood / 1200}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const x = a + 30 + i * ((b - a - 60) / 5);
            const h = 220 * bump(flood - i * 60, 900) * (0.7 + 0.3 * noise(i, 6));
            return h > 1 ? (
              <path
                key={i}
                d={`M${x - 26} ${level} Q${x - 30} ${level - h * 0.6} ${x} ${level - h} Q${x + 30} ${level - h * 0.6} ${x + 26} ${level} Z`}
              />
            ) : null;
          })}
        </g>
      )}
      {flood >= 0 && flood < 900 && (
        <g fill={FOAM} {...ink(2)} opacity={1 - flood / 900}>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={a + 40 + i * 80}
              cy={level - 20 - ((flood * 0.12 * (1 + noise(i))) % 60)}
              r={10 + noise(i, 3) * 8}
            />
          ))}
        </g>
      )}
      {/* The big branch the vine hangs from. */}
      <path
        d={`M${pivot.x - 420} ${pivot.y - 60} Q${pivot.x - 200} ${pivot.y - 10} ${pivot.x + 120} ${pivot.y - 20}`}
        stroke={INK}
        strokeWidth={34}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${pivot.x - 420} ${pivot.y - 60} Q${pivot.x - 200} ${pivot.y - 10} ${pivot.x + 120} ${pivot.y - 20}`}
        stroke={BARK}
        strokeWidth={27}
        fill="none"
        strokeLinecap="round"
      />
      <g fill={LEAF} {...ink(2.5)}>
        <circle cx={pivot.x + 120} cy={pivot.y - 40} r={40} />
        <circle cx={pivot.x + 70} cy={pivot.y - 64} r={30} />
      </g>
      <path
        d={`M${pivot.x} ${pivot.y} Q${(pivot.x + end.x) / 2 + 12} ${(pivot.y + end.y) / 2} ${end.x} ${end.y}`}
        stroke={INK}
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${pivot.x} ${pivot.y} Q${(pivot.x + end.x) / 2 + 12} ${(pivot.y + end.y) / 2} ${end.x} ${end.y}`}
        stroke="#4f8a2e"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      {[0.3, 0.6].map((f) => (
        <path
          key={f}
          transform={`translate(${lerp(pivot.x, end.x, f)} ${lerp(pivot.y, end.y, f)})`}
          d="M0 0 Q12 -8 18 2 Q8 6 0 0 Z"
          fill={LEAF}
          {...ink(1.5)}
        />
      ))}
    </g>
  );
}

// ---------- Level 13: boar charge ----------
// snort (a boar trots in and paws the ground) → charge → crash (into the bush) → it trots off.

function boarPose(p: ObstacleProps) {
  const snortAt = eventTime(p.events, 'snort');
  const chargeAt = eventTime(p.events, 'charge');
  const crashAt = eventTime(p.events, 'crash');
  const { boarStart, bush } = BOAR;
  if (p.t < snortAt) return null;
  if (p.t < chargeAt) {
    const x = lerp(boarStart, 900, easeOut(clamp01((p.t - snortAt) / 500)));
    return { x, step: Math.sin(p.t / 90), dazed: false, facing: -1 };
  }
  if (p.t < crashAt) {
    return {
      x: lerp(900, bush + 90, (p.t - chargeAt) / (crashAt - chargeAt)),
      step: Math.sin(p.t / 45),
      dazed: false,
      facing: -1,
    };
  }
  const dt = p.t - crashAt;
  // Sits dazed for a moment, then trots off the way it came, a bit sheepish.
  if (dt < 900) return { x: bush + 90 + 10 * bump(dt, 250), step: 0, dazed: true, facing: -1 };
  return { x: bush + 90 + (dt - 900) * 0.5, step: Math.sin(p.t / 70), dazed: false, facing: 1 };
}

function Boar({
  x,
  step,
  dazed,
  facing,
  t,
}: {
  x: number;
  step: number;
  dazed: boolean;
  facing: number;
  t: number;
}) {
  const fur = '#7a5a48';
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      {/* Legs. */}
      {[-40, -18, 22, 44].map((lx, i) => (
        <path
          key={lx}
          d={`M${lx} -30 L${lx + (i % 2 ? step : -step) * 10} -2`}
          stroke={INK}
          strokeWidth={12}
          strokeLinecap="round"
        />
      ))}
      <ellipse cx={0} cy={-62} rx={70} ry={44} fill={fur} {...ink(3.5)} />
      <path d="M-60 -76 Q0 -130 60 -86 Q20 -96 -60 -76 Z" fill={shade(fur, 0.35)} {...ink(2.5)} />
      <ellipse cx={10} cy={-40} rx={46} ry={16} fill={shade(fur, 0.25)} />
      {/* Head, facing left (local −x). */}
      <g transform="translate(-68 -60)">
        <ellipse cx={0} cy={0} rx={34} ry={28} fill={fur} {...ink(3)} />
        <path d="M-8 -26 L0 -44 L10 -24 Z" fill={shade(fur, 0.3)} {...ink(2)} />
        <ellipse cx={-30} cy={8} rx={14} ry={12} fill="#e8a0a8" {...ink(2.5)} />
        <circle cx={-34} cy={6} r={2.5} fill={INK} />
        <circle cx={-26} cy={6} r={2.5} fill={INK} />
        <path
          d="M-22 18 q-6 10 -14 8"
          stroke="#fff6e0"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
        {dazed ? (
          <path d="M-12 -12 l8 8 m0 -8 l-8 8" stroke={INK} strokeWidth={3} />
        ) : (
          <g>
            <circle cx={-8} cy={-8} r={4} fill={INK} />
            <path d="M-16 -18 L0 -12" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          </g>
        )}
      </g>
      <path d="M68 -70 q16 -6 12 10" stroke={INK} strokeWidth={3} fill="none" />
      {dazed && (
        <g transform={`translate(-68 -120) rotate(${t * 0.3})`} fill="#ffd35a" {...ink(1.5)}>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              transform={`rotate(${i * 120}) translate(26 0)`}
              d="M0 -8 L2.5 -2.5 L8 0 L2.5 2.5 L0 8 L-2.5 2.5 L-8 0 L-2.5 -2.5 Z"
            />
          ))}
        </g>
      )}
    </g>
  );
}

export function BoarChargeBack(p: ObstacleProps) {
  const { tree, branch, bush } = BOAR;
  const crash = since(p, 'crash');
  const shakeBush = 8 * bump(crash, 500) * Math.sin(p.t / 30);
  return (
    <g>
      {/* The tree and the branch he climbs onto. */}
      <path
        d={`M${tree - 40} 6 L${tree - 34} -700 L${tree + 34} -700 L${tree + 40} 6 Z`}
        fill={BARK}
        {...ink(3.5)}
      />
      <path
        d={`M${tree + 8} 6 L${tree + 12} -700 L${tree + 34} -700 L${tree + 40} 6 Z`}
        fill={shade(BARK, 0.35)}
      />
      <path
        d={`M${tree + 20} ${-branch - 30} Q${tree + 120} ${-branch + 6} ${tree + 240} ${-branch - 10}`}
        stroke={INK}
        strokeWidth={30}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${tree + 20} ${-branch - 30} Q${tree + 120} ${-branch + 6} ${tree + 240} ${-branch - 10}`}
        stroke={BARK}
        strokeWidth={23}
        fill="none"
        strokeLinecap="round"
      />
      <g fill={LEAF} {...ink(2.5)}>
        <circle cx={tree + 250} cy={-branch - 40} r={36} />
        <circle cx={tree + 220} cy={-branch - 64} r={26} />
      </g>
      {/* The bush the boar crashes into. */}
      <g transform={`translate(${bush + shakeBush} 0)`} fill={LEAF} {...ink(3)}>
        <circle cx={-40} cy={-50} r={50} />
        <circle cx={30} cy={-60} r={60} />
        <circle cx={-10} cy={-100} r={46} />
        <circle cx={10} cy={-80} r={24} fill={tint(LEAF, 0.2)} stroke="none" />
      </g>
      <LeafBurst x={bush + 20} y={-90} dt={crash} count={14} />
    </g>
  );
}

export function BoarChargeFront(p: ObstacleProps) {
  const boar = boarPose(p);
  if (!boar) return null;
  const snort = since(p, 'snort');
  const charge = since(p, 'charge');
  return (
    <g>
      {charge < 0 && (
        <Dust x={boar.x + 50} y={-4} dt={(snort % 600) - 100} ms={400} size={0.5} color="#8a7050" />
      )}
      {charge >= 0 && since(p, 'crash') < 0 && (
        <g transform={`translate(${boar.x + 90} 0) scale(-1 1)`}>
          <SpeedLines x={0} t={p.t} ys={[-30, -60, -90]} />
        </g>
      )}
      <Boar {...boar} t={p.t} />
    </g>
  );
}

// ---------- Level 14: mushroom bounce ----------
// bubble (the path turns to bubbling mud) → b1..b3 (he bounces off each mushroom).

export function MushroomBounceBack(p: ObstacleProps) {
  const [a, b] = MUSHROOMS.bog;
  const bubble = since(p, 'bubble');
  const mud = '#6b4a2e';
  const rise = bubble < 0 ? 0 : easeOut(clamp01(bubble / 700));
  return (
    <g>
      <path
        d={`M${a} -2 Q${a + 30} ${-12 * rise} ${a + 80} ${-10 * rise} L${b - 80} ${-10 * rise} Q${b - 30} ${-12 * rise} ${b} -2 L${b} 40 L${a} 40 Z`}
        fill={mud}
        {...ink(3)}
      />
      <path d={`M${a + 60} ${4 - 10 * rise} H${b - 60}`} stroke={tint(mud, 0.25)} strokeWidth={4} />
      {bubble >= 0 &&
        Array.from({ length: 7 }, (_, i) => {
          const cycle = (bubble + i * 170) % 900;
          const x = a + 80 + i * ((b - a - 160) / 6);
          const r = 6 + cycle * 0.012;
          return cycle < 700 ? (
            <circle
              key={i}
              cx={x}
              cy={-10 * rise - r * 0.6}
              r={r}
              fill={tint(mud, 0.3)}
              {...ink(2)}
            />
          ) : null;
        })}
      {MUSHROOMS.caps.map((x, i) => {
        const dt = since(p, `b${i + 1}`);
        const squash = bump(dt, 300);
        const top = -MUSHROOMS.capTop + 16 * squash;
        const color = ['#e0503c', '#e8743b', '#c04a8a'][i]!;
        return (
          <g key={x}>
            <path
              d={`M${x - 16} 20 L${x - 12} ${top + 6} L${x + 12} ${top + 6} L${x + 16} 20 Z`}
              fill="#f3e6cf"
              {...ink(3)}
            />
            <g
              transform={`translate(${x} ${top}) scale(${1 + 0.18 * squash} ${1 - 0.18 * squash})`}
            >
              <path
                d="M-80 16 Q-78 -58 0 -62 Q78 -58 80 16 Q0 4 -80 16 Z"
                fill={color}
                {...ink(3.5)}
              />
              <path d="M20 -58 Q72 -50 80 16 Q50 8 30 8 Z" fill={shade(color, 0.3)} />
              <g fill="#fff6e0" {...ink(1.5)}>
                <circle cx={-40} cy={-24} r={11} />
                <circle cx={0} cy={-42} r={9} />
                <circle cx={36} cy={-18} r={10} />
              </g>
            </g>
            {dt >= 0 && dt < 700 && (
              <g fill="#fff6c8" opacity={1 - dt / 700}>
                {[0, 1, 2, 3, 4].map((j) => (
                  <circle
                    key={j}
                    cx={x + (j - 2) * 30 + (j - 2) * dt * 0.05}
                    cy={top - 70 - dt * 0.08 * (1 + noise(j + i))}
                    r={4}
                  />
                ))}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

// ---------- Level 15: falling bridge ----------
// creak → collapse (the planks drop one by one behind him as he runs).

/** The hero's running speed across the bridge (matches the script). */
const BRIDGE_RUN = 0.78;

function plankFallAt(p: ObstacleProps, x: number) {
  const collapseAt = eventTime(p.events, 'collapse');
  const start = p.heroAt(collapseAt).x - FALLING_BRIDGE.lag;
  const [a] = FALLING_BRIDGE.ravine;
  // Planks already behind him go in a quick cascade; the rest as he runs past.
  if (x <= start) return collapseAt + ((x - a) / Math.max(1, start - a)) * 250;
  return collapseAt + 250 + (x - start) / BRIDGE_RUN;
}

export function FallingBridgeBack(p: ObstacleProps) {
  const [a, b] = FALLING_BRIDGE.ravine;
  const planks = [];
  for (let x = a + 4; x < b - 4; x += FALLING_BRIDGE.plank) planks.push(x);
  const creak = since(p, 'creak');
  const wobble = creak >= 0 ? 3 * Math.sin(p.t / 40) * Math.exp(-Math.max(0, creak) / 600) : 0;
  const collapseAt = eventTime(p.events, 'collapse');
  const front = p.t < collapseAt ? a : Math.min(b, p.heroX - FALLING_BRIDGE.lag);
  return (
    <g>
      <path
        d={`M${a - 16} -4 L${a} 16 L${a + 30} 220 L${b - 30} 220 L${b} 16 L${b + 16} -4 Z`}
        fill="#1e2a22"
        {...ink(3)}
      />
      <path d={`M${a + 60} 220 Q${(a + b) / 2} 120 ${b - 60} 220 Z`} fill="#2e4a36" />
      {[a - 10, b + 10].map((x) => (
        <g key={x}>
          <rect x={x - 9} y={-90} width={18} height={96} rx={4} fill={BARK} {...ink(3)} />
        </g>
      ))}
      {planks.map((x, i) => {
        const dt = p.t - plankFallAt(p, x);
        const y = fallen(dt, 0.0028) + wobble * Math.sin(i);
        if (y > 300) return null;
        return (
          <g
            key={x}
            transform={`translate(${x + 22} ${y}) rotate(${dt > 0 ? (noise(i) - 0.5) * dt * 0.4 : 0})`}
          >
            <rect x={-22} y={-6} width={44} height={12} rx={2} fill={WOOD} {...ink(2.5)} />
            <path d="M-18 -1 H18" stroke={shade(WOOD, 0.3)} strokeWidth={2} />
          </g>
        );
      })}
      {/* The rope rail: taut from the break to the far post, dangling from the near one. */}
      <path
        d={`M${front} -70 Q${(front + b) / 2} -40 ${b + 10} -84`}
        stroke="#c9a66b"
        strokeWidth={5}
        fill="none"
        {...{ strokeLinecap: 'round' }}
      />
      {p.t >= collapseAt && (
        <path
          d={`M${a - 10} -84 q 20 60 6 ${140 + 20 * Math.sin(p.t / 300)}`}
          stroke="#c9a66b"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {p.t < collapseAt && (
        <path
          d={`M${a - 10} -84 Q${(a + b) / 2} -40 ${b + 10} -84`}
          stroke="#c9a66b"
          strokeWidth={5}
          fill="none"
        />
      )}
    </g>
  );
}

// ---------- Level 16 (boss): follow the fireflies ----------
// dusk (night falls, fog rolls in) → fireflies (they gather; roots rise across the path)
// → dawn (he bursts into a moonlit clearing).

const FLIES = Array.from({ length: 16 }, (_, i) => ({ i, ph: noise(i, 9) * 6.28 }));

function Firefly({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g>
      <Glow x={x} y={y} r={30 * s} color="#f4ff8a" />
      <circle cx={x} cy={y} r={4 * s} fill="#fbffc8" />
    </g>
  );
}

export function FirefliesBack(p: ObstacleProps) {
  const { hump, arch, archClear, gap } = FIREFLIES;
  const dark = clamp01(since(p, 'dusk') / 900) - clamp01(since(p, 'dawn') / 800);
  const rise = easeOut(progress(p, 'fireflies', 700));
  const rootLine = { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const };
  return (
    <g>
      <rect x={-600} y={-900} width={3200} height={1200} fill="#0b1330" opacity={0.55 * dark} />
      {/* Fog along the ground. */}
      <g fill="#dfe8ff" opacity={0.25 * dark}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx={-200 + i * 380 + ((p.t * 0.02) % 380)} cy={-20} rx={260} ry={40} />
        ))}
      </g>
      {/* A root hump to jump, a root arch to slide under, and a gap. */}
      {rise > 0 && (
        <path
          d={`M${hump - 100} 6 Q${hump} ${-150 * rise} ${hump + 100} 6 Z`}
          fill={ROOT}
          {...rootLine}
        />
      )}
      {rise > 0 && (
        <g transform={`translate(0 ${(1 - rise) * 260})`}>
          <path
            d={`M${arch - 150} 6 Q${arch - 120} ${-archClear - 90} ${arch} ${-archClear - 60} Q${arch + 120} ${-archClear - 90} ${arch + 150} 6 L${arch + 110} 6 Q${arch + 90} ${-archClear - 10} ${arch} ${-archClear} Q${arch - 90} ${-archClear - 10} ${arch - 110} 6 Z`}
            fill={ROOT}
            {...rootLine}
          />
        </g>
      )}
      <path
        d={`M${gap[0] - 14} -4 L${gap[0]} 30 L${gap[0] + 20} 220 L${gap[1] - 20} 220 L${gap[1]} 30 L${gap[1] + 14} -4 Z`}
        fill="#0c0a14"
        {...ink(3)}
      />
      {[gap[0] + 40, gap[1] - 40].map((x, i) => (
        <path
          key={x}
          d={`M${x} 10 q ${i ? -20 : 20} 60 ${i ? 10 : -10} 140`}
          stroke={ROOT}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {/* The moon comes out when he reaches the clearing. */}
      <g opacity={clamp01(since(p, 'dawn') / 800)}>
        <Glow x={1900} y={-560} r={180} color="#fff6d0" />
        <circle cx={1900} cy={-560} r={52} fill="#fff6d0" {...ink(3)} />
      </g>
      <Dust x={arch} y={-4} dt={since(p, 'fireflies')} ms={900} color="#5a4a3a" />
    </g>
  );
}

export function FirefliesFront(p: ObstacleProps) {
  const dusk = since(p, 'dusk');
  const flies = since(p, 'fireflies');
  const dawn = since(p, 'dawn');
  if (dusk < 0) return null;
  return (
    <g>
      {FLIES.map(({ i, ph }) => {
        // Scattered in the dark, then streaming ahead of him as a glowing trail,
        // then swirling up around him in the clearing.
        const wander = {
          x: -200 + i * 130 + 30 * Math.sin(p.t / 700 + ph),
          y: -260 - 80 * Math.sin(p.t / 500 + ph),
        };
        const trail = {
          x: p.heroX + 140 + i * 60 + 12 * Math.sin(p.t / 260 + ph),
          y: -90 - 50 * Math.sin(i * 0.6 + p.t / 400),
        };
        const k = easeOut(clamp01(flies / 900));
        let x = lerp(wander.x, trail.x, k);
        let y = lerp(wander.y, trail.y, k);
        if (dawn >= 0) {
          const a = ph + dawn / 500 + (i / FLIES.length) * 6.28;
          const r = 90 + dawn * 0.12;
          const s = clamp01(dawn / 600);
          x = lerp(x, p.heroX + Math.cos(a) * r, s);
          y = lerp(y, -120 + Math.sin(a) * r * 0.6 - dawn * 0.08, s);
        }
        const fade = dawn > 1400 ? Math.max(0, 1 - (dawn - 1400) / 600) : 1;
        return (
          <g key={i} opacity={fade}>
            <Firefly x={x} y={y} s={0.8 + noise(i) * 0.5} />
          </g>
        );
      })}
    </g>
  );
}
