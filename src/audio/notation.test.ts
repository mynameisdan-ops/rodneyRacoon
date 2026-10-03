import { describe, expect, it } from 'vitest';
import { SONGS, STINGS, worldSong } from '../content/music';
import {
  compileSong,
  midiToHz,
  noteToMidi,
  parseChord,
  parseChords,
  parseLine,
  STEPS_PER_BAR,
  type Song,
} from './notation';

describe('notes and chords', () => {
  it('reads note names', () => {
    expect(noteToMidi('C4')).toBe(60);
    expect(noteToMidi('A4')).toBe(69);
    expect(noteToMidi('F#3')).toBe(54);
    expect(noteToMidi('Bb5')).toBe(82);
    expect(noteToMidi('H2')).toBeNaN();
    expect(noteToMidi('C')).toBeNaN();
  });

  it('tunes A4 to 440 Hz', () => {
    expect(midiToHz(69)).toBe(440);
    expect(midiToHz(81)).toBeCloseTo(880);
  });

  it('reads chord symbols', () => {
    expect(parseChord('C')).toEqual({ root: 0, intervals: [0, 4, 7] });
    expect(parseChord('Am')).toEqual({ root: 9, intervals: [0, 3, 7] });
    expect(parseChord('B7')).toEqual({ root: 11, intervals: [0, 4, 7, 10] });
    expect(parseChord('F#m')?.root).toBe(6);
    expect(parseChord('Bb')?.root).toBe(10);
    expect(parseChord('Cb')?.root).toBe(11);
    expect(parseChord('Xm')).toBeUndefined();
    expect(parseChord('Cwhat')).toBeUndefined();
    expect(parseChords('C | Am | F G |')).toEqual([['C'], ['Am'], ['F', 'G']]);
  });
});

describe('parseLine', () => {
  it('holds notes with "-" and rests with "."', () => {
    const { notes, bars } = parseLine('C5 - E5 . G5 - - . | C6 - - - - - - -');
    expect(bars).toEqual([8, 8]);
    expect(notes).toEqual([
      { step: 0, len: 2, midi: 72 },
      { step: 2, len: 1, midi: 76 },
      { step: 4, len: 3, midi: 79 },
      { step: 8, len: 8, midi: 84 },
    ]);
  });

  it('counts the steps in each bar, so a short bar shows', () => {
    expect(parseLine('C5 - - | D5 - - - - - - -').bars).toEqual([3, 8]);
  });

  it('rejects junk', () => {
    expect(() => parseLine('C5 X5')).toThrow();
  });
});

const tune: Song = {
  bpm: 120,
  form: 'AB',
  lead: 'square',
  bass: 'rootFifth',
  arp: 'up',
  drums: 'beat',
  sections: {
    A: { chords: 'C', lead: 'C5 - - - E5 - - -' },
    B: { chords: 'F G', lead: 'A5 - - - B5 - - -' },
  },
};

describe('compileSong', () => {
  it('lays sections end to end, a step being an eighth note', () => {
    const song = compileSong(tune);
    expect(song.steps).toBe(16);
    expect(song.stepSec).toBe(0.25);
    expect(song.notes.filter((n) => n.voice === 'lead')).toEqual([
      { step: 0, len: 4, midi: 72, voice: 'lead' },
      { step: 4, len: 4, midi: 76, voice: 'lead' },
      { step: 8, len: 4, midi: 81, voice: 'lead' },
      { step: 12, len: 4, midi: 83, voice: 'lead' },
    ]);
  });

  it('puts the bass on each chord root, and splits a bar between two chords', () => {
    const bass = compileSong(tune).notes.filter((n) => n.voice === 'bass');
    expect(bass[0]).toEqual({ step: 0, len: 2, midi: 36, voice: 'bass' });
    // Bar 2 is F then G, half a bar each.
    expect(bass.filter((n) => n.step >= 8 && n.step < 12).map((n) => n.midi % 12)).toContain(5);
    expect(bass.filter((n) => n.step >= 12).map((n) => n.midi % 12)).toContain(7);
    expect(bass.every((n) => n.step + n.len <= 16)).toBe(true);
  });

  it('leaves the tune out of the groove', () => {
    expect(compileSong(tune, false).notes.some((n) => n.voice === 'lead')).toBe(false);
  });

  it('complains about bars that do not line up', () => {
    const bad = { ...tune, sections: { A: { chords: 'C | F', lead: 'C5 - - - - - - -' } } };
    expect(() => compileSong({ ...bad, form: 'A' })).toThrow(/lead bars/);
    const short = { ...tune, form: 'A', sections: { A: { chords: 'C', lead: 'C5 - -' } } };
    expect(() => compileSong(short)).toThrow(/steps/);
    expect(() => compileSong({ ...tune, form: 'Z' })).toThrow();
  });
});

describe('the songs', () => {
  const all = { ...SONGS, ...STINGS };
  for (const [id, song] of Object.entries(all)) {
    it(`${id} compiles, in tune and in range`, () => {
      const compiled = compileSong(song);
      expect(compiled.steps % STEPS_PER_BAR).toBe(0);
      expect(compiled.notes.length).toBeGreaterThan(0);
      for (const n of compiled.notes) {
        // From a low E (bass) to C7 (the top of a fanfare).
        expect(n.midi).toBeGreaterThanOrEqual(28);
        expect(n.midi).toBeLessThanOrEqual(96);
        expect(n.len).toBeGreaterThan(0);
        expect(n.step + n.len).toBeLessThanOrEqual(compiled.steps);
      }
    });
  }

  it('loops the themes and plays the stings once, each short', () => {
    for (const song of Object.values(SONGS)) {
      expect(song.sting).toBeFalsy();
      const { steps, stepSec } = compileSong(song);
      expect(steps * stepSec).toBeGreaterThan(15);
      expect(steps * stepSec).toBeLessThan(60);
    }
    for (const sting of Object.values(STINGS)) {
      expect(sting.sting).toBe(true);
      const { steps, stepSec } = compileSong(sting);
      expect(steps * stepSec).toBeLessThan(12);
    }
  });

  it('gives each world its theme', () => {
    expect(worldSong(1)).toBe('world1');
    expect(worldSong(5)).toBe('world5');
    expect(worldSong(9)).toBe('title');
  });
});
