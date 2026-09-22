import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useActiveSection } from '../utils/useActiveSection';
import NavHologram3D from './NavHologram3D';

const NAV_LINKS = [
  { label: 'About', href: '#hero' },
  { label: 'AI Lab', href: '#ai-sandbox' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const activeSection = useActiveSection();

  // 3D Parallax & Tilt physics for Navbar Capsule
  const navRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smooth springs for 3D rotation angles
  const springConfig = { damping: 20, stiffness: 260, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Tilt degrees based on mouse position relative to capsule center
  const rotateX = useTransform(smoothMouseY, [0, 1], [7, -7]);
  const rotateY = useTransform(smoothMouseX, [0, 1], [-9, 9]);

  // Specular lighting reflection coordinates (percent)
  const glareX = useTransform(smoothMouseX, [0, 1], [0, 100]);
  const glareY = useTransform(smoothMouseY, [0, 1], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(Math.max(0, Math.min(1, x)));
    mouseY.set(Math.max(0, Math.min(1, y)));
  };

  const handleMouseLeave = () => {
    setIsNavHovered(false);
    // Smoothly settle back to flat center position
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const handleMouseEnter = () => {
    setIsNavHovered(true);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const getSectionFromHref = (href: string): string => href.replace('#', '');

  return (
    <>
      {/* Floating Profile Logo with 3D Holographic Halo Ring */}
      <div className="fixed top-5 left-5 z-50">
        <a
          href="#hero"
          aria-label="Home — Koshal Kumar"
          className="group relative block p-1 transform hover:scale-105 transition-transform duration-300"
        >
          {/* Animated 3D Halo Ring */}
          <div
            className="absolute -inset-1 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, #38bdf8, #818cf8, #f472b6, #38bdf8)',
              animation: 'holo-rotate 5s linear infinite',
              filter: 'blur(3px)',
            }}
          />
          <div className="absolute inset-0 rounded-full bg-[#06080d]" />

          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-sky-400/60 shadow-[0_0_25px_rgba(56,189,248,0.25)] transition-all">
            <img
              src="/profile.jpeg"
              alt="Koshal Kumar"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Online green indicator */}
          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#06080d] shadow-[0_0_8px_#34d399]" />
        </a>
      </div>

      {/* Mobile Menu Button — Floating Top Right */}
      <div className="md:hidden fixed top-5 right-5 z-50">
        <button
          className="relative w-12 h-12 flex flex-col justify-center items-center rounded-full bg-[#080d1a]/90 backdrop-blur-xl border border-white/15 shadow-[0_4px_25px_rgba(0,0,0,0.5)]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <motion.span
            animate={isMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
            className="block w-5 h-0.5 bg-slate-200 absolute"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          />
          <motion.span
            animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-5 h-0.5 bg-slate-200 absolute"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          />
          <motion.span
            animate={isMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
            className="block w-5 h-0.5 bg-slate-200 absolute"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          />
        </button>
      </div>

      {/* Desktop 3D Floating Capsule Navbar */}
      <header className="hidden md:flex fixed top-5 left-1/2 -translate-x-1/2 z-50 nav-3d-wrapper">
        <motion.div
          ref={navRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.35 }}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="nav-3d-capsule relative rounded-full p-[1.5px] transition-shadow duration-300"
        >
          {/* Animated 3D Holographic Border Light Beam */}
          <div className="nav-border-beam" />

          {/* Deep Multi-Layer Obsidian Glass Capsule Body */}
          <nav
            className="relative rounded-full px-3 py-1.5 flex items-center gap-1 bg-[#080d18]/92 backdrop-blur-2xl border border-white/12 shadow-[0_12px_45px_-10px_rgba(0,0,0,0.7),0_0_30px_rgba(56,189,248,0.08)]"
            style={{
              transformStyle: 'preserve-3d',
              boxShadow: isScrolled
                ? '0 16px 50px -10px rgba(0,0,0,0.85), 0 0 25px rgba(56,189,248,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
                : '0 12px 40px -10px rgba(0,0,0,0.6), 0 0 20px rgba(56,189,248,0.08), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {/* Specular Glare Reflection on Hover */}
            {isNavHovered && (
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none opacity-40 overflow-hidden"
                style={{
                  background: `radial-gradient(circle 120px at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.25), transparent 70%)`,
                }}
              />
            )}

            {/* Embedded 3D Hologram Core with Status */}
            <div style={{ transform: 'translateZ(26px)' }} className="flex items-center">
              <NavHologram3D />
              {/* Divider between 3D core & links */}
              <div className="h-5 w-[1px] bg-white/10 mx-1.5" />
            </div>

            {/* Navigation Links */}
            <ul className="flex items-center gap-0.5" style={{ transform: 'translateZ(18px)' }}>
              {NAV_LINKS.map((link) => {
                const sectionId = getSectionFromHref(link.href);
                const isActive = activeSection === sectionId;
                return (
                  <li key={link.label} className="relative">
                    <a
                      href={link.href}
                      className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider whitespace-nowrap transition-all duration-200 select-none ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-slate-300 hover:text-white hover:scale-105'
                      }`}
                    >
                      {/* Active indicator cyan dot */}
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                      )}
                      <span>{link.label}</span>
                    </a>

                    {/* Elevated 3D Frosted Glass Active Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill-active"
                        className="absolute inset-0 rounded-full z-0 pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(56, 189, 248, 0.22) 0%, rgba(129, 140, 248, 0.18) 100%)',
                          border: '1px solid rgba(56, 189, 248, 0.45)',
                          boxShadow:
                            '0 0 20px rgba(56, 189, 248, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                          backdropFilter: 'blur(12px)',
                          transform: 'translateZ(12px)',
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 32,
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </motion.div>
      </header>

      {/* Mobile Fullscreen Cyberpunk Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(40px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.35 }}
            className="md:hidden fixed inset-0 bg-[#06080d]/95 z-40 flex flex-col items-center justify-center px-6"
          >
            {/* Ambient Background Glows */}
            <div className="absolute w-72 h-72 rounded-full bg-sky-500/10 blur-[90px] pointer-events-none" />
            <div className="absolute w-72 h-72 rounded-full bg-purple-500/10 blur-[90px] pointer-events-none bottom-10" />

            {/* Mobile 3D Hologram Badge */}
            <div className="mb-8 flex items-center justify-center scale-125">
              <NavHologram3D />
            </div>

            <nav className="w-full max-w-xs">
              <ul className="flex flex-col items-stretch space-y-4">
                {NAV_LINKS.map((link, i) => {
                  const sectionId = getSectionFromHref(link.href);
                  const isActive = activeSection === sectionId;
                  return (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, y: 25 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      transition={{ delay: i * 0.06, type: 'spring', bounce: 0.3 }}
                    >
                      <a
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`group flex items-center justify-between px-5 py-3 rounded-2xl border transition-all duration-300 ${
                          isActive
                            ? 'bg-sky-500/15 border-sky-400/50 text-white font-semibold shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                        }`}
                      >
                        <span className="font-display text-xl uppercase tracking-wider">
                          {link.label}
                        </span>
                        {isActive ? (
                          <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                        ) : (
                          <span className="text-slate-600 font-mono text-xs group-hover:text-slate-400">
                            0{i + 1}
                          </span>
                        )}
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;