import { memo, useId } from 'react';
import { Dust, Glow, SpeedLines } from '../../fx';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { SnowPine } from '../../worlds/mountain';
import { bump, circles, clamp01, lerp, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { BARK, P, SNOW } from './kit';
import { PEAK } from './layout';
import { Blizzard, Crevasse, SnowBurst } from './parts';

// ---------- Level 32 (boss): over the peak ----------
// storm (up the slope in a blizzard; lightning strikes by the summit) → sled (he hops on at the
// top) → jump (off the snow ramp over the crevasse) → land (the storm clears) → off.

const RED = '#d8402e';

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

const [C0, C1] = PEAK.crevasse;

/** The mountain's shoulder (painted): up to the peak, the long run down, the ramp, the far side. */
const Shoulder = memo(function Shoulder() {
  const id = useId();
  const profile = PEAK.profile.map(([x, l]) => `L${x} ${-l}`).join(' ');
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={-240} x2="0" y2={40}>
          <stop offset="0" stopColor={P.snowTop} />
          <stop offset="1" stopColor={P.snowLow} />
        </linearGradient>
      </defs>
      <path
        d={`M-600 40 L-600 0 ${profile} L${C0 - 70} 0 Q${C0 - 30} -2 ${C0} -26 L${C0} 240 L-600 240 Z`}
        fill={`url(#${id})`}
      />
      {/* Blue shadow down the far side of the peak, and the lit crest. */}
      <path d={`M480 -220 L1500 0 L1100 0 Q800 -60 480 -200 Z`} fill={P.snowBlue} opacity={0.55} />
      <path
        d={`M-600 0 ${profile} L${C0 - 70} 0 Q${C0 - 30} -2 ${C0} -26`}
        stroke="#ffffff"
        strokeWidth={5}
        fill="none"
        strokeLinejoin="round"
      />
      {/* Rocks poking out of the snow, and the summit's cairn with its pennant. */}
      {[
        [180, 0.7],
        [700, 0.9],
        [1150, 0.6],
      ].map(([x, s]) => (
        <g key={x} transform={`translate(${x} ${-groundLift(x!) + 6}) scale(${s})`}>
          <path d="M-40 0 Q-36 -34 -4 -42 Q30 -44 40 -8 L40 0 Z" fill={P.stone} />
          <path d="M8 -44 Q30 -40 40 -8 L40 0 L14 0 Q20 -26 8 -44 Z" fill={P.stoneDark} />
          <path
            d="M-34 -20 Q-26 -42 6 -44 Q26 -42 32 -30 Q10 -34 -6 -28 Q-20 -24 -34 -20 Z"
            fill={P.snowTop}
          />
        </g>
      ))}
      <g transform="translate(420 -220)">
        {[
          [0, 0, 22],
          [2, -18, 17],
          [-2, -32, 12],
        ].map(([x, y, r], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y! - r! * 0.4} rx={r} ry={r! * 0.6} fill={P.stone} />
            <ellipse
              cx={x! + 4}
              cy={y! - r! * 0.55}
              rx={r! * 0.6}
              ry={r! * 0.3}
              fill={tint(P.stone, 0.3)}
            />
          </g>
        ))}
        <path d="M0 -40 V-110" stroke="#5a4636" strokeWidth={4} />
        <path d="M2 -110 L44 -100 L2 -88 Z" fill={RED} />
      </g>
      <SnowPine x={-260} y={-2} h={90} />
      <SnowPine x={1340} y={-groundLift(1340)} h={70} flip />
      {/* The far side of the crevasse. */}
      <path d={`M${C1} -26 Q${C1 + 30} -2 ${C1 + 70} 0 H2700 V240 H${C1} Z`} fill={`url(#${id})`} />
      <path
        d={`M${C1} -26 Q${C1 + 30} -2 ${C1 + 70} 0 H2700`}
        stroke="#ffffff"
        strokeWidth={5}
        fill="none"
      />
      <SnowPine x={C1 + 420} y={-2} h={80} />
    </g>
  );
});

