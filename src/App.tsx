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

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorLerpPos, setCursorLerpPos] = useState({ x: 0, y: 0 });
  const [cursorEnlarged, setCursorEnlarged] = useState(false);
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

  // Loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Cursor animation loop with lerp
  const animateCursor = useCallback(() => {
    setCursorLerpPos((prev) => ({
      x: prev.x + (mouseRef.current.x - prev.x) * 0.08,
      y: prev.y + (mouseRef.current.y - prev.y) * 0.08,
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
        el.addEventListener('mouseenter', () => setCursorEnlarged(true));
        el.addEventListener('mouseleave', () => setCursorEnlarged(false));
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

  // Loading screen
  const LoadingScreen = () => (
    <motion.div
      key="loading"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50"
    >
      {/* KK monogram SVG draw */}
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 40 40"
        fill="none"
        className="mb-8"
      >
        <motion.path
          d="M6 8V32M6 20L16 8M6 20L16 32"
          stroke="#00d4ff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        <motion.path
          d="M24 8V32M24 20L34 8M24 20L34 32"
          stroke="#00d4ff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
        />
      </motion.svg>

      {/* Progress bar */}
      <div className="w-48 h-0.5 bg-surface rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
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
            transition={{ duration: 0.5 }}
            className="min-h-screen font-body text-text-base"
          >
            {/* Fixed 3D background */}
            <HeroScene3D scrollProgress={scrollVal} />

            {/* Scroll-driven 3D story scene */}
            <LaptopStoryScene scrollProgress={scrollVal} />

            {/* Main content */}
            <div className="relative z-10">
              <Navbar />
              <Hero />
              <Experience />
              <Skills />
              <Projects />
              <Achievements />
              <Contact />
              <Footer />
            </div>

            {/* Custom cursor - outer ring (lerped) */}
            {!reducedMotion && (
              <>
                <div
                  className="fixed pointer-events-none z-50 hidden md:block rounded-full border transition-all duration-150"
                  style={{
                    width: cursorEnlarged ? '48px' : '32px',
                    height: cursorEnlarged ? '48px' : '32px',
                    borderColor: '#00d4ff',
                    backgroundColor: cursorEnlarged ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                    transform: `translate(${cursorLerpPos.x - (cursorEnlarged ? 24 : 16)}px, ${cursorLerpPos.y - (cursorEnlarged ? 24 : 16)}px)`,
                  }}
                />
                {/* Inner dot (immediate) */}
                <div
                  className="fixed pointer-events-none z-50 hidden md:block rounded-full bg-primary"
                  style={{
                    width: '6px',
                    height: '6px',
                    transform: `translate(${cursorPos.x - 3}px, ${cursorPos.y - 3}px)`,
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