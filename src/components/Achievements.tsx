import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface MetricData {
  value: number;
  suffix: string;
  label: string;
}

const metrics: MetricData[] = [
  { value: 69, suffix: '%', label: 'RAG Recall Improvement (0.48 → 0.81)' },
  { value: 98, suffix: '%', label: 'Model Validation Accuracy (ResNet18)' },
  { value: 60, suffix: '%', label: 'AWS S3 Storage Cost Reduction' },
  { value: 80, suffix: '%', label: 'Manual Review Time Eliminated' },
];

// Custom easeOut function
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface CountUpProps {
  target: number;
  suffix: string;
  shouldStart: boolean;
}

const CountUp: React.FC<CountUpProps> = ({ target, suffix, shouldStart }) => {
  const [current, setCurrent] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const duration = 1800;

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
    <span>
      {current}
      {suffix}
    </span>
  );
};

const Achievements: React.FC = () => {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  return (
    <section className="bg-surface/70 py-24 relative overflow-hidden">
      {/* Subtle background particles via CSS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary animate-float"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.15,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 4 + 3}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-base mb-4">Impact by the Numbers</h2>
          <p className="text-text-muted font-body">Measurable outcomes shipped to production</p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-6xl md:text-7xl lg:text-8xl font-bold text-primary mb-3">
                <CountUp target={metric.value} suffix={metric.suffix} shouldStart={inView} />
              </div>
              <p className="font-body text-sm text-text-muted max-w-[160px] mx-auto">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
