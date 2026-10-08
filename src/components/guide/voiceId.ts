import { SENTENCE_SPLIT } from '../../lib/retrieval.ts';

export const splitSentences = (text: string) => text.split(SENTENCE_SPLIT).map((s) => s.trim()).filter(Boolean);

/** Stable clip id for a spoken sentence (FNV-1a), shared by `npm run voice` and the player. */
export function clipId(sentence: string): string {
  let h = 0x811c9dc5;
  for (const ch of sentence.trim()) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
