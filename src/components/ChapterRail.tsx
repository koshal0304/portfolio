import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CHAPTERS, CHAPTER_IDS } from '../data/chapters';
import { useActiveSection } from '../utils/useActiveSection';
import { travelTo } from '../lib/smoothScroll';

/**
 * A slim map of the journey on the right edge: how far you've come, which chapter you're in, and a
 * jump to any other. It stays out of the hero and fades in once the journey starts.
 */
const ChapterRail: React.FC = () => {
  const active = useActiveSection(CHAPTER_IDS);
  const { scrollY, scrollYProgress } = useScroll();
  const opacity = useTransform(scrollY, [window.innerHeight * 0.45, window.innerHeight * 0.85], [0, 1]);

  return (
    <motion.nav
      aria-label="Chapters"
      style={{ opacity }}
      className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
    >
      <div className="relative flex flex-col items-end gap-3">
        <div className="absolute bottom-1 right-[3px] top-1 w-px bg-white/10">
          <motion.div style={{ scaleY: scrollYProgress }} className="h-full w-px origin-top bg-accent-400/70" />
        </div>
        {CHAPTERS.map((c) => {
          const on = c.id === active;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => travelTo(`#${c.id}`)}
              aria-label={`Go to chapter ${c.n}, ${c.label}`}
              aria-current={on ? 'step' : undefined}
              className="group relative flex items-center gap-3 py-0.5"
            >
              <span
                className={`whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-500 ease-soft ${
                  on
                    ? 'translate-x-0 bg-canvas/70 text-slate-100 opacity-100'
                    : 'translate-x-2 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                }`}
              >
                {c.n} · {c.label}
              </span>
              <span
                className={`relative block h-[7px] w-[7px] rounded-full border transition-all duration-500 ease-soft ${
                  on ? 'scale-125 border-accent-400 bg-accent-400 shadow-[0_0_10px_rgba(244,182,120,0.8)]' : 'border-white/35 bg-canvas group-hover:border-white/70'
                }`}
              />
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default ChapterRail;
