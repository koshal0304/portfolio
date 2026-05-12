import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  featured?: boolean;
}

const featuredProject: Project = {
  id: 'object-detection',
  name: 'AI-Powered Real-Time Object Detection & Monitoring',
  description:
    'Phone-usage detection app. RTSP video stream via OpenCV. Concurrent GPU inference via ThreadPoolExecutor with tenacity retries. Live Matplotlib/Seaborn dashboard. Full pipeline: stream capture → structured output → real-time display.',
  techStack: ['Streamlit', 'Google Gemini API', 'OpenCV', 'PyTorch', 'ThreadPoolExecutor'],
  featured: true,
};

const additionalProjects: Project[] = [
  {
    id: 'knowledge-assistant',
    name: 'Personal Knowledge Assistant',
    description:
      'AI-powered knowledge management system that helps users organize, retrieve, and generate insights from their personal documents and notes.',
    techStack: ['Python', 'Streamlit', 'LangChain', 'OpenAI', 'Vector DB'],
    githubUrl: 'https://github.com/koshal0304/personal-knowledge-assistant',
    liveDemoUrl: 'https://personal-knowledge-assistant-g.streamlit.app/',
  },
  {
    id: 'yolo-detector',
    name: 'Webcam YOLO Object Detector',
    description:
      'Real-time object detection application using YOLO algorithm to identify objects through webcam feed with high accuracy and performance.',
    techStack: ['Python', 'Streamlit', 'OpenCV', 'YOLO', 'Computer Vision'],
    githubUrl: 'https://github.com/koshal0304/webcamyolodetector',
    liveDemoUrl: 'https://webcamyolodetector-l.streamlit.app/',
  },
  {
    id: 'talent-scout',
    name: 'Talent Scout AI Hiring Assistant',
    description:
      'AI-powered application that helps recruiters identify potential candidates based on resume analysis and job descriptions, streamlining the hiring process.',
    techStack: ['Python', 'Streamlit', 'NLP', 'Machine Learning', 'Document Processing'],
    githubUrl: 'https://github.com/koshal0304/talent-scout-ai',
    liveDemoUrl: 'https://talentscoutaihiringassistant.streamlit.app/',
  },
];

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

// ─── Project Card with 3D Tilt ────────────────────────────────────
interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt((prev) => ({
      x: prev.x + (y * -8 - prev.x) * 0.1,
      y: prev.y + (x * 8 - prev.y) * 0.1,
    }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-surface border border-surface-elevated rounded-xl p-6 cursor-default transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 500ms ease, border-color 300ms ease, box-shadow 300ms ease',
      }}
    >
      <h3 className="font-display text-xl font-bold text-text-base mb-3">{project.name}</h3>
      <p className="text-text-muted font-body text-sm leading-relaxed mb-5 line-clamp-3">{project.description}</p>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="font-mono text-xs border border-primary/30 text-primary px-2 py-1 rounded-full"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex gap-3">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-surface-elevated text-text-muted hover:text-primary hover:border-primary transition-all px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1"
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
            className="border border-surface-elevated text-text-muted hover:text-primary hover:border-primary transition-all px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1"
            aria-label={`View ${project.name} live demo`}
          >
            <ExternalLinkIcon />
            Live Demo
          </a>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main Projects Component ──────────────────────────────────────
const Projects: React.FC = () => {
  const [featuredTilt, setFeaturedTilt] = useState({ x: 0, y: 0 });

  const handleFeaturedMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setFeaturedTilt({ x: y * -8, y: x * 8 });
  }, []);

  const handleFeaturedMouseLeave = useCallback(() => {
    setFeaturedTilt({ x: 0, y: 0 });
  }, []);

  return (
    <section id="projects" className="bg-background/70 py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-base mb-4">Projects</h2>
        </motion.div>

        {/* ═══ Featured project card (UNCHANGED) ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onMouseMove={handleFeaturedMouseMove}
          onMouseLeave={handleFeaturedMouseLeave}
          className="bg-surface-elevated border border-primary/20 rounded-2xl p-8 md:p-10 relative overflow-hidden cursor-default mb-10"
          style={{
            transform: `perspective(1000px) rotateX(${featuredTilt.x}deg) rotateY(${featuredTilt.y}deg)`,
            transition: 'transform 400ms ease',
          }}
        >
          {/* Top gradient border */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary" />

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Content */}
            <div>
              <h3 className="font-display text-2xl font-bold text-text-base mb-4">{featuredProject.name}</h3>
              <p className="text-text-muted font-body text-sm leading-relaxed mb-6">{featuredProject.description}</p>
              <div className="flex flex-wrap gap-2">
                {featuredProject.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-xs border border-primary/30 text-primary px-2 py-1 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Decorative data pipeline grid */}
            <div className="hidden md:grid grid-cols-6 grid-rows-4 gap-2" aria-hidden="true">
              {Array.from({ length: 24 }).map((_, i) => {
                const isActive = [2, 5, 8, 9, 14, 17, 20, 23].includes(i);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className={`aspect-square rounded-md ${
                      isActive ? 'bg-primary/20 glow-cyan' : 'bg-surface border border-surface-elevated'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ═══ Recovered projects bento grid ═══ */}
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
            className="inline-flex items-center gap-2 border border-primary/30 text-text-muted hover:text-primary hover:border-primary transition-all px-6 py-3 rounded-lg font-mono text-sm"
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
