import React from 'react';
import { motion } from 'framer-motion';

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

const Education: React.FC = () => {
  return (
    <section id="education" className="bg-surface/70 py-24 relative overflow-hidden">
      {/* Background aurora orb */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="float-orb"
          style={{
            width: '350px',
            height: '350px',
            background: 'var(--aurora-2)',
            top: '25%',
            right: '-8%',
            opacity: 0.05,
            animationDelay: '-5s',
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-100 mb-4 tracking-tight">
            Education & Certifications
          </h2>
          <p className="text-slate-400 font-body text-base">Academic background & specialized technical training</p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="aurora-divider mx-auto mt-6"
            style={{ maxWidth: '100px', transformOrigin: 'center' }}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Degree Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="glass-liquid holo-card rounded-2xl p-8 relative flex flex-col justify-between border border-white/[0.08] hover:border-white/20 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span
                  className="font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-sky-400/30 text-sky-300 bg-sky-950/30 shadow-[0_0_10px_rgba(56,189,248,0.1)]"
                >
                  Degree
                </span>
                <span className="font-mono text-xs text-slate-400">2018 – 2022</span>
              </div>

              <h3 className="font-display text-2xl font-bold text-slate-100 mb-2">
                B.Tech in Automation & Robotics Engineering
              </h3>
              <p className="font-mono text-sm text-sky-300/90 mb-4">
                Gulzar Group of Institutes, Ludhiana
              </p>
              <p className="text-slate-300 font-body text-sm leading-relaxed mb-6">
                Rigorous grounding in control systems, robotics engineering, embedded hardware,
                computational algorithms, and autonomous intelligent systems.
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex flex-wrap gap-2">
              {['Robotics Engineering', 'Automation Systems', 'Control Theory', 'Computational Logic'].map(
                (skill) => (
                  <span
                    key={skill}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-full text-slate-300 bg-white/[0.03] border border-white/[0.08]"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </motion.div>

          {/* Certifications Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="glass-liquid holo-card rounded-2xl p-8 relative flex flex-col justify-between border border-white/[0.08] hover:border-white/20 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span
                  className="font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-400/30 text-indigo-300 bg-indigo-950/30 shadow-[0_0_10px_rgba(129,140,248,0.1)]"
                >
                  Verified Credentials
                </span>
                <span className="font-mono text-xs text-slate-400">Industry Certifications</span>
              </div>

              <div className="space-y-6">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-baseline justify-between mb-1">
                      <h4 className="font-display text-lg font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                        {cert.title}
                      </h4>
                      <span className="font-mono text-xs text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-950/40 border border-indigo-400/30">
                        {cert.issuer}
                      </span>
                    </div>
                    <p className="text-slate-300 font-body text-xs leading-relaxed">
                      {cert.focus}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08] mt-6 flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)] animate-pulse" />
              Continuous learning & production AI research
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Education;
