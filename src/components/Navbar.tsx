import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion';
import { ArrowUpRight, Search, Sparkles } from 'lucide-react';
import { useActiveSection } from '../utils/useActiveSection';
import { openPalette } from '../lib/askLab';
import { travelTo } from '../lib/smoothScroll';
import { Magnetic3D, ScrambleText, SlotRollText } from './KineticText';
import { EASE } from '../lib/kineticPresets';

const MOD_KEY = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl ';

const NAV_LINKS = [
  { num: '01', label: 'About', href: '#hero', mood: '#f4b678' },
  { num: '02', label: 'AI Lab', href: '#ai-sandbox', mood: '#a5b4fc' },
  { num: '03', label: 'Experience', href: '#experience', mood: '#f8c690' },
  { num: '04', label: 'Skills', href: '#skills', mood: '#7ee0c0' },
  { num: '05', label: 'Projects', href: '#projects', mood: '#f5a3b7' },
  { num: '06', label: 'Education', href: '#education', mood: '#bcd3ff' },
  { num: '07', label: 'Contact', href: '#contact', mood: '#f7a072' },
] as const;

type ScrollMode = 'top' | 'up' | 'down';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [scrollMode, setScrollMode] = useState<ScrollMode>('top');
  const [scrollPct, setScrollPct] = useState(0);
  const [booted, setBooted] = useState(false);

  const activeSection = useActiveSection();
  const reduce = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  const { scrollY, scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 180, damping: 28, mass: 0.35 });

  // 3D perspective tilt springs for the floating glass chassis
  const rawRx = useMotionValue(0);
  const rawRy = useMotionValue(0);
  const tiltX = useSpring(rawRx, { stiffness: 200, damping: 24, mass: 0.5 });
  const tiltY = useSpring(rawRy, { stiffness: 200, damping: 24, mass: 0.5 });

  // Boot light-sweep completes once on mount
  useEffect(() => {
    const id = setTimeout(() => setBooted(true), 1200);
    return () => clearTimeout(id);
  }, []);

  // Intelligent scroll direction + depth tracker
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = lastY.current;
    const delta = latest - prev;
    lastY.current = latest;

    if (latest < 48) {
      setScrollMode((m) => (m === 'top' ? m : 'top'));
    } else if (delta > 4 && latest > 120) {
      setScrollMode((m) => (m === 'down' ? m : 'down'));
    } else if (delta < -3) {
      setScrollMode((m) => (m === 'up' ? m : 'up'));
    }

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((latest / max) * 100))) : 0;
    setScrollPct((p) => (p === pct ? p : pct));
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const activeLink = NAV_LINKS.find((l) => l.href.slice(1) === activeSection) ?? NAV_LINKS[0];
  const isCompact = scrollMode === 'down' && !isNavHovered && !isMenuOpen;
  const isScrolled = scrollMode !== 'top';

  const handleNavPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== 'mouse' || !navRef.current) return;
    const r = navRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    navRef.current.style.setProperty('--nav-mx', `${x}px`);
    navRef.current.style.setProperty('--nav-my', `${y}px`);
    navRef.current.style.setProperty('--nav-hover', '1');
    const nx = x / r.width - 0.5;
    const ny = y / r.height - 0.5;
    rawRy.set(nx * 5.5);
    rawRx.set(-ny * 6.5);
  };

  const handleNavPointerLeave = () => {
    setIsNavHovered(false);
    setHoveredIdx(null);
    rawRx.set(0);
    rawRy.set(0);
    if (navRef.current) {
      navRef.current.style.setProperty('--nav-hover', '0.38');
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setIsMenuOpen(false);
    travelTo(href);
  };

  return (
    <>
      <motion.header
        initial={reduce ? undefined : { y: -32, opacity: 0, rotateX: -24, scale: 0.95 }}
        animate={{
          y: isCompact ? -3 : 0,
          opacity: 1,
          rotateX: 0,
          scale: isCompact ? 0.965 : 1,
        }}
        transition={{ duration: 0.65, ease: EASE }}
        style={{ perspective: 1300 }}
        className={`fixed inset-x-0 z-50 mx-auto transition-[top,max-width] duration-500 ease-soft ${
          isCompact
            ? 'top-2 w-[calc(100%-24px)] max-w-[960px]'
            : isScrolled
              ? 'top-3 w-[calc(100%-24px)] max-w-[1010px]'
              : 'top-3.5 w-[calc(100%-24px)] max-w-[1060px]'
        }`}
      >
        {/* Ambient mood halo tethered beneath the floating control bar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-6 -bottom-3 -top-1 -z-10 rounded-full opacity-50 blur-2xl transition-all duration-700"
          style={{
            background: `radial-gradient(60% 80% at 50% 50%, ${activeLink.mood}26, transparent 72%)`,
          }}
        />

        <motion.nav
          ref={navRef}
          aria-label="Primary"
          onPointerEnter={() => setIsNavHovered(true)}
          onPointerMove={handleNavPointerMove}
          onPointerLeave={handleNavPointerLeave}
          style={
            reduce
              ? undefined
              : {
                  rotateX: tiltX,
                  rotateY: tiltY,
                  transformStyle: 'preserve-3d',
                }
          }
          className={`nav-chassis group/nav relative flex items-center justify-between gap-2.5 overflow-hidden rounded-2xl backdrop-blur-2xl backdrop-saturate-150 transition-[padding] duration-500 ease-soft ${
            isCompact ? 'py-1.5 pl-2.5 pr-2' : 'py-2 pl-3 pr-2.5'
          }`}
        >
          {/* Cursor-following luminous glass bezel */}
          <span aria-hidden="true" className="nav-bezel-glow" />

          {/* Cursor-following interior optical caustic glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/nav:opacity-100"
            style={{
              background:
                'radial-gradient(280px circle at var(--nav-mx, 50%) var(--nav-my, 50%), rgba(244, 182, 120, 0.11), rgba(165, 180, 252, 0.05) 45%, transparent 72%)',
            }}
          />

          {/* Cinematic entrance light sweep across the control bar */}
          {!booted && !reduce && (
            <motion.span
              aria-hidden="true"
              initial={{ x: '-120%', opacity: 0.9 }}
              animate={{ x: '260%', opacity: 0 }}
              transition={{ duration: 1.15, delay: 0.15, ease: EASE }}
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-accent-200/35 to-transparent"
            />
          )}

          {/* Brand Emblem with Orbital Telemetry Ring */}
          <Magnetic3D strength={0.14} tilt={4} className="shrink-0">
            <a
              href="#hero"
              onClick={(e) => handleLinkClick(e, '#hero')}
              aria-label="Home — Koshal Kumar"
              className="slot-roll-trigger group/brand relative z-10 flex items-center gap-2.5 rounded-full py-0.5 pr-2"
            >
              <span className="relative flex h-8 w-8 items-center justify-center">
                {/* Orbital reticle ring */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 36 36"
                  className="orbit-ring-spin pointer-events-none absolute -inset-1 h-10 w-10 text-accent-300/45 transition-colors duration-300 group-hover/brand:text-accent-300"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="16.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.9"
                    strokeDasharray="18 8 4 8"
                  />
                </svg>
                <img
                  src="/profile.jpeg"
                  alt=""
                  className="relative h-7 w-7 rounded-full border border-white/25 object-cover shadow-[0_0_12px_rgba(244,182,120,0.28)]"
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-deep bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                  title="Open to work"
                />
              </span>
              <span className="flex flex-col leading-none">
                <SlotRollText
                  text="Koshal Kumar"
                  className="text-[13.5px] font-medium tracking-tight text-slate-100 whitespace-nowrap"
                  accentClassName="text-accent-200"
                />
                <span className="mt-0.5 hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400 sm:inline-flex">
                  <span
                    className="h-1 w-1 rounded-full transition-colors duration-500"
                    style={{ backgroundColor: activeLink.mood, boxShadow: `0 0 6px ${activeLink.mood}` }}
                  />
                  <ScrambleText
                    text={isScrolled ? `${activeLink.num} · ${activeLink.label}` : 'AI ENGINEER'}
                    durationMs={420}
                  />
                </span>
              </span>
            </a>
          </Magnetic3D>

          {/* Primary 3D Magnetic Navigation Rail */}
          <ul
            className="relative z-10 hidden items-center gap-0.5 lg:flex"
            onPointerLeave={() => setHoveredIdx(null)}
          >
            {NAV_LINKS.map((link, idx) => {
              const isActive = activeSection === link.href.slice(1);
              const isHovered = hoveredIdx === idx;
              return (
                <motion.li
                  key={link.label}
                  initial={reduce ? undefined : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + idx * 0.04, duration: 0.45, ease: EASE }}
                  className="relative"
                  onPointerEnter={() => setHoveredIdx(idx)}
                >
                  {/* Hover optical lens that glides fluidly under the cursor */}
                  {isHovered && !isActive && (
                    <motion.span
                      layoutId="nav-hover-lens"
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-full border border-white/15 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}

                  {/* Active morphing glowing capsule */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-capsule"
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-full border border-accent-300/35 bg-gradient-to-b from-white/[0.13] to-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_6px_18px_-6px_rgba(244,182,120,0.45)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    >
                      {/* Top specular glint */}
                      <span className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-accent-200/80 to-transparent" />
                      {/* Bottom glowing plasma emitter */}
                      <span
                        className="absolute -bottom-px left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full"
                        style={{
                          backgroundColor: link.mood,
                          boxShadow: `0 0 12px 1px ${link.mood}`,
                        }}
                      />
                    </motion.span>
                  )}

                  <Magnetic3D strength={0.16} tilt={5}>
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`slot-roll-trigger relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] whitespace-nowrap transition-colors duration-300 ${
                        isActive ? 'text-slate-50 font-medium' : 'text-slate-300 hover:text-slate-50'
                      }`}
                    >
                      <span
                        className={`hidden font-mono text-[9px] tabular-nums transition-all duration-300 xl:inline ${
                          isActive
                            ? 'text-accent-300 opacity-100'
                            : isHovered
                              ? 'text-accent-300/80 opacity-90'
                              : 'text-slate-500 opacity-60'
                        }`}
                      >
                        {link.num}
                      </span>
                      <SlotRollText
                        text={link.label}
                        active={isActive}
                        accentClassName={isActive ? 'text-accent-200' : 'text-accent-200'}
                      />
                    </a>
                  </Magnetic3D>
                </motion.li>
              );
            })}
          </ul>

          {/* Right Controls: Live Telemetry + Semantic Search + Luminous CTA */}
          <div className="relative z-10 flex shrink-0 items-center gap-1.5">
            {/* Scroll depth HUD badge (desktop, when scrolled) */}
            <AnimatePresence>
              {isScrolled && (
                <motion.span
                  initial={{ opacity: 0, width: 0, scale: 0.9 }}
                  animate={{ opacity: 1, width: 'auto', scale: 1 }}
                  exit={{ opacity: 0, width: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  aria-hidden="true"
                  className="hidden overflow-hidden xl:inline-flex"
                >
                  <span className="mr-0.5 inline-flex items-center gap-1 rounded-full border border-white/10 bg-deep/55 px-2 py-1 font-mono text-[10px] tabular-nums text-slate-300">
                    <span className="h-1 w-1 rounded-full bg-accent-400" />
                    {String(scrollPct).padStart(2, '0')}%
                  </span>
                </motion.span>
              )}
            </AnimatePresence>

            <Magnetic3D strength={0.18} tilt={6}>
              <button
                type="button"
                onClick={openPalette}
                aria-label="Search my experience"
                title="Semantic search across my experience"
                className="group/search flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-2.5 text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:border-accent-300/40 hover:bg-white/[0.1] hover:text-slate-50"
              >
                <Search className="h-3.5 w-3.5 transition-transform duration-300 group-hover/search:scale-110 group-hover/search:text-accent-300" />
                <kbd className="hidden font-mono text-[10px] text-slate-400 transition-colors group-hover/search:text-slate-200 md:inline">
                  {MOD_KEY}K
                </kbd>
              </button>
            </Magnetic3D>

            <Magnetic3D strength={0.2} tilt={6} className="hidden sm:inline-flex">
              <a
                href="#contact"
                onClick={(e) => handleLinkClick(e, '#contact')}
                className="slot-roll-trigger btn btn-primary group/cta relative overflow-hidden !px-4 !py-1.5 text-[12.5px]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-soft group-hover/cta:translate-x-full"
                />
                <SlotRollText text="Let's talk" accentClassName="text-deep" />
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
              </a>
            </Magnetic3D>

            <button
              type="button"
              className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.05] transition-colors hover:border-accent-300/40 hover:bg-white/[0.1] lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              <motion.span
                animate={isMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -3 }}
                className="absolute block h-px w-3.5 bg-slate-100"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
              <motion.span
                animate={isMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 3 }}
                className="absolute block h-px w-3.5 bg-slate-100"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
            </button>
          </div>

          {/* Live Scroll-Progress Plasma Filament along bottom edge */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-4 bottom-0 h-[1.5px] overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              style={{
                scaleX: smoothProgress,
                background: `linear-gradient(90deg, rgba(244,182,120,0.25), ${activeLink.mood}, #ffffff)`,
                boxShadow: `0 0 10px ${activeLink.mood}`,
              }}
              className="h-full w-full origin-left"
            />
          </div>
        </motion.nav>
      </motion.header>

      {/* Futuristic 3D Mobile Command Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col justify-center overflow-hidden bg-deep/92 px-7 backdrop-blur-2xl lg:hidden"
          >
            {/* Subtle holographic architectural grid */}
            <div aria-hidden="true" className="lab-chamber-grid pointer-events-none absolute inset-0 opacity-60" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full blur-3xl"
              style={{ background: `${activeLink.mood}22` }}
            />

            <div className="relative z-10 mx-auto w-full max-w-md [perspective:900px]">
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-300"
              >
                <Sparkles className="h-3 w-3" />
                Navigation Matrix · {String(scrollPct).padStart(2, '0')}% Depth
              </motion.p>

              <nav aria-label="Mobile">
                <ul className="flex flex-col gap-2">
                  {NAV_LINKS.map((link, i) => {
                    const isActive = activeSection === link.href.slice(1);
                    return (
                      <motion.li
                        key={link.label}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, x: -24, rotateX: -35 }}
                        animate={{ opacity: 1, x: 0, rotateX: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ delay: i * 0.045, duration: 0.48, ease: EASE }}
                      >
                        <a
                          href={link.href}
                          onClick={(e) => handleLinkClick(e, link.href)}
                          className={`group flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300 ${
                            isActive
                              ? 'border-accent-300/35 bg-white/[0.08] shadow-[0_12px_30px_-14px_rgba(244,182,120,0.45)]'
                              : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]'
                          }`}
                        >
                          <span className="flex items-baseline gap-4">
                            <span
                              className="font-mono text-[11px] tabular-nums"
                              style={{ color: isActive ? link.mood : undefined }}
                            >
                              [{link.num}]
                            </span>
                            <span
                              className={`font-display text-[26px] font-medium tracking-display transition-colors ${
                                isActive ? 'text-shader-gold' : 'text-slate-100 group-hover:text-accent-200'
                              }`}
                            >
                              {link.label}
                            </span>
                          </span>
                          <ArrowUpRight
                            className={`h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
                              isActive ? 'text-accent-300' : 'text-slate-500 group-hover:text-slate-200'
                            }`}
                          />
                        </a>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.45, ease: EASE }}
                className="mt-6 flex items-center gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    openPalette();
                  }}
                  className="btn btn-ghost flex-1 !py-2.5 text-[13px]"
                >
                  <Search className="h-3.5 w-3.5" />
                  Semantic search
                </button>
                <a
                  href="#contact"
                  onClick={(e) => handleLinkClick(e, '#contact')}
                  className="btn btn-primary flex-1 !py-2.5 text-[13px]"
                >
                  Let's talk
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
