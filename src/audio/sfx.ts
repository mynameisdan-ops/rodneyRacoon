import type { SfxName, SfxOptions } from './cues';
import { midiToHz } from './notation';
import { noise, tone, type Out } from './synth';

/**
 * Each sound effect as a little synth recipe (no audio files). `at` is when it starts on the
 * context's clock; `size` scales it, `ms` stretches long ones and `n` steps the pitch (the
 * digit typed, the combo, the star). Everything is in C major, like the music, and gentle:
 * a miss is a soft "bwom", never a harsh buzzer.
 */
type Recipe = (out: Out, at: number, o: SfxOptions) => void;

/** C major pentatonic from C5 up: anything played on it sounds right together. */
const PENTA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98, 100, 103];
const penta = (i: number) => midiToHz(PENTA[Math.max(0, Math.min(PENTA.length - 1, i))]!);

/** Fixed "random" offsets and pitches for debris, glass and sparkles (so renders repeat). */
const SCATTER = [0.0, 0.07, 0.03, 0.12, 0.19, 0.1, 0.25, 0.16, 0.31, 0.22];
const GLASS = [3100, 4200, 2700, 3800, 4700, 2900, 3500, 4400, 3300, 4000];

function bell(out: Out, freq: number, at: number, dur: number, gain: number) {
  tone(out, { freq, at, dur, gain });
  tone(out, { freq: freq * 2.01, at, dur: dur * 0.5, gain: gain * 0.25 });
}

function thud(out: Out, at: number, size: number) {
  tone(out, { freq: 140, to: 55, at, dur: 0.14, gain: 0.35 * size });
  noise(out, { at, dur: 0.1, gain: 0.15 * size, filter: { type: 'lowpass', freq: 600 } });
}

function sparkles(out: Out, at: number, count: number, from: number, gain: number) {
  for (let i = 0; i < count; i++) {
    const step = [0, 2, 4, 3, 5, 7, 6, 8][i % 8]!;
    tone(out, { type: 'triangle', freq: penta(from + step), at: at + i * 0.06, dur: 0.3, gain });
  }
}

