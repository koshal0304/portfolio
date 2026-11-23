// Prints every line the AI guide can speak as JSON [{ id, text }] for scripts/voice.py.
// Scripted beats render as one clip each, so intonation carries across their sentences (the player
// prefers a whole-beat clip). Answers quote knowledge-base sentences verbatim, so those render one
// sentence at a time and are the whole Q&A vocabulary.
import { KNOWLEDGE } from '../src/data/knowledge.ts';
import { GREETINGS, LISTEN_ERROR, NUDGE, QUIPS, REPLIES, SCRIPT, SURPRISE, THANKS, TOUR } from '../src/components/guide/script.ts';
import { clipId, splitSentences } from '../src/components/guide/voiceId.ts';

const beats = [
  ...Object.values(SCRIPT).flat(),
  ...TOUR.flatMap((stop) => [stop.lead, ...stop.beats]),
  ...QUIPS,
  NUDGE,
  SURPRISE,
  LISTEN_ERROR,
  THANKS,
].flatMap((b) => (b ? [b.text] : []));
const texts = [...beats, ...Object.values(GREETINGS), ...Object.values(REPLIES)];

const lines = new Map<string, string>();
for (const text of [...texts.map((t) => splitSentences(t).join(' ')), ...KNOWLEDGE.flatMap((c) => splitSentences(c.text))]) {
  lines.set(clipId(text), text);
}
console.log(JSON.stringify([...lines].map(([id, text]) => ({ id, text }))));
