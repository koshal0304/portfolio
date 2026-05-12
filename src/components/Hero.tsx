import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const SPECIALTIES = ['LLM Pipelines', 'RAG Systems', 'AI Agents', 'Production AI'];

const Hero: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Typewriter effect
  const typewriter = useCallback(() => {
    const currentWord = SPECIALTIES[currentIndex];

    if (!isDeleting) {
      if (displayText.length < currentWord.length) {
        setTimeout(() => setDisplayText(currentWord.slice(0, displayText.length + 1)), 80);
      } else {
        setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayText.length > 0) {
        setTimeout(() => setDisplayText(displayText.slice(0, -1)), 40);
      } else {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % SPECIALTIES.length);
      }
    }
  }, [displayText, currentIndex, isDeleting]);

  useEffect(() => {
    const timeout = setTimeout(typewriter, 10);
    return () => clearTimeout(timeout);
  }, [typewriter]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollProgress = Math.min(scrollY / (window.innerHeight || 1), 1);
  const nameChars = 'Koshal Kumar'.split('');

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Content overlay */}
      <div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        style={{ pointerEvents: 'none' }}
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-mono text-sm tracking-[0.3em] text-text-muted mb-6"
        >
          AI ENGINEER
        </motion.p>

        {/* Name - character split */}
        <h1 className="font-display text-7xl md:text-9xl font-bold text-text-base mb-6 leading-none">
          {nameChars.map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </h1>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="font-display text-2xl md:text-3xl text-primary mb-12"
        >
          <span>{displayText}</span>
          <span className="inline-block w-0.5 h-7 bg-primary ml-1 animate-pulse" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          style={{ pointerEvents: 'auto' }}
        >
          <motion.a
            href="#experience"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 border border-primary text-primary px-8 py-3 font-mono text-sm rounded-md glow-cyan transition-all duration-300 hover:bg-primary hover:text-background"
          >
            View My Work
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              ↓
            </motion.span>
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollProgress > 0.05 ? 0 : 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-10"
      >
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="w-px h-10 bg-primary origin-top mb-2"
        />
        <span className="font-mono text-xs text-text-muted tracking-widest" style={{ writingMode: 'vertical-rl' }}>
          scroll
        </span>
      </motion.div>
    </section>
  );
};

export default Hero;
