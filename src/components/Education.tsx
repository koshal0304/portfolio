import React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import SectionHeader from './SectionHeader';
import BlueprintArm from './education/BlueprintArm';
import { ExtrudedHeading, ScrambleText } from './KineticText';

interface Certification {
  title: string;
  issuer: string;
  focus: string;
}

const certifications: Certification[] = [
  {
    title: 'Machine Learning',
    issuer: 'Coding Ninjas',
    focus: 'Classical ML algorithms, deep learning fundamentals, model optimization & evaluation',
  },
  {
    title: 'Data Scientist',
    issuer: 'AlmaBetter',
    focus: 'Data science pipelines, advanced predictive modeling, statistical inference & feature engineering',
  },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Cards swing in from either side of the schematic, like plates being slid onto a drafting table.
const swing = (side: 1 | -1) => ({
  initial: { opacity: 0, x: 48 * side, rotateY: -14 * side },
  whileInView: { opacity: 1, x: 0, rotateY: 0 },
  viewport: { once: true, margin: '-12% 0px' },
  transition: { duration: 1, ease: EASE },
});

// Faint drafting grid (major + minor lines) that fades out toward the edges.
const BLUEPRINT: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(165,180,252,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(165,180,252,0.075) 1px, transparent 1px), linear-gradient(rgba(165,180,252,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(165,180,252,0.035) 1px, transparent 1px)',
  backgroundSize: '120px 120px, 120px 120px, 24px 24px, 24px 24px',
  maskImage: 'radial-gradient(ellipse 70% 60% at 50% 55%, #000 35%, transparent 80%)',
  WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 55%, #000 35%, transparent 80%)',
};

const Education: React.FC = () => {
  // The schematic leans a few degrees toward the cursor.
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const tiltX = useSpring(rx, { stiffness: 120, damping: 20 });
  const tiltY = useSpring(ry, { stiffness: 120, damping: 20 });
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 16);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  };
  const onPointerLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <section id="education" className="relative py-24 md:py-32" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={BLUEPRINT} />
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHeader
          chapter="07"
          eyebrow="Foundations"
          title="Robotics first, then AI."
          lead="An engineering degree in automation and robotics, sharpened with focused ML and data-science training."
        />

        <div
          data-guide="education"
          className="grid grid-cols-1 items-center gap-6 [perspective:1400px] lg:grid-cols-[1fr_minmax(220px,280px)_1fr] lg:gap-8"
        >
          <div className="[perspective:900px] lg:order-2">
            <BlueprintArm tiltX={tiltX} tiltY={tiltY} />
          </div>

          <motion.article {...swing(-1)} className="card spotlight flex flex-col justify-between rounded-[20px] p-7 md:p-8 lg:order-1">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-300">
                  <ScrambleText text="Degree" retriggerOnHover durationMs={460} />
                </span>
                <span className="font-mono text-[11px] text-slate-400">2018 – 2022</span>
              </div>
              <ExtrudedHeading
                text="B.Tech in Automation & Robotics Engineering"
                as="h3"
                variant="holo"
                className="mb-2 font-display text-[24px] font-medium leading-tight tracking-tight text-slate-100 md:text-[28px]"
              />
              <p className="mb-4 text-[14px] text-slate-300">Gulzar Group of Institutes, Ludhiana</p>
              <p className="mb-6 text-[15px] leading-relaxed text-slate-300">
                Rigorous grounding in control systems, robotics engineering, embedded hardware, computational algorithms,
                and autonomous intelligent systems.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 border-t border-white/10 pt-5">
              {['Robotics Engineering', 'Automation Systems', 'Control Theory', 'Computational Logic'].map((skill) => (
                <span key={skill} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-slate-300 transition-colors hover:border-indigo-300/40 hover:text-slate-100">
                  {skill}
                </span>
              ))}
            </div>
          </motion.article>

          <motion.article {...swing(1)} className="card spotlight flex flex-col justify-between rounded-[20px] p-7 md:p-8 lg:order-3">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-300">
                  <ScrambleText text="Certifications" retriggerOnHover durationMs={520} />
                </span>
                <span className="font-mono text-[11px] text-slate-400">Industry programs</span>
              </div>
              <ul className="space-y-6">
                {certifications.map((cert) => (
                  <li key={cert.title}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <ExtrudedHeading
                        text={cert.title}
                        as="h4"
                        variant="holo"
                        className="font-display text-[20px] font-medium tracking-tight text-slate-100"
                      />
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[11px] text-slate-300">
                        {cert.issuer}
                      </span>
                    </div>
                    <p className="text-[14px] leading-relaxed text-slate-300">{cert.focus}</p>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5 font-mono text-[11px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400" aria-hidden="true" />
              Continuous learning & production AI research
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  );
};

export default Education;
