import React, { Suspense, lazy, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import SafeBoundary from './SafeBoundary';
import { featuredProject, additionalProjects, type Project } from '../data/profile';

const SemanticCluster3D = lazy(() => import('./SemanticCluster3D'));

// ─── GitHub SVG Icon ──────────────────────────────────────────────
const GitHubIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// ─── External Link SVG Icon ──────────────────────────────────────
const ExternalLinkIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// ─── Architecture strip: data-flow stages with packets travelling through them ──
const PipelineFlow: React.FC<{ steps: string[] }> = ({ steps }) => (
  <ol className="flex flex-wrap items-center gap-y-2 mb-5" aria-label="Architecture data flow">
    {steps.map((step, i) => (
      <li key={step} className="flex items-center">
        <span className="font-mono text-[10px] px-2.5 py-1 rounded-md border border-sky-400/20 bg-sky-500/[0.06] text-sky-100/90 whitespace-nowrap">
          {step}
        </span>
        {i < steps.length - 1 && (
          <span className="pipe-link" style={{ animationDelay: `${i * 0.35}s` }} aria-hidden="true" />
        )}
      </li>
    ))}
  </ol>
);

// ─── Project Card with 3D Tilt + Holographic Shimmer ──────────────
interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt((prev) => ({
      x: prev.x + (y * -10 - prev.x) * 0.15,
      y: prev.y + (x * 10 - prev.y) * 0.15,
    }));
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass-liquid holo-card rounded-xl p-6 cursor-default relative group"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 100ms ease-out',
      }}
    >
      {/* Spotlight glow that follows cursor */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${glowPos.x}% ${glowPos.y}%, rgba(56, 189, 248, 0.08), transparent 50%)`,
        }}
      />

      <div style={{ transform: 'translateZ(26px)', transformStyle: 'preserve-3d' }}>
        <h3 className="font-display text-xl font-bold text-slate-100 mb-1 tracking-tight">{project.name}</h3>
        {project.subtitle && (
          <p className="font-mono text-xs text-sky-300/90 mb-3">{project.subtitle}</p>
        )}
        <p className="text-slate-300 font-body text-sm leading-relaxed mb-5 line-clamp-3">{project.description}</p>
        <PipelineFlow steps={project.pipeline} />

        {/* Tech tags */}
        <div className="flex flex-wrap gap-2 mb-5" style={{ transform: 'translateZ(12px)' }}>
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_10px_rgba(56,189,248,0.2)] text-slate-300"
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-3" style={{ transform: 'translateZ(18px)' }}>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-text="Open"
              className="glass-liquid text-slate-200 hover:text-black hover:bg-white transition-all px-4 py-2 rounded-lg text-xs font-mono flex items-center gap-2 font-medium cursor-pointer"
              aria-label={`View ${project.name} on GitHub`}
            >
              <GitHubIcon />
              GitHub
            </a>
          )}
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-text="Open"
              className="glass-liquid text-slate-200 hover:text-black hover:bg-white transition-all px-4 py-2 rounded-lg text-xs font-mono flex items-center gap-2 font-medium cursor-pointer"
              aria-label={`View ${project.name} live demo`}
            >
              <ExternalLinkIcon />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Projects Component ──────────────────────────────────────
const Projects: React.FC = () => {
  const [featuredTilt, setFeaturedTilt] = useState({ x: 0, y: 0 });
  const [featuredGlow, setFeaturedGlow] = useState({ x: 50, y: 50 });

  const handleFeaturedMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setFeaturedTilt({ x: y * -6, y: x * 6 });
    setFeaturedGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const handleFeaturedMouseLeave = useCallback(() => {
    setFeaturedTilt({ x: 0, y: 0 });
  }, []);

  return (
    <section id="projects" className="bg-background/70 py-24 relative overflow-hidden">
      {/* Background aurora */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="float-orb"
          style={{
            width: '350px',
            height: '350px',
            background: 'var(--aurora-3)',
            bottom: '10%',
            left: '-5%',
            opacity: 0.04,
            animationDelay: '-8s',
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-100 mb-4 tracking-tight">Projects</h2>
          <p className="text-slate-400 font-body max-w-xl mx-auto">Production-grade AI architectures, semantic retrieval engines, and full-stack systems</p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="aurora-divider mx-auto mt-4"
            style={{ maxWidth: '80px', transformOrigin: 'center' }}
          />
        </motion.div>

        {/* ═══ Featured project card with 3D Semantic Cluster ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={handleFeaturedMouseMove}
          onMouseLeave={handleFeaturedMouseLeave}
          className="glass-liquid holo-card rounded-2xl p-8 md:p-10 relative overflow-hidden cursor-default mb-10 group"
          style={{
            transform: `perspective(1000px) rotateX(${featuredTilt.x}deg) rotateY(${featuredTilt.y}deg)`,
            transition: 'transform 400ms ease',
          }}
        >
          {/* Aurora top border */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)',
            }}
          />

          {/* Spotlight glow */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(600px circle at ${featuredGlow.x}% ${featuredGlow.y}%, rgba(56, 189, 248, 0.05), transparent 50%)`,
            }}
          />

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left: Content (7 cols) */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-sky-300 font-semibold">
                  Featured Architecture
                </span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-100 mb-2 tracking-tight">
                {featuredProject.name}
              </h3>
              {featuredProject.subtitle && (
                <p className="font-mono text-xs text-sky-300/90 mb-4 font-medium">{featuredProject.subtitle}</p>
              )}
              <p className="text-slate-300 font-body text-sm sm:text-base leading-relaxed mb-6">
                {featuredProject.description}
              </p>
              <PipelineFlow steps={featuredProject.pipeline} />
              <div className="flex flex-wrap gap-2">
                {featuredProject.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-xs px-3 py-1 rounded-full border border-sky-400/20 bg-sky-500/5 text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Live Interactive 3D Semantic Vector Space (5 cols) */}
            <div className="lg:col-span-5 w-full">
              <SafeBoundary>
                <Suspense fallback={<div className="w-full h-72 md:h-80 rounded-xl glass-panel" />}>
                  <SemanticCluster3D className="w-full h-72 md:h-80" />
                </Suspense>
              </SafeBoundary>
            </div>
          </div>
        </motion.div>

        {/* ═══ Projects bento grid ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {additionalProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* View more on GitHub */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/koshal0304"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-text="Open"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-all px-6 py-3 rounded-lg font-mono text-sm cursor-pointer glow-button"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <GitHubIcon />
            View More on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
