export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export type TitlePreset =
  | 'prism'
  | 'hologram'
  | 'ribbon'
  | 'lattice'
  | 'architect'
  | 'odometer'
  | 'blueprint'
  | 'vortex';

export const CHAPTER_PRESET: Record<string, TitlePreset> = {
  '01': 'prism',
  '02': 'hologram',
  '03': 'ribbon',
  '04': 'lattice',
  '05': 'architect',
  '06': 'odometer',
  '07': 'blueprint',
  '08': 'vortex',
};
