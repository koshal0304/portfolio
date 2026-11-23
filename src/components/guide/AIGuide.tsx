import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, AudioLines, MessageCircle, Mic, Minus, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import SafeBoundary from '../SafeBoundary';
import { useActiveSection } from '../../utils/useActiveSection';
import { inspect, synthesize } from '../../lib/retrieval';
import { getIndex } from '../../data/knowledge';
import { REACT_EVENT, TOUR_EVENT, type TwinReaction } from '../../lib/askLab';
import { travelTo } from '../../lib/smoothScroll';
import { createSignal } from './signal';
import { DOCK, GUIDE_SECTIONS, LISTEN_ERROR, NUDGE, QUIPS, REPLIES, SCRIPT, SUGGESTIONS, SURPRISE, THANKS, TOUR, greeting, type Beat } from './script';
import { prefetch, speak, speechSupported, stopSpeaking, unlockAudio, voiceLevel, voiceShape } from './speech';
import { splitSentences } from './voiceId';

const AvatarStage = lazy(() => import('./AvatarStage'));

// The browser's own speech recognition (Chrome, Edge, Safari), so a visitor can simply ask out loud.
interface Recognition {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
const speechApi = typeof window === 'undefined' ? {} : (window as unknown as Record<string, unknown>);
const Recognizer = (speechApi.SpeechRecognition ?? speechApi.webkitSpeechRecognition) as (new () => Recognition) | undefined;

const load = (key: string) => {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};
const save = (key: string, value: boolean) => {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // storage unavailable (private mode): preference just won't persist
  }
};

/** Time a reader needs for a caption. */
const readMs = (text: string) => Math.max(3500, text.length * 65);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
/** Docked stage height by breakpoint; the hero size is whatever #twin-slot lays out to. */
const dockHeight = () => (innerWidth >= 1280 ? 250 : innerWidth >= 768 ? 220 : 150);
const partsOf = (b: Beat) => b.parts ?? splitSentences(b.text);
const SCROLL_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End']);

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

