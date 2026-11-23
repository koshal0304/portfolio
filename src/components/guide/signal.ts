// Shared, three.js-free contract between the DOM guide and the 3D loop.

export type Gesture = 'idle' | 'wave' | 'point' | 'present' | 'think' | 'celebrate' | 'explain' | 'nod' | 'shake' | 'shrug';
export type Mood = 'neutral' | 'happy' | 'excited' | 'curious' | 'alert';

/** Mouth shape estimated from the live voice: jaw opening, spread (E/I), rounded (O/U), sibilant (S/F). */
export interface VoiceShape {
  open: number;
  wide: number;
  round: number;
  hiss: number;
}

/** Shared mutable channel between the DOM guide and the 3D loop (no React re-renders per frame). */
export interface GuideSignal {
  gesture: Gesture;
  mood: Mood;
  since: number;
  talking: boolean;
  /** The visitor is typing a question: lean in, look at the bubble. */
  listening: boolean;
  focusEl: Element | null;
  travelDir: number;
  travelAt: number;
  /** When he last dissolved out of one dock to re-materialise in the other. */
  teleportAt: number;
  /** When he first finished materialising (0 until then): the first hello waits for it. */
  readyAt: number;
  pokedAt: number;
  /** Which way the body angles: toward the page content (−1 = docked left, 1 = docked right). */
  side: number;
  /** 0 = standing in the hero, 1 = docked in the corner (drives camera framing). */
  dock: number;
  /** Head top / centre in stage fractions (0..1 from top-left), written by the 3D loop for the bubble. */
  head: { x: number; y: number };
  /** Live loudness (0..1) of the voice clip being played, for lip-sync; null when silent. */
  level: (() => number | null) | null;
  shape: ((level: number) => VoiceShape | null) | null;
}

export const createSignal = (): GuideSignal => ({
  gesture: 'idle',
  mood: 'neutral',
  since: 0,
  talking: false,
  listening: false,
  focusEl: null,
  travelDir: 0,
  travelAt: -1e9,
  teleportAt: -1e9,
  readyAt: 0,
  pokedAt: -1e9,
  side: 1,
  dock: 0,
  head: { x: 0.5, y: 0.2 },
  level: null,
  shape: null,
});
