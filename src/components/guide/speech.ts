// Natural voice: every line is pre-rendered offline with Kokoro (open neural TTS, Apache-2.0)
// into /voice/<id>.mp3 by `npm run voice`. A sentence without a clip falls back to the best
// voice the browser offers, so new copy still speaks before clips are regenerated.
import { VOICE_CLIPS } from './voiceClips';
import { clipId } from './voiceId';

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
export const speechSupported = VOICE_CLIPS.size > 0 || !!synth;

let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let generation = 0;
let frame = 0;
const samples = new Uint8Array(512);

/** Call from the click that turns voice on: browsers only allow audio after a user gesture. */
export function unlockAudio() {
  audio ??= new Audio();
  try {
    if (!analyser) {
      ctx = new AudioContext();
      const source = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = samples.length;
      source.connect(analyser);
      analyser.connect(ctx.destination);
    }
    void ctx?.resume();
  } catch {
    analyser = null; // no Web Audio: clips still play, the mouth uses its procedural flap
  }
}

/** Loudness 0..1 of the clip playing now (lip-sync), or null when no clip is playing. */
export function voiceLevel(): number | null {
  if (!analyser || !audio || audio.paused) return null;
  analyser.getByteTimeDomainData(samples);
  let sum = 0;
  for (const v of samples) sum += ((v - 128) / 128) ** 2;
  return Math.min(1, Math.sqrt(sum / samples.length) * 6);
}

// Fallback ranking: neural/natural voices first (Edge, Safari premium), then decent defaults.
const NATURAL = /natural|neural|premium|enhanced|online/i;
const PREFERRED = /Andrew|Brian|Guy|Christopher|Prabhat|Ryan|Daniel|Google UK English Male|Google US English/i;
let voice: SpeechSynthesisVoice | null = null;
function pickVoice() {
  const en = synth?.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en')) ?? [];
  return (
    en.find((v) => NATURAL.test(v.name) && PREFERRED.test(v.name)) ??
    en.find((v) => NATURAL.test(v.name)) ??
    en.find((v) => PREFERRED.test(v.name)) ??
    en[0] ??
    null
  );
}
synth?.addEventListener?.('voiceschanged', () => (voice = pickVoice()));

function browserSay(text: string, gen: number, onBoundary: (i: number) => void, done: () => void) {
  if (!synth) return done();
  voice ??= pickVoice();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.onboundary = (e) => gen === generation && onBoundary(e.charIndex + (e.charLength || 0));
  u.onend = u.onerror = done;
  synth.speak(u);
}

/**
 * Speak sentences in order. `onProgress` receives the caption character index (offsets assume
 * `parts.join(' ')`). `onEnd` fires once at the end and never for a call that was cancelled.
 */
export function speak(parts: string[], onProgress: (chars: number) => void, onEnd: () => void) {
  stopSpeaking();
  const gen = generation;
  const live = () => gen === generation;
  let base = 0;

  const play = (i: number) => {
    if (!live()) return;
    if (i >= parts.length) return onEnd();
    const text = parts[i];
    const start = base;
    base += text.length + 1;
    let finished = false;
    let fellBack = false;
    const done = () => {
      if (finished || !live()) return;
      finished = true;
      cancelAnimationFrame(frame);
      onProgress(start + text.length);
      play(i + 1);
    };
    // A missing clip can fire both onerror and a rejected play(); speak the fallback once.
    const fallback = () => {
      if (!live() || finished || fellBack) return;
      fellBack = true;
      browserSay(text, gen, (c) => onProgress(start + c), done);
    };

    const id = clipId(text);
    if (!audio || !VOICE_CLIPS.has(id)) return fallback();
    const a = audio;
    a.src = `/voice/${id}.mp3`;
    a.onended = done;
    a.onerror = fallback;
    a.play().catch(fallback);
    // Captions follow the audio clock smoothly (timeupdate only fires ~4×/s).
    const tick = () => {
      if (!live() || finished) return;
      if (a.duration) onProgress(start + Math.round((text.length * a.currentTime) / a.duration));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  };
  play(0);
}

export function stopSpeaking() {
  generation++;
  cancelAnimationFrame(frame);
  audio?.pause();
  synth?.cancel();
}
