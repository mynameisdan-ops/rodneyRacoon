import { midiToHz, type Drum, type LeadVoice } from './notation';

/**
 * Web Audio building blocks: a tone, a burst of filtered noise, and the instruments the music
 * plays. They take any `BaseAudioContext`, so the dev sound board can render them offline to
 * measure them. Times are in seconds on the context's clock.
 */
export interface Out {
  ctx: BaseAudioContext;
  dest: AudioNode;
}

interface Filter {
  type: BiquadFilterType;
  freq: number;
  /** Sweeps the cutoff to this by the end. */
  to?: number;
  q?: number;
}

/**
 * `pluck` dies away over the whole length (a hit, a bell); `hold` stays up and lets go at the
 * end (a held note, a swell).
 */
type Envelope = 'pluck' | 'hold';

export interface ToneOptions {
  type?: OscillatorType | 'pulse';
  freq: number;
  /** Glides to this frequency by the end. */
  to?: number;
  at: number;
  dur: number;
  gain: number;
  attack?: number;
  env?: Envelope;
  /** A wobble in pitch: `rate` Hz, `depth` Hz either side. */
  vibrato?: { rate: number; depth: number };
  filter?: Filter;
}

export interface NoiseOptions {
  at: number;
  dur: number;
  gain: number;
  attack?: number;
  env?: Envelope;
  filter: Filter;
}

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();
const pulseWaves = new WeakMap<BaseAudioContext, PeriodicWave>();

/** Two seconds of white noise, made once per context (a fixed seed, so renders repeat). */
function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  let buf = noiseBuffers.get(ctx);
  if (!buf) {
    buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let seed = 1;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 16807) % 2147483647;
      data[i] = (seed / 2147483647) * 2 - 1;
    }
    noiseBuffers.set(ctx, buf);
  }
  return buf;
}

/** A 25% pulse wave: the bright, thin chiptune tone of the arpeggios. */
function pulseWave(ctx: BaseAudioContext): PeriodicWave {
  let wave = pulseWaves.get(ctx);
  if (!wave) {
    const n = 32;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
    wave = ctx.createPeriodicWave(real, imag);
    pulseWaves.set(ctx, wave);
  }
  return wave;
}

/** A gain node shaped by the envelope, feeding `dest`. */
function envelope(
  ctx: BaseAudioContext,
  dest: AudioNode,
  at: number,
  dur: number,
  peak: number,
  attack: number,
  env: Envelope,
): GainNode {
  const g = ctx.createGain();
  const a = Math.min(attack, dur / 2);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(peak, at + a);
  if (env === 'pluck') {
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  } else {
    const release = Math.min(0.06, dur / 3);
    g.gain.setValueAtTime(peak, at + dur - release);
    g.gain.linearRampToValueAtTime(0, at + dur);
  }
  g.connect(dest);
  return g;
}

function filtered(
  ctx: BaseAudioContext,
  dest: AudioNode,
  f: Filter | undefined,
  at: number,
  dur: number,
) {
  if (!f) return dest;
  const node = ctx.createBiquadFilter();
  node.type = f.type;
  node.frequency.setValueAtTime(f.freq, at);
  if (f.to !== undefined) node.frequency.exponentialRampToValueAtTime(Math.max(20, f.to), at + dur);
  if (f.q !== undefined) node.Q.value = f.q;
  node.connect(dest);
  return node;
}

export function tone(out: Out, o: ToneOptions): void {
  const { ctx } = out;
  const env = envelope(ctx, out.dest, o.at, o.dur, o.gain, o.attack ?? 0.005, o.env ?? 'pluck');
  const osc = ctx.createOscillator();
  if (o.type === 'pulse') osc.setPeriodicWave(pulseWave(ctx));
  else osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, o.at);
  if (o.to !== undefined) osc.frequency.exponentialRampToValueAtTime(o.to, o.at + o.dur);
  if (o.vibrato) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = o.vibrato.rate;
    depth.gain.value = o.vibrato.depth;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(o.at);
    lfo.stop(o.at + o.dur + 0.05);
  }
  osc.connect(filtered(ctx, env, o.filter, o.at, o.dur));
  osc.start(o.at);
  osc.stop(o.at + o.dur + 0.05);
}

export function noise(out: Out, o: NoiseOptions): void {
  const { ctx } = out;
  const env = envelope(ctx, out.dest, o.at, o.dur, o.gain, o.attack ?? 0.003, o.env ?? 'pluck');
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = true;
  src.connect(filtered(ctx, env, o.filter, o.at, o.dur));
  // Start somewhere different in the buffer each time, so repeats don't sound identical.
  src.start(o.at, (o.at * 7.31) % 1.5);
  src.stop(o.at + o.dur + 0.05);
}

/** One note of the music. `dur` is how long it's held, in seconds; `vel` scales it. */
export function playNote(
  out: Out,
  voice: LeadVoice | 'bass' | 'arp',
  midi: number,
  at: number,
  dur: number,
  vel = 1,
): void {
  const freq = midiToHz(midi);
  switch (voice) {
    case 'square':
      tone(out, {
        type: 'square',
        freq,
        at,
        dur,
        gain: 0.06 * vel,
        env: 'hold',
        attack: 0.01,
        filter: { type: 'lowpass', freq: 3200 },
      });
      return;
    case 'triangle':
      tone(out, {
        type: 'triangle',
        freq,
        at,
        dur,
        gain: 0.2 * vel,
        env: 'hold',
        attack: 0.02,
        vibrato: { rate: 5, depth: freq * 0.004 },
      });
      return;
    case 'flute':
      tone(out, {
        type: 'sine',
        freq,
        at,
        dur,
        gain: 0.16 * vel,
        env: 'hold',
        attack: 0.04,
        vibrato: { rate: 5.5, depth: freq * 0.005 },
      });
      tone(out, {
        type: 'triangle',
        freq: freq * 2,
        at,
        dur,
        gain: 0.02 * vel,
        env: 'hold',
        attack: 0.06,
      });
      return;
    case 'bell':
      tone(out, { type: 'sine', freq, at, dur: Math.max(0.35, dur), gain: 0.2 * vel });
      tone(out, { type: 'sine', freq: freq * 4, at, dur: 0.12, gain: 0.05 * vel });
      return;
    case 'bass':
      tone(out, { type: 'triangle', freq, at, dur, gain: 0.26 * vel, env: 'hold', attack: 0.008 });
      return;
    case 'arp':
      tone(out, { type: 'pulse', freq, at, dur: Math.max(0.12, dur), gain: 0.035 * vel });
      return;
  }
}

export function playDrum(out: Out, drum: Drum, at: number, vel = 1): void {
  switch (drum) {
    case 'kick':
      tone(out, { freq: 150, to: 45, at, dur: 0.16, gain: 0.45 * vel });
      return;
    case 'snare':
      noise(out, {
        at,
        dur: 0.13,
        gain: 0.16 * vel,
        filter: { type: 'bandpass', freq: 1800, q: 0.8 },
      });
      tone(out, { type: 'triangle', freq: 190, to: 150, at, dur: 0.08, gain: 0.12 * vel });
      return;
    case 'hat':
      noise(out, { at, dur: 0.035, gain: 0.06 * vel, filter: { type: 'highpass', freq: 7000 } });
      return;
    case 'openHat':
      noise(out, { at, dur: 0.18, gain: 0.045 * vel, filter: { type: 'highpass', freq: 6500 } });
      return;
  }
}
