import { SONGS, STINGS, type SongId, type StingId } from '../content/music';
import { DEFAULT_AUDIO, type AudioSettings } from '../state/schema';
import { SFX_NAMES, type SfxName, type SfxOptions } from './cues';
import { compileSong, type CompiledSong, type Drum, type LeadVoice, type Song } from './notation';
import { SFX } from './sfx';
import { playDrum, playNote, type Out } from './synth';

/**
 * The game's sound: one AudioContext (made on the first tap or key press, as browsers require),
 * an effects bus and a music bus with the player's volumes, and a limiter so nothing clips.
 * It goes quiet while the app is hidden. Nothing here loads a file or touches the network.
 *
 * Music is a sequencer that schedules a little ahead of the context's clock: a looping theme
 * per screen (`setMusic`) and one-shot stings (`playSting`). Buttons click by themselves (a
 * `data-sound` attribute picks another sound, or `off` for none).
 */

/** Loudness of each volume step (0 = off), on a curve so each step sounds like one. */
const LEVEL_GAIN = [0, 0.25, 0.55, 1] as const;
/** The music sits under the effects. */
export const MUSIC_MIX = 0.5;
/** How the theme plays: with its tune, without it (a timed page), or softly under a scene. */
export type MusicPart = 'full' | 'groove' | 'quiet';
export const PART_GAIN: Record<MusicPart, number> = { full: 1, groove: 0.8, quiet: 0.45 };

/** Seconds of music scheduled ahead, and how often the sequencer wakes (ms). */
const LOOKAHEAD = 0.2;
const PUMP_MS = 40;

let ctx: AudioContext | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let settings: AudioSettings = DEFAULT_AUDIO;
let installed = false;

function levelGain(level: number): number {
  return settings.muted ? 0 : (LEVEL_GAIN[level] ?? 0);
}

function running(): AudioContext | null {
  return ctx && ctx.state === 'running' ? ctx : null;
}

