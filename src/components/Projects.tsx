import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Github } from 'lucide-react';
import SafeBoundary from './SafeBoundary';
import SectionHeader from './SectionHeader';
import { featuredProject, additionalProjects, type Project } from '../data/profile';
import { ExtrudedHeading, Magnetic3D, ScrambleText, SlotRollText } from './KineticText';

const SemanticCluster3D = lazy(() => import('./SemanticCluster3D'));

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DECK_TOP = 96;
const DECK_STEP = 18;
const DECK = [featuredProject, ...additionalProjects];

// Architecture strip: data-flow stages with packets travelling between them.
const PipelineFlow: React.FC<{ steps: string[] }> = ({ steps }) => (
  <ol className="mb-5 flex flex-wrap items-center gap-y-2" aria-label="Architecture data flow">
    {steps.map((step, i) => (
      <li key={step} className="flex items-center">
        <span className="whitespace-nowrap rounded-md border border-white/[0.12] bg-white/5 px-2.5 py-1 font-mono text-[10px] text-slate-200">
          {step}
        </span>
        {i < steps.length - 1 && <span className="pipe-link" style={{ animationDelay: `${i * 0.35}s` }} aria-hidden="true" />}
      </li>
    ))}
  </ol>
);

const TechTags: React.FC<{ tags: string[] }> = ({ tags }) => (
  <div className="flex flex-wrap gap-1.5">
    {tags.map((tech) => (
      <span key={tech} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-slate-300">
        {tech}
      </span>
    ))}
  </div>
);

