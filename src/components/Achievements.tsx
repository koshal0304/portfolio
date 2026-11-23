import React from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { EASE } from '../lib/kineticPresets';

interface MetricData {
  value: number;
  label: string;
}

const metrics: MetricData[] = [
  { value: 69, label: 'RAG recall improvement (0.48 → 0.81)' },
  { value: 98, label: 'Validation accuracy, fine-tuned ResNet18' },
  { value: 60, label: 'AWS S3 storage cost removed' },
  { value: 80, label: 'Manual image-review time eliminated' },
];

const STRIP = '01234567890123456789'.split(''); // two turns, so every digit visibly spins before it lands

// Hairlines between cells (not a gap-colour grid: a flipping cell would expose it).
const DIVIDER = ['', 'border-l', 'border-t md:border-t-0 md:border-l', 'border-t border-l md:border-t-0'];

/** Each digit is a 0–9 strip that rolls up into place like a mechanical counter. */
const Odometer: React.FC<{ value: number; run: boolean; delay: number }> = ({ value, run, delay }) => (
  <span className="inline-flex" aria-hidden="true">
    {String(value)
      .split('')
      .map((d, i) => (
        <span key={i} className="inline-block h-[1em] overflow-hidden">
          <motion.span
            className="flex flex-col"
            initial={{ y: '0%' }}
            animate={run ? { y: `${-(10 + Number(d)) * 5}%` } : undefined}
            transition={{ duration: 1.9 + i * 0.35, delay: delay + i * 0.12, ease: EASE }}
          >
            {STRIP.map((n, k) => (
              <span key={k} className="text-shader-gold block h-[1em]">
                {n}
              </span>
            ))}
          </motion.span>
        </span>
      ))}
  </span>
);

const slabTilt = (e: React.PointerEvent<HTMLDivElement>) => {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--my-tilt', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
  el.style.setProperty('--mx-tilt', `${-((e.clientY - r.top) / r.height - 0.5) * 8}deg`);
};

const slabUntilt = (e: React.PointerEvent<HTMLDivElement>) => {
  e.currentTarget.style.setProperty('--mx-tilt', '0deg');
  e.currentTarget.style.setProperty('--my-tilt', '0deg');
};

const Achievements: React.FC = () => {
  const grid = React.useRef<HTMLDListElement>(null);
  const run = useInView(grid, { once: true, margin: '-15% 0px' });
  const reduce = useReducedMotion();

  return (
    <section id="achievements" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1100px] px-5">
        <SectionHeader
          chapter="06"
          eyebrow="Impact"
          title="Measured in production."
          lead="Every number here came from a system real users depend on."
        />

        <dl
          ref={grid}
          data-guide="metrics"
          className="grid grid-cols-2 overflow-hidden rounded-[20px] border border-white/15 shadow-[0_30px_70px_-34px_rgba(6,8,16,0.85)] [perspective:1200px] md:grid-cols-4"
        >
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={reduce ? undefined : { rotateX: -80, opacity: 0 }}
              animate={run || reduce ? { rotateX: 0, opacity: 1 } : undefined}
              transition={{ duration: 1.1, delay: i * 0.14, ease: EASE }}
              style={{ transformOrigin: '50% 0%' }}
              className={`border-white/10 bg-canvas/85 ${DIVIDER[i]}`}
            >
              <div
                onPointerMove={reduce ? undefined : slabTilt}
                onPointerLeave={slabUntilt}
                style={
                  reduce
                    ? undefined
                    : {
                        transform: 'perspective(800px) rotateX(var(--mx-tilt, 0deg)) rotateY(var(--my-tilt, 0deg))',
                        transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
                      }
                }
                className="spotlight flex h-full flex-col-reverse justify-end gap-5 p-6 md:p-8"
              >
                <motion.dt
                  initial={reduce ? undefined : { opacity: 0, y: 8 }}
                  animate={run || reduce ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.65, delay: 0.55 + i * 0.12, ease: EASE }}
                  className="text-[13px] leading-snug text-slate-300"
                >
                  {metric.label}
                </motion.dt>
                <dd>
                  <span className="text-extrude-gold flex items-baseline font-display text-[44px] font-medium leading-none tracking-display tabular-nums md:text-[64px]">
                    <Odometer value={metric.value} run={run} delay={0.35 + i * 0.14} />
                    <span aria-hidden="true" className="text-shader-gold ml-0.5 text-[0.72em]">
                      %
                    </span>
                    <span className="sr-only">{metric.value}%</span>
                  </span>
                  {/* A light bar fills to the metric, its glowing head riding the end. */}
                  <span aria-hidden="true" className="relative mt-5 block h-[2px] rounded-full bg-white/10">
                    <span className="absolute inset-0 overflow-hidden rounded-full">
                      <motion.span
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-300/10 via-accent-300 to-white"
                        initial={{ x: '-100%' }}
                        animate={run ? { x: `${metric.value - 100}%` } : undefined}
                        transition={{ duration: 2, delay: 0.45 + i * 0.14, ease: EASE }}
                      />
                    </span>
                    <motion.span
                      className="absolute inset-0"
                      initial={{ x: '-100%' }}
                      animate={run ? { x: `${metric.value - 100}%` } : undefined}
                      transition={{ duration: 2, delay: 0.45 + i * 0.14, ease: EASE }}
                    >
                      <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent-100 shadow-[0_0_12px_3px_rgba(244,182,120,0.85)]" />
                    </motion.span>
                  </span>
                </dd>
              </div>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default Achievements;