export const SFX: Record<SfxName, Recipe> = {
  // Buttons and the number pad.
  tap: (out, at) => {
    tone(out, { freq: 600, to: 900, at, dur: 0.06, gain: 0.16 });
  },
  key: (out, at, { n = 0 }) => {
    tone(out, { type: 'triangle', freq: penta(n), at, dur: 0.08, gain: 0.16 });
    noise(out, { at, dur: 0.015, gain: 0.04, filter: { type: 'highpass', freq: 4000 } });
  },
  erase: (out, at) => {
    tone(out, { freq: 500, to: 320, at, dur: 0.08, gain: 0.14 });
  },

  // A timed page.
  count: (out, at) => {
    tone(out, { type: 'triangle', freq: midiToHz(76), at, dur: 0.18, gain: 0.26 });
    tone(out, { freq: midiToHz(88), at, dur: 0.12, gain: 0.05 });
  },
  go: (out, at) => {
    tone(out, { type: 'triangle', freq: midiToHz(84), at, dur: 0.45, gain: 0.22 });
    tone(out, { type: 'triangle', freq: midiToHz(88), at, dur: 0.45, gain: 0.16 });
    tone(out, { type: 'pulse', freq: midiToHz(91), at: at + 0.04, dur: 0.4, gain: 0.04 });
  },
  correct: (out, at, { n = 1 }) => {
    // Climbs a step with each answer in a row.
    const i = Math.min(Math.max(0, n - 1), 7);
    bell(out, penta(i + 2), at, 0.3, 0.18);
    bell(out, penta(i + 4), at + 0.07, 0.4, 0.16);
  },
  wrong: (out, at) => {
    const lp = { type: 'lowpass' as const, freq: 900 };
    tone(out, { type: 'triangle', freq: 260, to: 210, at, dur: 0.16, gain: 0.22, filter: lp });
    tone(out, {
      type: 'triangle',
      freq: 210,
      to: 170,
      at: at + 0.13,
      dur: 0.22,
      gain: 0.18,
      filter: lp,
    });
  },
  reveal: (out, at) => {
    tone(out, { freq: midiToHz(79), at, dur: 0.22, gain: 0.15, env: 'hold', attack: 0.02 });
    tone(out, {
      freq: midiToHz(76),
      at: at + 0.2,
      dur: 0.35,
      gain: 0.15,
      env: 'hold',
      attack: 0.02,
    });
  },
  combo: (out, at, { n = 5 }) => {
    const notes = n >= 10 ? [84, 88, 91, 96, 100] : [84, 88, 91, 96];
    notes.forEach((m, i) => {
      tone(out, {
        type: 'square',
        freq: midiToHz(m),
        at: at + i * 0.055,
        dur: 0.14,
        gain: 0.11,
        filter: { type: 'lowpass', freq: 4000 },
      });
    });
    noise(out, { at: at + 0.1, dur: 0.45, gain: 0.08, filter: { type: 'highpass', freq: 6000 } });
  },
  tick: (out, at) => {
    tone(out, { freq: 1500, at, dur: 0.04, gain: 0.14 });
    tone(out, { freq: 3000, at, dur: 0.015, gain: 0.04 });
  },
  done: (out, at) => {
    tone(out, {
      type: 'square',
      freq: midiToHz(79),
      at,
      dur: 0.12,
      gain: 0.06,
      filter: { type: 'lowpass', freq: 3500 },
    });
    tone(out, {
      type: 'square',
      freq: midiToHz(84),
      at: at + 0.12,
      dur: 0.45,
      gain: 0.07,
      env: 'hold',
      filter: { type: 'lowpass', freq: 3500 },
    });
    bell(out, midiToHz(88), at + 0.12, 0.6, 0.1);
  },
  timeUp: (out, at) => {
    bell(out, midiToHz(76), at, 0.5, 0.17);
    bell(out, midiToHz(72), at + 0.25, 0.7, 0.17);
  },

  // Results, the shop and the maps.
  star: (out, at, { n = 0 }) => {
    bell(out, midiToHz([88, 91, 96][Math.min(2, n)]!), at, 0.6, 0.2);
    noise(out, { at, dur: 0.3, gain: 0.04, filter: { type: 'highpass', freq: 7000 } });
  },
  tally: (out, at) => {
    tone(out, { type: 'triangle', freq: 880, at, dur: 0.06, gain: 0.12 });
  },
  coin: (out, at, { size = 1 }) => {
    const lp = { type: 'lowpass' as const, freq: 5000 };
    tone(out, {
      type: 'square',
      freq: midiToHz(83),
      at,
      dur: 0.07,
      gain: 0.08 * size,
      env: 'hold',
      filter: lp,
    });
    tone(out, {
      type: 'square',
      freq: midiToHz(88),
      at: at + 0.07,
      dur: 0.3,
      gain: 0.08 * size,
      filter: lp,
    });
  },
  sticker: (out, at) => {
    noise(out, {
      at,
      dur: 0.4,
      gain: 0.1,
      attack: 0.15,
      filter: { type: 'bandpass', freq: 1000, to: 5000, q: 1 },
    });
    sparkles(out, at + 0.15, 7, 5, 0.12);
  },
  buy: (out, at) => {
    for (let i = 0; i < 3; i++) SFX.coin(out, at + i * 0.09, { size: 0.8 });
    bell(out, midiToHz(96), at + 0.3, 0.7, 0.14);
  },
  wear: (out, at) => {
    tone(out, { freq: 300, to: 900, at, dur: 0.1, gain: 0.2 });
    noise(out, {
      at: at + 0.04,
      dur: 0.15,
      gain: 0.06,
      filter: { type: 'bandpass', freq: 3000, q: 1 },
    });
  },
  steps: (out, at) => {
    for (let i = 0; i < 4; i++) {
      tone(out, { freq: 140, to: 90, at: at + i * 0.28, dur: 0.07, gain: 0.16 });
      noise(out, {
        at: at + i * 0.28,
        dur: 0.05,
        gain: 0.05,
        filter: { type: 'lowpass', freq: 900 },
      });
    }
  },

  // Cut scenes: the hero and the directing beats.
  jump: (out, at, { size = 1 }) => {
    tone(out, { freq: 250, to: 700, at, dur: 0.18, gain: 0.16 * size });
    noise(out, {
      at,
      dur: 0.22,
      gain: 0.06 * size,
      attack: 0.05,
      filter: { type: 'bandpass', freq: 800, to: 2500, q: 1 },
    });
  },
  land: (out, at, { size = 1 }) => thud(out, at, size),
  impact: (out, at, { size = 1 }) => {
    const s = Math.min(1.2, size);
    noise(out, {
      at,
      dur: 0.25 + 0.2 * s,
      gain: 0.32 * s,
      filter: { type: 'lowpass', freq: 4000, to: 300 },
    });
    tone(out, { freq: 120, to: 40, at, dur: 0.25, gain: 0.45 * s });
    noise(out, { at, dur: 0.03, gain: 0.18 * s, filter: { type: 'highpass', freq: 2000 } });
  },
  rumble: (out, at, { size = 1, ms = 1000 }) => {
    const dur = ms / 1000;
    noise(out, {
      at,
      dur,
      gain: 0.5 * size,
      attack: 0.08,
      filter: { type: 'lowpass', freq: 160, q: 1 },
    });
    tone(out, { freq: 45, at, dur, gain: 0.14 * size, attack: 0.1 });
  },
  whoosh: (out, at, { size = 1 }) => {
    noise(out, {
      at,
      dur: 0.38,
      gain: 0.4 * size,
      attack: 0.14,
      filter: { type: 'bandpass', freq: 400, to: 2400, q: 1.2 },
    });
  },
  cutin: (out, at) => {
    tone(out, { freq: midiToHz(100), at, dur: 0.45, gain: 0.09 });
    tone(out, { freq: midiToHz(107), at, dur: 0.35, gain: 0.07 });
    noise(out, { at, dur: 0.2, gain: 0.12, filter: { type: 'highpass', freq: 6000 } });
    noise(out, {
      at,
      dur: 0.15,
      gain: 0.12,
      filter: { type: 'bandpass', freq: 3000, to: 900, q: 2 },
    });
  },
  alert: (out, at) => {
    tone(out, { freq: 1200, at, dur: 0.06, gain: 0.14 });
    tone(out, { freq: 1600, at: at + 0.08, dur: 0.12, gain: 0.14 });
  },
  sweat: (out, at) => {
    tone(out, { freq: 1100, to: 500, at, dur: 0.14, gain: 0.12 });
  },
  sparkle: (out, at, { size = 1 }) => sparkles(out, at, size > 1 ? 8 : 5, 7, 0.12),

  // Cut scenes: the obstacles.
  crash: (out, at, { size = 1 }) => {
    noise(out, {
      at,
      dur: 0.6,
      gain: 0.38 * size,
      filter: { type: 'lowpass', freq: 5000, to: 500 },
    });
    tone(out, { freq: 100, to: 35, at, dur: 0.35, gain: 0.45 * size });
    for (let i = 0; i < 5; i++) {
      tone(out, {
        freq: GLASS[i]! * 0.6,
        at: at + 0.08 + SCATTER[i]!,
        dur: 0.06,
        gain: 0.05 * size,
      });
    }
  },
  crack: (out, at, { size = 1 }) => {
    noise(out, { at, dur: 0.05, gain: 0.4 * size, filter: { type: 'highpass', freq: 1500 } });
    noise(out, { at, dur: 0.16, gain: 0.15 * size, filter: { type: 'bandpass', freq: 900, q: 1 } });
    tone(out, { freq: 300, to: 100, at, dur: 0.08, gain: 0.2 * size });
  },
  crumble: (out, at, { size = 1 }) => {
    for (let i = 0; i < 7; i++) {
      noise(out, {
        at: at + i * 0.07 + SCATTER[i]! * 0.3,
        dur: 0.08,
        gain: (0.4 - i * 0.04) * size,
        filter: { type: 'lowpass', freq: 1200 },
      });
    }
    noise(out, { at, dur: 0.7, gain: 0.5 * size, filter: { type: 'lowpass', freq: 200 } });
  },
  water: (out, at, { size = 1 }) => {
    noise(out, {
      at,
      dur: 1.4,
      gain: 0.45 * size,
      attack: 0.35,
      filter: { type: 'bandpass', freq: 500, to: 900, q: 0.7 },
    });
    noise(out, {
      at,
      dur: 1.2,
      gain: 0.4 * size,
      attack: 0.2,
      filter: { type: 'lowpass', freq: 220 },
    });
  },
  splash: (out, at, { size = 1 }) => {
    noise(out, {
      at,
      dur: 0.45,
      gain: 0.34 * size,
      filter: { type: 'bandpass', freq: 2500, to: 600, q: 0.8 },
    });
    noise(out, { at, dur: 0.3, gain: 0.2 * size, filter: { type: 'lowpass', freq: 400 } });
    for (let i = 0; i < 4; i++) {
      tone(out, {
        freq: 1000 + i * 250,
        to: 1800 + i * 300,
        at: at + 0.1 + SCATTER[i + 2]!,
        dur: 0.05,
        gain: 0.05 * size,
      });
    }
  },
  wind: (out, at, { size = 1, ms = 1600 }) => {
    noise(out, {
      at,
      dur: ms / 1000,
      gain: 0.6 * size,
      attack: 0.5,
      env: 'pluck',
      filter: { type: 'bandpass', freq: 500, to: 1200, q: 4 },
    });
    noise(out, {
      at,
      dur: ms / 1000,
      gain: 0.25 * size,
      attack: 0.4,
      filter: { type: 'lowpass', freq: 400 },
    });
  },
  thunder: (out, at, { size = 1 }) => {
    noise(out, { at, dur: 0.06, gain: 0.5 * size, filter: { type: 'highpass', freq: 1200 } });
    noise(out, {
      at: at + 0.03,
      dur: 1.8,
      gain: 0.5 * size,
      attack: 0.05,
      filter: { type: 'lowpass', freq: 400, to: 80 },
    });
  },
  whistle: (out, at) => {
    for (const m of [74, 78, 81]) {
      tone(out, {
        type: 'triangle',
        freq: midiToHz(m),
        at,
        dur: 0.9,
        gain: 0.09,
        env: 'hold',
        attack: 0.06,
        vibrato: { rate: 6, depth: 4 },
      });
    }
    noise(out, {
      at,
      dur: 0.9,
      gain: 0.04,
      env: 'hold',
      attack: 0.05,
      filter: { type: 'bandpass', freq: 1500, q: 1 },
    });
  },
  flutter: (out, at, { size = 1 }) => {
    for (let i = 0; i < 14; i++) {
      const freq = i % 2 ? 1400 : 1900;
      noise(out, {
        at: at + i * 0.045 + SCATTER[i % 10]! * 0.05,
        dur: 0.03,
        gain: 0.3 * size,
        filter: { type: 'bandpass', freq, q: 2 },
      });
    }
  },
  creak: (out, at) => {
    const osc = {
      type: 'sawtooth' as const,
      at,
      gain: 0.35,
      filter: { type: 'bandpass' as const, freq: 700, q: 3 },
    };
    tone(out, { ...osc, freq: 80, to: 120, dur: 0.25, env: 'hold' });
    tone(out, { ...osc, freq: 120, to: 70, at: at + 0.25, dur: 0.35 });
  },
  boom: (out, at, { size = 1 }) => {
    tone(out, { freq: 90, to: 30, at, dur: 0.6, gain: 0.5 * size });
    noise(out, {
      at,
      dur: 0.7,
      gain: 0.32 * size,
      filter: { type: 'lowpass', freq: 900, to: 150 },
    });
  },
  fall: (out, at) => {
    tone(out, { freq: 1400, to: 300, at, dur: 0.7, gain: 0.1, env: 'hold', attack: 0.03 });
  },
  bloop: (out, at, { n = 0, size = 1 }) => {
    tone(out, { freq: 380 + n * 70, to: 900 + n * 120, at, dur: 0.12, gain: 0.2 * size });
  },
  boing: (out, at, { n = 0 }) => {
    tone(out, {
      type: 'triangle',
      freq: 200 + n * 50,
      to: 330 + n * 80,
      at,
      dur: 0.38,
      gain: 0.22,
      vibrato: { rate: 18, depth: 30 },
    });
  },
  grab: (out, at) => {
    noise(out, { at, dur: 0.04, gain: 0.22, filter: { type: 'bandpass', freq: 2500, q: 1.5 } });
    tone(out, { freq: 700, at, dur: 0.04, gain: 0.1 });
  },
  grow: (out, at) => {
    [72, 76, 79, 84, 88].forEach((m, i) => {
      tone(out, { type: 'triangle', freq: midiToHz(m), at: at + i * 0.07, dur: 0.3, gain: 0.1 });
    });
    tone(out, { freq: 300, to: 1200, at, dur: 0.5, gain: 0.05 });
  },
  snort: (out, at) => {
    for (const t of [0, 0.18]) {
      noise(out, {
        at: at + t,
        dur: 0.12,
        gain: 0.3,
        attack: 0.02,
        filter: { type: 'lowpass', freq: 700 },
      });
    }
  },
  shatter: (out, at, { size = 1 }) => {
    SFX.crack(out, at, { size: 0.8 * size });
    GLASS.forEach((freq, i) => {
      tone(out, { freq, at: at + 0.02 + SCATTER[i]! * 1.2, dur: 0.09, gain: 0.07 * size });
    });
    noise(out, { at, dur: 0.4, gain: 0.14 * size, filter: { type: 'highpass', freq: 5000 } });
  },
  zip: (out, at) => {
    tone(out, { freq: 600, to: 1500, at, dur: 1.1, gain: 0.07, env: 'hold', attack: 0.1 });
    noise(out, {
      at,
      dur: 1.1,
      gain: 0.1,
      env: 'hold',
      attack: 0.1,
      filter: { type: 'bandpass', freq: 3000, q: 2 },
    });
  },
};