/** Makes the context on the first gesture and wakes it on later ones (until it runs). */
function unlock() {
  if (document.hidden) return;
  if (!ctx) {
    try {
      ctx = new AudioContext({ latencyHint: 'interactive' });
    } catch {
      return; // No Web Audio: the game plays silently.
    }
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -8;
    limiter.knee.value = 6;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.2;
    limiter.connect(ctx.destination);
    sfxBus = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus.connect(limiter);
    musicBus.connect(limiter);
    applyVolumes(true);
    ctx.onstatechange = () => running() && applyMusic();
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

function onVisibility() {
  if (!ctx) return;
  if (document.hidden) void ctx.suspend();
  else void ctx.resume();
}

/** Plays the button's sound on every click (`data-sound` picks one; `off` for none). */
function onClick(e: MouseEvent) {
  const button = (e.target as Element | null)?.closest?.('button');
  if (!button || button.disabled) return;
  const sound = button.dataset.sound;
  if (sound === 'off') return;
  playSfx(isSfxName(sound) ? sound : 'tap');
}

const isSfxName = (v: unknown): v is SfxName => (SFX_NAMES as readonly unknown[]).includes(v);

/** Sets up sound for the page (once): unlocking on a gesture, pausing while hidden, clicks. */
export function installAudio(): void {
  if (installed) return;
  installed = true;
  for (const type of ['pointerdown', 'pointerup', 'touchend', 'keydown']) {
    window.addEventListener(type, unlock, { capture: true, passive: true });
  }
  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('click', onClick, true);
}

function applyVolumes(now = false) {
  if (!ctx || !sfxBus || !musicBus) return;
  const t = ctx.currentTime;
  const set = (g: GainNode, v: number) =>
    now ? g.gain.setValueAtTime(v, t) : g.gain.setTargetAtTime(v, t, 0.05);
  set(sfxBus, levelGain(settings.sound));
  set(musicBus, levelGain(settings.music) * MUSIC_MIX);
}

/** The player's volumes (from the save); changes fade in quickly. */
export function setAudioSettings(next: AudioSettings): void {
  settings = next;
  applyVolumes();
}

// ---- Sound effects -------------------------------------------------------------------------

const lastPlayed = new Map<string, number>();

/** Plays a sound effect now. The same sound twice within a few ms plays once. */
export function playSfx(name: SfxName, options: SfxOptions = {}): void {
  const c = running();
  if (!c || !sfxBus || levelGain(settings.sound) === 0) return;
  const key = `${name}:${options.n ?? ''}`;
  const now = performance.now();
  if (now - (lastPlayed.get(key) ?? -Infinity) < 30) return;
  lastPlayed.set(key, now);
  SFX[name]({ ctx: c, dest: sfxBus }, c.currentTime + 0.005, options);
}

// ---- Music ---------------------------------------------------------------------------------

interface Steps {
  song: CompiledSong;
  lead: LeadVoice;
  /** Notes and drum hits starting on each step. */
  notes: CompiledSong['notes'][];
  drums: Drum[][];
}

const compiled = new Map<Song, Steps>();

function stepsOf(song: Song): Steps {
  let s = compiled.get(song);
  if (!s) {
    const c = compileSong(song);
    const notes: Steps['notes'] = Array.from({ length: c.steps }, () => []);
    const drums: Drum[][] = Array.from({ length: c.steps }, () => []);
    for (const n of c.notes) notes[n.step]!.push(n);
    for (const d of c.drums) drums[d.step]!.push(d.drum);
    s = { song: c, lead: song.lead, notes, drums };
    compiled.set(song, s);
  }
  return s;
}

/** Schedules one step of a song at time `at`. */
function playStep(out: Out, s: Steps, step: number, at: number, withLead: boolean) {
  const { stepSec } = s.song;
  for (const n of s.notes[step]!) {
    if (n.voice === 'lead' && !withLead) continue;
    const voice = n.voice === 'lead' ? s.lead : n.voice;
    playNote(out, voice, n.midi, at, n.len * stepSec * (n.voice === 'lead' ? 0.92 : 0.8));
  }
  for (const d of s.drums[step]!) playDrum(out, d, at);
}

interface Playing {
  id: SongId;
  part: MusicPart;
  steps: Steps;
  gain: GainNode;
  step: number;
  next: number;
}

let wanted: { id: SongId | null; part: MusicPart } = { id: null, part: 'full' };
let playing: Playing | null = null;
let sting: GainNode | null = null;
let lastSting = { id: '', at: -Infinity };
let timer: number | undefined;

function fadeOut(g: GainNode, seconds: number) {
  if (!ctx) return;
  g.gain.setTargetAtTime(0, ctx.currentTime, seconds / 4);
  window.setTimeout(() => g.disconnect(), seconds * 1000 + 200);
}

function pump() {
  const c = running();
  if (!c || !playing) return;
  const p = playing;
  // After a long stall, skip ahead rather than play a pile of late notes.
  if (p.next < c.currentTime - 0.1) p.next = c.currentTime + 0.05;
  const audible = levelGain(settings.music) > 0;
  const out = { ctx: c, dest: p.gain };
  while (p.next < c.currentTime + LOOKAHEAD) {
    if (audible) playStep(out, p.steps, p.step, p.next, p.part === 'full');
    p.step = (p.step + 1) % p.steps.song.steps;
    p.next += p.steps.song.stepSec;
  }
}

function applyMusic() {
  if (!ctx || !musicBus) return;
  const { id, part } = wanted;
  if (playing && playing.id === id) {
    playing.part = part;
    playing.gain.gain.setTargetAtTime(PART_GAIN[part], ctx.currentTime, 0.15);
    return;
  }
  if (playing) fadeOut(playing.gain, 0.6);
  if (sting && id) {
    fadeOut(sting, 0.4);
    sting = null;
  }
  playing = null;
  window.clearInterval(timer);
  if (!id) return;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.setTargetAtTime(PART_GAIN[part], ctx.currentTime, 0.1);
  gain.connect(musicBus);
  playing = { id, part, steps: stepsOf(SONGS[id]), gain, step: 0, next: ctx.currentTime + 0.08 };
  timer = window.setInterval(pump, PUMP_MS);
  pump();
}

/** The theme for the screen on show (null for none); the same theme carries on. */
export function setMusic(id: SongId | null, part: MusicPart = 'full'): void {
  wanted = { id, part };
  applyMusic();
}

/** A one-shot fanfare. It stops the theme; the next screen's `setMusic` starts one again. */
export function playSting(id: StingId): void {
  const c = running();
  if (!c || !musicBus) return;
  const now = performance.now();
  if (lastSting.id === id && now - lastSting.at < 300) return;
  lastSting = { id, at: now };
  wanted = { id: null, part: 'full' };
  applyMusic();
  if (sting) fadeOut(sting, 0.2);
  const g = c.createGain();
  g.connect(musicBus);
  sting = g;
  if (levelGain(settings.music) > 0)
    playSongOnce({ ctx: c, dest: g }, STINGS[id], c.currentTime + 0.05);
}

/**
 * Schedules a whole song once from `at` (a sting, or a loop rendered offline by the dev sound
 * board); returns its length in seconds.
 */
export function playSongOnce(out: Out, song: Song, at: number, withLead = true): number {
  const s = stepsOf(song);
  for (let step = 0; step < s.song.steps; step++) {
    playStep(out, s, step, at + step * s.song.stepSec, withLead);
  }
  return s.song.steps * s.song.stepSec;
}
