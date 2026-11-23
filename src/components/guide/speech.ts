// Natural voice: every line is pre-rendered offline with Kokoro (open neural TTS, Apache-2.0) into
// /voice/<id>.mp3 by `npm run voice`. Clips are decoded once and scheduled back to back on the Web
// Audio clock with breath-length pauses, so a beat flows like one utterance instead of stop-start
// sentences; a beat rendered as a single clip is preferred (prosody carries across sentences).
// Lines without a clip fall back to the best voice the browser offers.
import { VOICE_CLIPS } from './voiceClips';
import { clipId } from './voiceId';
import type { VoiceShape } from './signal';

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
export const speechSupported = VOICE_CLIPS.size > 0 || !!synth;

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let voiceGain: GainNode | null = null;
let sources: AudioBufferSourceNode[] = [];
let playing = false;
let generation = 0;
let frame = 0;
let frontMean = 0.5;
const wave = new Uint8Array(1024);
const spectrum = new Uint8Array(512);
const raw = new Map<string, Promise<ArrayBuffer | null>>();
const decoded = new Map<string, Promise<AudioBuffer | null>>();

const fetchClip = (id: string) => {
  let p = raw.get(id);
  if (!p) {
    p = fetch(`/voice/${id}.mp3`)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null);
    raw.set(id, p);
  }
  return p;
};

const decode = (id: string) => {
  const c = ctx;
  if (!c) return Promise.resolve(null);
  let p = decoded.get(id);
  if (!p) {
    // decodeAudioData detaches its input; keep the fetched bytes reusable.
    p = fetchClip(id)
      .then((bytes) => (bytes ? c.decodeAudioData(bytes.slice(0)) : null))
      .catch(() => null);
    decoded.set(id, p);
  }
  return p;
};

/** What actually gets played for a line: the whole line when it was rendered as one clip, else its sentences. */
export function spokenUnits(parts: string[]): string[] {
  const whole = parts.join(' ');
  return parts.length > 1 && VOICE_CLIPS.has(clipId(whole)) ? [whole] : parts;
}

/** Warm the cache for lines that are about to be spoken, so playback starts without a gap. */
export function prefetch(parts: string[]) {
  for (const unit of spokenUnits(parts)) {
    const id = clipId(unit);
    if (VOICE_CLIPS.has(id)) void (ctx ? decode(id) : fetchClip(id));
  }
}

/** Call from the click that turns voice on: browsers only allow audio after a user gesture. */
export function unlockAudio() {
  try {
    if (!ctx) {
      ctx = new AudioContext();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.3;
      analyser.connect(ctx.destination);
    }
    void ctx.resume();
  } catch {
    ctx = null; // no Web Audio: the browser voice still works, the mouth uses its procedural flap
    analyser = null;
  }
}

/** Loudness 0..1 of the clip playing now (lip-sync), or null when no clip is playing. */
export function voiceLevel(): number | null {
  if (!analyser || !playing) return null;
  analyser.getByteTimeDomainData(wave);
  let sum = 0;
  for (const v of wave) sum += ((v - 128) / 128) ** 2;
  return Math.min(1, Math.sqrt(sum / wave.length) * 5);
}

const ramp = (x: number, a: number, b: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));

/**
 * Rough mouth shape from the live spectrum. Open vowels put energy in F1, E/I push it up into F2,
 * O/U keep it low, sibilants live above 4 kHz. Measured against the voice's own running average,
 * so it adapts to the speaker's tilt instead of fixed thresholds.
 */
export function voiceShape(level: number): VoiceShape | null {
  if (!analyser || !ctx || !playing) return null;
  analyser.getByteFrequencyData(spectrum);
  const hz = ctx.sampleRate / analyser.fftSize;
  const band = (lo: number, hi: number) => {
    const a = Math.floor(lo / hz);
    const b = Math.min(spectrum.length - 1, Math.ceil(hi / hz));
    let s = 0;
    for (let i = a; i <= b; i++) s += spectrum[i];
    return s / ((b - a + 1) * 255);
  };
  const f1 = band(250, 900);
  const f2 = band(900, 2600);
  const voiced = f1 + f2 + 1e-3;
  const front = f2 / voiced;
  if (level > 0.06) frontMean += (front - frontMean) * 0.03;
  const hiss = ramp(band(4000, 9000) / voiced, 0.25, 0.75) * ramp(level, 0.03, 0.2);
  const open = ramp(level, 0.04, 0.6) * (1 - hiss * 0.6);
  return {
    open,
    wide: open * ramp(front - frontMean, -0.01, 0.06),
    round: open * ramp(frontMean - front, -0.01, 0.06),
    hiss,
  };
}

