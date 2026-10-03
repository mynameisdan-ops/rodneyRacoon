/**
 * The music notation (pure: no Web Audio here, so it is tested). A song is written as chords
 * and a lead line in eighth-note steps, 8 steps to a bar; `compileSong` turns it into note
 * events for the sequencer, adding a bass line, an arpeggio and drums in the song's styles.
 *
 * A line is tokens separated by spaces, with `|` between bars (bars are checked to be 8 steps):
 * a note (`C5`, `F#4`, `Bb3`) starts a note, `-` holds the note before it a step longer, and
 * `.` is a step of rest.
 */

export const STEPS_PER_BAR = 8;

const NOTE_INDEX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** MIDI number of a note name like `C4` (60), `F#3` or `Bb5`; NaN if it isn't one. */
export function noteToMidi(name: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) return NaN;
  const [, letter, accidental, octave] = m;
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  return 12 * (Number(octave) + 1) + NOTE_INDEX[letter!]! + shift;
}

export function midiToHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** Semitones above the root for each chord quality. */
const QUALITIES: Record<string, readonly number[]> = {
  '': [0, 4, 7],
  m: [0, 3, 7],
  '7': [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  '6': [0, 4, 7, 9],
};

/**
 * A chord symbol (`C`, `Am`, `F#m`, `B7`, `Bbmaj7`) as semitones: its root's pitch class
 * (0..11) and the intervals above it. Undefined if it isn't one.
 */
export function parseChord(
  symbol: string,
): { root: number; intervals: readonly number[] } | undefined {
  const m = /^([A-G])([#b]?)(.*)$/.exec(symbol);
  if (!m) return undefined;
  const [, letter, accidental, quality] = m;
  const intervals = QUALITIES[quality!];
  if (!intervals) return undefined;
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  return { root: (NOTE_INDEX[letter!]! + shift + 12) % 12, intervals };
}

export interface NoteEvent {
  /** Step the note starts on. */
  step: number;
  /** Steps it lasts. */
  len: number;
  midi: number;
}

export interface ParsedLine {
  notes: NoteEvent[];
  /** Steps in each bar, in order (each should be `STEPS_PER_BAR`). */
  bars: number[];
}

/** Parses a lead line. Throws on a token that isn't a note, `-` or `.`. */
export function parseLine(line: string): ParsedLine {
  const notes: NoteEvent[] = [];
  const bars: number[] = [];
  let step = 0;
  let barStart = 0;
  let open: NoteEvent | undefined;
  for (const token of line.split(/\s+/).filter(Boolean)) {
    if (token === '|') {
      bars.push(step - barStart);
      barStart = step;
      continue;
    }
    if (token === '-') {
      if (open) open.len += 1;
      step += 1;
      continue;
    }
    if (token === '.') {
      open = undefined;
      step += 1;
      continue;
    }
    const midi = noteToMidi(token);
    if (Number.isNaN(midi)) throw new Error(`Not a note: "${token}"`);
    open = { step, len: 1, midi };
    notes.push(open);
    step += 1;
  }
  if (step > barStart) bars.push(step - barStart);
  return { notes, bars };
}

/** Chord symbols bar by bar: `'C | Am | F G | C'` (two in a bar split it in halves). */
export function parseChords(line: string): string[][] {
  return line
    .split('|')
    .map((bar) => bar.trim().split(/\s+/).filter(Boolean))
    .filter((bar) => bar.length > 0);
}

export type BassStyle = 'rootFifth' | 'pulse' | 'walk' | 'gallop' | 'long' | 'none';
export type ArpStyle = 'up' | 'updown' | 'stab' | 'none';
export type DrumStyle = 'beat' | 'soft' | 'march' | 'gallop' | 'hit' | 'none';
export type Drum = 'kick' | 'snare' | 'hat' | 'openHat';

/** Instruments a song's lead can be played on (`synth.ts` draws them). */
export type LeadVoice = 'square' | 'triangle' | 'flute' | 'bell';

export interface SongSection {
  /** One or two chords per bar, e.g. `'C | Am | F G | C'`. */
  chords: string;
  /** The tune, 8 steps per bar, as many bars as `chords`. */
  lead: string;
}

export interface Song {
  /** Beats (quarter notes) per minute; a step is an eighth note. */
  bpm: number;
  sections: Record<string, SongSection>;
  /** The order sections play in, e.g. `'AABA'`. */
  form: string;
  lead: LeadVoice;
  bass: BassStyle;
  arp: ArpStyle;
  drums: DrumStyle;
  /** Plays once (a fanfare) instead of looping. */
  sting?: boolean;
}

export type Voice = 'lead' | 'bass' | 'arp';

export interface CompiledSong {
  /** Steps in the whole song (one loop). */
  steps: number;
  /** Seconds per step. */
  stepSec: number;
  notes: (NoteEvent & { voice: Voice })[];
  drums: { step: number; drum: Drum }[];
}

/** Where chord notes sit: bass from the octave of C2, arpeggios from C4. */
const BASS_C = 36;
const ARP_C = 60;

/** Drum hits for each step of a bar. */
const DRUM_BARS: Record<DrumStyle, readonly (readonly Drum[])[]> = {
  beat: [
    ['kick', 'hat'],
    ['hat'],
    ['snare', 'hat'],
    ['hat'],
    ['kick', 'hat'],
    ['hat'],
    ['snare', 'hat'],
    ['openHat'],
  ],
  soft: [['kick'], [], ['hat'], [], ['kick'], [], ['hat'], []],
  march: [['kick'], [], ['snare'], ['snare'], ['kick'], [], ['snare'], ['hat']],
  gallop: [['kick'], [], ['hat'], ['hat'], ['kick'], [], ['hat'], ['hat']],
  hit: [['kick', 'openHat'], [], [], [], [], [], [], []],
  none: [[], [], [], [], [], [], [], []],
};

type Half = { root: number; tones: readonly number[]; start: number; len: number };

/** The bass notes over one chord (a whole bar or half of one). */
function bassFor(style: BassStyle, h: Half): NoteEvent[] {
  const r = BASS_C + h.root;
  const fifth = r + 7;
  const notes = (pattern: [offset: number, midi: number, len: number][]) =>
    pattern.filter(([o]) => o < h.len).map(([o, midi, len]) => ({ step: h.start + o, len, midi }));
  switch (style) {
    case 'rootFifth':
      return notes([
        [0, r, 2],
        [2, r, 1],
        [4, fifth, 2],
        [6, r, 1],
      ]);
    case 'pulse':
      return notes(Array.from({ length: 8 }, (_, o) => [o, r, 1] as [number, number, number]));
    case 'walk':
      return notes([
        [0, r, 1],
        [2, fifth, 1],
        [4, r + 12, 1],
        [6, fifth, 1],
      ]);
    case 'gallop':
      return notes([
        [0, r, 2],
        [2, r, 1],
        [3, r, 1],
        [4, fifth, 2],
        [6, fifth, 1],
        [7, fifth, 1],
      ]);
    case 'long':
      return [{ step: h.start, len: h.len, midi: r }];
    case 'none':
      return [];
  }
}

/** The arpeggio over one chord. */
function arpFor(style: ArpStyle, h: Half): NoteEvent[] {
  const chord = h.tones.map((t) => ARP_C + h.root + t);
  const up = [...chord.slice(0, 3), chord[0]! + 12];
  const order =
    style === 'up' ? up : style === 'updown' ? [...up, ...up.slice(1, -1).reverse()] : [];
  if (style === 'stab') {
    return [0, 4]
      .filter((o) => o < h.len)
      .flatMap((o) => chord.slice(0, 3).map((midi) => ({ step: h.start + o, len: 2, midi })));
  }
  if (order.length === 0) return [];
  return Array.from({ length: h.len }, (_, o) => ({
    step: h.start + o,
    len: 1,
    midi: order[o % order.length]!,
  }));
}

/**
 * Compiles a song into note and drum events (one loop). `withLead: false` leaves the tune out
 * (the quieter groove under a timed page). Throws if a section's bars don't line up.
 */
export function compileSong(song: Song, withLead = true): CompiledSong {
  const notes: CompiledSong['notes'] = [];
  const drums: CompiledSong['drums'] = [];
  let barIndex = 0;
  for (const name of song.form) {
    const section = song.sections[name];
    if (!section) throw new Error(`No section "${name}"`);
    const chordBars = parseChords(section.chords);
    const lead = parseLine(section.lead);
    if (lead.bars.length !== chordBars.length) {
      throw new Error(
        `Section ${name}: ${lead.bars.length} lead bars, ${chordBars.length} chord bars`,
      );
    }
    lead.bars.forEach((n, i) => {
      if (n !== STEPS_PER_BAR) throw new Error(`Section ${name} bar ${i + 1} has ${n} steps`);
    });
    const offset = barIndex * STEPS_PER_BAR;
    if (withLead) {
      for (const n of lead.notes) notes.push({ ...n, step: n.step + offset, voice: 'lead' });
    }
    chordBars.forEach((bar, i) => {
      const barStart = offset + i * STEPS_PER_BAR;
      const len = STEPS_PER_BAR / bar.length;
      bar.forEach((symbol, j) => {
        const chord = parseChord(symbol);
        if (!chord) throw new Error(`Not a chord: "${symbol}"`);
        const h: Half = {
          root: chord.root,
          tones: chord.intervals,
          start: barStart + j * len,
          len,
        };
        for (const n of bassFor(song.bass, h)) notes.push({ ...n, voice: 'bass' });
        for (const n of arpFor(song.arp, h)) notes.push({ ...n, voice: 'arp' });
      });
      DRUM_BARS[song.drums].forEach((hits, o) => {
        for (const drum of hits) drums.push({ step: barStart + o, drum });
      });
    });
    barIndex += chordBars.length;
  }
  return { steps: barIndex * STEPS_PER_BAR, stepSec: 60 / song.bpm / 2, notes, drums };
}
