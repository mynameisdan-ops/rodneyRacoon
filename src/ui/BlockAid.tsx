import { memo, type CSSProperties } from 'react';
import type { Problem } from '../game/problems';
import { BLOCK_BOX, BLOCK_TIMING, blockPicture } from './blockLayout';

/**
 * A problem drawn as blocks that join, leave, close up or split (the parent's "Blocks"
 * setting). Its box is always the same size, picture or not, so nothing on the page moves.
 * Only `transform` and `opacity` animate, as CSS keyframes started by mounting (a new problem
 * is a new `key`).
 */
export const BlockAid = memo(function BlockAid({ problem }: { problem: Problem }) {
  const pic = blockPicture(problem);
  const timing = {
    '--block-start': `${BLOCK_TIMING.start}ms`,
    '--block-move': `${BLOCK_TIMING.move}ms`,
    width: BLOCK_BOX.w,
    height: BLOCK_BOX.h,
  } as CSSProperties;
  return (
    <div className="block-aid" style={timing} aria-hidden="true">
      {pic?.frames.map((f, i) => (
        <div
          key={`f${i}`}
          className="block-aid__frame"
          style={{ left: f.x, top: f.y, width: f.w, height: f.h }}
        />
      ))}
      {pic?.blocks.map((k, i) => {
        const cls = [
          'block',
          `block--${k.tone}`,
          k.rod ? 'block--rod' : '',
          k.ghost ? 'block--ghost' : '',
          k.leaves ? 'block--leaves' : '',
          k.from ? 'block--moves' : '',
        ].join(' ');
        const style = {
          left: k.x,
          top: k.y,
          width: k.w,
          height: k.h,
          ...(k.from ? { '--dx': `${k.from.x - k.x}px`, '--dy': `${k.from.y - k.y}px` } : {}),
        } as CSSProperties;
        return <div key={i} className={cls} style={style} />;
      })}
    </div>
  );
});
