import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cpu, ChevronDown, ArrowRight, Search } from 'lucide-react';
import type { NeuralMode } from './NeuralCodeScene3D';
import { openPalette } from '../lib/askLab';

const SPECIALTIES = [
  'Multi-Agent Systems (LangGraph)',
  'Enterprise RAG Pipelines',
  'Schema-Aware NL-to-SQL Engines',
  'Production LLM Guardrails',
  'Vector Embedding Retrieval',
];

// The numbers a recruiter should see in the first five seconds.
const PROOF = [
  { value: '0.48 → 0.81', label: 'RAG recall, +69%' },
  { value: '6+', label: 'AI systems in production' },
  { value: '−60%', label: 'S3 storage cost' },
  { value: '98%', label: 'ResNet18 val. accuracy' },
];

interface HeroProps {
  active3DMode?: NeuralMode;
  on3DModeChange?: (mode: NeuralMode) => void;
}

const Hero: React.FC<HeroProps> = ({ active3DMode = 'attention', on3DModeChange }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect
  const typewriter = useCallback(() => {
    const currentWord = SPECIALTIES[currentIndex];

    if (!isDeleting) {
      if (displayText.length < currentWord.length) {
        setTimeout(() => setDisplayText(currentWord.slice(0, displayText.length + 1)), 60);
      } else {
        setTimeout(() => setIsDeleting(true), 2400);
      }
    } else {
      if (displayText.length > 0) {
        setTimeout(() => setDisplayText(displayText.slice(0, -1)), 35);
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

  return (
    <section id="hero" className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 pt-28 pb-16 overflow-hidden">
      {/* Centered Clean Container */}
      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center justify-center">
        {/* Eyebrow badge with live system status */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 px-4 py-1.5 rounded-full glass-panel border border-slate-500/25 flex items-center gap-2.5 shadow-[0_0_20px_rgba(203,213,225,0.08)]"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
          <p className="font-mono text-xs md:text-sm tracking-widest text-slate-200 uppercase">
            AI Engineer · Bengaluru, India
          </p>
        </motion.div>

        {/* Clean, Elegant Name (Refined Size & Typography) */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-100 mb-4"
        >
          Koshal Kumar
        </motion.h1>

        {/* Dynamic Subtitle — Crisp Typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-body text-lg sm:text-xl md:text-2xl text-slate-300 mb-5 h-9 flex items-center justify-center"
        >
          <span className="text-slate-400 font-light">Architecting </span>
          <span className="text-slate-300 font-medium ml-2 font-mono">{displayText}</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'steps(1)' }}
            className="inline-block w-[2px] h-[1.2em] ml-1 rounded-sm bg-slate-400 shadow-[0_0_6px_#CBD5E1]"
          />
        </motion.div>

        {/* Professional Summary snippet */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="max-w-2xl text-slate-300 font-body text-sm sm:text-base leading-relaxed mb-8"
        >
          Designing and deploying production LLM architectures — LangGraph multi-agent DAGs,
          schema-aware NL-to-SQL pipelines, hybrid vector search (FAISS/Pinecone), and AST security guardrails.
        </motion.p>

        {/* Interactive 3D Mode Selector Pills in Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-10"
        >
          <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" /> 3D Viewport:
          </span>
          <button
            onClick={() => on3DModeChange?.('attention')}
            className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer border ${
              active3DMode === 'attention'
                ? 'bg-slate-500/20 border-slate-400/60 text-slate-200 shadow-[0_0_12px_rgba(203,213,225,0.25)] font-semibold'
                : 'bg-[#0c1017]/70 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
            }`}
          >
            Attention Core
          </button>
          <button
            onClick={() => on3DModeChange?.('langgraph')}
            className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer border ${
              active3DMode === 'langgraph'
                ? 'bg-slate-500/20 border-slate-400/60 text-slate-200 shadow-[0_0_12px_rgba(203,213,225,0.25)] font-semibold'
                : 'bg-[#0c1017]/70 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
            }`}
          >
            LangGraph DAG
          </button>
          <button
            onClick={() => on3DModeChange?.('latent')}
            className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-all cursor-pointer border ${
              active3DMode === 'latent'
                ? 'bg-slate-500/20 border-slate-400/60 text-slate-200 shadow-[0_0_12px_rgba(203,213,225,0.25)] font-semibold'
                : 'bg-[#0c1017]/70 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
            }`}
          >
            Latent Vector Space
          </button>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#ai-sandbox"
            className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-slate-100 rounded-full overflow-hidden glow-button cursor-pointer"
          >
            <div className="absolute inset-[2px] bg-[#0c1017] rounded-full z-0 group-hover:bg-white/5 transition-colors duration-500" />
            <Sparkles className="relative z-10 w-4 h-4 text-slate-400" />
            <span className="relative z-10 font-bold">Try Interactive AI Lab</span>
            <ChevronDown className="relative z-10 w-4 h-4 group-hover:translate-y-0.5 transition-transform text-slate-300" />
          </a>

          <a
            href="#experience"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-slate-200 hover:text-white rounded-full border border-white/10 hover:border-slate-400/50 glass-liquid transition-all duration-300 cursor-pointer"
          >
            <span>Production Experience</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Proof strip — measured outcomes, not adjectives */}
        <motion.dl
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-12 w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/[0.08] bg-[#1a1f29]"
        >
          {PROOF.map((p) => (
            <div key={p.label} className="px-4 py-4 flex flex-col-reverse items-center gap-1 bg-[#080b12]/85 backdrop-blur-md">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-400 text-center">{p.label}</dt>
              <dd className="font-display text-xl sm:text-2xl font-bold text-gradient-soft tabular-nums whitespace-nowrap">
                {p.value}
              </dd>
            </div>
          ))}
        </motion.dl>

        <motion.button
          type="button"
          onClick={openPalette}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            Press <kbd className="px-1.5 py-0.5 rounded border border-white/15 text-slate-300">/</kbd> to semantically search my
            experience
          </span>
          <span className="md:hidden">Tap to semantically search my experience</span>
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;
