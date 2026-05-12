import React from 'react';
import { motion } from 'framer-motion';

/**
 * Aurora-animated section divider — a glowing, animated line
 * that separates sections with a premium cinematic feel.
 */
const SectionDivider: React.FC = () => {
  return (
    <div className="relative py-2 overflow-hidden">
      {/* Animated aurora line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="aurora-divider mx-auto"
        style={{ maxWidth: '80%', transformOrigin: 'center' }}
      />

      {/* Center glow dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        style={{
          background: 'var(--aurora-1)',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.2)',
        }}
      />
    </div>
  );
};

export default SectionDivider;
