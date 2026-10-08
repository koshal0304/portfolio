// Prints every sentence the AI guide can speak as JSON [{ id, text }] for scripts/voice.py.
// Answers quote knowledge-base sentences verbatim, so those are the whole Q&A vocabulary.
import { KNOWLEDGE } from '../src/data/knowledge.ts';
import { QUIPS, REPLIES, SCRIPT } from '../src/components/guide/script.ts';
import { clipId, splitSentences } from '../src/components/guide/voiceId.ts';

const texts = [
  ...Object.values(SCRIPT).flat().map((b) => b.text),
  ...QUIPS.map((b) => b.text),
  ...Object.values(REPLIES),
  ...KNOWLEDGE.map((c) => c.text),
];
const lines = new Map<string, string>();
for (const sentence of texts.flatMap(splitSentences)) lines.set(clipId(sentence), sentence);
console.log(JSON.stringify([...lines].map(([id, text]) => ({ id, text }))));
