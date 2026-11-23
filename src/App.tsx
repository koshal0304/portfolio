import { Suspense, lazy, useEffect, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Achievements from './components/Achievements';
import Education from './components/Education';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import SafeBoundary from './components/SafeBoundary';
import SectionHeader from './components/SectionHeader';
import { DimensionalTitle } from './components/KineticText';
import AIGuide from './components/guide/AIGuide';
import AIEngineerSandbox from './components/AIEngineerSandbox';
import Cursor from './components/Cursor';
import ChapterRail from './components/ChapterRail';
import { startSmoothScroll } from './lib/smoothScroll';

// three.js-heavy modules ship as separate chunks; the intro waits on them for real.
const loadSky = () => import('./components/DuskField');
const DuskField = lazy(loadSky);
const Skills = lazy(() => import('./components/Skills'));

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Surfaces marked .spotlight catch a soft light under the cursor (see index.css). */
function useSpotlight() {
  useEffect(() => {
    const on = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.('.spotlight') as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => window.removeEventListener('pointermove', on);
  }, []);
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  useSpotlight();
  useEffect(startSmoothScroll, []);

  // Progress tracks the real 3D chunk downloads and kicks off the twin's model; a 900ms floor lets the intro breathe.
  useEffect(() => {
    let ready = false;
    const settle = () => {
      ready = true;
    };
    Promise.all([loadSky(), import('./components/guide/avatarAsset').then((m) => m.preloadAvatar())]).then(settle, settle);
    const start = performance.now();
    let progress = 0;
    const interval = setInterval(() => {
      const done = ready && performance.now() - start > 900;
      progress = done ? 100 : progress + (92 - progress) * 0.06;
      setLoadProgress(progress);
      if (done) {
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 200);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas px-6 text-center"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_68%_38%,rgba(244,182,120,0.16),transparent_70%)]" />
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative font-mono text-[11px] uppercase tracking-[0.3em] text-slate-400"
            >
              Koshal Kumar · AI Engineer
            </motion.p>
            <DimensionalTitle
              text="Waking up the digital twin"
              as="h1"
              preset="hologram"
              inView
              interactive={false}
              extrude
              shader="prism"
              accentWords={[3, 4]}
              className="relative mt-3 font-display text-[28px] font-medium tracking-display text-slate-100 md:text-[38px]"
            />
            <div className="relative mt-8 h-px w-56 overflow-hidden bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-accent-400/50 via-accent-300 to-white shadow-[0_0_12px_rgba(244,182,120,0.85)]"
                style={{ width: `${loadProgress}%`, transition: 'width 60ms linear' }}
              />
            </div>
            <span className="relative mt-3 font-mono text-[10px] tabular-nums text-slate-400">{Math.round(loadProgress)}%</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="noise-overlay min-h-screen font-body text-slate-200"
          >
            <SafeBoundary>
              <Suspense fallback={null}>
                <DuskField reducedMotion={reducedMotion} />
              </Suspense>
            </SafeBoundary>
            <CommandPalette />
            {/* Outside the content's stacking context, so the nav and its menu layer above the floating twin. */}
            <Navbar />
            <ChapterRail />

            <div className="relative z-10">
              <main>
                <Hero />

                <section id="ai-sandbox" className="relative z-20 mx-auto max-w-[1160px] overflow-x-clip px-4 py-24 md:py-32">
                  <SectionHeader
                    chapter="02"
                    eyebrow="Live AI lab"
                    title="Don't take my word for it. Query it."
                    lead="A working hybrid-retrieval engine over my career ranks evidence in 3D, next to production architectures you can step through and a guardrail you can try to break. Everything runs in your browser."
                  />
                  <AIEngineerSandbox />
                </section>

                <Experience />
                <SafeBoundary>
                  <Suspense fallback={<section id="skills" className="min-h-[600px]" />}>
                    <Skills />
                  </Suspense>
                </SafeBoundary>
                <Projects />
                <Achievements />
                <Education />
                <Contact />
              </main>
              <Footer />
            </div>

            <AIGuide />
            <Cursor />
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

export default App;
