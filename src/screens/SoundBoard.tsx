import { useEffect, useState } from 'react';
import { SFX_NAMES, sceneCues, type SfxName } from '../audio/cues';
import {
  installAudio,
  MUSIC_MIX,
  PART_GAIN,
  playSfx,
  playSongOnce,
  playSting,
  setMusic,
} from '../audio/engine';
import { SFX } from '../audio/sfx';
import type { Out } from '../audio/synth';
import { getCutScene } from '../content/cutscenes';
import { getLevel } from '../content/levels';
import { SONGS, STINGS, worldSong, type SongId, type StingId } from '../content/music';
import { SCENE_SOUNDS } from '../content/sounds';
import { buildTimeline } from '../cutscenes/timeline';

/**
 * Dev-only sound board (`#sounds`): plays every sound effect, theme and sting, and measures
 * them by rendering offline (peak and loudness before the limiter, and how long each rings).
 * Each effect should peak under about 0.8, and a scene's whole mix under about 1.5 (the
 * limiter takes the rest). The report is also left on `window.soundReport`.
 */

const RATE = 22050;

interface Row {
  name: string;
  peak: number;
  rms: number;
  /** Seconds until it falls silent. */
  length: number;
}

async function render(seconds: number, play: (out: Out) => void): Promise<Row> {
  const ctx = new OfflineAudioContext(1, Math.ceil(RATE * seconds), RATE);
  play({ ctx, dest: ctx.destination });
  const data = (await ctx.startRendering()).getChannelData(0);
  let peak = 0;
  let sum = 0;
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const v = Math.abs(data[i]!);
    if (v > peak) peak = v;
    if (v > 0.002) last = i;
    sum += v * v;
  }
  const rms = Math.sqrt(sum / Math.max(1, last));
  return { name: '', peak, rms, length: last / RATE };
}

function withGain(out: Out, gain: number): Out {
  const g = out.ctx.createGain();
  g.gain.value = gain;
  g.connect(out.dest);
  return { ctx: out.ctx, dest: g };
}

/** Renders one level's cut scene: every cue, over its world's theme played softly. */
function renderScene(levelId: number): Promise<Row> {
  const scene = getCutScene(levelId)!;
  const tl = buildTimeline(scene.script);
  const cues = sceneCues(tl, SCENE_SOUNDS);
  return render(tl.realDuration / 1000 + 2, (out) => {
    const music = withGain(out, MUSIC_MIX * PART_GAIN.quiet);
    playSongOnce(music, SONGS[worldSong(getLevel(levelId)!.world)], 0, false);
    for (const c of cues) SFX[c.sound](out, c.at / 1000, c);
  });
}

async function measureAll(): Promise<Row[]> {
  const rows: Row[] = [];
  const add = async (name: string, row: Promise<Row>) => rows.push({ ...(await row), name });
  for (const name of SFX_NAMES) {
    await add(
      name,
      render(3.5, (out) => SFX[name](out, 0, { n: 3, size: 1, ms: 1400 })),
    );
  }
  for (const [id, song] of Object.entries({ ...SONGS, ...STINGS })) {
    await add(
      `♪ ${id}`,
      render(62, (out) => playSongOnce(withGain(out, MUSIC_MIX), song, 0)),
    );
  }
  for (const level of [1, 8, 21, 32, 40]) await add(`scene ${level}`, renderScene(level));
  return rows;
}

const flag = (r: Row) =>
  r.peak < 0.02 ? 'silent?' : r.peak > (r.name.startsWith('scene') ? 1.5 : 0.8) ? 'loud' : '';

export function SoundBoard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => installAudio(), []);

  const measure = () => {
    setBusy(true);
    void measureAll().then((r) => {
      (window as unknown as { soundReport: Row[] }).soundReport = r;
      setRows(r);
      setBusy(false);
    });
  };

  return (
    <div className="gallery sounds">
      <h1>Sounds (tap once to wake the audio)</h1>
      <h2>Effects</h2>
      <div className="sounds__grid">
        {SFX_NAMES.map((name: SfxName) => (
          <button key={name} type="button" data-sound="off" onClick={() => playSfx(name, { n: 3 })}>
            {name}
          </button>
        ))}
      </div>
      <h2>Music</h2>
      <div className="sounds__grid">
        {(Object.keys(SONGS) as SongId[]).flatMap((id) => [
          <button key={id} type="button" data-sound="off" onClick={() => setMusic(id)}>
            {id}
          </button>,
          <button
            key={`${id}-groove`}
            type="button"
            data-sound="off"
            onClick={() => setMusic(id, 'groove')}
          >
            {id} groove
          </button>,
        ])}
        {(Object.keys(STINGS) as StingId[]).map((id) => (
          <button key={id} type="button" data-sound="off" onClick={() => playSting(id)}>
            sting: {id}
          </button>
        ))}
        <button type="button" data-sound="off" onClick={() => setMusic(null)}>
          ■ stop
        </button>
      </div>
      <h2>Levels</h2>
      <button type="button" disabled={busy} onClick={measure}>
        {busy ? 'Measuring…' : 'Measure everything'}
      </button>
      {rows && (
        <table className="sounds__table">
          <thead>
            <tr>
              <th>sound</th>
              <th>peak</th>
              <th>rms</th>
              <th>length (s)</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.peak.toFixed(2)}</td>
                <td>{r.rms.toFixed(3)}</td>
                <td>{r.length.toFixed(2)}</td>
                <td>{flag(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
