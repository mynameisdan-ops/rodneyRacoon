import { memo, useId } from 'react';
import { ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { SnowPine } from '../../worlds/mountain';
import { clamp01, fallen, heroPasses, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { CLIFF, CLIFF_DARK, CLIFF_SHADE, NS, P, SNOW, STONE } from './kit';
import { LEDGE } from './layout';
import { Icicles, SnowBurst, SnowLedge } from './parts';

// ---------- Level 26: crumbling ledge ----------
// gust (the wind howls along the cliff) → crumble (the ledge breaks away ahead of him, and
// each gap after that opens just before he reaches it) → he leaps them.

const X0 = -500;
const X1 = 1700;

/** How deep the ledge's rock is below the path; open air and a misty valley below that. */
const BAND = 46;

/** The air below the ledge: a misty valley far below, with tiny pines and a frozen river. */
const Abyss = memo(function Abyss() {
  const id = useId();
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}air`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={BAND}
          x2="0"
          y2={240}
        >
          <stop offset="0" stopColor="#9fb4e2" />
          <stop offset="0.5" stopColor="#c8d8f2" />
          <stop offset="1" stopColor="#e8f1fb" />
        </linearGradient>
      </defs>
      <path d={`M${X0} ${BAND - 4} H${X1} V240 H${X0} Z`} fill={`url(#${id}air)`} />
      {/* The far side of the valley, then a forest far below, a frozen river and mist. */}
      <path
        d={`M${X0} 110 Q-200 84 100 100 T700 92 T1300 104 T${X1} 96 V240 H${X0} Z`}
        fill="#b4c6ea"
      />
      <g fill="#8aa2d2">
        {Array.from({ length: 56 }, (_, i) => {
          const x = X0 + 20 + i * 40 + 16 * noise(i, 7);
          const h = 12 + 10 * noise(i, 9);
          const y = 124 + 12 * noise(i, 11);
          return (
            <path key={i} d={`M${x - h * 0.32} ${y} L${x} ${y - h} L${x + h * 0.32} ${y} Z`} />
          );
        })}
      </g>
      <path d={`M${X0} 128 H${X1} V240 H${X0} Z`} fill="#8aa2d2" />
      <path
        d={`M${X0} 160 Q0 150 400 162 T1200 158 T${X1} 162 V172 Q1200 166 800 174 T0 168 T${X0} 172 Z`}
        fill="#e8f6ff"
      />
      <rect x={X0} y={136} width={X1 - X0} height={30} fill="#eef4fc" opacity={0.45} />
      <rect x={X0} y={70} width={X1 - X0} height={26} fill="#eef4fc" opacity={0.35} />
    </g>
  );
});

/** The cliff wall behind the ledge (painted), with snowy ledges, icicles and little pines. */
const Wall = memo(function Wall() {
  const id = useId();
  const top = Array.from({ length: 23 }, (_, i) => {
    const x = X0 + i * 100;
    const y = -110 - 90 * noise(i, 13) - (i % 3 === 0 ? 40 : 0);
    return `L${x} ${y.toFixed(0)}`;
  }).join(' ');
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}face`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-360}
          x2="0"
          y2={0}
        >
          <stop offset="0" stopColor={CLIFF} />
          <stop offset="1" stopColor={CLIFF_DARK} />
        </linearGradient>
      </defs>
      <path d={`M${X0} -12 ${top} L${X1} -12 Z`} fill={`url(#${id}face)`} />
      <path
        d={`M${X0} -12 ${top} L${X1} -12`}
        stroke={P.snowShade}
        strokeWidth={16}
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d={`M${X0} -16 ${top.replace(/L(-?\d+) (-?\d+)/g, (_, x, y) => `L${x} ${+y - 5}`)}`}
        stroke={P.snowTop}
        strokeWidth={8}
        fill="none"
        strokeLinejoin="round"
      />
      <g fill="#c2c5e6" opacity={0.35}>
        {[-380, -80, 220, 520, 820, 1120, 1420].map((x, i) => (
          <path
            key={x}
            d={`M${x} -12 L${x + 14} ${-90 - 40 * noise(i, 4)} L${x + 40} ${-80 - 40 * noise(i, 4)} L${x + 30} -12 Z`}
          />
        ))}
      </g>
      <g stroke={CLIFF_DARK} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.4}>
        <path d="M-200 -50 q70 8 150 -4 M300 -70 q80 10 160 -6 M900 -46 q70 6 140 -8 M1180 -64 q60 10 140 -4" />
      </g>
      <SnowLedge x0={-120} x1={10} y={-80} depth={10} />
      <Icicles x0={-110} x1={0} y={-70} len={16} seed={2} />
      <SnowPine x={-60} y={-82} h={60} />
      <SnowLedge x0={620} x1={760} y={-90} depth={10} />
      <Icicles x0={630} x1={750} y={-80} len={20} seed={4} />
      <SnowPine x={700} y={-92} h={52} flip />
      <SnowLedge x0={1250} x1={1380} y={-84} depth={10} />
      <path d={`M${X0} -14 Q600 -24 ${X1} -14 V-6 H${X0} Z`} fill={P.snowMid} />
    </g>
  );
});

