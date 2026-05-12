import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveSection } from '../utils/useActiveSection';

const NAV_LINKS = [
  { label: 'About', href: '#hero' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const activeSection = useActiveSection();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
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
      {/* Floating Logo - Always top left */}
      <div className="fixed top-6 left-6 z-50">
        <a href="#hero" aria-label="Home" className="block transform hover:scale-110 transition-transform duration-300">
          <img
            src="/profile.jpeg"
            alt="Koshal Kumar"
            className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          />
        </a>
      </div>

      {/* Mobile Menu Toggle - Floating top right */}
      <div className="md:hidden fixed top-6 right-6 z-50">
        <button
          className="relative w-12 h-12 flex flex-col justify-center items-center glass-panel rounded-full"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <motion.span
            animate={isMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
            className="block w-5 h-0.5 bg-white absolute"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
          <motion.span
            animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-5 h-0.5 bg-white absolute"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
          <motion.span
            animate={isMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
            className="block w-5 h-0.5 bg-white absolute"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </button>
      </div>

      {/* Desktop Floating Pill Navbar */}
      <header className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          className="glass-panel px-2 py-2 rounded-full flex items-center relative"
          style={{
            boxShadow: isScrolled 
              ? '0 10px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.05)' 
              : '0 10px 40px -10px rgba(0,0,0,0.3)',
            transition: 'box-shadow 0.3s ease'
          }}
        >
          <ul className="flex items-center">
            {NAV_LINKS.map((link) => {
              const sectionId = getSectionFromHref(link.href);
              const isActive = activeSection === sectionId;
              return (
                <li key={link.label} className="relative">
                  <a
                    href={link.href}
                    className={`relative z-10 block px-6 py-2 font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${
                      isActive ? 'text-black font-bold' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </a>
                  {/* Active sliding pill */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white rounded-full z-0"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </motion.nav>
      </header>

      {/* Mobile Fullscreen Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(40px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.4 }}
            className="md:hidden fixed inset-0 bg-black/80 z-40 flex items-center justify-center"
          >
            <nav>
              <ul className="flex flex-col items-center space-y-8">
                {NAV_LINKS.map((link, i) => {
                  const sectionId = getSectionFromHref(link.href);
                  const isActive = activeSection === sectionId;
                  return (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: i * 0.1, type: 'spring', bounce: 0.4 }}
                    >
                      <a
                        href={link.href}
                        className={`font-display text-4xl uppercase tracking-tighter transition-all duration-300 flex items-center gap-4 ${
                          isActive ? 'text-white' : 'text-white/40 hover:text-white'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {isActive && <span className="w-2 h-2 bg-white rounded-full" />}
                        {link.label}
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