import React, { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDownRight, AudioLines, Search } from 'lucide-react';
import { openPalette, startTour } from '../lib/askLab';
import { Magnetic3D, ScrambleText, ScrollKineticLead, SlotRollText } from './KineticText';
import { EASE } from '../lib/kineticPresets';

// The numbers a recruiter should see in the first five seconds.
const PROOF = [
  { value: '0.48 → 0.81', label: 'RAG recall, +69%' },
  { value: '6+', label: 'AI systems in production' },
  { value: '−60%', label: 'S3 storage cost' },
  { value: '98%', label: 'ResNet18 val. accuracy' },
];

const HERO_LINES = [
  { text: "Hi, I'm Koshal.", accentWord: 'Koshal.', muted: false },
  { text: 'I build AI that ships.', accentWord: 'ships.', muted: true },
] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.8, ease: EASE },
});

const proofTilt = (e: React.PointerEvent<HTMLDivElement>) => {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--py', `${((e.clientX - r.left) / r.width - 0.5) * 9}deg`);
  el.style.setProperty('--px', `${-((e.clientY - r.top) / r.height - 0.5) * 9}deg`);
};

const proofUntilt = (e: React.PointerEvent<HTMLDivElement>) => {
  e.currentTarget.style.setProperty('--px', '0deg');
  e.currentTarget.style.setProperty('--py', '0deg');
};

/**
 * Headline left, digital twin right. The twin itself is the guide's stage (AIGuide), laid out over
 * #twin-slot; it flies into the corner as this section scrolls away.
 */
