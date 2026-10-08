import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { roles } from '../data/profile';

const Experience: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const lineScaleY = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <section id="experience" ref={sectionRef} className="bg-background/70 py-24 relative overflow-hidden">
      {/* Background aurora orb */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="float-orb"
          style={{
            width: '400px',
            height: '400px',
            background: 'var(--aurora-2)',
            top: '20%',
            right: '-10%',
            opacity: 0.05,
            animationDelay: '-3s',
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Title with border glow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-100 mb-4 tracking-tight">
            Career Timeline
          </h2>
          <p className="text-slate-400 font-body text-base">End-to-end ownership, verified production deployments</p>
          {/* Aurora underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="aurora-divider mx-auto mt-6"
            style={{ maxWidth: '120px', transformOrigin: 'center' }}
          />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center vertical line — neon gradient */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-indigo-400/20 to-pink-400/20" />
            <motion.div
              style={{ scaleY: lineScaleY, transformOrigin: 'top' }}
              className="absolute inset-0 bg-gradient-to-b from-sky-400 via-indigo-400 to-pink-400"
            />
          </div>

          {/* Role Cards */}
          {roles.map((role, idx) => {
            const isExpanded = expandedCard === idx;
            const isLeft = idx % 2 === 0;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isLeft ? -50 : 50, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`relative mb-16 pl-16 md:pl-0 ${
                  isLeft ? 'md:pr-[calc(50%+2rem)] md:text-right' : 'md:pl-[calc(50%+2rem)]'
                }`}
              >
                {/* Timeline node with pulse ring */}
                <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 z-10">
                  <div
                    className="w-5 h-5 rounded-full pulse-ring relative bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                  />
                </div>

                {/* Card — holographic shimmer */}
                <div
                  data-guide={idx === 0 ? 'current-role' : undefined}
                  className="glass-liquid holo-card rounded-2xl p-6 md:p-8 border border-white/[0.08] hover:border-white/20 transition-all"
                >
                  <div className={`flex flex-col ${isLeft ? 'md:items-end' : 'md:items-start'} gap-2 mb-4`}>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-slate-100">{role.company}</h3>
                    <div className="flex items-center gap-2 flex-wrap text-slate-400 font-mono text-xs sm:text-sm">
                      <span className="text-slate-300 font-medium">{role.title}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{role.location}</span>
                    </div>
                    {role.subtitle && (
                      <p className="font-mono text-xs text-sky-300/90 tracking-wide font-medium">
                        {role.subtitle}
                      </p>
                    )}
                    <span
                      className="inline-block font-mono text-xs px-3 py-1 rounded-full border border-sky-400/30 text-sky-300 bg-sky-950/30 shadow-[0_0_10px_rgba(56,189,248,0.1)]"
                    >
                      {role.duration}
                    </span>
                  </div>

                  <p className="text-slate-300 font-body text-sm mb-5 leading-relaxed">{role.summary}</p>

                  {/* Tags */}
                  <div className={`flex flex-wrap gap-2 mb-4 ${isLeft ? 'md:justify-end' : ''}`}>
                    {(isExpanded ? role.allTags : role.tags).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-xs px-2.5 py-0.5 rounded-full border border-sky-400/20 bg-sky-500/5 text-sky-300/90 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : idx)}
                    className="font-mono text-xs hover:underline mb-2 cursor-pointer transition-colors duration-300 text-sky-400 hover:text-sky-300 flex items-center gap-1 inline-flex"
                    data-cursor-text={isExpanded ? 'Less' : 'More'}
                  >
                    <span>{isExpanded ? 'Collapse ↑' : `Show All ${role.projects.length} Projects ↓`}</span>
                  </button>

                  {/* Expanded projects */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                          {role.projects.map((project, pIdx) => (
                            <motion.div
                              key={pIdx}
                              initial={{ opacity: 0, x: isLeft ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: pIdx * 0.05 }}
                              className={`flex gap-3 ${isLeft ? 'md:flex-row-reverse md:text-right' : ''}`}
                            >
                              <div
                                className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                              />
                              <div>
                                <span className="font-semibold text-sm text-sky-200 block mb-0.5">
                                  {project.name}
                                </span>
                                <p className="text-slate-300 text-sm leading-relaxed">{project.description}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experience;
