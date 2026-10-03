import { memo } from 'react';
import { SparkTrail, SpeedLines } from '../../fx';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { Saguaro } from '../../worlds/canyon';
import { circles, clamp01, lerp, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { IRON, RED, WOOD, WOOD_DARK } from './kit';
import { ZIP } from './layout';
import { Gorge, SandBurst } from './parts';

// ---------- Level 34: zip line ----------
// zip (he grabs the handle and rides the line across the gorge; a hawk glides alongside) → off
// (he lets go and leaps for the far rim; the handle bangs into the far post).

const ropeLift = (x: number) =>
  lerp(ZIP.from.lift, ZIP.to.lift, (x - ZIP.from.x) / (ZIP.to.x - ZIP.from.x));

/** How far the handle's bar hangs below the line. */
const DROP = 26;

/** A post (lined): a timber with a crossbar, braced back into the ground, the line's anchor. */
const Post = memo(function Post({ lift, dir }: { lift: number; dir: 1 | -1 }) {
  return (
    <g>
      <path
        d={`M0 ${-lift - 30} L${-dir * 70} 4`}
        stroke={INK}
        strokeWidth={13}
        strokeLinecap="round"
      />
      <path
        d={`M0 ${-lift - 30} L${-dir * 70} 4`}
        stroke={WOOD_DARK}
        strokeWidth={13 - 2 * IN}
        strokeLinecap="round"
      />
      <rect x={-12} y={-lift - 40} width={24} height={lift + 44} rx={4} fill={WOOD} {...ink(OUT)} />
      <path d={`M-12 ${-lift - 40} h8 V4 h-8 Z`} fill={shade(WOOD, 0.3)} />
      <path
        d={`M6 ${-lift - 34} V-4`}
        stroke={tint(WOOD, 0.4)}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <rect x={-26} y={-lift - 8} width={52} height={12} rx={3} fill={WOOD} {...ink(IN + 1)} />
      <circle cx={0} cy={-lift} r={6} fill={IRON} {...ink(IN)} />
    </g>
  );
});

/** The handle (lined): a pulley wheel on the line and a red bar he holds. */
const Handle = memo(function Handle() {
  return (
    <g>
      <path d={`M-10 6 L-14 ${DROP} M10 6 L14 ${DROP}`} stroke={INK} strokeWidth={4} />
      <circle r={11} fill={IRON} {...ink(IN + 1)} />
      <circle r={4} fill={tint(IRON, 0.5)} />
      <path d={`M-26 ${DROP} H26`} stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <path d={`M-26 ${DROP} H26`} stroke={RED} strokeWidth={6} strokeLinecap="round" />
      <path
        d={`M-22 ${DROP - 1.5} H18`}
        stroke={tint(RED, 0.5)}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  );
});

/** A hawk gliding (lined): broad wings, a white head, a hooked yellow beak, a friendly eye. */
const Hawk = memo(function Hawk() {
  return (
    <g>
      <path
        d="M-30 -2 Q-10 -26 10 -4 Q24 -18 44 -10 Q30 0 14 4 Q0 10 -14 6 Q-26 8 -40 2 Z"
        fill="#8a5a3a"
        {...ink(OUT)}
      />
      <path d="M-14 6 Q0 10 14 4 Q4 0 -10 0 Z" fill="#5e3a26" />
      <path d="M-40 2 L-52 -4 L-50 6 Z" fill="#c8a070" {...ink(IN)} />
      <circle cx={18} cy={-2} r={7} fill="#f6efe2" {...ink(IN)} />
      <path d="M24 -2 L31 1 L24 4 Z" fill="#ffc94a" {...ink(1.2)} />
      <circle cx={20} cy={-4} r={1.6} fill={INK} />
      <circle cx={20.6} cy={-4.6} r={0.6} fill="#ffffff" />
    </g>
  );
});

/** Where the handle is: waiting at the start, riding with him, then running on into the far post. */
function handleAt(p: ObstacleProps) {
  const zipAt = eventTime(p.events, 'zip');
  const offAt = eventTime(p.events, 'off');
  const stop = ZIP.to.x - 30;
  if (p.t < zipAt) return { x: ZIP.from.x + 30, bang: -1 };
  if (p.t < offAt) return { x: p.heroX, bang: -1 };
  const at = p.heroAt(offAt).x;
  const v = (at - p.heroAt(offAt - 60).x) / 60;
  const x = at + v * (p.t - offAt);
  const bangAt = offAt + (stop - at) / Math.max(0.1, v);
  return x < stop ? { x, bang: -1 } : { x: stop, bang: p.t - bangAt };
}

export function ZipLineBack(p: ObstacleProps) {
  const [a, b] = ZIP.canyon;
  const zip = since(p, 'zip');
  const off = since(p, 'off');
  const riding = zip >= 0 && off < 0;
  const h = handleAt(p);
  // The line sags a little under him where the handle is.
  const sag = riding ? 10 : 0;
  const hy = -ropeLift(h.x) + sag;
  return (
    <g>
      <Gorge a={a} b={b} />
      <Saguaro x={ZIP.from.x - 120} y={-14} h={80} />
      <Saguaro x={ZIP.to.x + 160} y={-14} h={100} flip />
      <g transform={`translate(${ZIP.from.x} 0)`}>
        <Post lift={ZIP.from.lift} dir={1} />
      </g>
      <g transform={`translate(${ZIP.to.x} 0)`}>
        <Post lift={ZIP.to.lift} dir={-1} />
      </g>
      <path
        d={`M${ZIP.from.x} ${-ZIP.from.lift} L${h.x} ${hy - 4} L${ZIP.to.x} ${-ZIP.to.lift}`}
        stroke={INK}
        strokeWidth={6}
        fill="none"
      />
      <path
        d={`M${ZIP.from.x} ${-ZIP.from.lift} L${h.x} ${hy - 4} L${ZIP.to.x} ${-ZIP.to.lift}`}
        stroke="#d8c8a0"
        strokeWidth={2.4}
        fill="none"
      />
      {/* The hawk gliding alongside him over the gorge, then peeling away. */}
      {zip > 300 && off < 900 && (
        <g
          transform={`translate(${(p.heroX + 150 + (off > 0 ? off * 0.6 : 0)).toFixed(1)} ${(-p.heroLift + 30 - 10 * Math.sin(p.t / 260) - (off > 0 ? off * 0.3 : 0)).toFixed(1)}) rotate(${(-4 + 4 * Math.sin(p.t / 300)).toFixed(1)})`}
          opacity={1 - clamp01((off - 500) / 400)}
        >
          <Hawk />
        </g>
      )}
      <g
        transform={`translate(${h.x.toFixed(1)} ${(hy - 4).toFixed(1)}) rotate(${riding ? -6 : 0})`}
      >
        <Handle />
      </g>
      {riding && zip > 200 && <SparkTrail x={h.x - 6} y={hy - 8} t={p.t} />}
      {riding && zip > 500 && (
        <path
          d={circles(
            [0, 1, 2].map((i) => {
              const ph = ((p.t + i * 120) % 360) / 360;
              return { x: h.x - 20 - ph * 60, y: hy - 12 - ph * 30, r: 5 + ph * 10 };
            }),
          )}
          fill="#efe6da"
          opacity={0.7}
        />
      )}
      <SandBurst
        x={ZIP.to.x - 20}
        y={-ZIP.to.lift}
        dt={h.bang}
        size={0.5}
        ms={500}
        fill="#fff3c8"
        shadow="#ffb84a"
      />
    </g>
  );
}

export function ZipLineFront(p: ObstacleProps) {
  const riding = since(p, 'zip') >= 200 && since(p, 'off') < 0;
  return riding ? (
    <SpeedLines
      x={p.heroX - 90}
      t={p.t}
      ys={[-(p.heroLift + 60), -(p.heroLift + 110), -(p.heroLift + 150)]}
    />
  ) : null;
}