/** The ledge's rock below the path, lit along its edge, broken where the gaps have opened. */
function LedgeBand({ open }: { open: readonly boolean[] }) {
  const spans: [number, number][] = [];
  let x = X0;
  LEDGE.gaps.forEach(([a, b], i) => {
    if (!open[i]) return;
    spans.push([x, a]);
    x = b;
  });
  spans.push([x, X1]);
  return (
    <g>
      {spans.map(([a, b]) => (
        <g key={a}>
          <path
            d={`M${a} 10 H${b} V${BAND - 10} Q${(a + b) / 2} ${BAND + 6} ${a} ${BAND - 10} Z`}
            fill={CLIFF_SHADE}
          />
          <path d={`M${a} 12 H${b} V20 H${a} Z`} fill={CLIFF} />
          <path d={`M${a} 12 H${b}`} stroke={P.snowTop} strokeWidth={5} strokeLinecap="round" />
          <path
            d={`M${a} ${BAND - 12} Q${(a + b) / 2} ${BAND + 4} ${b} ${BAND - 12}`}
            stroke={CLIFF_DARK}
            strokeWidth={4}
            fill="none"
            opacity={0.6}
          />
        </g>
      ))}
    </g>
  );
}

/** A gap broken out of the ledge from a to b: jagged edges, the dark break, the haze below. */
function Gap({ a, b, i }: { a: number; b: number; i: number }) {
  const id = useId();
  const ys = [-8, 6, 22, 38];
  const left = ys.map((y, j) => `L${(a + 4 + 12 * noise(j + i * 5, 3)).toFixed(1)} ${y}`);
  const right = ys.map((y, j) => `L${(b - 4 - 12 * noise(j + i * 5, 7)).toFixed(1)} ${y}`);
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={-16} x2="0" y2={BAND + 4}>
          <stop offset="0" stopColor="#4c5894" />
          <stop offset="0.45" stopColor="#7f92cc" />
          <stop offset="1" stopColor="#a6bae6" />
        </linearGradient>
      </defs>
      {/* The break: the cliff behind falls away into the bright air below the ledge. */}
      <path
        d={`M${a} -16 ${left.join(' ')} L${a + 10} ${BAND + 4} L${b - 10} ${BAND + 4} ${[...right].reverse().join(' ')} L${b} -16 Z`}
        fill={`url(#${id})`}
      />
      <path
        d={`M${a + 4} -8 ${left.slice(1).join(' ')}`}
        stroke={CLIFF_DARK}
        strokeWidth={4}
        fill="none"
      />
      <path
        d={`M${b - 4} -8 ${right.slice(1).join(' ')}`}
        stroke="#c4cbec"
        strokeWidth={3}
        fill="none"
      />
      <path d={`M${a - 4} -18 Q${a + 4} -26 ${a + 16} -16 L${a + 8} -10 Z`} fill={SNOW} />
      <path d={`M${b + 4} -18 Q${b - 4} -26 ${b - 16} -16 L${b - 8} -10 Z`} fill={SNOW} />
    </g>
  );
}

