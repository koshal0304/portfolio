import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  DimensionalTitle,
  ScrambleText,
  ScrollKineticLead,
} from './KineticText';
import { CHAPTER_PRESET, EASE, type TitlePreset } from '../lib/kineticPresets';

interface SectionHeaderProps {
  /** Two-digit chapter number from src/data/chapters.ts, e.g. "03". */
  chapter: string;
  eyebrow: string;
  title: string;
  lead?: React.ReactNode;
  className?: string;
  /** Override the chapter's signature 3D typography animation preset. */
  preset?: TitlePreset;
  /** Optional word indices to highlight with animated shader-gold typography. */
  accentWords?: number[];
}

const CHAPTER_SHADER: Record<string, 'none' | 'gold' | 'prism' | 'holo'> = {
  '02': 'holo',
  '03': 'none',
  '04': 'prism',
  '05': 'none',
  '06': 'gold',
  '07': 'holo',
  '08': 'prism',
};

const CHAPTER_ACCENT_WORDS: Record<string, number[]> = {
  '02': [6, 7], // "Query it."
  '03': [0], // "Shipped,"
  '04': [4], // "systems."
  '05': [0], // "Architectures"
  '06': [2], // "production."
  '07': [0, 3], // "Robotics" & "AI."
  '08': [3], // "real."
};

/**
 * Every chapter opens with a bespoke motion-design title sequence:
 * a dual-layer 3D parallax numeral behind, a reticle telemetry eyebrow that decodes into place,
 * a chapter-unique 3D kinetic title choreography, a plasma horizon line, and word-illuminated lead copy.
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  chapter,
  eyebrow,
  title,
  lead,
  className = '',
  preset,
  accentWords,
}) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-12% 0px' });
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const ghostY = useTransform(scrollYProgress, [0, 1], ['-24%', '34%']);
  const ghostBackY = useTransform(scrollYProgress, [0, 1], ['-12%', '20%']);
  const ghostRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [24, 0, -22]);
  const ghostScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1.04, 0.94]);
  const ghostOpacity = useTransform(scrollYProgress, [0, 0.28, 0.75, 1], [0, 1, 1, 0]);

  const resolvedPreset = preset ?? CHAPTER_PRESET[chapter] ?? 'prism';
  const resolvedShader = CHAPTER_SHADER[chapter] ?? 'none';
  const resolvedAccent = accentWords ?? CHAPTER_ACCENT_WORDS[chapter] ?? [];

  return (
    <header ref={ref} className={`relative mx-auto mb-14 max-w-3xl text-center md:mb-20 ${className}`}>
      {/* Dual-plane 3D parallax ghost numeral for architectural depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-[58%] select-none [perspective:900px]"
      >
        <motion.span
          style={
            reduce
              ? { opacity: 0.7 }
              : { y: ghostBackY, rotateX: ghostRotateX, scale: ghostScale, opacity: ghostOpacity }
          }
          className="absolute inset-0 block translate-x-1.5 translate-y-1.5 font-display text-[150px] font-semibold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(244,182,120,0.08)] blur-[1px] md:text-[300px]"
        >
          {chapter}
        </motion.span>
        <motion.span
          style={
            reduce
              ? { opacity: 0.8 }
              : { y: ghostY, rotateX: ghostRotateX, scale: ghostScale, opacity: ghostOpacity }
          }
          className="relative block font-display text-[150px] font-semibold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.1)] md:text-[300px]"
        >
          {chapter}
        </motion.span>
      </div>

      {/* Telemetry reticle eyebrow */}
      <motion.span
        initial={reduce ? undefined : { opacity: 0, y: 10, scale: 0.94 }}
        animate={inView || reduce ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ duration: 0.6, ease: EASE }}
        className="eyebrow group relative tabular-nums backdrop-blur-sm"
      >
        <span className="relative flex h-2 w-2 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400/50" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-accent-400 shadow-[0_0_8px_rgba(244,182,120,0.9)]" />
        </span>
        <ScrambleText text={`${chapter} — ${eyebrow}`} trigger={inView} retriggerOnHover />
      </motion.span>

      {/* Signature 3D dimensional kinetic title */}
      <DimensionalTitle
        text={title}
        as="h2"
        preset={resolvedPreset}
        inView={inView}
        extrude
        shader={resolvedShader}
        accentWords={resolvedAccent}
        className="mt-6 font-display text-[38px] font-medium leading-[1.04] tracking-display text-slate-100 md:text-[60px]"
      />

      {/* Plasma horizon rule with travelling light spark */}
      <motion.div
        aria-hidden="true"
        initial={reduce ? undefined : { scaleX: 0, opacity: 0 }}
        animate={inView || reduce ? { scaleX: 1, opacity: 1 } : undefined}
        transition={{ duration: 1.05, delay: 0.32, ease: EASE }}
        className="relative mx-auto mt-6 h-px w-48 overflow-hidden bg-gradient-to-r from-transparent via-accent-300/65 to-transparent"
      >
        {!reduce && (
          <span className="horizon-spark absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent via-white to-transparent" />
        )}
      </motion.div>

      {/* Word-illuminated kinetic lead copy */}
      {lead && (
        <ScrollKineticLead
          inView={inView}
          delay={0.28}
          className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-400 md:text-[17px]"
        >
          {lead}
        </ScrollKineticLead>
      )}
    </header>
  );
};

export default SectionHeader;
