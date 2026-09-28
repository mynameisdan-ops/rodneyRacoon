import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs a scene clock from 0 to `duration` ms on animation frames. Frame gaps are
 * capped, so a backgrounded tab (where frames stop) resumes where it left off
 * instead of jumping ahead. Returns the time and a function that skips to the end.
 */
export function useSceneClock(duration: number): [number, () => void] {
  const [t, setT] = useState(0);
  const skipRef = useRef(false);

  useEffect(() => {
    let elapsed = 0;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      elapsed = skipRef.current
        ? duration
        : Math.min(duration, elapsed + Math.min(100, now - last));
      last = now;
      setT(elapsed);
      if (elapsed < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  const skip = useCallback(() => {
    skipRef.current = true;
  }, []);
  return [t, skip];
}
