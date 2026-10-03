import { useEffect, useMemo, useRef } from 'react';
import type { SongId } from '../content/music';
import { SCENE_SOUNDS } from '../content/sounds';
import type { Timeline } from '../cutscenes/timeline';
import { sceneCues } from './cues';
import { playSfx, setMusic, type MusicPart } from './engine';

/** Plays a screen's theme while it's on show (the next screen sets its own). */
export function useMusic(id: SongId | null, part: MusicPart = 'full'): void {
  useEffect(() => setMusic(id, part), [id, part]);
}

/** Cues further behind than this (ms) were skipped past, and stay quiet. */
const SKIPPED_MS = 250;

/** Plays a cut scene's sounds as its real-time clock passes them. */
export function useSceneSounds(timeline: Timeline, real: number): void {
  const cues = useMemo(() => sceneCues(timeline, SCENE_SOUNDS), [timeline]);
  const last = useRef(-1);
  useEffect(() => {
    const from = last.current;
    last.current = real;
    for (const cue of cues) {
      if (cue.at > from && cue.at <= real && real - cue.at < SKIPPED_MS) playSfx(cue.sound, cue);
    }
  }, [cues, real]);
}