const AIGuide: React.FC = () => {
  const section = useActiveSection(GUIDE_SECTIONS);
  const isDesktop = useMedia('(min-width: 768px)');
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)');

  const signal = useRef({ ...createSignal(), level: voiceLevel, shape: voiceShape });
  const stageRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [docked, setDocked] = useState(false);
  const [minimized, setMinimized] = useState(() => load('guide:min'));
  const [voiceOn, setVoiceOn] = useState(false);
  const [beat, setBeat] = useState<Beat | null>(null);
  const [shown, setShown] = useState(0);
  const [open, setOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [question, setQuestion] = useState('');
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [tourPaused, setTourPaused] = useState(false);

  const voiceRef = useRef(false);
  const speakingRef = useRef(false);
  const typingRef = useRef(false);
  const askingRef = useRef(false);
  const minimizedRef = useRef(minimized);
  const sideRef = useRef<'left' | 'right'>('right');
  const dockedRef = useRef(false);
  const seen = useRef(new Set<string>());
  const pokes = useRef(0);
  const pokeTimes = useRef<number[]>([]);
  const nudged = useRef(false);
  const tour = useRef({ on: false, paused: false, done: false, i: 0, token: 0 });
  const recognition = useRef<Recognition | null>(null);
  const highlighted = useRef<Element | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const syncTalking = () => (signal.current.talking = typingRef.current || speakingRef.current);

  const highlight = (el: Element | null) => {
    highlighted.current?.classList.remove('guide-focus');
    highlighted.current = el;
    if (!el) return;
    el.classList.add('guide-focus');
    clearTimeout(timers.current.focus);
    timers.current.focus = setTimeout(() => el.classList.remove('guide-focus'), 4500);
  };

  /** Say a beat. `after` runs once it has been heard (or read), after a natural breath. */
  const play = useCallback((b: Beat, after?: () => void) => {
    const s = signal.current;
    clearTimeout(timers.current.after);
    setBeat(b);
    setShown(0);
    setOpen(true);
    s.gesture = b.gesture;
    s.mood = b.mood ?? 'neutral';
    s.since = performance.now();
    s.focusEl = b.focus ? document.querySelector(b.focus) : null;
    highlight(s.focusEl);
    typingRef.current = true;
    const next = (ms: number) => after && (timers.current.after = setTimeout(after, ms));
    if (voiceRef.current) {
      speakingRef.current = true;
      speak(
        partsOf(b),
        (i) => setShown((n) => Math.max(n, i)),
        () => {
          speakingRef.current = false;
          setShown(b.text.length);
          syncTalking();
          next(550);
        }
      );
    } else {
      stopSpeaking();
      speakingRef.current = false;
      next(readMs(b.text) + 900);
    }
    syncTalking();

    // Collapse the caption once it has been read; answers, offers and tour lines stay up.
    clearTimeout(timers.current.hide);
    if (!b.reply && !b.actions && !after) {
      const hide = () => (speakingRef.current || askingRef.current ? (timers.current.hide = setTimeout(hide, 1500)) : setOpen(false));
      timers.current.hide = setTimeout(hide, readMs(b.text) + (window.innerWidth < 768 ? 1200 : 4000));
    }
  }, []);

  /** Say beats one after another, like a person finishing one thought before the next. */
  const sequence = useCallback(
    (beats: Beat[], done?: () => void) => {
      const [first, ...rest] = beats;
      if (!first) return done?.();
      if (voiceRef.current && rest[0]) prefetch(partsOf(rest[0]));
      play(first, rest.length || done ? () => sequence(rest, done) : undefined);
    },
    [play]
  );

  // ─── Guided tour ───────────────────────────────────────────────────────────────────────────
  const endTour = useCallback(() => {
    const t = tour.current;
    t.on = false;
    t.paused = false;
    t.token++;
    clearTimeout(timers.current.tour);
    setTourStep(null);
    setTourPaused(false);
  }, []);

  /** Fly to a chapter while saying the travel line, then present it once there. */
  const runStop = useCallback(
    (i: number) => {
      const t = tour.current;
      const stop = TOUR[i];
      const token = ++t.token;
      const alive = () => t.on && !t.paused && t.token === token;
      if (!stop) {
        t.done = true;
        return endTour();
      }
      t.i = i;
      setTourStep(i);
      let arrived = false;
      let ready = !stop.lead;
      const present = () => {
        if (!alive() || !arrived || !ready) return;
        sequence(stop.beats, () => {
          if (alive()) timers.current.tour = setTimeout(() => alive() && runStop(i + 1), 650);
        });
      };
      if (voiceRef.current) [stop.lead, ...stop.beats].forEach((b) => b && prefetch(partsOf(b)));
      if (stop.lead)
        play(stop.lead, () => {
          ready = true;
          present();
        });
      travelTo(`#${stop.id}`, {
        duration: i === 0 ? 1.2 : 2.2,
        onComplete: () => {
          arrived = true;
          timers.current.arrive = setTimeout(present, 250);
        },
      });
    },
    [play, sequence, endTour]
  );

  const pauseTour = useCallback(() => {
    const t = tour.current;
    if (!t.on || t.paused) return;
    t.paused = true;
    t.token++;
    clearTimeout(timers.current.after);
    clearTimeout(timers.current.tour);
    stopSpeaking();
    speakingRef.current = false;
    syncTalking();
    setTourPaused(true);
  }, []);

  const skipTour = (delta: number) => {
    const t = tour.current;
    if (!t.on) return;
    t.paused = false;
    setTourPaused(false);
    stopSpeaking();
    runStop(Math.max(0, Math.min(TOUR.length - 1, t.i + delta)));
  };

  const setMin = useCallback(
    (min: boolean) => {
      setMinimized(min);
      minimizedRef.current = min;
      save('guide:min', min);
      if (min) {
        endTour();
        stopSpeaking();
        speakingRef.current = false;
        clearTimeout(timers.current.after);
        setOpen(false);
        highlight(null);
      }
    },
    [endTour]
  );

  /** Must run inside a click: browsers only allow audio after a user gesture. */
  const enableVoice = useCallback(() => {
    if (!speechSupported) return;
    setVoiceOn(true);
    voiceRef.current = true;
    unlockAudio();
  }, []);

  const beginTour = useCallback(() => {
    setMin(false);
    enableVoice();
    setAsking(false);
    askingRef.current = false;
    signal.current.listening = false;
    GUIDE_SECTIONS.forEach((id) => seen.current.add(id)); // chapter intros won't talk over the tour
    const t = tour.current;
    t.on = true;
    t.paused = false;
    runStop(0);
  }, [enableVoice, runStop, setMin]);

  useEffect(() => {
    const pending = timers.current; // same object for the component's lifetime
    return () => {
      Object.values(pending).forEach(clearTimeout);
      highlighted.current?.classList.remove('guide-focus');
      recognition.current?.stop();
      stopSpeaking();
    };
  }, []);

  // The stage is laid out at the hero slot's size, then scaled (never resized) into the dock.
  useEffect(() => {
    const slot = document.getElementById('twin-slot');
    const measure = () => {
      const w = slot?.offsetWidth || 420;
      const h = slot?.offsetHeight || 520;
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    };
    measure();
    const ro = slot ? new ResizeObserver(measure) : null;
    if (slot) ro?.observe(slot);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // One frame loop places the stage and the caption: standing in the hero, then flying into the
  // corner as the hero scrolls away (scrubbed by scroll, smoothed so wheel steps never jerk it).
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let p = -1;
    let dockX = -1;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const stage = stageRef.current;
      const W = stage?.offsetWidth ?? 0;
      const H = stage?.offsetHeight ?? 0;
      if (!stage || !W || !H) return;
      const s = signal.current;
      const slot = document.getElementById('twin-slot')?.getBoundingClientRect();
      const hero = document.getElementById('hero');
      // Desktop: he stays put beside the headline while it scrolls away, scrubbed into the dock.
      // Phones: he sits above the headline, so he scrolls with it, then swoops into the dock.
      const phone = innerWidth < 768;
      const heroX = slot ? slot.left : innerWidth - W - 12;
      const heroY = slot ? slot.top + (phone ? 0 : scrollY) : 80;
      const target = !hero || !slot ? 1 : phone ? (slot.bottom > innerHeight * 0.42 ? 0 : 1) : clamp01((scrollY - innerHeight * 0.04) / (hero.offsetHeight * 0.55));
      p = p < 0 || reducedMotion ? target : p + (target - p) * (1 - Math.exp(-dt * 8));
      const e = smooth(p);
      const dh = dockHeight();
      const k = dh / H;
      const dw = W * k;
      const right = sideRef.current === 'right';
      const toX = right ? innerWidth - dw - 12 : 12;
      // Switching sides while docked is a teleport: hold while he dissolves, jump while he's gone.
      const sinceTeleport = now - s.teleportAt;
      if (dockX < 0 || reducedMotion) dockX = toX;
      else if (sinceTeleport < 380) {
        // still dissolving in the old dock
      } else if (sinceTeleport < 1000) dockX = toX;
      else dockX += (toX - dockX) * (1 - Math.exp(-dt * 4));
      const x = heroX + (dockX - heroX) * e;
      const y = heroY + (innerHeight - dh - 6 - heroY) * e;
      const scale = 1 + (k - 1) * e;
      stage.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      if (haloRef.current) haloRef.current.style.opacity = String(e * 0.9);

      s.dock = e;
      s.side = right ? 1 : -1;
      const isDocked = e > 0.97;
      if (isDocked !== dockedRef.current) {
        dockedRef.current = isDocked;
        setDocked(isDocked);
      }

      const bubble = bubbleRef.current;
      if (!bubble) return;
      const bw = bubble.offsetWidth;
      const bh = bubble.offsetHeight;
      const sw = W * scale;
      const sh = H * scale;
      const hx = x + s.head.x * sw;
      const hy = y + s.head.y * sh;
      let bx: number;
      let by: number;
      if (e < 0.5) {
        bx = hx - bw / 2; // hero: a lower third where the portrait fades out (over the torso on phones)
        by = y + sh * (phone ? 0.5 : 0.7);
      } else if (phone) {
        bx = innerWidth - bw - 12;
        by = y - bh - 6;
      } else {
        bx = right ? Math.min(hx + 80, innerWidth - 12) - bw : Math.max(hx - 80, 12);
        by = hy - bh - 6;
      }
      bx = Math.min(Math.max(bx, 12), innerWidth - bw - 12);
      by = Math.min(Math.max(by, 72), innerHeight - bh - 8);
      const fade = clamp01(Math.abs(e - 0.5) * 5);
      bubble.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
      bubble.style.opacity = String(fade);
      bubble.style.pointerEvents = fade > 0.5 ? '' : 'none';
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  // Caption pacing: with voice on the audio clock drives it and this slow tick only prevents a stall.
  useEffect(() => {
    if (!beat) return;
    if (shown >= beat.text.length) {
      typingRef.current = false;
      syncTalking();
      return;
    }
    const id = setTimeout(() => setShown((n) => n + (voiceOn ? 1 : 2)), voiceOn ? 110 : 40);
    return () => clearTimeout(id);
  }, [beat, shown, voiceOn]);

  // Chapter choreography: move to the chapter's dock, then introduce it once (unless touring).
  useEffect(() => {
    if (minimized) return;
    let id: ReturnType<typeof setTimeout>;
    const first = seen.current.size === 0;
    const since = performance.now();
    // The first hello waits until he has visibly materialised (a slow GPU compiles his shaders first),
    // so the wave is seen, not spent while his canvas is still warming up.
    const wait = () => {
      const ready = signal.current.readyAt > 0 || performance.now() - since > 6000;
      id = first && !ready ? setTimeout(wait, 120) : setTimeout(run, first ? 350 : 650);
    };
    const run = () => {
      const s = signal.current;
      const next = isDesktop ? (DOCK[section] ?? 'right') : 'right';
      if (sideRef.current !== next) {
        sideRef.current = next;
        s.travelDir = next === 'left' ? -1 : 1;
        s.travelAt = performance.now();
        if (dockedRef.current && !reducedMotion) s.teleportAt = performance.now();
      }
      if (askingRef.current || tour.current.on) return;
      if (seen.current.has(section)) {
        s.gesture = 'nod';
        s.since = performance.now();
        return;
      }
      seen.current.add(section);
      if (section === 'hero') play(greeting());
      else sequence(SCRIPT[section] ?? []);
      if (voiceRef.current) {
        const after = GUIDE_SECTIONS[GUIDE_SECTIONS.indexOf(section) + 1];
        (SCRIPT[after] ?? []).forEach((b) => prefetch(partsOf(b)));
      }
    };
    wait();
    return () => clearTimeout(id);
  }, [section, minimized, isDesktop, reducedMotion, play, sequence]);

  // "Take the guided tour" anywhere on the page.
  useEffect(() => {
    window.addEventListener(TOUR_EVENT, beginTour);
    return () => window.removeEventListener(TOUR_EVENT, beginTour);
  }, [beginTour]);

  // Other sections can make him react (a sent message gets a celebration).
  useEffect(() => {
    const on = (e: Event) => {
      const kind = (e as CustomEvent<TwinReaction>).detail;
      if (kind === 'celebrate' && !minimizedRef.current && !tour.current.on) return play(THANKS);
      const s = signal.current;
      s.gesture = kind;
      s.since = performance.now();
    };
    window.addEventListener(REACT_EVENT, on);
    return () => window.removeEventListener(REACT_EVENT, on);
  }, [play]);

  // Scrolling by hand during the tour means the visitor wants the wheel: pause, offer to resume.
  useEffect(() => {
    if (tourStep === null || tourPaused) return;
    const interrupt = (e: Event) => {
      if (e instanceof KeyboardEvent && (!SCROLL_KEYS.has(e.key) || (e.target as HTMLElement)?.closest?.('input, textarea'))) return;
      pauseTour();
    };
    window.addEventListener('wheel', interrupt, { passive: true });
    window.addEventListener('touchmove', interrupt, { passive: true });
    window.addEventListener('keydown', interrupt);
    return () => {
      window.removeEventListener('wheel', interrupt);
      window.removeEventListener('touchmove', interrupt);
      window.removeEventListener('keydown', interrupt);
    };
  }, [tourStep, tourPaused, pauseTour]);

  // After a quiet while, offer the tour once (never mid-tour, mid-sentence or mid-question).
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const offer = () => {
      if (nudged.current || tour.current.on || tour.current.done) return;
      if (speakingRef.current || askingRef.current || minimizedRef.current) return reset();
      nudged.current = true;
      play(NUDGE);
    };
    const reset = () => {
      clearTimeout(id);
      id = setTimeout(offer, 40000);
    };
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(id);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [play]);

  const toggleVoice = () => {
    if (voiceOn) {
      setVoiceOn(false);
      voiceRef.current = false;
      stopSpeaking();
      speakingRef.current = false;
      syncTalking();
    } else {
      enableVoice();
      play(beat ?? QUIPS[0]);
    }
  };

  const setAsk = (on: boolean) => {
    setAsking(on);
    askingRef.current = on;
    signal.current.listening = on;
    if (on) pauseTour();
  };

  const ask = (q: string) => {
    const query = q.trim().slice(0, 300);
    if (!query) return;
    setQuestion('');
    pauseTour();
    stopSpeaking();
    speakingRef.current = false;
    // A person takes a beat before answering; so does the twin.
    const s = signal.current;
    s.gesture = 'think';
    s.mood = 'curious';
    s.since = performance.now();
    setThinking(true);
    clearTimeout(timers.current.think);
    timers.current.think = setTimeout(() => {
      setThinking(false);
      const verdict = inspect(query);
      if (verdict.blocked) {
        return play({
          text: REPLIES.blocked,
          note: `Guardrail: ${verdict.findings.map((f) => f.label).join(' · ')} (risk ${verdict.risk.toFixed(2)})`,
          gesture: 'shake',
          mood: 'alert',
          reply: true,
        });
      }
      const retrieval = getIndex().search(query, 3);
      const answer = synthesize(retrieval, 2);
      if (!answer.length) return play({ text: REPLIES.noEvidence, gesture: 'shrug', mood: 'curious', reply: true });
      const parts = answer.map((a) => a.text);
      play({ text: parts.join(' '), parts, gesture: 'explain', mood: 'happy', href: retrieval.hits[0].chunk.href, reply: true });
    }, 650 + Math.random() * 350);
  };

  /** Ask out loud: words appear in the box as they're recognised, the answer follows. */
  const listen = () => {
    if (!Recognizer) return;
    if (listening) return recognition.current?.stop();
    enableVoice();
    stopSpeaking();
    speakingRef.current = false;
    syncTalking();
    setAsk(true);
    const rec = new Recognizer();
    rec.lang = navigator.language || 'en-US';
    rec.interimResults = true;
    let heard = '';
    let failed = '';
    rec.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      heard = text;
      setQuestion(text);
    };
    rec.onerror = (e) => (failed = e.error);
    rec.onend = () => {
      setListening(false);
      recognition.current = null;
      if (heard.trim()) return ask(heard);
      if (failed && failed !== 'aborted')
        play({ ...LISTEN_ERROR, note: failed === 'not-allowed' ? 'Microphone access is blocked for this site.' : undefined });
    };
    recognition.current = rec;
    setListening(true);
    signal.current.listening = true;
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const poke = () => {
    const now = performance.now();
    signal.current.pokedAt = now;
    if (minimized) setMin(false);
    pauseTour();
    pokeTimes.current = [...pokeTimes.current.filter((t) => now - t < 4000), now];
    if (pokeTimes.current.length >= 5) {
      pokeTimes.current = [];
      return play(SURPRISE);
    }
    play(QUIPS[pokes.current++ % QUIPS.length]);
  };

  const words = useMemo(() => (beat ? [...beat.text.matchAll(/\S+\s*/g)].map((m) => ({ w: m[0], at: m.index ?? 0 })) : []), [beat]);
  const typing = !!beat && shown < beat.text.length;
  const hidden = minimized && docked;
  const status = listening
    ? 'listening'
    : thinking
      ? 'thinking'
      : typing || speakingRef.current
        ? 'speaking'
        : tourStep !== null
          ? tourPaused
            ? 'tour paused'
            : `guiding · ${tourStep + 1}/${TOUR.length}`
          : asking
            ? 'listening'
            : 'online';
  const iconBtn = 'cursor-pointer rounded-full p-1.5 transition-colors text-slate-300 hover:bg-white/10 hover:text-slate-100';

  return (
    <>
      <div
        ref={stageRef}
        aria-hidden={hidden}
        className="fixed left-0 top-0 z-[35] pointer-events-none"
        style={{ width: size.w || undefined, height: size.h || undefined, transformOrigin: '0 0', willChange: 'transform', opacity: hidden ? 0 : 1, transition: 'opacity 0.4s' }}
      >
        {/* A soft light behind him once docked, so he never looks cut out of the page. */}
        <div
          ref={haloRef}
          className="absolute inset-x-[6%] bottom-[16%] top-[8%] rounded-full bg-[radial-gradient(closest-side,rgba(244,182,120,0.3),rgba(165,180,252,0.08)_60%,transparent)] opacity-0"
        />
        {size.w > 0 && (
          <SafeBoundary>
            <Suspense fallback={null}>
              <AvatarStage signal={signal} stage={stageRef} reducedMotion={reducedMotion} paused={hidden} />
            </Suspense>
          </SafeBoundary>
        )}
        {!hidden && (
          <button
            type="button"
            onClick={poke}
            data-cursor="Talk"
            aria-label="Talk to Koshal's digital twin"
            className="pointer-events-auto absolute left-1/2 top-[6%] h-[48%] w-[34%] -translate-x-1/2 cursor-pointer rounded-full focus-visible:outline focus-visible:outline-accent-400"
          />
        )}
      </div>

      <AnimatePresence>
        {hidden && (
          <motion.button
            key="min"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setMin(false)}
            aria-label="Open the AI guide"
            className="fixed bottom-4 right-4 z-[35] h-14 w-14 cursor-pointer rounded-full bg-accent-400 p-[2px] shadow-[0_10px_30px_-8px_rgba(244,182,120,0.7)]"
          >
            <img src="/profile.jpeg" alt="" className="h-full w-full rounded-full border-2 border-canvas object-cover" />
          </motion.button>
        )}
      </AnimatePresence>

      <div ref={bubbleRef} className="fixed left-0 top-0 z-[36] w-[min(calc(100vw-24px),330px)]" style={{ willChange: 'transform' }}>
        <AnimatePresence>
          {open && beat && !hidden && (
            <motion.div
              key="bubble"
              role="complementary"
              aria-label="AI guide"
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/[0.14] bg-canvas/75 p-3.5 shadow-[0_24px_60px_-20px_rgba(10,12,20,0.7)] backdrop-blur-2xl backdrop-saturate-150"
            >
              <div className="mb-2 flex items-center gap-2">
                <img src="/profile.jpeg" alt="" className="h-6 w-6 rounded-full border border-accent-300/50 object-cover" />
                <div className="min-w-0 leading-none">
                  <div className="truncate text-[12px] font-medium text-slate-100">Koshal · digital twin</div>
                  <div className="mt-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent-300">
                    <span className={`h-1.5 w-1.5 rounded-full ${status === 'online' ? 'bg-emerald-400' : 'animate-pulse bg-accent-300'}`} />
                    {status}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleVoice}
                      aria-pressed={voiceOn}
                      aria-label={voiceOn ? 'Mute voice' : 'Turn on voice'}
                      className={`flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 font-mono text-[10px] transition-colors ${
                        voiceOn ? 'bg-accent-400/15 text-accent-200' : 'text-slate-300 hover:bg-white/10 hover:text-slate-100'
                      }`}
                    >
                      {voiceOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                      {!voiceOn && <span>Voice</span>}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setAsk(!asking)}
                    aria-pressed={asking}
                    aria-label="Ask the guide a question"
                    className={asking ? 'cursor-pointer rounded-full bg-accent-400/15 p-1.5 text-accent-200' : iconBtn}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => setMin(true)} aria-label="Minimize the guide" className={iconBtn}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {thinking ? (
                <p className="flex h-5 items-center gap-1 pl-0.5" aria-label="Thinking">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </p>
              ) : (
                <p className="text-[13.5px] leading-relaxed text-slate-100" aria-live={beat.reply ? 'polite' : 'off'}>
                  {/* Live-caption highlight is visual only; assistive tech gets the whole line at once. */}
                  <span aria-hidden="true">
                    {words.map(({ w, at }) => (
                      <span key={at} className={at < shown ? undefined : 'word-pending'}>
                        {w}
                      </span>
                    ))}
                  </span>
                  <span className="sr-only">{beat.text}</span>
                </p>
              )}

              {beat.note && !thinking && <p className="mt-1.5 font-mono text-[10px] leading-snug text-rose-200">{beat.note}</p>}

              {beat.href && !typing && !thinking && (
                <a href={beat.href} className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-accent-300 hover:text-accent-200">
                  Show me <ArrowRight className="h-3 w-3" />
                </a>
              )}

              {beat.actions && tourStep === null && !asking && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {beat.actions.includes('tour') && (
                    <button type="button" onClick={beginTour} className="btn btn-primary !gap-1.5 !px-3.5 !py-1.5 text-[12px]">
                      <AudioLines className="h-3.5 w-3.5" />
                      Take the tour
                    </button>
                  )}
                  {beat.actions.includes('ask') && (
                    <button type="button" onClick={() => setAsk(true)} className="btn btn-ghost !px-3.5 !py-1.5 text-[12px]">
                      Ask a question
                    </button>
                  )}
                </div>
              )}

              {tourStep !== null && (
                <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2.5">
                  <div className="flex flex-1 gap-1" aria-label={`Tour stop ${tourStep + 1} of ${TOUR.length}`}>
                    {TOUR.map((stop, i) => (
                      <span
                        key={stop.id}
                        className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i < tourStep ? 'bg-accent-400/60' : i === tourStep ? 'bg-accent-300' : 'bg-white/15'}`}
                      />
                    ))}
                  </div>
                  <button type="button" onClick={() => skipTour(-1)} aria-label="Previous stop" className={iconBtn}>
                    <SkipBack className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => (tourPaused ? skipTour(0) : pauseTour())}
                    aria-label={tourPaused ? 'Resume the tour' : 'Pause the tour'}
                    className={iconBtn}
                  >
                    {tourPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                  </button>
                  <button type="button" onClick={() => skipTour(1)} aria-label="Next stop" className={iconBtn}>
                    <SkipForward className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={endTour} aria-label="End the tour" className={iconBtn}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {asking && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    ask(question);
                  }}
                  className="mt-2.5"
                >
                  <label htmlFor="guide-question" className="sr-only">
                    Ask about Koshal's work
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="guide-question"
                      autoFocus
                      value={question}
                      maxLength={300}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Escape' && setAsk(false)}
                      placeholder={listening ? 'Listening…' : 'Ask me about his work…'}
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-sunken/70 px-3 py-2 text-[12.5px] text-slate-100 placeholder-slate-400 focus:border-accent-400/60 focus:outline-none"
                    />
                    {Recognizer && (
                      <button
                        type="button"
                        onClick={listen}
                        aria-pressed={listening}
                        aria-label={listening ? 'Stop listening' : 'Ask out loud'}
                        className={`relative shrink-0 cursor-pointer rounded-xl p-2 transition-colors ${
                          listening ? 'bg-accent-400 text-deep' : 'border border-white/10 bg-sunken/70 text-slate-200 hover:border-accent-400/50'
                        }`}
                      >
                        {listening && <span className="absolute inset-0 animate-ping rounded-xl bg-accent-400/40" />}
                        <Mic className="relative h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {!question && !listening && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {SUGGESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => ask(q)}
                          className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-200 transition-colors hover:border-accent-400/50 hover:text-slate-100"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AIGuide;
