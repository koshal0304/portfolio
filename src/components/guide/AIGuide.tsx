import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Minus, Volume2, VolumeX } from 'lucide-react';
import SafeBoundary from '../SafeBoundary';
import { useActiveSection } from '../../utils/useActiveSection';
import { inspect, synthesize } from '../../lib/retrieval';
import { getIndex } from '../../data/knowledge';
import { createSignal } from './signal';
import { DOCK, GUIDE_SECTIONS, QUIPS, REPLIES, SCRIPT, type Beat } from './script';
import { speak, speechSupported, stopSpeaking, unlockAudio, voiceLevel } from './speech';
import { splitSentences } from './voiceId';

const AvatarStage = lazy(() => import('./AvatarStage'));

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

  const signal = useRef({ ...createSignal(), level: voiceLevel });
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [minimized, setMinimized] = useState(() => load('guide:min'));
  const [voiceOn, setVoiceOn] = useState(false);
  const [beat, setBeat] = useState<Beat | null>(null);
  const [shown, setShown] = useState(0);
  const [open, setOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState('');
  const [side, setSide] = useState<'left' | 'right'>('right');

  const voiceRef = useRef(false);
  const speakingRef = useRef(false);
  const typingRef = useRef(false);
  const askingRef = useRef(false);
  const sideRef = useRef<'left' | 'right'>('right');
  const seen = useRef(new Set<string>());
  const pokes = useRef(0);
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

  const play = useCallback((b: Beat) => {
    const s = signal.current;
    setBeat(b);
    setShown(0);
    setOpen(true);
    s.gesture = b.gesture;
    s.mood = b.mood ?? 'neutral';
    s.since = performance.now();
    s.focusEl = b.focus ? document.querySelector(b.focus) : null;
    highlight(s.focusEl);
    typingRef.current = true;
    if (voiceRef.current) {
      speakingRef.current = true;
      speak(
        b.parts ?? splitSentences(b.text),
        (i) => setShown((n) => Math.max(n, i)),
        () => {
          speakingRef.current = false;
          setShown(b.text.length);
          syncTalking();
        }
      );
    } else {
      stopSpeaking();
      speakingRef.current = false;
    }
    syncTalking();

    // Collapse the caption once it has been read; answers to the visitor's own questions stay.
    clearTimeout(timers.current.hide);
    if (!b.reply) {
      const hide = () => (speakingRef.current || askingRef.current ? (timers.current.hide = setTimeout(hide, 1500)) : setOpen(false));
      timers.current.hide = setTimeout(hide, readMs(b.text) + (window.innerWidth < 768 ? 1200 : 4000));
    }
  }, []);

  // Appear shortly after the page settles.
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 1200);
    const pending = timers.current; // same object for the component's lifetime
    return () => {
      clearTimeout(id);
      Object.values(pending).forEach(clearTimeout);
      highlighted.current?.classList.remove('guide-focus');
      stopSpeaking();
    };
  }, []);

  // Caption typewriter; speech boundary events can push it ahead.
  useEffect(() => {
    if (!beat) return;
    if (shown >= beat.text.length) {
      typingRef.current = false;
      syncTalking();
      return;
    }
    // With voice on the audio clock drives the caption; this slow tick only prevents a stall.
    const id = setTimeout(() => setShown((n) => n + (voiceOn ? 1 : 2)), voiceOn ? 110 : 40);
    return () => clearTimeout(id);
  }, [beat, shown, voiceOn]);

  // Section choreography: travel to the section's dock, then introduce it once.
  useEffect(() => {
    if (!ready || minimized) return;
    const id = setTimeout(() => {
      const s = signal.current;
      const next = isDesktop ? (DOCK[section] ?? 'right') : 'right';
      if (sideRef.current !== next) {
        sideRef.current = next;
        s.travelDir = next === 'left' ? -1 : 1;
        s.travelAt = performance.now();
        setSide(next);
      }
      if (askingRef.current) return;
      clearTimeout(timers.current.follow);
      if (seen.current.has(section)) {
        s.gesture = 'nod';
        s.since = performance.now();
        return;
      }
      seen.current.add(section);
      const [first, second] = SCRIPT[section] ?? [];
      if (!first) return;
      play(first);
      if (second) timers.current.follow = setTimeout(() => play(second), readMs(first.text) + 1200);
    }, 650);
    return () => clearTimeout(id);
  }, [section, ready, minimized, isDesktop, play]);

  const toggleVoice = () => {
    const on = !voiceOn;
    setVoiceOn(on);
    voiceRef.current = on;
    if (on) {
      unlockAudio(); // inside the click, so the browser allows playback
      play(beat ?? QUIPS[0]);
    }
    else {
      stopSpeaking();
      speakingRef.current = false;
      syncTalking();
    }
  };

  const setMin = (min: boolean) => {
    setMinimized(min);
    save('guide:min', min);
    if (min) {
      stopSpeaking();
      speakingRef.current = false;
      highlight(null);
    }
  };

  const ask = (q: string) => {
    const query = q.trim().slice(0, 300);
    if (!query) return;
    setQuestion('');
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
    if (!answer.length) {
      return play({
        text: REPLIES.noEvidence,
        gesture: 'think',
        mood: 'curious',
        reply: true,
      });
    }
    const parts = answer.map((a) => a.text);
    play({ text: parts.join(' '), parts, gesture: 'explain', mood: 'happy', href: retrieval.hits[0].chunk.href, reply: true });
  };

  const poke = () => {
    signal.current.pokedAt = performance.now();
    play(QUIPS[pokes.current++ % QUIPS.length]);
  };

  if (!ready) return null;

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMin(false)}
        aria-label="Open the AI guide"
        className="fixed bottom-4 right-4 z-[35] w-14 h-14 rounded-full p-[2px] bg-[conic-gradient(from_0deg,#38bdf8,#a78bfa,#f472b6,#38bdf8)] shadow-[0_0_25px_rgba(56,189,248,0.35)] cursor-pointer"
      >
        <img src="/profile.jpeg" alt="" className="w-full h-full rounded-full object-cover border-2 border-[#06080d]" />
      </button>
    );
  }

  const typing = !!beat && shown < beat.text.length;
  const left = side === 'left';

  return (
    <motion.aside
      layout="position"
      transition={{ type: 'spring', stiffness: 70, damping: 16 }}
      aria-label="AI guide"
      className={`fixed bottom-2 z-[35] flex items-end gap-1 pointer-events-none right-2 flex-row md:flex-col md:gap-0 ${
        left ? 'md:right-auto md:left-3 md:items-start' : 'md:right-3 md:items-end'
      }`}
    >
      <AnimatePresence>
        {open && beat && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto mb-3 md:mb-0 w-[min(calc(100vw-150px),280px)] md:w-[300px] rounded-2xl bg-[#0a0e16]/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.08)] p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <img src="/profile.jpeg" alt="" className="w-6 h-6 rounded-full object-cover border border-sky-400/40" />
              <div className="leading-none min-w-0">
                <div className="text-[12px] font-semibold text-slate-100 truncate">Koshal · digital twin</div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-sky-300/80 mt-0.5">
                  {typing || speakingRef.current ? 'speaking' : asking ? 'listening' : 'online'}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-0.5">
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    aria-pressed={voiceOn}
                    aria-label={voiceOn ? 'Mute voice' : 'Turn on voice'}
                    className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                      voiceOn ? 'text-sky-300 bg-sky-500/10' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {voiceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    {!voiceOn && <span className="hidden md:inline">Voice</span>}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const next = !asking;
                    setAsking(next);
                    askingRef.current = next;
                  }}
                  aria-pressed={asking}
                  aria-label="Ask the guide a question"
                  className={`p-1 rounded-md transition-colors cursor-pointer ${asking ? 'text-sky-300 bg-sky-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMin(true)}
                  aria-label="Minimize the guide"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-[13px] leading-relaxed text-slate-200" aria-live={beat.reply ? 'polite' : 'off'}>
              {/* Typewriter is visual only; assistive tech gets the whole line at once. */}
              <span aria-hidden="true">
                {beat.text.slice(0, shown)}
                {typing && <span className="inline-block w-[2px] h-[1em] ml-0.5 align-[-2px] bg-sky-300 animate-pulse" />}
              </span>
              <span className="sr-only">{beat.text}</span>
            </p>

            {beat.note && <p className="mt-1.5 font-mono text-[10px] leading-snug text-rose-300/90">{beat.note}</p>}

            {beat.href && !typing && (
              <a
                href={beat.href}
                className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-sky-300 hover:text-sky-200"
              >
                Show me <ArrowRight className="w-3 h-3" />
              </a>
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
                <input
                  id="guide-question"
                  autoFocus
                  value={question}
                  maxLength={300}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setAsking(false);
                      askingRef.current = false;
                    }
                  }}
                  placeholder="Ask me about his work…"
                  className="w-full rounded-lg bg-[#06080d]/80 border border-white/10 px-3 py-2 text-[12px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400/60"
                />
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={stageRef}
        className="relative w-[120px] h-[140px] md:w-[210px] md:h-[230px] xl:w-[250px] xl:h-[270px] bg-[radial-gradient(closest-side,rgba(6,8,13,0.92),rgba(6,8,13,0.55)_65%,transparent)]"
      >
        <SafeBoundary>
          <Suspense fallback={null}>
            <AvatarStage signal={signal} stage={stageRef} reducedMotion={reducedMotion} />
          </Suspense>
        </SafeBoundary>
        <button
          type="button"
          onClick={poke}
          aria-label="Talk to Koshal's digital twin"
          className="pointer-events-auto absolute left-1/2 -translate-x-1/2 top-[8%] w-[38%] h-[62%] rounded-full cursor-pointer focus-visible:outline focus-visible:outline-sky-400"
        />
      </div>
    </motion.aside>
  );
};

export default AIGuide;
