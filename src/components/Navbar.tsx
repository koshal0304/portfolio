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
    <header className="fixed top-0 left-0 right-0 z-50">
      <motion.nav
        initial={false}
        animate={{
          backgroundColor: isScrolled ? 'rgba(10, 10, 15, 0.8)' : 'rgba(10, 10, 15, 0)',
          borderBottomColor: isScrolled ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 212, 255, 0)',
        }}
        transition={{ duration: 0.3 }}
        className="border-b"
        style={{ backdropFilter: isScrolled ? 'blur(24px)' : 'none' }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-20">
          {/* Logo - KK SVG */}
          <a href="#hero" className="relative z-10" aria-label="Home">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8V32M6 20L16 8M6 20L16 32" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M24 8V32M24 20L34 8M24 20L34 32" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => {
              const sectionId = getSectionFromHref(link.href);
              const isActive = activeSection === sectionId;
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={`relative font-mono text-sm transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-text-muted hover:text-primary'
                    }`}
                  >
                    {link.label}
                    {/* Active dot */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    {/* Hover underline */}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 hover-target" />
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative z-10 w-8 h-8 flex flex-col justify-center items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <motion.span
              animate={isMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
              className="block w-6 h-0.5 bg-primary absolute"
              transition={{ duration: 0.2 }}
            />
            <motion.span
              animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-0.5 bg-primary absolute"
              transition={{ duration: 0.2 }}
            />
            <motion.span
              animate={isMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
              className="block w-6 h-0.5 bg-primary absolute"
              transition={{ duration: 0.2 }}
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 bg-background/95 z-40 flex items-center justify-center"
            style={{ backdropFilter: 'blur(40px)' }}
          >
            <nav>
              <ul className="flex flex-col items-center space-y-8">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <a
                      href={link.href}
                      className="font-display text-3xl text-text-base hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;