const Hero: React.FC = () => {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  // The twin stays put while the page scrolls; its floor light must not slide past him.
  const stageLight = useTransform(scrollY, [0, 140], [1, 0]);
  // Desktop: the copy drifts up and dissolves as the twin flies off (phones read it below the portrait).
  const wide = typeof window !== 'undefined' && window.innerWidth >= 768;
  const exitY = useTransform(scrollY, [0, 700], [0, wide ? -140 : 0]);
  const exitOpacity = useTransform(scrollY, [0, 560], [1, wide ? 0 : 1]);

  // Subtle 3D perspective plane tilt for the hero display typography
  const titleBoxRef = useRef<HTMLDivElement>(null);
  const rawRx = useMotionValue(0);
  const rawRy = useMotionValue(0);
  const titleRx = useSpring(rawRx, { stiffness: 150, damping: 22 });
  const titleRy = useSpring(rawRy, { stiffness: 150, damping: 22 });

  let runningCharIdx = 0;

  return (
    <section
      id="hero"
      className="relative mx-auto flex min-h-[100svh] max-w-[1240px] flex-col-reverse justify-center gap-2 px-5 pb-16 pt-24 md:grid md:grid-cols-12 md:items-center md:gap-8 md:px-8 md:pb-20 md:pt-28"
    >
      <motion.div style={{ y: exitY, opacity: exitOpacity }} className="relative z-10 md:col-span-7">
        <motion.span {...rise(0.05)} className="eyebrow backdrop-blur-sm">
          <span className="relative flex h-2 w-2 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          </span>
          <ScrambleText text="AI Engineer · Bengaluru · Open to roles" durationMs={760} retriggerOnHover />
        </motion.span>

        {/* 3D Prism Kinetic Hero Typography with Cursor-Reactive Plane & Per-Letter Physics */}
        <div
          ref={titleBoxRef}
          className="mt-6 [perspective:1200px]"
          onPointerMove={
            reduce
              ? undefined
              : (e) => {
                  if (e.pointerType !== 'mouse' || !titleBoxRef.current) return;
                  const r = titleBoxRef.current.getBoundingClientRect();
                  const nx = (e.clientX - r.left) / r.width - 0.5;
                  const ny = (e.clientY - r.top) / r.height - 0.5;
                  rawRy.set(nx * 6.5);
                  rawRx.set(-ny * 5.5);
                }
          }
          onPointerLeave={
            reduce
              ? undefined
              : () => {
                  rawRx.set(0);
                  rawRy.set(0);
                }
          }
        >
          <motion.div style={reduce ? undefined : { rotateX: titleRx, rotateY: titleRy, transformStyle: 'preserve-3d' }}>
            <h1
              aria-label="Hi, I'm Koshal. I build AI that ships."
              className="text-extrude-gold font-display text-[46px] font-medium leading-[0.98] tracking-display text-slate-100 sm:text-[60px] lg:text-[76px]"
            >
              {reduce ? (
                <>
                  <span className="block">
                    Hi, I'm <span className="text-shader-gold">Koshal.</span>
                  </span>
                  <span className="block text-slate-300">
                    I build AI that <span className="text-shader-prism">ships.</span>
                  </span>
                </>
              ) : (
                HERO_LINES.map((line, lineIdx) => {
                  const words = line.text.split(' ');
                  return (
                    <span
                      key={line.text}
                      aria-hidden="true"
                      className={`block pb-[0.07em] [transform-style:preserve-3d] ${line.muted ? 'text-slate-300/90' : ''}`}
                    >
                      {words.map((word, wIdx) => {
                        const isHighlight = word === line.accentWord;
                        const chars = Array.from(word);
                        return (
                          <React.Fragment key={`${lineIdx}-${wIdx}`}>
                            <span className="inline-flex whitespace-nowrap align-bottom [transform-style:preserve-3d]">
                              {chars.map((ch, cIdx) => {
                                const idx = runningCharIdx++;
                                return (
                                  <motion.span
                                    key={cIdx}
                                    className={`kinetic-glyph inline-block origin-bottom will-change-transform ${
                                      isHighlight ? (lineIdx === 0 ? 'text-shader-gold' : 'text-shader-prism') : ''
                                    }`}
                                    style={isHighlight ? { animationDelay: `${-(idx * 0.15)}s` } : undefined}
                                    initial={{
                                      y: '110%',
                                      rotateX: -72,
                                      z: -55,
                                      opacity: 0,
                                      filter: 'blur(8px)',
                                    }}
                                    animate={{
                                      y: '0%',
                                      rotateX: 0,
                                      z: 0,
                                      opacity: 1,
                                      filter: 'blur(0px)',
                                    }}
                                    transition={{
                                      delay: 0.1 + idx * 0.022,
                                      duration: 0.85,
                                      ease: EASE,
                                    }}
                                    whileHover={{
                                      y: -6,
                                      scale: 1.08,
                                      transition: { type: 'spring', stiffness: 420, damping: 16 },
                                    }}
                                  >
                                    {ch}
                                  </motion.span>
                                );
                              })}
                            </span>
                            {wIdx < words.length - 1 ? ' ' : ''}
                          </React.Fragment>
                        );
                      })}
                    </span>
                  );
                })
              )}
            </h1>
          </motion.div>
        </div>

        <ScrollKineticLead
          inView
          delay={0.34}
          className="mt-6 max-w-[34rem] text-[16px] leading-relaxed text-slate-300 md:text-[17px]"
        >
          Production LLM systems end to end: LangGraph multi-agent platforms, enterprise RAG, schema-aware NL-to-SQL, and the guardrails that keep them safe in front of real users.
        </ScrollKineticLead>

        <motion.div {...rise(0.45)} className="mt-8 flex flex-wrap items-center gap-3">
          <Magnetic3D strength={0.22} tilt={6}>
            <button
              type="button"
              onClick={startTour}
              className="slot-roll-trigger btn btn-primary group relative overflow-hidden"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-soft group-hover:translate-x-full"
              />
              <AudioLines className="h-4 w-4" />
              <SlotRollText text="Take the guided tour" accentClassName="text-deep" />
            </button>
          </Magnetic3D>
          <Magnetic3D strength={0.22} tilt={6}>
            <a href="#ai-sandbox" className="slot-roll-trigger btn btn-ghost group">
              <SlotRollText text="Explore the live AI lab" accentClassName="text-accent-200" />
              <ArrowDownRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:text-accent-300" />
            </a>
          </Magnetic3D>
        </motion.div>

        <motion.dl
          {...rise(0.55)}
          data-guide="proof"
          className="mt-12 grid max-w-[40rem] grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-white/15 bg-white/10 shadow-[0_24px_50px_-30px_rgba(6,8,16,0.8)] sm:grid-cols-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {PROOF.map((p, idx) => (
            <motion.div
              key={p.label}
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56 + idx * 0.06, duration: 0.55, ease: EASE }}
              onPointerMove={reduce ? undefined : proofTilt}
              onPointerLeave={proofUntilt}
              style={
                reduce
                  ? undefined
                  : {
                      transform: 'perspective(650px) rotateX(var(--px, 0deg)) rotateY(var(--py, 0deg))',
                      transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
                    }
              }
              className="spotlight flex flex-col-reverse justify-between gap-1.5 bg-canvas/85 px-4 py-4"
            >
              <dt className="font-mono text-[10px] uppercase leading-snug tracking-[0.12em] text-slate-400">
                {p.label}
              </dt>
              <dd className="text-shader-gold whitespace-nowrap text-[22px] font-medium tabular-nums tracking-tight md:text-[24px]">
                {p.value}
              </dd>
            </motion.div>
          ))}
        </motion.dl>

        <motion.button
          {...rise(0.65)}
          type="button"
          onClick={openPalette}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 font-mono text-[11px] text-slate-400 transition-colors hover:text-slate-100"
        >
          <Search className="h-3.5 w-3.5 text-accent-300/80" />
          <span className="hidden md:inline">
            Press <kbd className="rounded border border-white/20 bg-white/[0.04] px-1.5 py-0.5 text-slate-200">/</kbd> to semantically search my experience
          </span>
          <span className="md:hidden">Tap to semantically search my experience</span>
        </motion.button>
      </motion.div>

      {/* The twin stands here: a warm light pool and a floor glow, the 3D stage is laid over it. */}
      <div className="relative w-full md:col-span-5">
        <motion.div
          id="twin-slot"
          aria-hidden="true"
          style={{ opacity: stageLight }}
          className="relative mx-auto h-[44svh] min-h-[300px] w-full max-w-[440px] md:h-[min(78svh,720px)] md:max-w-none"
        >
          <div className="absolute inset-x-[8%] bottom-[18%] top-[6%] rounded-full bg-[radial-gradient(closest-side,rgba(244,182,120,0.22),rgba(244,182,120,0.06)_55%,transparent)] blur-2xl" />
          <div className="absolute inset-x-[18%] bottom-[10%] h-10 rounded-[50%] bg-[radial-gradient(closest-side,rgba(10,12,20,0.45),transparent)]" />
          <span className="absolute bottom-[3%] left-1/2 hidden -translate-x-1/2 items-center gap-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 md:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" />
            <ScrambleText text="Digital twin · rendered live · tap to talk" durationMs={900} />
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