// Browser fallback: neural/natural voices first (Edge, Safari premium), then decent defaults.
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

function sayInBrowser(lines: string[], gen: number, onProgress: (chars: number) => void, onEnd: () => void) {
  let base = 0;
  const next = (i: number) => {
    if (gen !== generation) return;
    if (i >= lines.length || !synth) {
      onProgress(lines.join(' ').length);
      return onEnd();
    }
    const text = lines[i];
    const start = base;
    base += text.length + 1;
    voice ??= pickVoice();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.onboundary = (e) => gen === generation && onProgress(start + e.charIndex + (e.charLength || 0));
    u.onend = u.onerror = () => {
      if (gen !== generation) return;
      onProgress(start + text.length);
      setTimeout(() => next(i + 1), 160); // a breath between sentences
    };
    synth.speak(u);
  };
  next(0);
}

/** A breath between sentences, a little longer after questions; never metronomic. */
const pauseAfter = (text: string) => (/[?!]$/.test(text) ? 0.42 : /[.:]$/.test(text) ? 0.34 : 0.22) + Math.random() * 0.08;

/** Clip time → caption index. Punctuation takes longer to say than letters, so highlights stay on the word being heard. */
function captionClock(text: string) {
  const weights = [...text].map((ch) => (/[.!?]/.test(ch) ? 6 : /[,;:—–]/.test(ch) ? 3.5 : ch === ' ' ? 1.2 : 1));
  const cum = new Float32Array(weights.length + 1);
  weights.forEach((w, i) => (cum[i + 1] = cum[i] + w));
  return (fraction: number) => {
    const target = fraction * cum[weights.length];
    let lo = 0;
    let hi = weights.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid + 1] < target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
}

/**
 * Speak sentences in order. `onProgress` receives the caption character index (offsets assume
 * `parts.join(' ')`). `onEnd` fires once at the end and never for a call that was cancelled.
 */
export function speak(parts: string[], onProgress: (chars: number) => void, onEnd: () => void) {
  stopSpeaking();
  const gen = generation;
  const lines = spokenUnits(parts);
  const ids = lines.map(clipId);
  const c = ctx;
  const out = analyser;
  if (!c || !out || ids.some((id) => !VOICE_CLIPS.has(id))) return sayInBrowser(lines, gen, onProgress, onEnd);

  Promise.all(ids.map(decode)).then((buffers) => {
    if (gen !== generation) return;
    if (buffers.some((b) => !b)) return sayInBrowser(lines, gen, onProgress, onEnd);
    const gain = c.createGain();
    gain.connect(out);
    voiceGain = gain;
    let at = c.currentTime + 0.05;
    let base = 0;
    const plan = (buffers as AudioBuffer[]).map((buffer, i) => {
      const src = c.createBufferSource();
      src.buffer = buffer;
      src.connect(gain);
      src.start(at);
      sources.push(src);
      const seg = { start: at, end: at + buffer.duration, base, clock: captionClock(lines[i]) };
      base += lines[i].length + 1;
      at = seg.end + pauseAfter(lines[i]);
      return seg;
    });
    playing = true;
    const tick = () => {
      if (gen !== generation) return;
      const now = c.currentTime;
      const seg = plan.find((s) => now < s.end);
      if (!seg) {
        playing = false;
        onProgress(base);
        return onEnd();
      }
      if (now >= seg.start) onProgress(seg.base + seg.clock((now - seg.start) / (seg.end - seg.start)));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  });
}

export function stopSpeaking() {
  generation++;
  cancelAnimationFrame(frame);
  playing = false;
  // Fade instead of cutting mid-word: no click, sounds like the twin stopped to listen.
  if (ctx && voiceGain) {
    const stopAt = ctx.currentTime + 0.12;
    voiceGain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
    for (const s of sources) {
      try {
        s.stop(stopAt);
      } catch {
        // never started
      }
    }
  }
  sources = [];
  voiceGain = null;
  synth?.cancel();
}
