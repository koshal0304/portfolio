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
        className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center justify-center"
        style={{ pointerEvents: 'none' }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="mb-8 px-6 py-2 rounded-full glass border border-white/10"
        >
          <p className="font-mono text-xs md:text-sm tracking-[0.4em] text-white/80 uppercase">
            AI Engineer & Creative Developer
          </p>
        </motion.div>

        {/* Name - character split with neon gradient */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-[8rem] font-black mb-6 leading-none tracking-tighter flex flex-wrap justify-center gap-[0.2em]">
          {'Koshal Kumar'.split(' ').map((word, wIdx) => (
            <span key={wIdx} className="whitespace-nowrap">
              {word.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 100, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.3 + (wIdx * 6 + i) * 0.05, duration: 0.8, type: 'spring', bounce: 0.4 }}
                  className="inline-block text-gradient-neon pb-2"
                  style={{ transformOrigin: 'bottom' }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: 1.2, duration: 1 }}
          className="font-body font-light text-xl md:text-3xl text-text-muted mb-16 h-10 flex items-center justify-center"
        >
          <span>Crafting </span>
          <span className="text-white font-medium ml-2">{displayText}</span>
          <span className="inline-block w-[3px] h-[1.2em] bg-white ml-1 animate-pulse" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          style={{ pointerEvents: 'auto' }}
        >
          <motion.a
            href="#experience"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center justify-center gap-3 glass-panel px-10 py-4 font-mono text-sm uppercase tracking-widest text-white rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors duration-300" />
            <span className="relative z-10">Discover My Work</span>
            <motion.span
              className="relative z-10"
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
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
        transition={{ delay: 2.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-10"
      >
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 2.8, duration: 1, ease: "easeInOut" }}
          className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent origin-top mb-4"
        />
        <span className="font-mono text-[10px] text-white/40 tracking-[0.5em] uppercase" style={{ writingMode: 'vertical-rl' }}>
          Scroll
        </span>
      </motion.div>
    </section>
  );
};

export default Hero;