const Links: React.FC<{ project: Project }> = ({ project }) =>
  project.githubUrl || project.liveDemoUrl ? (
    <div className="mt-6 flex flex-wrap gap-2">
      {project.githubUrl && (
        <Magnetic3D strength={0.16} tilt={5}>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="Open"
            aria-label={`View ${project.name} on GitHub`}
            className="slot-roll-trigger btn btn-ghost !px-3.5 !py-1.5 text-[13px]"
          >
            <Github className="h-3.5 w-3.5" />
            <SlotRollText text="GitHub" accentClassName="text-accent-200" />
          </a>
        </Magnetic3D>
      )}
      {project.liveDemoUrl && (
        <Magnetic3D strength={0.16} tilt={5}>
          <a
            href={project.liveDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="Open"
            aria-label={`View ${project.name} live demo`}
            className="slot-roll-trigger btn btn-ghost !px-3.5 !py-1.5 text-[13px]"
          >
            <SlotRollText text="Live demo" accentClassName="text-accent-200" />
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </Magnetic3D>
      )}
    </div>
  ) : null;

const Index: React.FC<{ i: number; label: string }> = ({ i, label }) => (
  <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
    <span className="text-accent-300">[{String(i + 1).padStart(2, '0')}]</span>
    <ScrambleText text={label} retriggerOnHover durationMs={480} />
  </p>
);

const FeaturedBody: React.FC = () => (
  <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
    <div className="lg:col-span-7">
      <Index i={0} label="Featured architecture" />
      <ExtrudedHeading
        text={featuredProject.name}
        as="h3"
        variant="gold"
        className="mb-2 font-display text-[28px] font-medium leading-[1.05] tracking-display text-slate-100 md:text-[40px]"
      />
      {featuredProject.subtitle && <p className="mb-5 font-mono text-[12px] text-slate-400">{featuredProject.subtitle}</p>}
      <p className="mb-6 text-[15px] leading-relaxed text-slate-300 md:text-[16px]">{featuredProject.description}</p>
      <PipelineFlow steps={featuredProject.pipeline} />
      <TechTags tags={featuredProject.techStack} />
      <Links project={featuredProject} />
    </div>
    <div className="w-full lg:col-span-5">
      <SafeBoundary>
        <Suspense fallback={<div className="panel h-72 w-full rounded-[16px] md:h-80" />}>
          <SemanticCluster3D className="h-72 w-full md:h-80" />
        </Suspense>
      </SafeBoundary>
    </div>
  </div>
);

const Body: React.FC<{ project: Project; i: number }> = ({ project, i }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-10">
    <div className="md:col-span-5">
      <Index i={i} label={project.subtitle?.split('|')[0].trim() || 'Project'} />
      <ExtrudedHeading
        text={project.name}
        as="h3"
        variant="holo"
        className="font-display text-[24px] font-medium leading-[1.08] tracking-tight text-slate-100 md:text-[32px]"
      />
      <Links project={project} />
    </div>
    <div className="md:col-span-7">
      <p className="mb-5 text-[14px] leading-relaxed text-slate-300 md:text-[15px]">{project.description}</p>
      <PipelineFlow steps={project.pipeline} />
      <TechTags tags={project.techStack} />
    </div>
  </div>
);

/** A slab you can tilt: the pointer writes CSS variables directly, no React render per move. */
const tilt = (e: React.PointerEvent<HTMLElement>) => {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--ty', `${((e.clientX - r.left) / r.width - 0.5) * 6}deg`);
  el.style.setProperty('--tx', `${-((e.clientY - r.top) / r.height - 0.5) * 6}deg`);
};
const untilt = (e: React.PointerEvent<HTMLElement>) => {
  e.currentTarget.style.setProperty('--tx', '0deg');
  e.currentTarget.style.setProperty('--ty', '0deg');
};

interface DeckCardProps {
  index: number;
  self: React.RefObject<HTMLDivElement>;
  next?: React.RefObject<HTMLDivElement>;
  deck: boolean;
  children: React.ReactNode;
}

/** Sticks under the nav; as the next card slides over it, it tips back into depth and dims. */
const DeckCard: React.FC<DeckCardProps> = ({ index, self, next, deck, children }) => {
  const top = DECK_TOP + index * DECK_STEP;
  // How far the next card has slid over this one, from real on-screen boxes: target-based useScroll
  // measures sticky elements by layout offsets and read "fully covered" for every card.
  const { scrollY } = useScroll();
  const covered = useTransform(scrollY, () => {
    const el = next?.current;
    if (!el || !deck) return 0;
    const span = window.innerHeight - (top + DECK_STEP);
    return Math.min(1, Math.max(0, (window.innerHeight - el.getBoundingClientRect().top) / span));
  });
  const scale = useTransform(covered, [0, 1], [1, 0.92]);
  const rotateX = useTransform(covered, [0, 1], [0, 4]);
  const dim = useTransform(covered, [0, 1], [0, 0.62]);

  return (
    <motion.div
      ref={self}
      style={deck ? { top, scale, rotateX, transformPerspective: 1400 } : { transformPerspective: 1200 }}
      initial={deck ? undefined : { opacity: 0, y: 40, rotateX: 10 }}
      whileInView={deck ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.8, ease: EASE }}
      className={deck ? 'sticky mb-[14vh] origin-top last:mb-0' : 'mb-5'}
    >
      <div
        onPointerMove={tilt}
        onPointerLeave={untilt}
        style={{
          transform: 'perspective(1100px) rotateX(var(--tx, 0deg)) rotateY(var(--ty, 0deg))',
          transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
        }}
        className="relative"
      >
        {/* Glass over an opaque slab: stacked cards must not show the text of the card beneath. */}
        <span aria-hidden="true" className="absolute inset-0 rounded-[20px] bg-canvas/95" />
        <article data-guide={index === 0 ? 'featured-project' : undefined} className="card spotlight relative rounded-[20px] p-6 md:p-10">
          {children}
          <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-canvas" />
        </article>
      </div>
    </motion.div>
  );
};

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

const Projects: React.FC = () => {
  // The deck needs every card to fit under the nav; below lg the featured card is too tall to stick.
  const wide = useMedia('(min-width: 1024px)');
  const reduced = useReducedMotion();
  const deck = wide && !reduced;
  const refs = useMemo(() => DECK.map(() => React.createRef<HTMLDivElement>()), []);

  return (
    <section id="projects" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5">
        <SectionHeader
          chapter="05"
          eyebrow="Selected work"
          title="Architectures that hold up."
          lead="Production-grade AI architectures, semantic retrieval engines and full-stack systems. Scroll to deal the deck."
        />

        <div className={deck ? 'pb-[10vh]' : ''}>
          {DECK.map((project, i) => (
            <DeckCard key={project.id} index={i} self={refs[i]} next={refs[i + 1]} deck={deck}>
              {i === 0 ? <FeaturedBody /> : <Body project={project} i={i} />}
            </DeckCard>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Magnetic3D strength={0.18} tilt={5}>
            <a href="https://github.com/koshal0304" target="_blank" rel="noopener noreferrer" data-cursor="Open" className="slot-roll-trigger btn btn-ghost">
              <Github className="h-4 w-4" />
              <SlotRollText text="More on GitHub" accentClassName="text-accent-200" />
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Magnetic3D>
        </div>
      </div>
    </section>
  );
};

export default Projects;