/** A chunk of the ledge, lined (it's what he stood on): rock under a slab of snow. */
const Chunk = memo(function Chunk({ w }: { w: number }) {
  return (
    <g>
      <path
        d={`M${-w / 2} -6 L${w / 2} -8 L${w * 0.36} 18 L${w * 0.1} 30 L${-w * 0.3} 22 Z`}
        fill={STONE}
        {...ink(OUT)}
        {...NS}
      />
      <path
        d={`M${w * 0.1} 30 L${-w * 0.3} 22 L${-w * 0.36} 8 L${w * 0.02} 14 Z`}
        fill={shade(STONE, 0.3)}
      />
      <path
        d={`M${-w / 2 - 2} -4 Q${-w * 0.2} -16 ${w * 0.1} -12 Q${w * 0.35} -16 ${w / 2 + 2} -6 L${w / 2} 2 L${-w / 2} 4 Z`}
        fill={SNOW}
        {...ink(IN)}
        {...NS}
      />
      <path
        d={`M${-w * 0.3} -8 Q0 -14 ${w * 0.3} -9`}
        stroke={tint(SNOW, 0.6)}
        strokeWidth={2}
        fill="none"
      />
    </g>
  );
});

/** When gap `i` breaks open: the first at 'crumble', the others as he comes within 200px. */
function openAt(p: ObstacleProps, i: number) {
  const crumbleAt = eventTime(p.events, 'crumble');
  if (i === 0) return crumbleAt;
  return heroPasses(p, LEDGE.gaps[i]![0] - 200, crumbleAt);
}

export function LedgeBack(p: ObstacleProps) {
  const gust = since(p, 'gust');
  const opens = LEDGE.gaps.map((_, i) => p.t - openAt(p, i));
  return (
    <g>
      <Wall />
      <Abyss />
      <LedgeBand open={opens.map((dt) => dt >= 0)} />
      {LEDGE.gaps.map(([a, b], i) => {
        const dt = opens[i]!;
        if (dt < 0) return null;
        const w = (b - a) / 3 + 8;
        return (
          <g key={a}>
            <Gap a={a} b={b} i={i} />
            {/* The ledge falling away in chunks, tumbling down into the haze. */}
            {[0, 1, 2].map((j) => {
              const y = fallen(dt - j * 70, 0.0022);
              if (y > 260) return null;
              const x = a + ((b - a) * (j + 0.5)) / 3 + (j - 1) * y * 0.08;
              const s = 1 - clamp01(y / 400);
              return (
                <g
                  key={j}
                  transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${dt > j * 70 ? ((j - 1) * (dt - j * 70) * 0.12).toFixed(1) : 0}) scale(${s.toFixed(3)})`}
                  opacity={1 - clamp01((y - 160) / 100)}
                >
                  <Chunk w={w} />
                </g>
              );
            })}
            <SnowBurst x={(a + b) / 2} y={-6} dt={dt} size={0.55} ms={700} />
          </g>
        );
      })}
      {/* Gusts of wind streaming along the cliff, and snow blown off its ledges. */}
      {gust >= 0 && (
        <g opacity={1 - clamp01((gust - 3200) / 800)}>
          <g stroke="#ffffff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.8}>
            {[0, 1, 2, 3].map((i) => {
              const x = 1500 - ((gust * 1.1 + i * 470) % 2000);
              const y = -110 - i * 60;
              return (
                <path key={i} d={`M${x} ${y} q-60 -18 -120 0 t-120 0 q-30 -30 0 -42 q20 6 10 20`} />
              );
            })}
          </g>
          <g fill="#ffffff" opacity={0.85}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const x = 1500 - ((gust * 0.8 + i * 230) % 2000);
              const y = -40 - 200 * noise(i, 4) + 10 * Math.sin(gust / 120 + i);
              return <circle key={i} cx={x} cy={y} r={3 + (i % 3)} />;
            })}
          </g>
        </g>
      )}
    </g>
  );
}
