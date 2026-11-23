import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { roles, type RoleData } from '../data/profile';
import SectionHeader from './SectionHeader';
import { ExtrudedHeading, ScrambleText, SlotRollText } from './KineticText';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const GAP = 72;
// Pin first: the first card holds centre for a beat before the track moves, the last one after.
const HOLD = [0.08, 0.92];
const yearOf = (role: RoleData) => role.duration.match(/\d{4}/)?.[0] ?? '';

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

const RoleCard: React.FC<{ role: RoleData; index: number }> = ({ role, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <article data-guide={index === 0 ? 'current-role' : undefined} className="card spotlight rounded-[20px] p-6 md:p-8">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <ExtrudedHeading
            text={role.company}
            as="h3"
            variant="gold"
            className="font-display text-[22px] font-medium leading-tight tracking-tight text-slate-100 md:text-[28px]"
          />
          <p className="mt-1 text-[13px] text-slate-300">
            {role.title}
            <span className="mx-1.5 text-slate-500">·</span>
            <span className="text-slate-400">{role.location}</span>
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-slate-300">
          {role.duration}
        </span>
      </div>

      {role.subtitle && (
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-accent-300">
          <ScrambleText text={role.subtitle} retriggerOnHover durationMs={520} />
        </p>
      )}
      <p className="mb-5 text-[15px] leading-relaxed text-slate-300">{role.summary}</p>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {(open ? role.allTags : role.tags).map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-slate-300 transition-colors hover:border-accent-300/35 hover:text-slate-100">
            {tag}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="slot-roll-trigger inline-flex cursor-pointer items-center gap-1.5 text-[13px] text-slate-200 transition-colors hover:text-accent-300"
      >
        <SlotRollText
          text={open ? 'Hide projects' : `Show all ${role.projects.length} projects`}
          accentClassName="text-accent-300"
        />
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            {/* Scrolls on its own inside the pinned track; Lenis must not hijack it. */}
            <ul data-lenis-prevent className="mt-5 max-h-[30vh] space-y-4 overflow-y-auto border-t border-white/10 pr-2 pt-5">
              {role.projects.map((project) => (
                <li key={project.name} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" aria-hidden="true" />
                  <div>
                    <span className="mb-0.5 block text-[14px] font-medium text-slate-100">{project.name}</span>
                    <p className="text-[14px] leading-relaxed text-slate-300">{project.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};

interface SlotProps {
  role: RoleData;
  index: number;
  x: MotionValue<number>;
  centre: number;
  step: number;
  vw: number;
  width: number;
  onFocusCard: (index: number) => void;
}

/** One coverflow slab: turns toward the centre, recedes and dims with its distance from it. */
const CoverSlot: React.FC<SlotProps> = ({ role, index, x, centre, step, vw, width, onFocusCard }) => {
  const n = useTransform(x, (v) => (centre + v - vw / 2) / step); // distance from centre, in cards
  const near = useTransform(n, (v) => Math.min(Math.abs(v), 1.4));
  const rotateY = useTransform(n, (v) => Math.max(-38, Math.min(38, -v * 30)));
  const scale = useTransform(near, (v) => 1 - v * 0.12);
  const opacity = useTransform(near, (v) => 1 - v * 0.42);
  const z = useTransform(near, (v) => -v * 150);
  const ghostX = useTransform(n, (v) => v * -110);

  return (
    <motion.div
      style={{ width, rotateY, scale, opacity, z }}
      onFocusCapture={() => onFocusCard(index)}
      className="relative shrink-0 [transform-style:preserve-3d]"
    >
      <motion.span
        aria-hidden="true"
        style={{ x: ghostX }}
        className="pointer-events-none absolute -top-24 left-5 translate-y-1.5 select-none font-display text-[150px] font-semibold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(244,182,120,0.09)] blur-[1px]"
      >
        {yearOf(role)}
      </motion.span>
      <motion.span
        aria-hidden="true"
        style={{ x: ghostX }}
        className="pointer-events-none absolute -top-24 left-4 select-none font-display text-[150px] font-semibold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.1)]"
      >
        {yearOf(role)}
      </motion.span>
      {/* The sky's particles stay a glow behind the glass instead of crossing the text. */}
      <span aria-hidden="true" className="absolute inset-0 rounded-[20px] bg-canvas/60" />
      <RoleCard role={role} index={index} />
    </motion.div>
  );
};

const Tick: React.FC<{ progress: MotionValue<number>; at: number; role: RoleData }> = ({ progress, at, role }) => {
  const lit = useTransform(progress, (p) => (p >= at - 0.02 ? 1 : 0.3));
  return (
    <motion.div style={{ left: `${at * 100}%`, opacity: lit }} className="absolute top-0 -translate-x-1/2">
      <span className="mx-auto block h-3 w-px -translate-y-1.5 bg-slate-300" />
      <span className="mt-3 block whitespace-nowrap text-center font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300">
        {role.company}
      </span>
      <span className="block whitespace-nowrap text-center font-mono text-[10px] text-slate-500">{yearOf(role)}</span>
    </motion.div>
  );
};

/** lg+: the section pins and the career travels sideways past you, newest first, like a camera dolly. */
const HorizontalTimeline: React.FC = () => {
  const wrap = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState(() => ({ vw: document.documentElement.clientWidth, card: 620 }));
  useEffect(() => {
    const measure = () => {
      const vw = document.documentElement.clientWidth;
      setGeo({ vw, card: Math.round(Math.min(640, Math.max(500, vw * 0.44))) });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const pad = (geo.vw - geo.card) / 2;
  const step = geo.card + GAP;
  const dist = step * (roles.length - 1);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] });
  const progress = useTransform(scrollYProgress, HOLD, [0, 1]);
  const x = useTransform(progress, (p) => -p * dist);
  const comet = useTransform(progress, (p) => `${p * 100}%`);
  const hint = useTransform(scrollYProgress, [0, 0.07], [1, 0]);
  const count = useTransform(progress, (p) => String(Math.round(p * (roles.length - 1)) + 1).padStart(2, '0'));
  const height = Math.round(dist * 1.35);

  // Keyboard users tab into a card that may be off to the side: bring the page to where it is centred.
  const focusCard = (i: number) => {
    const el = wrap.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    const p = HOLD[0] + (i / (roles.length - 1)) * (HOLD[1] - HOLD[0]);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + p * span, behavior: 'smooth' });
  };

  return (
    <div ref={wrap} className="relative" style={{ height: `calc(100vh + ${height}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden [perspective:1600px]">
        <div className="pointer-events-none absolute left-8 top-24 flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400 xl:left-12">
          <motion.span className="text-[13px] text-slate-100">{count}</motion.span>
          <span>/ {String(roles.length).padStart(2, '0')}</span>
        </div>
        <motion.p
          style={{ opacity: hint }}
          className="pointer-events-none absolute right-8 top-24 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400 xl:right-12"
        >
          Scroll · travel back in time →
        </motion.p>

        <motion.div style={{ x, paddingLeft: pad, paddingRight: pad, gap: GAP }} className="flex items-center [transform-style:preserve-3d]">
          {roles.map((role, i) => (
            <CoverSlot
              key={role.company}
              role={role}
              index={i}
              x={x}
              centre={pad + i * step + geo.card / 2}
              step={step}
              vw={geo.vw}
              width={geo.card}
              onFocusCard={focusCard}
            />
          ))}
        </motion.div>

        {/* The rail: progress fill with a comet riding its head; each role lights up as you reach it. */}
        <div className="absolute bottom-20 left-1/2 w-[min(760px,70vw)] -translate-x-1/2" aria-hidden="true">
          <div className="relative h-px bg-white/[0.14]">
            <motion.div style={{ scaleX: progress }} className="absolute inset-0 origin-left bg-gradient-to-r from-accent-400/20 to-accent-300" />
            <motion.div style={{ x: comet }} className="absolute inset-0">
              <span className="absolute -left-16 top-0 h-px w-16 bg-gradient-to-r from-transparent to-accent-200" />
              <span className="absolute -left-[5px] -top-[5px] h-[11px] w-[11px] rounded-full bg-accent-100 shadow-[0_0_16px_5px_rgba(244,182,120,0.55)]" />
            </motion.div>
            {roles.map((role, i) => (
              <Tick key={role.company} progress={progress} at={i / (roles.length - 1)} role={role} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Phones, tablets and reduced motion: a vertical path; cards swing in from alternating sides. */
const VerticalTimeline: React.FC = () => {
  const list = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 0.75', 'end 0.6'] });
  return (
    <div ref={list} className="relative mx-auto max-w-[760px] px-5 [perspective:1400px]">
      <div className="absolute bottom-2 left-[31px] top-2 w-px" aria-hidden="true">
        <div className="absolute inset-0 bg-white/10" />
        <motion.div style={{ scaleY: scrollYProgress }} className="absolute inset-0 origin-top bg-accent-400/80" />
      </div>
      {roles.map((role, i) => (
        <motion.div
          key={role.company}
          initial={{ opacity: 0, x: i % 2 ? 56 : -56, rotateY: i % 2 ? -16 : 16 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative mb-10 pl-10 last:mb-0"
        >
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.4, opacity: 0.35 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-45% 0px -45% 0px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`absolute left-[6px] top-8 z-10 h-[11px] w-[11px] rounded-full border-2 border-canvas bg-accent-400 ${i === 0 ? 'pulse-ring' : ''}`}
          />
          <RoleCard role={role} index={i} />
        </motion.div>
      ))}
    </div>
  );
};

const Experience: React.FC = () => {
  const wide = useMedia('(min-width: 1024px)');
  const reduced = useReducedMotion();
  return (
    <section id="experience" className="relative pt-24 md:pt-32">
      <div className="mx-auto max-w-[1100px] px-5">
        <SectionHeader
          chapter="03"
          eyebrow="Career"
          title="Shipped, not prototyped."
          lead="End-to-end ownership across three AI teams — from first commit to production traffic."
          className="!mb-0 lg:!mb-0"
        />
      </div>
      {wide && !reduced ? (
        <HorizontalTimeline />
      ) : (
        <div className="pb-24 pt-14 md:pb-32 md:pt-20">
          <VerticalTimeline />
        </div>
      )}
    </section>
  );
};

export default Experience;
