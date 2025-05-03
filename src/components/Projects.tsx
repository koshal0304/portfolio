import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, ArrowRight, Star, Github } from 'lucide-react';
import MovingStarsBackground from './MovingStarsBackground';

interface ProjectProps {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl: string;
  codeUrl?: string;
}

const projects: ProjectProps[] = [
  {
    title: 'Personal Knowledge Assistant',
    description: 'AI-powered knowledge management system that helps users organize, retrieve, and generate insights from their personal documents and notes.',
    image: 'https://images.pexels.com/photos/7567434/pexels-photo-7567434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    technologies: ['Python', 'Streamlit', 'LangChain', 'OpenAI', 'Vector DB'],
    liveUrl: 'https://personal-knowledge-assistant-g.streamlit.app/',
    codeUrl: 'https://github.com/koshal0304/personal-knowledge-assistant'
  },
  {
    title: 'Webcam YOLO Object Detector',
    description: 'Real-time object detection application using YOLO algorithm to identify objects through webcam feed with high accuracy and performance.',
    image: 'https://images.pexels.com/photos/5483077/pexels-photo-5483077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    technologies: ['Python', 'Streamlit', 'OpenCV', 'YOLO', 'Computer Vision'],
    liveUrl: 'https://webcamyolodetector-l.streamlit.app/',
    codeUrl: 'https://github.com/koshal0304/webcamyolodetector'
  },
  {
    title: 'Talent Scout AI Hiring Assistant',
    description: 'AI-powered application that helps recruiters identify potential candidates based on resume analysis and job descriptions, streamlining the hiring process.',
    image: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    technologies: ['Python', 'Streamlit', 'NLP', 'Machine Learning', 'Document Processing'],
    liveUrl: 'https://talentscoutaihiringassistant.streamlit.app/',
    codeUrl: 'https://github.com/koshal0304/talent-scout-ai'
  }
];

const ProjectCard: React.FC<ProjectProps> = ({ title, description, image, technologies, liveUrl, codeUrl }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-2xl bg-gray-900/60 shadow-xl transition-all duration-500 ease-out opacity-0 translate-y-10 backdrop-blur-sm border border-blue-900/30 hover:shadow-blue-500/20"
      style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Featured badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-blue-500/50"
             style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}>
          <Star size={12} className="animate-pulse" />
          <span>Featured</span>
        </div>
      </div>

      {/* Image container with overlay */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${isHovered ? 'scale-110 blur-sm' : 'scale-100'}`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-blue-900/90 via-black/70 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-95' : 'opacity-80'}`}></div>

        {/* Overlay content that appears on hover */}
        <div className={`absolute inset-0 flex flex-col justify-center items-center p-6 transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white text-center mb-6 max-w-xs">{description}</p>
          <div className="flex gap-4">
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium transition-all duration-300 hover:bg-blue-700 hover:scale-105 flex items-center gap-1 border border-blue-500/50"
              style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
            >
              <ExternalLink size={16} /> <span>Live Demo</span>
            </a>
            {codeUrl && (
              <a
                href={codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-900/80 text-white rounded-full font-medium transition-all duration-300 hover:bg-purple-800 hover:scale-105 flex items-center gap-1 border border-purple-500/50"
                style={{ boxShadow: '0 0 10px rgba(124, 58, 237, 0.3)' }}
              >
                <Github size={16} /> <span>View Code</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6 relative -mt-20 bg-gradient-to-t from-gray-900/95 via-gray-900/95 to-transparent backdrop-blur-sm">
        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300"
            style={{ textShadow: '0 0 8px rgba(59, 130, 246, 0.3)' }}>{title}</h3>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-6 stagger-fade-in">
          {technologies.map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs font-medium rounded-full bg-blue-900/40 text-blue-300 border border-blue-800/50 transition-all duration-300 hover:bg-blue-800/60"
              style={{ boxShadow: '0 0 8px rgba(59, 130, 246, 0.1)' }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex justify-between items-center">
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 font-medium transition-all duration-300 hover:text-blue-300 hover:translate-x-1"
            aria-label={`View ${title} live demo`}
            style={{ textShadow: '0 0 8px rgba(59, 130, 246, 0.2)' }}
          >
            Explore Project <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>

          {/* Animated border line */}
          <div className="h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-1/3 transition-all duration-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100');
          entry.target.classList.remove('opacity-0');
          sectionObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const titleObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          titleObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }

    if (titleRef.current) {
      titleObserver.observe(titleRef.current);
    }

    return () => {
      if (sectionRef.current) {
        sectionObserver.unobserve(sectionRef.current);
      }
      if (titleRef.current) {
        titleObserver.unobserve(titleRef.current);
      }
    };
  }, []);

  return (
    <section id="projects" className="py-24 bg-black relative overflow-hidden">
      {/* Moving stars background */}
      <MovingStarsBackground starCount={120} />

      {/* Space-themed decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-900/10 to-transparent"></div>
      <div className="absolute -top-10 -right-10 w-60 h-60 bg-blue-500/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-indigo-500/5 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div
        ref={sectionRef}
        className="container mx-auto px-4 opacity-0 transition-opacity duration-1000 relative z-10"
      >
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="px-4 py-1 bg-blue-900/30 text-blue-300 text-sm font-medium rounded-full backdrop-blur-sm border border-blue-800/30">
              My Work
            </span>
          </div>
          <h2
            ref={titleRef}
            className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"
            style={{ textShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}
          >
            Featured Projects
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8 rounded-full animate-pulse-slow"></div>
          <p className="max-w-2xl mx-auto text-blue-200 text-lg">
            A showcase of my recent work, featuring web applications and data science projects
            built with cutting-edge technologies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>

        {/* View more projects button */}
        <div className="text-center mt-16">
          <a
            href="https://github.com/koshal0304"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-blue-500 text-blue-300 rounded-full font-medium transition-all duration-300 hover:bg-blue-600/30 hover:text-white hover:border-blue-400"
            style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)' }}
          >
            <Github size={18} />
            <span>View More Projects on GitHub</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Projects;
