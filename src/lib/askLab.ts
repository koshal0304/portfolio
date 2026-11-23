import { travelTo } from './smoothScroll';

// Decoupled cross-component signals (palette → AI Lab, any button → palette).
export const ASK_EVENT = 'lab:ask';
export const PALETTE_EVENT = 'palette:open';

export function askLab(query: string) {
  window.dispatchEvent(new CustomEvent(ASK_EVENT, { detail: query }));
  travelTo('#ai-sandbox');
}

export const openPalette = () => window.dispatchEvent(new Event(PALETTE_EVENT));

/** Start the twin's narrated tour. Call it inside a click so the guide may start audio. */
export const TOUR_EVENT = 'twin:tour';
export const startTour = () => window.dispatchEvent(new Event(TOUR_EVENT));

/** Let any section make the twin react (a sent form gets a celebration, and so on). */
export type TwinReaction = 'celebrate' | 'nod' | 'wave';
export const REACT_EVENT = 'twin:react';
export const reactTwin = (kind: TwinReaction) => window.dispatchEvent(new CustomEvent<TwinReaction>(REACT_EVENT, { detail: kind }));
