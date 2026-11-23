import React, { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

const PHRASES = ["Let's build something real", 'Open to AI engineering roles', 'Bengaluru, India'];

/**
 * A 3D velocity-reactive kinetic ribbon: drifts on its own, surges & reverses with scroll,
 * and leans dramatically in 3D perspective (skewX + rotateX) proportional to scroll momentum.
 */
const VelocityMarquee: React.FC<{ speed?: number }> = ({ speed = 1.6 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 46, stiffness: 380 });
  const boost = useTransform(velocity, [-1500, 0, 1500], [-5, 0, 5], { clamp: false });
  const skewX = useTransform(velocity, [-2200, 0, 2200], [10, 0, -10]);
  const rotateX = useTransform(velocity, [-2200, 0, 2200], [-14, 0, 14]);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(-1);

  useAnimationFrame((_, delta) => {
    if (reduce || !inView) return;
    const b = boost.get();
    if (b > 0.05) direction.current = -1;
    else if (b < -0.05) direction.current = 1;
    baseX.set(baseX.get() + direction.current * speed * (delta / 1000) * (1 + Math.abs(b)));
  });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-white/10 py-7 [perspective:1000px] md:py-9"
    >
      <motion.div
        style={reduce ? undefined : { x, skewX, rotateX, transformStyle: 'preserve-3d' }}
        className="flex w-max whitespace-nowrap will-change-transform"
      >
        {[0, 1].map((copy) => (
          <span key={copy} className="flex shrink-0 items-center">
            {PHRASES.map((p, i) => (
              <span key={p} className="flex items-center">
                <span
                  className={`px-6 font-display text-[56px] font-medium leading-none tracking-display md:px-10 md:text-[104px] ${
                    i % 2
                      ? 'text-transparent [-webkit-text-stroke:1px_rgba(253,219,180,0.52)]'
                      : 'text-shader-prism text-extrude-gold'
                  }`}
                >
                  {p}
                </span>
                <span className="text-[28px] text-accent-400 drop-shadow-[0_0_14px_rgba(244,182,120,0.75)] md:text-[44px]">
                  ✦
                </span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default VelocityMarquee;
