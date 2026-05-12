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

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient aurora orbs behind content */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="float-orb"
          style={{
            width: '500px',
            height: '500px',
            background: 'var(--aurora-1)',
            top: '10%',
            left: '-10%',
            opacity: 0.08,
            animationDelay: '0s',
          }}
        />
        <div
          className="float-orb"
          style={{
            width: '400px',
            height: '400px',
            background: 'var(--aurora-2)',
            bottom: '10%',
            right: '-5%',
            opacity: 0.06,
            animationDelay: '-7s',
          }}
        />
        <div
          className="float-orb"
          style={{
            width: '250px',
            height: '250px',
            background: 'var(--aurora-3)',
            top: '60%',
            left: '40%',
            opacity: 0.04,
            animationDelay: '-12s',
          }}
        />
      </div>

      {/* Content overlay */}
      <div
        className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center justify-center"
        style={{ pointerEvents: 'none' }}
      >
        {/* Eyebrow badge — glassmorphism pill */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 px-6 py-2.5 rounded-full glass-panel"
        >
          <p className="font-mono text-xs md:text-sm tracking-[0.4em] text-white/60 uppercase">
            AI Engineer & Creative Developer
          </p>
        </motion.div>

        {/* Name — Character-by-character spring entrance with shimmer */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-[8rem] font-black mb-6 leading-none tracking-tighter flex flex-wrap justify-center gap-[0.15em]">
          {'Koshal Kumar'.split(' ').map((word, wIdx) => (
            <span key={wIdx} className="whitespace-nowrap">
              {word.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 120, rotateX: -90, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                  transition={{
                    delay: 0.4 + (wIdx * 6 + i) * 0.06,
                    duration: 1,
                    type: 'spring',
                    bounce: 0.35,
                  }}
                  className="inline-block text-shimmer pb-2"
                  style={{ transformOrigin: 'bottom' }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        {/* Subtitle — Typewriter with neon cursor */}
        <motion.div
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: 1.4, duration: 1 }}
          className="font-body font-light text-xl md:text-3xl text-white/50 mb-16 h-10 flex items-center justify-center"
        >
          <span>Crafting </span>
          <span className="text-white font-medium ml-2">{displayText}</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'steps(1)' }}
            className="inline-block w-[3px] h-[1.2em] ml-1 rounded-sm"
            style={{
              background: 'var(--aurora-1)',
              boxShadow: '0 0 8px rgba(0, 212, 255, 0.6)',
            }}
          />
        </motion.div>

        {/* CTA Button — Neon glow border */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ pointerEvents: 'auto' }}
        >
          <motion.a
            href="#experience"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-cursor-text="Explore"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 font-mono text-sm uppercase tracking-widest text-white rounded-full overflow-hidden glow-button cursor-pointer"
          >
            {/* Inner bg */}
            <div className="absolute inset-[2px] bg-[var(--bg-deep)] rounded-full z-0 group-hover:bg-white/5 transition-colors duration-500" />
            <span className="relative z-10">Discover My Work</span>
            <motion.span
              className="relative z-10"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              ↓
            </motion.span>
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator with neon pulse */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollProgress > 0.05 ? 0 : 1 }}
        transition={{ delay: 2.8 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-10"
      >
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 3, duration: 1.2, ease: 'easeInOut' }}
          className="w-[1px] h-16 origin-top mb-4"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 212, 255, 0.5), transparent)',
          }}
        />
        <span
          className="font-mono text-[10px] text-white/30 tracking-[0.5em] uppercase"
          style={{ writingMode: 'vertical-rl' }}
        >
          Scroll
        </span>
      </motion.div>
    </section>
  );
};

export default Hero;
