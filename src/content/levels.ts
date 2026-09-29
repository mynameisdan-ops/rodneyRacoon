import type { SkillId } from '../game/problems';

export interface WorldDef {
  id: number;
  name: string;
}

export interface LevelDef {
  /** 1-based level number, 1..40. */
  id: number;
  world: number;
  skill: SkillId;
  /** Problems on the page. */
  problems: number;
  /** Default difficulty (0..1) inside the skill until adaptive difficulty lands (M6). */
  difficulty: number;
  /** The obstacle the cut scene shows after this level. */
  obstacle: string;
  /** Short cut-scene caption (kept short: gameplay must not depend on reading). */
  caption: string;
  boss?: boolean;
}

export const WORLDS: WorldDef[] = [{ id: 1, name: 'Old Mine Shaft' }];

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    world: 1,
    skill: 'add-within-5',
    problems: 10,
    difficulty: 0.2,
    obstacle: 'Cart race',
    caption: 'Cart race!',
  },
  {
    id: 2,
    world: 1,
    skill: 'add-within-10',
    problems: 10,
    difficulty: 0.2,
    obstacle: 'Cart jump',
    caption: 'Jump the gap!',
  },
  {
    id: 3,
    world: 1,
    skill: 'add-within-10',
    problems: 12,
    difficulty: 0.7,
    obstacle: 'Wall smash',
    caption: 'Smash through!',
  },
  {
    id: 4,
    world: 1,
    skill: 'doubles',
    problems: 12,
    difficulty: 0.5,
    obstacle: 'Rat swarm',
    caption: 'Swing over the rats!',
  },
  {
    id: 5,
    world: 1,
    skill: 'make-10',
    problems: 12,
    difficulty: 0.5,
    obstacle: 'Crystal cavern',
    caption: 'Hop the crystals!',
  },
  {
    id: 6,
    world: 1,
    skill: 'add-within-20',
    problems: 14,
    difficulty: 0.2,
    obstacle: 'Bat storm',
    caption: 'Slide under!',
  },
  {
    id: 7,
    world: 1,
    skill: 'add-within-20',
    problems: 15,
    difficulty: 0.8,
    obstacle: 'Runaway lift',
    caption: 'Grab the chain!',
  },
  {
    id: 8,
    world: 1,
    skill: 'world1-review',
    problems: 16,
    difficulty: 0.6,
    obstacle: 'Escape the mine',
    caption: 'Jump the canyon!',
    boss: true,
  },
];

export function getLevel(id: number): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getWorld(id: number): WorldDef | undefined {
  return WORLDS.find((w) => w.id === id);
}
