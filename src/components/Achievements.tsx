import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface MetricData {
  value: number;
  suffix: string;
  label: string;
  color: string;
}

const metrics: MetricData[] = [
  { value: 69, suffix: '%', label: 'RAG Recall Improvement (0.48 → 0.81)', color: 'var(--aurora-1)' },
  { value: 98, suffix: '%', label: 'Model Validation Accuracy (ResNet18)', color: 'var(--aurora-2)' },
  { value: 60, suffix: '%', label: 'AWS S3 Storage Cost Reduction', color: 'var(--aurora-3)' },
  { value: 80, suffix: '%', label: 'Manual Review Time Eliminated', color: 'var(--aurora-1)' },
];

// Custom easeOut function
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface CountUpProps {
  target: number;
  suffix: string;
  shouldStart: boolean;
  color: string;
}

const CountUp: React.FC<CountUpProps> = ({ target, suffix, shouldStart, color }) => {
  const [current, setCurrent] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const duration = 2200; // Slower, more dramatic

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    },
    [target]
  );

  useEffect(() => {
    if (shouldStart) {
      rafRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [shouldStart, animate]);

  return (
    <span
      style={{
        color,
        textShadow: `0 0 40px ${color}40, 0 0 80px ${color}20`,
      }}
    >
      {current}
      {suffix}
    </span>
  );
};

const Achievements: React.FC = () => {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  return (
    <section className="bg-surface/70 py-24 relative overflow-hidden">
      {/* Background aurora orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="float-orb"
          style={{
            width: '300px',
            height: '300px',
            background: 'var(--aurora-1)',
            top: '20%',
            left: '10%',
            opacity: 0.05,
            animationDelay: '-4s',
          }}
        />
        <div
          className="float-orb"
          style={{
            width: '250px',
            height: '250px',
            background: 'var(--aurora-2)',
            bottom: '10%',
            right: '15%',
            opacity: 0.04,
            animationDelay: '-9s',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-base mb-4">
            Impact by the Numbers
          </h2>
          <p className="text-text-muted font-body">Measurable outcomes shipped to production</p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="aurora-divider mx-auto mt-6"
            style={{ maxWidth: '100px', transformOrigin: 'center' }}
          />
        </motion.div>

        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center glass-liquid rounded-xl p-6"
            >
              <div className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-3">
                <CountUp
                  target={metric.value}
                  suffix={metric.suffix}
                  shouldStart={inView}
                  color={metric.color}
                />
              </div>
              {/* Neon underline per metric */}
              <div
                className="w-8 h-[2px] mx-auto mb-3 rounded-full"
                style={{
                  background: metric.color,
                  boxShadow: `0 0 10px ${metric.color}50`,
                }}
              />
              <p className="font-body text-sm text-text-muted max-w-[160px] mx-auto">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
