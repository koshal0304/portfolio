import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

interface RoleData {
  title: string;
  company: string;
  location: string;
  duration: string;
  summary: string;
  projects: { name: string; description: string }[];
  tags: string[];
  allTags: string[];
}

const roles: RoleData[] = [
  {
    title: 'AI Engineer',
    company: 'Renan',
    location: 'Bengaluru',
    duration: '2024–Present',
    summary: 'Building production AI features end-to-end. LLM pipelines, RAG systems, SQL agents.',
    projects: [
      { name: 'Clarification Agent (Project Friday)', description: 'LangChain + Azure OpenAI query clarification agent. Session-based caching. Standardized output format for frontend parsing.' },
      { name: 'SQL Validation Module (Project Friday)', description: '4-step pipeline (syntax, semantic, intent, execution) via LLMs, SQLGlot, Metabase. Auto-correction with context-aware retry. PostgreSQL + MongoDB dialects. Destructive query guardrails.' },
      { name: 'RAG Metadata Enrichment', description: 'Column recall 0.48 → 0.81 (69% improvement) via automated LLM-generated column descriptions with business context. No manual labelling.' },
      { name: 'Document Q&A Agent (Project Friday)', description: 'LangGraph agent for PDF/Excel/Word Q&A. Gemini-generated metadata tagging. S3 storage. Python backend + Node.js API.' },
      { name: 'ITR JSON-Excel Automation (TCO Platform, PwC)', description: 'Python + COM Automation (pywin32) + Redis task queue across pre-warmed Excel instances. 2–3x faster than sequential GUI approach.' },
      { name: 'ITR Automation Validation & Stability', description: 'VBA validation macros for structured error reports. Bulk array writes. Instance pooling to prevent COM memory leaks.' },
      { name: 'Email Module (TCO Platform, PwC)', description: 'Node.js + Microsoft Graph API. OAuth Outlook sign-in. Real-time webhooks (no polling). Auto email classification and routing. Full read/compose/send functionality.' },
      { name: 'RBAC System (TCO Platform, PwC)', description: 'Node.js + TypeScript. 5-tier hierarchy: MAKER, CHECKER, TEAM_LEAD, SUPER_TL, PARTNER. JWT RS256, 15-min access tokens, 7-day refresh tokens, Redis permission cache, state machine (DRAFT to COMPLETED), full audit log.' },
      { name: 'Analytics & Reports Module (TCO Platform, PwC)', description: '3 role-scoped dashboards (Super TL, Maker, Checker). ROI Tracker, drill-down, server-side filtering, pagination, Excel export. Component library: StatusBadge, KPICard, FilterPanel, DrillDownPanel.' },
    ],
    tags: ['LangChain', 'Azure OpenAI', 'LangGraph', 'Node.js', 'PostgreSQL', 'Redis'],
    allTags: ['LangChain', 'Azure OpenAI', 'LangGraph', 'Node.js', 'PostgreSQL', 'Redis', 'SQLGlot', 'Metabase', 'Gemini API', 'Python', 'TypeScript', 'pywin32', 'Microsoft Graph API', 'JWT/OAuth2'],
  },
  {
    title: 'Engineering Intern',
    company: 'Ripik.ai',
    location: 'Noida',
    duration: 'Jan 2025 (3 months)',
    summary: 'AWS cost optimization, computer vision model training, and AI image processing pipelines.',
    projects: [
      { name: 'AWS S3 Cost Reduction', description: 'Boto3 + PIL parallelized compression, 150 workers, 10K+ files processed, 60% storage cost reduction. Automated audit logs.' },
      { name: 'ResNet18 Kiln Classifier', description: 'PyTorch fine-tune, 3 classes (dusty/healthy/hot), 98% validation accuracy. Confusion-matrix tooling shipped to production.' },
      { name: 'Gemini API Image Pipeline', description: '150-thread concurrency, 10% JPEG compression, structured JSON audit reports, 80% manual review time reduction, 100+ images/day.' },
    ],
    tags: ['PyTorch', 'ResNet18', 'Boto3', 'PIL', 'Gemini API', 'AWS S3'],
    allTags: ['PyTorch', 'ResNet18', 'Boto3', 'PIL', 'Gemini API', 'AWS S3'],
  },
];

const Experience: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const lineScaleY = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <section id="experience" ref={sectionRef} className="bg-background/70 py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-base mb-4">Career Timeline</h2>
          <p className="text-text-muted font-body">End-to-end ownership, production deployments</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px">
            <div className="absolute inset-0 bg-gradient-to-b from-primary to-secondary opacity-20" />
            <motion.div
              style={{ scaleY: lineScaleY, transformOrigin: 'top' }}
              className="absolute inset-0 bg-gradient-to-b from-primary to-secondary"
            />
          </div>

          {/* Role Cards */}
          {roles.map((role, idx) => {
            const isExpanded = expandedCard === idx;
            const isLeft = idx % 2 === 0;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className={`relative mb-16 pl-16 md:pl-0 ${
                  isLeft ? 'md:pr-[calc(50%+2rem)] md:text-right' : 'md:pl-[calc(50%+2rem)]'
                }`}
              >
                {/* Timeline node */}
                <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 z-10">
                  <div className="w-5 h-5 rounded-full bg-primary glow-cyan relative">
                    <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
                  </div>
                </div>

                {/* Card */}
                <div className="bg-surface border border-surface-elevated rounded-xl p-6 md:p-8 hover:border-primary/20 transition-colors duration-300">
                  <div className={`flex flex-col ${isLeft ? 'md:items-end' : 'md:items-start'} gap-2 mb-4`}>
                    <h3 className="font-display text-xl font-bold text-text-base">{role.company}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-text-muted font-mono text-sm">{role.title}</span>
                      <span className="text-text-muted font-mono text-sm">· {role.location}</span>
                    </div>
                    <span className="inline-block border border-primary/40 text-primary font-mono text-xs px-2 py-1 rounded-full">
                      {role.duration}
                    </span>
                  </div>

                  <p className="text-text-muted font-body text-sm mb-4">{role.summary}</p>

                  {/* Tags */}
                  <div className={`flex flex-wrap gap-2 mb-4 ${isLeft ? 'md:justify-end' : ''}`}>
                    {(isExpanded ? role.allTags : role.tags).map((tag) => (
                      <span key={tag} className="font-mono text-xs border border-primary/30 text-primary/80 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : idx)}
                    className="text-primary font-mono text-xs hover:underline mb-4"
                  >
                    {isExpanded ? 'Collapse ↑' : `Show All ${role.projects.length} Projects ↓`}
                  </button>

                  {/* Expanded projects */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 pt-4 border-t border-surface-elevated">
                          {role.projects.map((project, pIdx) => (
                            <div key={pIdx} className={`flex gap-3 ${isLeft ? 'md:flex-row-reverse md:text-right' : ''}`}>
                              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <div>
                                <span className="text-primary font-semibold text-sm">{project.name}</span>
                                <p className="text-text-muted text-sm">{project.description}</p>
                              </div>
                            </div>
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
