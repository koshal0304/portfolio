import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Particles from './components/Particles';
import MovingStarsBackground from './components/MovingStarsBackground';
import ScrollAnimationWrapper from './components/ScrollAnimationWrapper';
import ParallaxEffect from './components/ParallaxEffect';
import CursorTrail from './components/CursorTrail';
import SpotlightCursor from './components/SpotlightCursor';
import ScrollProgressIndicator from './components/ScrollProgressIndicator';
import { initAllAnimations } from './utils/scrollAnimations';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorEnlarged, setCursorEnlarged] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  // Handle loading animation
  useEffect(() => {
    // Simulate a loading time
    const timer = setTimeout(() => {
      setIsLoading(false);

      // Initialize animations after loading is complete
      setTimeout(() => {
        initAllAnimations();
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Handle custom cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setCursorEnlarged(true);
    const handleMouseUp = () => setCursorEnlarged(false);

    // Add hover effect to interactive elements
    const addCursorHoverListeners = () => {
      const interactiveElements = document.querySelectorAll('a, button, input, textarea, [role="button"]');

      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => setCursorEnlarged(true));
        el.addEventListener('mouseleave', () => setCursorEnlarged(false));
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Wait for DOM to be fully loaded before adding hover listeners
    if (document.readyState === 'complete') {
      addCursorHoverListeners();
    } else {
      window.addEventListener('load', addCursorHoverListeners);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('load', addCursorHoverListeners);
    };
  }, []);

  // Apply cursor position with smooth animation
  useEffect(() => {
    if (!cursorRef.current || !cursorDotRef.current) return;

    // Smooth animation for outer circle
    cursorRef.current.style.transform = `translate(${cursorPosition.x}px, ${cursorPosition.y}px) translate(-50%, -50%)`;

    // Faster animation for inner dot
    cursorDotRef.current.style.transform = `translate(${cursorPosition.x}px, ${cursorPosition.y}px) translate(-50%, -50%)`;
  }, [cursorPosition]);

  // Loading screen component
  const LoadingScreen = () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      {/* Stars background for loading screen */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDuration: `${Math.random() * 3 + 1}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-600 border-b-purple-500 border-l-purple-600 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-blue-300 border-b-transparent border-l-blue-300 animate-spin-slow"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xl font-bold">K</span>
        </div>
      </div>

      <h2 className="text-white text-2xl font-bold mb-2">Koshal Kumar</h2>
      <p className="text-blue-200 text-lg">Exploring the Universe...</p>

      <div className="mt-8 w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-black relative"
          >
            {/* Aurora background effect */}
            <div className="aurora-bg" />

            <Particles />
            <CursorTrail color="rgba(59, 130, 246, 0.5)" size={6} trailLength={15} />
            <SpotlightCursor />

            {/* Main content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10"
            >
              <Navbar />

              {/* Hero section with parallax stars */}
              <section id="hero" className="relative">
                <MovingStarsBackground starCount={100} density="high" speed="slow" colorScheme="mixed" withNebula={true} />
                <Hero />
              </section>

              {/* Experience section with animated background */}
              <ScrollAnimationWrapper animation="fade-in-up">
                <section id="experience" className="relative">
                  <MovingStarsBackground starCount={70} density="medium" speed="medium" colorScheme="blue" />
                  <Experience />
                </section>
              </ScrollAnimationWrapper>

              {/* Projects section with animated background */}
              <ScrollAnimationWrapper animation="fade-in-up" delay={200}>
                <section id="projects" className="relative">
                  <MovingStarsBackground starCount={80} density="medium" speed="medium" colorScheme="purple" />
                  <Projects />
                </section>
              </ScrollAnimationWrapper>

              {/* Skills section with animated background */}
              <ScrollAnimationWrapper animation="fade-in-up" delay={300}>
                <section id="skills" className="relative">
                  <MovingStarsBackground starCount={60} density="low" speed="fast" colorScheme="mixed" />
                  <Skills />
                </section>
              </ScrollAnimationWrapper>

              {/* Contact section with animated background */}
              <ScrollAnimationWrapper animation="fade-in-up" delay={400}>
                <section id="contact" className="relative">
                  <MovingStarsBackground starCount={90} density="high" speed="slow" colorScheme="blue" withNebula={true} />
                  <Contact />
                </section>
              </ScrollAnimationWrapper>

              <Footer />
            </motion.div>

            {/* Custom cursor effect - space themed */}
            <div
              ref={cursorRef}
              className={`fixed w-8 h-8 rounded-full border-2 border-blue-500 pointer-events-none z-50 hidden md:block transition-transform duration-100 ${cursorEnlarged ? 'scale-150' : 'scale-100'
                }`}
              style={{
                transitionProperty: 'transform, width, height',
                transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)',
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)'
              }}
            />

            <div
              ref={cursorDotRef}
              className="fixed w-2 h-2 bg-blue-400 rounded-full pointer-events-none z-50 hidden md:block"
              style={{
                transitionProperty: 'transform',
                transitionDuration: '0.05s',
                transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)',
                boxShadow: '0 0 5px rgba(59, 130, 246, 0.8)'
              }}
            />

            {/* Scroll Progress Indicator */}
            <ScrollProgressIndicator />

            {/* Scroll to top button with enhanced effects */}
            <ParallaxEffect direction="up" factor={0.05} speed="fast">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-blue-500/50 hover:scale-110 hover-glow"
                style={{
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
                  '--glow-rgb': '59, 130, 246'
                } as React.CSSProperties}
                aria-label="Scroll to top"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </motion.button>
            </ParallaxEffect>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;