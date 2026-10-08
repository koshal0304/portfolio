// Shared, three.js-free contract between the DOM guide and the 3D loop.

export type Gesture = 'idle' | 'wave' | 'point' | 'present' | 'think' | 'celebrate' | 'explain' | 'nod' | 'shake';
export type Mood = 'neutral' | 'happy' | 'excited' | 'curious' | 'alert';

/** Shared mutable channel from the DOM guide to the 3D loop (no React re-renders per frame). */
export interface GuideSignal {
  gesture: Gesture;
  mood: Mood;
  since: number;
  talking: boolean;
  focusEl: Element | null;
  travelDir: number;
  travelAt: number;
  pokedAt: number;
  /** Live loudness (0..1) of the voice clip being played, for lip-sync; null when silent. */
  level: (() => number | null) | null;
}

export const createSignal = (): GuideSignal => ({
  gesture: 'idle',
  mood: 'neutral',
  since: 0,
  talking: false,
  focusEl: null,
  travelDir: 0,
  travelAt: -1e9,
  pokedAt: -1e9,
  level: null,
});
