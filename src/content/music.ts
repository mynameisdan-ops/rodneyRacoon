import type { Song } from '../audio/notation';

/**
 * The music (data only): a theme for the title and one per world, plus short stings. Notation:
 * `src/audio/notation.ts` (8 eighth-note steps a bar; `-` holds, `.` rests). The sequencer adds
 * the bass, arpeggio and drums from each song's styles; on a timed page a world's theme plays
 * without its tune, so it doesn't pull attention from the math.
 */
export type SongId = 'title' | 'world1' | 'world2' | 'world3' | 'world4' | 'world5';
export type StingId = 'win' | 'retry' | 'world' | 'home';

// prettier-ignore
export const SONGS: Record<SongId, Song> = {
  // The title: warm and adventurous, in C.
  title: {
    bpm: 116, form: 'AABA', lead: 'square', bass: 'rootFifth', arp: 'up', drums: 'beat',
    sections: {
      A: {
        chords: 'C | Am | F | G',
        lead: 'E5 - G5 - C6 - B5 A5 | A5 - E5 - - - C5 D5 | F5 - A5 - C6 - D6 C6 | B5 - - - G5 - . .',
      },
      B: {
        chords: 'F | G | Em Am | Dm G',
        lead: 'A5 - - C6 A5 - F5 - | G5 - - B5 G5 - D5 - | E5 - G5 - A5 - C6 - | D6 - C6 - B5 - G5 -',
      },
    },
  },
  // World 1, the old mine: a bouncy minor tune on a xylophone, a mine-cart bass.
  world1: {
    bpm: 104, form: 'AABA', lead: 'bell', bass: 'walk', arp: 'none', drums: 'soft',
    sections: {
      A: {
        chords: 'Am | Am | F | E',
        lead: 'A4 . C5 E5 A5 - E5 . | G5 . E5 . C5 D5 E5 . | F5 . A5 . C6 - A5 . | G#5 - - - E5 . B4 .',
      },
      B: {
        chords: 'Dm | Am | F | E',
        lead: 'D5 . F5 . A5 . F5 . | E5 . A5 . C6 . A5 . | F5 . E5 . D5 . C5 . | B4 - - . E5 - - .',
      },
    },
  },
  // World 2, the forest: a gentle flute over rolling arpeggios, in G.
  world2: {
    bpm: 108, form: 'AABA', lead: 'flute', bass: 'rootFifth', arp: 'updown', drums: 'soft',
    sections: {
      A: {
        chords: 'G | Em | C | D',
        lead: 'B4 - D5 - G5 - - - | F#5 - E5 - D5 - B4 - | C5 - E5 - G5 - A5 G5 | F#5 - - - D5 - - -',
      },
      B: {
        chords: 'C | D | Bm Em | Am D',
        lead: 'E5 - - G5 E5 - C5 - | D5 - - F#5 A5 - - - | B5 - A5 - G5 - F#5 E5 | E5 - - - F#5 - - -',
      },
    },
  },
  // World 3, the river: quick and splashy, in D.
  world3: {
    bpm: 126, form: 'AABA', lead: 'square', bass: 'pulse', arp: 'up', drums: 'beat',
    sections: {
      A: {
        chords: 'D | A | Bm | G',
        lead: 'F#5 . A5 . D6 - A5 F#5 | E5 - A5 - C#6 - - . | D6 . B5 . F#5 . B5 . | A5 - G5 - F#5 - E5 -',
      },
      B: {
        chords: 'G | A | F#m Bm | G A',
        lead: 'B5 - - A5 G5 - D5 - | C#6 - - B5 A5 - E5 - | F#5 - A5 - D6 - F#6 - | E6 - D6 - C#6 - A5 -',
      },
    },
  },
  // World 4, the mountains: slow and grand, a horn over a march, in F.
  world4: {
    bpm: 92, form: 'AABA', lead: 'triangle', bass: 'long', arp: 'up', drums: 'march',
    sections: {
      A: {
        chords: 'F | C | Dm | Bb',
        lead: 'C5 - - F5 F5 - G5 - | A5 - - - G5 - - - | D5 - - F5 A5 - C6 - | Bb5 - - - A5 - G5 -',
      },
      B: {
        chords: 'Dm | Bb | F C | Bb C',
        lead: 'D6 - - - A5 - - - | Bb5 - - - F5 - - - | A5 - - G5 F5 - E5 - | D5 - - - E5 - G5 -',
      },
    },
  },
  // World 5, the canyon: a western gallop, in E minor, riding home.
  world5: {
    bpm: 132, form: 'AABA', lead: 'flute', bass: 'gallop', arp: 'none', drums: 'gallop',
    sections: {
      A: {
        chords: 'Em | Em | C | D',
        lead: 'E5 - - - B4 - E5 - | G5 - F#5 - E5 - D5 - | E5 - - - C5 - E5 G5 | F#5 - - - - - . .',
      },
      B: {
        chords: 'G | D | C | B7',
        lead: 'B5 - - - G5 - B5 - | A5 - - - F#5 - D5 - | E5 - G5 - C6 - B5 A5 | B5 - - - D#5 - F#5 -',
      },
    },
  },
};

// prettier-ignore
export const STINGS: Record<StingId, Song> = {
  // A passed page: a quick rising fanfare.
  win: {
    bpm: 150, form: 'A', lead: 'square', bass: 'long', arp: 'none', drums: 'hit', sting: true,
    sections: { A: { chords: 'C | C', lead: 'G4 C5 E5 G5 C6 - E6 - | G6 - - - - - . .' } },
  },
  // A page to try again: gentle and hopeful, rising at the end.
  retry: {
    bpm: 112, form: 'A', lead: 'flute', bass: 'long', arp: 'none', drums: 'none', sting: true,
    sections: { A: { chords: 'F | C', lead: 'C5 - D5 - E5 - G5 - | A5 - - - G5 - - .' } },
  },
  // A world's boss beaten.
  world: {
    bpm: 120, form: 'A', lead: 'square', bass: 'rootFifth', arp: 'stab', drums: 'march', sting: true,
    sections: {
      A: {
        chords: 'C | F | G | C',
        lead: 'G5 - - G5 C6 - - - | A5 - - A5 F5 - - - | B5 - D6 - G6 - F6 - | E6 - - - - - . .',
      },
    },
  },
  // Home at last (level 40): the title tune, then a big finish.
  home: {
    bpm: 132, form: 'A', lead: 'square', bass: 'rootFifth', arp: 'up', drums: 'beat', sting: true,
    sections: {
      A: {
        chords: 'C | Am | F | G | C | C',
        lead: 'E5 - G5 - C6 - B5 A5 | A5 - E5 - - - C5 D5 | F5 - A5 - C6 - D6 C6 | B5 - - - G5 - - - | C6 - - - G5 - C6 - | E6 - - - - - . .',
      },
    },
  },
};

/** The theme for a world (the title theme for anything else). */
export function worldSong(worldId: number): SongId {
  return worldId >= 1 && worldId <= 5 ? (`world${worldId}` as SongId) : 'title';
}
