import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { travelTo } from '../lib/smoothScroll';
import { Magnetic3D, SlotRollText } from './KineticText';

const ICON = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const LINKS = [
  {
    label: 'Email',
    href: 'mailto:koshalkumar0304@gmail.com',
    icon: (
      <svg {...ICON}>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/koshal-kumar-970233240',
    icon: (
      <svg {...ICON}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'Phone',
    href: 'tel:+918218806349',
    icon: (
      <svg {...ICON}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/koshal0304',
    icon: (
      <svg {...ICON}>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
  },
];

const WORDMARK = Array.from('Koshal Kumar');

/** Font size that makes the wordmark exactly fill its container (fitText), refit on resize and font load. */
function useFitText() {
  const box = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const fit = () => {
      const el = word.current;
      const width = box.current?.clientWidth;
      if (!el || !width) return;
      el.style.fontSize = '100px';
      el.style.fontSize = `${(100 * width) / el.scrollWidth}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  return { box, word };
}

const Footer: React.FC = () => {
  const footer = useRef<HTMLElement>(null);
  const { box, word } = useFitText();
  const reduce = useReducedMotion();
  // The name unfolds out of 3D floor perspective as the page runs out.
  const { scrollYProgress } = useScroll({ target: footer, offset: ['start end', 'end end'] });
  const y = useTransform(scrollYProgress, [0, 1], ['55%', '0%']);
  const rotateX = useTransform(scrollYProgress, [0, 1], [46, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.6, 1]);

  return (
    <footer ref={footer} className="relative overflow-hidden border-t border-white/10 bg-deep/60 pt-14">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
          <p className="text-center font-mono text-[12px] text-slate-400 md:text-left">© 2026 Koshal Kumar — AI Engineer, Bengaluru</p>
          <div className="flex items-center gap-2">
            <ul className="flex items-center gap-1">
              {LINKS.map((link) => (
                <li key={link.label}>
                  <Magnetic3D strength={0.2} tilt={6}>
                    <a
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      aria-label={link.label}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-accent-300"
                    >
                      {link.icon}
                    </a>
                  </Magnetic3D>
                </li>
              ))}
            </ul>
            <Magnetic3D strength={0.18} tilt={5}>
              <button
                type="button"
                onClick={() => travelTo('#hero', { duration: 2.4 })}
                className="slot-roll-trigger btn btn-ghost !px-3.5 !py-2 text-[12px]"
              >
                <SlotRollText text="Back to top" accentClassName="text-accent-200" />
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </Magnetic3D>
          </div>
        </div>

        {/* 3D Perspective Floor-Unfold Giant Wordmark with Per-Letter Kinetic Hover Wave */}
        <div ref={box} aria-hidden="true" className="mt-12 select-none overflow-hidden [perspective:1200px]">
          <motion.span
            ref={word}
            style={reduce ? undefined : { y, rotateX, opacity, transformOrigin: '50% 100%' }}
            className="text-extrude-gold block w-max whitespace-nowrap pb-[0.04em] font-display font-semibold leading-[0.82] tracking-[-0.055em] text-slate-100 [mask-image:linear-gradient(to_bottom,#000_52%,transparent_99%)]"
          >
            {WORDMARK.map((ch, idx) => (
              <motion.span
                key={idx}
                className="inline-block transition-colors duration-300 hover:text-accent-200"
                whileHover={
                  reduce
                    ? undefined
                    : {
                        y: -12,
                        rotateX: -14,
                        scale: 1.05,
                        transition: { type: 'spring', stiffness: 380, damping: 18 },
                      }
                }
              >
                {ch === ' ' ? '\u00A0' : ch}
              </motion.span>
            ))}
          </motion.span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
