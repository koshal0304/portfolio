import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import Footer from './components/Footer';
import HeroScene3D from './components/HeroScene3D';
import LaptopStoryScene from './components/LaptopStoryScene';
import SectionDivider from './components/SectionDivider';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorLerpPos, setCursorLerpPos] = useState({ x: 0, y: 0 });
  const [cursorEnlarged, setCursorEnlarged] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Scroll progress for HeroScene3D
  const { scrollYProgress } = useScroll();
  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [scrollVal, setScrollVal] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollProgress.on('change', (v) => setScrollVal(v));
    return () => unsubscribe();
  }, [scrollProgress]);

  // Simulate cinematic loading with progress
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      // Non-linear loading — fast start, slow middle, fast finish
      const remaining = 100 - progress;
      const increment = remaining > 60 ? 3 : remaining > 20 ? 1.5 : 4;
      progress = Math.min(100, progress + increment);
      setLoadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 400);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Cursor animation loop with lerp for buttery smoothness
  const animateCursor = useCallback(() => {
    setCursorLerpPos((prev) => ({
      x: prev.x + (mouseRef.current.x - prev.x) * 0.12,
      y: prev.y + (mouseRef.current.y - prev.y) * 0.12,
    }));
    rafRef.current = requestAnimationFrame(animateCursor);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const addHoverListeners = () => {
      document.querySelectorAll('a, button, input, textarea, [role="button"]').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          setCursorEnlarged(true);
          // Check for data-cursor-text attribute
          const text = el.getAttribute('data-cursor-text') || 'View';
          setCursorText(text);
        });
        el.addEventListener('mouseleave', () => {
          setCursorEnlarged(false);
          setCursorText('');
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animateCursor);

    // Re-add listeners after DOM updates
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });
    addHoverListeners();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [animateCursor]);

  // Reduced motion check
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // ─── Cinematic Loading Screen ─────────────────────────────────────
  const LoadingScreen = () => (
    <motion.div
      key="loading"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: 'var(--bg-deep)' }}
    >
      {/* Ambient aurora glow behind loader */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="float-orb"
          style={{
            width: '400px',
            height: '400px',
            background: 'var(--aurora-1)',
            top: '30%',
            left: '20%',
            animationDelay: '0s',
          }}
        />
        <div
          className="float-orb"
          style={{
            width: '300px',
            height: '300px',
            background: 'var(--aurora-2)',
            top: '50%',
            right: '20%',
            animationDelay: '-5s',
          }}
        />
      </div>

      {/* Profile Photo with neon ring reveal */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 relative"
      >
        {/* Neon ring */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute -inset-3 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, var(--aurora-1), var(--aurora-2), var(--aurora-3), var(--aurora-1))',
            animation: 'holo-rotate 3s linear infinite',
            filter: 'blur(4px)',
          }}
        />
        <div className="absolute -inset-2 rounded-full bg-[var(--bg-deep)]" />
        <img
          src="/profile.jpeg"
          alt="Koshal Kumar"
          className="relative w-24 h-24 rounded-full object-cover border-2 border-white/10"
          style={{ boxShadow: '0 0 40px rgba(0, 212, 255, 0.2)' }}
        />
      </motion.div>

      {/* Name with glitch reveal */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="font-display text-2xl font-bold text-white mb-2 tracking-tight"
      >
        <span className={loadProgress > 50 ? 'loading-glitch' : ''}>
          Koshal Kumar
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="font-mono text-xs text-white/40 tracking-[0.4em] uppercase mb-10"
      >
        AI Engineer
      </motion.p>

      {/* Progress bar with neon glow */}
      <div className="w-56 relative">
        <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${loadProgress}%`,
              background: `linear-gradient(90deg, var(--aurora-1), var(--aurora-2))`,
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
              transition: 'width 0.05s linear',
            }}
          />
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute right-0 top-3 font-mono text-[10px] text-white/30"
        >
          {Math.round(loadProgress)}%
        </motion.span>
      </div>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen font-body text-text-base bg-transparent noise-overlay"
          >
            {/* Fixed 3D background */}
            <HeroScene3D scrollProgress={scrollVal} />

            {/* Scroll-driven 3D story scene */}
            <LaptopStoryScene scrollProgress={scrollVal} />

            {/* Main content */}
            <div className="relative z-10 selection:bg-white selection:text-black">
              <Navbar />
              <Hero />
              <SectionDivider />
              <Experience />
              <SectionDivider />
              <Skills />
              <SectionDivider />
              <Projects />
              <SectionDivider />
              <Achievements />
              <SectionDivider />
              <Contact />
              <Footer />
            </div>

            {/* Custom cursor - blend exclusion for premium effect */}
            {!reducedMotion && (
              <>
                {/* Main cursor dot */}
                <div
                  className="fixed pointer-events-none z-50 hidden md:flex items-center justify-center rounded-full transition-all duration-300 ease-out blend-exclusion"
                  style={{
                    width: cursorEnlarged ? '80px' : '24px',
                    height: cursorEnlarged ? '80px' : '24px',
                    backgroundColor: 'white',
                    transform: `translate(${cursorLerpPos.x - (cursorEnlarged ? 40 : 12)}px, ${cursorLerpPos.y - (cursorEnlarged ? 40 : 12)}px)`,
                  }}
                >
                  <span
                    className={`text-black text-[9px] font-bold uppercase tracking-[0.15em] transition-opacity duration-200 ${
                      cursorEnlarged ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {cursorText}
                  </span>
                </div>

                {/* Trailing glow ring */}
                <div
                  className="fixed pointer-events-none z-[49] hidden md:block rounded-full"
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transform: `translate(${cursorLerpPos.x - 20}px, ${cursorLerpPos.y - 20}px)`,
                    transition: 'width 0.3s, height 0.3s',
                  }}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;