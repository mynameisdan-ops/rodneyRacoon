import { LEVELS, WORLDS } from '../content/levels';
import { Stars } from '../ui/Stars';

interface Props {
  bestStars: Record<number, number>;
  onPlay: (levelId: number) => void;
}

/** Temporary level picker; the trail map replaces it in M2. */
export function LevelSelect({ bestStars, onPlay }: Props) {
  return (
    <div className="levels">
      <h1 className="levels__title">The Long Way Home</h1>
      {WORLDS.map((world) => (
        <section key={world.id} className="levels__world">
          <h2>
            World {world.id}: {world.name}
          </h2>
          <div className="levels__grid">
            {LEVELS.filter((l) => l.world === world.id).map((level) => (
              <button
                key={level.id}
                type="button"
                className={level.boss ? 'level-tile level-tile--boss' : 'level-tile'}
                onClick={() => onPlay(level.id)}
              >
                <span className="level-tile__num">{level.id}</span>
                <Stars count={bestStars[level.id] ?? 0} size={28} />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
