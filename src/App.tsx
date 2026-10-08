import { Suspense, lazy, useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Achievements from './components/Achievements';
import Education from './components/Education';
import Contact from './components/Contact';
import Footer from './components/Footer';
import type { NeuralMode } from './components/NeuralCodeScene3D';
import CommandPalette from './components/CommandPalette';
import SafeBoundary from './components/SafeBoundary';
import AIGuide from './components/guide/AIGuide';
import AIEngineerSandbox from './components/AIEngineerSandbox';
import SectionDivider from './components/SectionDivider';
import Cursor3D from './components/Cursor3D';
import { Sparkles } from 'lucide-react';

// three.js-heavy modules ship as separate chunks; the loader waits on the scene for real.
const loadScene = () => import('./components/NeuralCodeScene3D');
const NeuralCodeScene3D = lazy(loadScene);
const Skills = lazy(() => import('./components/Skills'));

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [active3DMode, setActive3DMode] = useState<NeuralMode>('attention');

  // Scroll progress drives the background scene
  const { scrollYProgress } = useScroll();
  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [scrollVal, setScrollVal] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollProgress.on('change', (v) => setScrollVal(v));
    return () => unsubscribe();
  }, [scrollProgress]);

  // Progress tracks the real 3D chunk download; 900ms floor lets the reveal animation play.
  useEffect(() => {
    let ready = false;
    const settle = () => {
      ready = true;
    };
    loadScene().then(settle, settle);
    const start = performance.now();
    let progress = 0;
    const interval = setInterval(() => {
      const done = ready && performance.now() - start > 900;
      progress = done ? 100 : progress + (92 - progress) * 0.06;
      setLoadProgress(progress);
      if (done) {
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 250);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

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
        className="font-display text-2xl font-bold text-slate-100 mb-2 tracking-tight"
      >
        <span className={loadProgress > 50 ? 'loading-glitch' : ''}>
          Koshal Kumar
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="font-mono text-xs text-slate-400 tracking-[0.4em] uppercase mb-10"
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
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
              transition: 'width 0.05s linear',
            }}
          />
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute right-0 top-3 font-mono text-[10px] text-slate-400"
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
          // Called, not mounted: a component defined in render would remount (and restart its animations) every tick.
          LoadingScreen()
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen font-body text-slate-200 bg-transparent noise-overlay"
          >
            {/* Interactive 3D Neural Code Matrix Background */}
            <SafeBoundary>
              <Suspense fallback={null}>
                <NeuralCodeScene3D scrollProgress={scrollVal} activeMode={active3DMode} />
              </Suspense>
            </SafeBoundary>
            <CommandPalette />
            <AIGuide />

            {/* Main content */}
            <div className="relative z-10 selection:bg-sky-500/30 selection:text-sky-100">
              <Navbar />
              <Hero active3DMode={active3DMode} on3DModeChange={setActive3DMode} />
              <SectionDivider />

              {/* Dedicated Interactive AI Engineering Section */}
              <section id="ai-sandbox" className="py-20 md:py-28 px-4 max-w-5xl mx-auto relative z-20">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-sky-400/30 text-sky-300 font-mono text-xs uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Live Interactive Demonstration</span>
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-slate-100 tracking-tight mb-4">
                    AI Engineering Lab
                  </h2>
                  <p className="text-slate-400 font-body text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                    Query a working hybrid-retrieval engine over my career and watch it rank evidence in 3D, explore
                    production architectures, and attack a live guardrail. Everything runs in your browser.
                  </p>
                </div>
                <AIEngineerSandbox />
              </section>

              <SectionDivider />
              <Experience />
              <SectionDivider />
              <SafeBoundary>
                <Suspense fallback={<section id="skills" className="min-h-[600px]" />}>
                  <Skills />
                </Suspense>
              </SafeBoundary>
              <SectionDivider />
              <Projects />
              <SectionDivider />
              <Achievements />
              <SectionDivider />
              <Education />
              <SectionDivider />
              <Contact />
              <Footer />
            </div>

            {/* 3D Cursor — morphing icosahedron with particle trail */}
            <Cursor3D reducedMotion={reducedMotion} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;