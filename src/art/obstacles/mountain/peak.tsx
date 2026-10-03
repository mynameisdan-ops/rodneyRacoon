import { Dust, Glow, SpeedLines } from '../../fx';
import { INK, ink } from '../../style';
import { bump, clamp01, lerp, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { SNOW, SNOW_SHADE, BARK } from './kit';
import { PEAK } from './layout';
import { Chasm } from './parts';

// ---------- Level 32 (boss): over the peak ----------
// storm → sled (he jumps on at the peak) → land (over the crevasse) → off; the storm clears.

/** Snowflakes blowing sideways across the scene. */
function Blizzard({
  t,
  strength,
  x0 = -400,
  x1 = 2400,
}: {
  t: number;
  strength: number;
  x0?: number;
  x1?: number;
}) {
  if (strength <= 0) return null;
  return (
    <g fill="#ffffff" opacity={0.85 * strength}>
      {Array.from({ length: 40 }, (_, i) => {
        const span = x1 - x0;
        const x = x0 + ((i * 97 + t * (0.5 + noise(i) * 0.4)) % span);
        const y = -700 + ((i * 53 + t * 0.25) % 760);
        return <circle key={i} cx={x} cy={y} r={3 + (i % 3)} />;
      })}
    </g>
  );
}

function groundLift(x: number) {
  const pts = PEAK.profile;
  if (x <= pts[0][0]) return 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, l0] = pts[i - 1]!;
    const [x1, l1] = pts[i]!;
    if (x <= x1) return lerp(l0, l1, (x - x0) / (x1 - x0));
  }
  return 0;
}

function sledPose(p: ObstacleProps) {
  const sledAt = eventTime(p.events, 'sled');
  const offAt = eventTime(p.events, 'off');
  const riding = p.t >= sledAt && p.t < offAt;
  const x = p.t < sledAt ? PEAK.sled : Math.min(p.heroX, PEAK.stop);
  const lift = riding ? p.heroLift - PEAK.seat : groundLift(x);
  const slope = x > 480 && x < 1500 && lift - groundLift(x) < 4 ? 12 : 0;
  return { x, lift, slope, riding };
}

export function PeakBack(p: ObstacleProps) {
  const [c0, c1] = PEAK.crevasse;
  const storm = clamp01(since(p, 'storm') / 900) - clamp01(since(p, 'land') / 1000);
  const flash =
    since(p, 'storm') >= 0 ? Math.max(bump((since(p, 'storm') % 1700) - 900, 160), 0) : 0;
  const profile = PEAK.profile.map(([x, l]) => `${x} ${-l}`).join(' L');
  const sun = clamp01(since(p, 'land') / 1000);
  return (
    <g>
      <rect x={-600} y={-900} width={3400} height={1200} fill="#2a3048" opacity={0.45 * storm} />
      <g opacity={sun}>
        <Glow x={1900} y={-560} r={200} color="#fff3b0" />
        <circle cx={1900} cy={-560} r={50} fill="#fff3b0" {...ink(3)} />
      </g>
      {/* The mountain shoulder: up to the peak, then a long run down. */}
      <path
        d={`M-40 4 L${profile} L${c0 - 60} 0 L${c0} 0 L${c0} 240 L-40 240 Z`}
        fill={SNOW}
        {...ink(3.5)}
      />
      <path
        d={`M100 ${-groundLift(100) + 20} L400 -200 L480 -200 L1300 ${-groundLift(1300) + 16}`}
        stroke={SNOW_SHADE}
        strokeWidth={10}
        fill="none"
      />
      <path d={`M${c0 - 80} 0 L${c0 - 10} -30 L${c0} 0 Z`} fill={SNOW} {...ink(3)} />
      <Chasm a={c0} b={c1} color="#3a5070" />
      <path d={`M${c1} 4 H2600 V240 H${c1} Z`} fill={SNOW} {...ink(3)} />
      <path d={`M${c1} 4 H2600`} stroke={SNOW} strokeWidth={6} />
      {/* A lightning bolt far off, with the flash. */}
      {flash > 0 && (
        <g>
          <rect
            x={-600}
            y={-900}
            width={3400}
            height={1200}
            fill="#ffffff"
            opacity={0.35 * flash}
          />
          <path
            d="M1300 -800 L1250 -640 L1300 -640 L1230 -480"
            stroke="#fff6a0"
            strokeWidth={10}
            fill="none"
            strokeLinejoin="round"
          />
        </g>
      )}
      <Blizzard t={p.t} strength={storm} />
    </g>
  );
}

export function PeakFront(p: ObstacleProps) {
  const sled = sledPose(p);
  const landAt = eventTime(p.events, 'land');
  const sledAt = eventTime(p.events, 'sled');
  const flying = p.t >= eventTime(p.events, 'jump') && p.t < landAt;
  const tilt = flying
    ? -10 +
      20 * clamp01((p.t - eventTime(p.events, 'jump')) / (landAt - eventTime(p.events, 'jump')))
    : sled.slope;
  return (
    <g>
      {sled.riding && !flying && <SpeedLines x={sled.x - 120} t={p.t} ys={[-30, -60, -90]} />}
      <g transform={`translate(${sled.x} ${-sled.lift}) rotate(${tilt})`}>
        <path
          d="M-70 -4 H60 Q86 -4 84 -30"
          stroke={INK}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M-70 -4 H60 Q86 -4 84 -30"
          stroke="#c0392b"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
        <rect x={-66} y={-26} width={124} height={14} rx={4} fill={BARK} {...ink(2.5)} />
        <path d="M-50 -12 V-4 M30 -12 V-4" stroke={INK} strokeWidth={5} />
      </g>
      {sled.riding && p.t >= sledAt && (
        <Dust
          x={sled.x - 60}
          y={-sled.lift}
          dt={(p.t - sledAt) % 400}
          ms={400}
          size={0.4}
          color="#ffffff"
        />
      )}
      <Dust x={sled.x} y={-sled.lift} dt={p.t - landAt} ms={800} size={1.2} color="#ffffff" />
    </g>
  );
}
