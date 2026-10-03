import { Dust, Glow, SparkBurst } from '../../fx';
import { INK, ink, shade, tint } from '../../style';
import { clamp01, easeOut, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { RED_DARK, WOOD } from './kit';
import { HOME } from './layout';

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