/** The sled (lined): a red toboggan with curled runners, its feet at (0, 0). */
const Sled = memo(function Sled() {
  return (
    <g>
      <path
        d="M-74 -4 H62 Q90 -4 88 -34"
        stroke={INK}
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M-74 -4 H62 Q90 -4 88 -34"
        stroke="#c9ced8"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      <path d="M-50 -12 V-4 M30 -12 V-4" stroke={INK} strokeWidth={6} />
      <path d="M-50 -12 V-4 M30 -12 V-4" stroke={shade(RED, 0.3)} strokeWidth={3} />
      <path
        d="M-70 -28 H58 Q74 -28 74 -18 Q74 -12 60 -12 H-70 Q-76 -12 -76 -20 Q-76 -28 -70 -28 Z"
        fill={RED}
        {...ink(OUT)}
      />
      <path d="M-70 -18 H60 Q70 -18 72 -14 Q66 -12 60 -12 H-70 Z" fill={shade(RED, 0.3)} />
      <path d="M-62 -24 H50" stroke={tint(RED, 0.5)} strokeWidth={3} strokeLinecap="round" />
      <path d="M-30 -28 V-12 M10 -28 V-12" stroke={shade(RED, 0.4)} strokeWidth={IN} />
      <path
        d="M66 -26 Q84 -40 78 -54"
        stroke={BARK}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

/** Where the sled is: waiting at the summit, under him once he's on it, then where it stopped. */
function sledPose(p: ObstacleProps) {
  const sledAt = eventTime(p.events, 'sled');
  const offAt = eventTime(p.events, 'off');
  let x = PEAK.sled;
  let lift = groundLift(x);
  const ride = p.t >= sledAt && p.t < offAt && p.heroX >= PEAK.sled - 2;
  if (ride) {
    x = p.heroX;
    lift = p.heroLift - PEAK.seat;
  } else if (p.t >= offAt) {
    x = Math.min(p.heroAt(offAt).x, PEAK.stop);
    lift = groundLift(x);
  }
  const onSlope = x > PEAK.profile[2][0] && x < PEAK.profile[3][0] && lift - groundLift(x) < 4;
  return { x, lift, slope: onSlope ? 12 : 0, ride };
}

/** A bank of storm cloud from the top down to `y`, its underside billowing in bumps `w` wide. */
function cloudBank(y: number, w: number, drift: number, edgeOnly = false) {
  const x0 = -800 - (drift % w);
  let d = edgeOnly ? `M${x0} ${y}` : `M${x0} -1000 V${y}`;
  for (let x = x0; x < 2800; x += w) {
    const i = Math.round((x - x0) / w);
    const dip = y + w * (0.35 + 0.15 * noise(i, 4));
    d += ` Q${(x + w / 2).toFixed(1)} ${dip.toFixed(1)} ${(x + w).toFixed(1)} ${y}`;
  }
  return edgeOnly ? d : `${d} V-1000 Z`;
}

/** The storm's strength 0..1: it gathers at 'storm' and clears after 'land'. */
const stormOf = (p: ObstacleProps) =>
  clamp01(since(p, 'storm') / 900) - clamp01((since(p, 'land') - 100) / 1100);

export function PeakBack(p: ObstacleProps) {
  const storm = stormOf(p);
  const sun = clamp01((since(p, 'land') - 200) / 1000);
  return (
    <g>
      {/* The sun breaking through once the storm has passed. */}
      {sun > 0 && (
        <g opacity={sun}>
          <g fill="#fff8d0" opacity={0.35}>
            {[-40, -20, 0, 20, 40].map((a) => (
              <path
                key={a}
                d="M0 0 L-30 900 L30 900 Z"
                transform={`translate(1950 -620) rotate(${a + 10})`}
              />
            ))}
          </g>
          <Glow x={1950} y={-620} r={260} color="#fff3b0" />
        </g>
      )}
      <Shoulder />
      <Crevasse a={C0} b={C1} />
      {/* The storm's clouds rolling over, darkening the scene. */}
      {storm > 0 && (
        <g>
          <rect
            x={-700}
            y={-900}
            width={3600}
            height={1200}
            fill="#2a3256"
            opacity={0.42 * storm}
          />
          <g opacity={storm}>
            <path d={cloudBank(-560, 150, p.t * 0.03)} fill="#363e6a" />
            <path d={cloudBank(-610, 110, p.t * 0.05 + 50)} fill="#525a88" />
            <path
              d={cloudBank(-610, 110, p.t * 0.05 + 50, true)}
              stroke="#8a92c0"
              strokeWidth={4}
              fill="none"
            />
          </g>
        </g>
      )}
    </g>
  );
}

export function PeakFront(p: ObstacleProps) {
  const sled = sledPose(p);
  const storm = stormOf(p);
  const landAt = eventTime(p.events, 'land');
  const sledAt = eventTime(p.events, 'sled');
  const jumpAt = eventTime(p.events, 'jump');
  const flying = p.t >= jumpAt && p.t < landAt;
  const tilt = flying ? -12 + 20 * clamp01((p.t - jumpAt) / (landAt - jumpAt)) : sled.slope;
  // Lightning: a bolt strikes the rock on the slope behind him at 'strike', and flickers in the storm.
  const strike = since(p, 'strike');
  const flash = Math.max(
    bump(strike, 260),
    storm > 0.5 ? bump((since(p, 'storm') % 2300) - 1500, 140) * 0.6 : 0,
  );
  return (
    <g>
      {sled.ride && !flying && p.t > sledAt + 200 && (
        <SpeedLines x={sled.x - 140} t={p.t} ys={[-40, -70, -100]} />
      )}
      <g
        transform={`translate(${sled.x.toFixed(1)} ${(-sled.lift).toFixed(1)}) rotate(${tilt.toFixed(1)})`}
      >
        <Sled />
      </g>
      {/* Snow sprayed up behind the runners. */}
      {sled.ride && !flying && p.t > sledAt + 300 && (
        <path
          d={circles(
            [0, 1, 2, 3].map((i) => {
              const ph = ((p.t + i * 80) % 320) / 320;
              return {
                x: sled.x - 80 - ph * 70,
                y: -sled.lift - 6 - ph * 36 + ph * ph * 30,
                r: 7 + 5 * ph,
              };
            }),
          )}
          fill={SNOW}
          {...ink(IN)}
        />
      )}
      <SnowBurst x={sled.x} y={-sled.lift} dt={p.t - landAt} size={1.1} ms={900} />
      <Dust x={PEAK.stop} y={-4} dt={since(p, 'off')} ms={500} size={0.5} color="#eef4fc" />
      {strike >= 0 && strike < 420 && (
        <g>
          <path
            d="M300 -900 L250 -640 L300 -640 L220 -380 L270 -380 L180 -100"
            stroke={INK}
            strokeWidth={18}
            fill="none"
            strokeLinejoin="round"
          />
          <path
            d="M300 -900 L250 -640 L300 -640 L220 -380 L270 -380 L180 -100"
            stroke="#fff27a"
            strokeWidth={10}
            fill="none"
            strokeLinejoin="round"
          />
          <SnowBurst x={180} y={-96} dt={strike} size={0.9} ms={700} />
        </g>
      )}
      {flash > 0 && (
        <rect x={-700} y={-900} width={3600} height={1200} fill="#ffffff" opacity={0.4 * flash} />
      )}
      <Blizzard t={p.t} strength={storm} x0={-600} x1={2600} />
    </g>
  );
}
