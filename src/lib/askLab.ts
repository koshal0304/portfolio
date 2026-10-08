// Decoupled cross-component signals (palette → AI Lab, any button → palette).
export const ASK_EVENT = 'lab:ask';
export const PALETTE_EVENT = 'palette:open';

export function askLab(query: string) {
  window.dispatchEvent(new CustomEvent(ASK_EVENT, { detail: query }));
  document.getElementById('ai-sandbox')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export const openPalette = () => window.dispatchEvent(new Event(PALETTE_EVENT));
