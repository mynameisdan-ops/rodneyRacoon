import { memo } from 'react';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { clamp01, fallen, heroPasses, lerp, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { SPRAY, SPRAY_SHADE, BARK, HEART } from './kit';
import { DAM } from './layout';
import { River, Bank, Splash } from './parts';

// ---------- Level 18: beaver dam ----------
// crack (water spurts through) → burst (logs pop out behind him as he runs the top).

const MUD = '#7a5436';
const STICK = '#ad7c4c';
const FUR = '#9c6238';
const MUZZLE = '#e9be88';
const TAIL = '#5b3b2c';
const DAM_TOP = -DAM.top + 18;

/** The dam's outline: a heap of sticks and mud from bank to bank, flat on top. */
const DAM_EDGE = `M${DAM.dam[0] - 56} 70 Q${DAM.dam[0] - 44} 14 ${DAM.dam[0] - 8} ${DAM_TOP} H${DAM.dam[1] + 8} Q${DAM.dam[1] + 44} 14 ${DAM.dam[1] + 56} 70 Z`;

/** Sticks woven through the dam, as one path of strokes (a few elements, cheap every frame). */
const DAM_STICKS = (() => {
  const [a, b] = DAM.dam;
  let d = '';
  let i = 0;
  for (let y = DAM_TOP + 12; y < 60; y += 18) {
    const f = (y - DAM_TOP) / (70 - DAM_TOP);
    const left = a - 8 - 48 * f + 14;
    const right = b + 8 + 48 * f - 14;
    for (let x = left + noise(i, 3) * 24; x < right - 20; x += 52 + noise(i, 5) * 34) {
      const ang = ((noise(i, 9) - 0.5) * 50 * Math.PI) / 180;
      const l = (30 + noise(i, 11) * 26) / 2;
      const yy = y + (noise(i, 7) - 0.5) * 6;
      d += `M${(x - Math.cos(ang) * l).toFixed(1)} ${(yy - Math.sin(ang) * l).toFixed(1)} L${(x + Math.cos(ang) * l).toFixed(1)} ${(yy + Math.sin(ang) * l).toFixed(1)} `;
      i++;
    }
  }
  return d;
})();

const DamBody = memo(function DamBody() {
  const [a, b] = DAM.dam;
  return (
    <g>
      <path d={DAM_EDGE} fill={MUD} {...ink(OUT)} />
      <path
        d={`M${a - 56} 70 Q${a - 44} 14 ${a - 8} ${DAM_TOP} L${a + 26} ${DAM_TOP} Q${a - 14} 14 ${a - 22} 70 Z`}
        fill={shade(MUD, 0.3)}
      />
      <g fill={tint(MUD, 0.18)}>
        {[0.12, 0.3, 0.52, 0.7, 0.88].map((f, i) => (
          <ellipse key={f} cx={lerp(a, b, f)} cy={DAM_TOP + 30 + (i % 2) * 22} rx={34} ry={9} />
        ))}
      </g>
      <path d={DAM_STICKS} stroke={INK} strokeWidth={9.4} strokeLinecap="round" fill="none" />
      <path d={DAM_STICKS} stroke={STICK} strokeWidth={6} strokeLinecap="round" fill="none" />
      <path
        d={DAM_STICKS}
        transform="translate(0.8 -1.4)"
        stroke={tint(STICK, 0.45)}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${b - 30} ${DAM_TOP + 3} H${b + 6} Q${b + 38} 14 ${b + 48} 56`}
        stroke={tint(MUD, 0.45)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      {/* The beavers' doorways. */}
      {DAM.beavers.map((x) => (
        <ellipse key={x} cx={x} cy={12} rx={30} ry={22} fill="#2a1912" {...ink(IN + 0.5)} />
      ))}
    </g>
  );
});

/** One of the walkway logs on top of the dam, its top at y -9 (side on, its end to the right). */
const DamLog = memo(function DamLog() {
  return (
    <g>
      <rect x={-24} y={-9} width={48} height={18} rx={8} fill={BARK} {...ink(OUT - 0.6)} />
      <path d="M-24 2 Q-23 9 -16 9 H16 Q23 9 24 2 Z" fill={shade(BARK, 0.3)} />
      <path d="M-18 -5 H14" stroke={tint(BARK, 0.4)} strokeWidth={2.2} strokeLinecap="round" />
      <path
        d="M-12 2 h10 M5 0 h7"
        stroke={shade(BARK, 0.45)}
        strokeWidth={IN}
        strokeLinecap="round"
      />
      <ellipse cx={22} cy={0} rx={5.5} ry={8.5} fill={HEART} {...ink(IN)} />
      <ellipse
        cx={22}
        cy={0}
        rx={2.4}
        ry={4}
        fill="none"
        stroke={shade(HEART, 0.35)}
        strokeWidth={1}
      />
    </g>
  );
});

function logBurstAt(p: ObstacleProps, x: number) {
  const burstAt = eventTime(p.events, 'burst');
  const start = p.heroAt(burstAt).x - DAM.lag;
  const [a] = DAM.dam;
  if (x <= start) return burstAt + ((x - a) / Math.max(1, start - a)) * 200;
  return Math.max(burstAt + 200, heroPasses(p, x + DAM.lag, burstAt));
}

/** A beaver's body (facing us): a paddle tail, a round tummy, big eyes and buck teeth. */
const BeaverBody = memo(function BeaverBody() {
  return (
    <g>
      <g transform="rotate(-28 -14 12)">
        <ellipse cx={-36} cy={12} rx={20} ry={9} fill={TAIL} {...ink(OUT - 0.6)} />
        <path
          d="M-50 8 L-24 16 M-48 15 L-26 8 M-40 5 L-32 19"
          stroke={shade(TAIL, 0.45)}
          strokeWidth={1.2}
        />
      </g>
      <path d="M-22 14 Q-26 -16 0 -20 Q26 -16 22 14 Q0 24 -22 14 Z" fill={FUR} {...ink(OUT)} />
      <path d="M-22 14 Q-26 -6 -16 -14 Q-20 4 -10 18 Q-16 18 -22 14 Z" fill={shade(FUR, 0.3)} />
      <ellipse cx={1} cy={4} rx={11} ry={11} fill={MUZZLE} />
      <path d="M-16 8 q4 6 10 4" stroke={shade(FUR, 0.35)} strokeWidth={IN} fill="none" />
      <circle cx={-14} cy={-38} r={6} fill={FUR} {...ink(IN + 0.5)} />
      <circle cx={14} cy={-38} r={6} fill={FUR} {...ink(IN + 0.5)} />
      <circle cx={-14} cy={-38} r={2.6} fill={shade(FUR, 0.45)} />
      <circle cx={14} cy={-38} r={2.6} fill={shade(FUR, 0.45)} />
      <ellipse cx={0} cy={-25} rx={20} ry={17} fill={FUR} {...ink(OUT)} />
      <path
        d="M-20 -23 Q-20 -37 -6 -41 Q-16 -31 -14 -13 Q-20 -15 -20 -23 Z"
        fill={shade(FUR, 0.25)}
      />
      <path
        d="M10 -39 Q18 -35 19 -27"
        stroke={tint(FUR, 0.5)}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={0} cy={-17} rx={11} ry={8} fill={MUZZLE} {...ink(IN)} />
      <ellipse cx={0} cy={-22} rx={4.4} ry={3} fill="#3a2418" />
      <circle cx={1.4} cy={-23} r={1.1} fill="#ffffff" />
      <path d="M-3.4 -13 h6.8 v6 q-3.4 2 -6.8 0 Z" fill="#fff8ea" {...ink(1.1)} />
      <path d="M0 -13 V-7" stroke={INK} strokeWidth={0.9} />
      {[-8, 8].map((ex) => (
        <g key={ex}>
          <ellipse cx={ex} cy={-29} rx={3.6} ry={4.4} fill="#2a1a20" />
          <circle cx={ex + 1.2} cy={-30.6} r={1.5} fill="#ffffff" />
          <circle cx={ex - 1} cy={-27.4} r={0.7} fill="#ffffff" />
        </g>
      ))}
      <ellipse cx={-13} cy={-18} rx={3} ry={1.8} fill="#ff9aa8" opacity={0.65} />
      <ellipse cx={13} cy={-18} rx={3} ry={1.8} fill="#ff9aa8" opacity={0.65} />
      <path
        d="M-16 -4 Q-24 2 -22 10"
        stroke={INK}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M-16 -4 Q-24 2 -22 10"
        stroke={FUR}
        strokeWidth={4.6}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
});

/** A beaver peeking out of its doorway: it waves hello, then dives out of the way. */
function Beaver({ x, y, wave }: { x: number; y: number; wave: number }) {
  return (
    <g transform={`translate(${x} ${y.toFixed(1)})`}>
      <BeaverBody />
      <g transform={`rotate(${(-20 + wave * 28).toFixed(1)} 16 -6)`}>
        <path
          d="M16 -6 Q26 -14 30 -28"
          stroke={INK}
          strokeWidth={8.4}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M16 -6 Q26 -14 30 -28"
          stroke={FUR}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
        <circle cx={30} cy={-29} r={4.2} fill={MUZZLE} {...ink(IN)} />
      </g>
    </g>
  );
}

export function BeaverDamBack(p: ObstacleProps) {
  const [a, b] = DAM.dam;
  const crack = since(p, 'crack');
  const burst = since(p, 'burst');
  const logs = [];
  for (let x = a + 20; x < b - 10; x += 46) logs.push(x);
  return (
    <g>
      <Bank x={a - 40} dir={1} level={40} />
      <Bank x={b + 40} dir={-1} level={40} />
      <DamBody />
      {/* The beavers wave hello, then dive out of the way. */}
      {DAM.beavers.map((x, i) => {
        const dive = burst - i * 80;
        const y = dive < 0 ? 22 - 20 * clamp01((p.heroX - a - 20) / 120) : 22 + dive * 0.25;
        return y < 90 ? <Beaver key={x} x={x} y={y} wave={Math.sin(p.t / 120 + i)} /> : null;
      })}
      {/* Water spurting out through the cracks, then gushing once it bursts. */}
      {crack >= 0 &&
        [0.25, 0.5, 0.75].map((f, i) => {
          const x = lerp(a, b, f) + 40;
          const h =
            (30 + 50 * clamp01(crack / 600)) *
            (1 + (burst > 0 ? 1.5 : 0)) *
            (0.8 + 0.2 * Math.sin(p.t / 70 + i));
          const y0 = -DAM.top + 30;
          return (
            <g key={f}>
              <path
                d={`M${x - 8} ${y0} Q${x + h * 0.6} ${y0 - 10} ${x + h} 44 L${x + h - 24} 44 Q${x + h * 0.4} ${y0 + 14} ${x - 8} ${y0 + 14} Z`}
                fill={SPRAY}
                {...ink(IN + 0.4)}
              />
              <path
                d={`M${x} ${y0 + 4} Q${x + h * 0.55} ${y0 - 4} ${x + h - 8} 36`}
                stroke={SPRAY_SHADE}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      {logs.map((x, i) => {
        const dt = p.t - logBurstAt(p, x);
        const y = -DAM.top + 9 + fallen(dt, 0.002) - (dt > 0 ? dt * 0.35 : 0);
        if (y > 260) return null;
        const r = dt > 0 ? (noise(i) - 0.5) * dt * 0.5 : (i % 3) * 3;
        return (
          <g key={x} transform={`translate(${x} ${y.toFixed(1)}) rotate(${r.toFixed(1)})`}>
            <DamLog />
          </g>
        );
      })}
      <River a={a - 40} b={b + 40} level={40} t={p.t} white={clamp01(burst / 600)} shore={false} />
      <Splash x={(a + b) / 2} y={30} dt={burst} size={1.4} />
    </g>
  );
}
