import { SparkTrail, SpeedLines } from '../../fx';
import { INK, ink } from '../../style';
import { lerp, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { WOOD, IRON } from './kit';
import { ZIP } from './layout';
import { Drop } from './parts';

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
