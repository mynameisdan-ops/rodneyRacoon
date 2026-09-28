/** Avatar options (data only). The avatar builder UI arrives in M8. */

export const SKIN_TONES = [
  { name: 'Light', value: '#f6d2b5' },
  { name: 'Peach', value: '#f1c29b' },
  { name: 'Tan', value: '#d9a066' },
  { name: 'Brown', value: '#a86b3c' },
  { name: 'Dark brown', value: '#6e4222' },
] as const;

export const HAIR_COLORS = [
  { name: 'Black', value: '#2b2118' },
  { name: 'Brown', value: '#6b3e1e' },
  { name: 'Light brown', value: '#9a6433' },
  { name: 'Blond', value: '#e0b458' },
  { name: 'Red', value: '#b5502a' },
] as const;

export const HAIR_STYLES = ['short', 'spiky', 'curly'] as const;
export type HairStyle = (typeof HAIR_STYLES)[number];

export const PANTS_COLORS = ['#2d4a7a', '#4a4a4a', '#6b5a3e', '#2f6b4f'] as const;
export const SHOE_COLORS = ['#3b2a20', '#e63946', '#1d3557', '#f4f4f4'] as const;
