import React, { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, Briefcase, Award, ChevronRight, Code, Database } from 'lucide-react';
import MovingStarsBackground from './MovingStarsBackground';

interface ExperienceItem {
  title: string;
  company: string;
  location: string;
  duration: string;
  description: string[];
  skills?: string[];
}

const experiences: ExperienceItem[] = [
  {
    title: "Engineering Intern",
    company: "Ripik.ai",
    location: "Noida",
    duration: "Present",
    description: [
      "AI-Powered Detection: Engineered a Python system using Google Gemini API and multithreading to automate analysis of 100+ images/day, compressing files (10% JPEG quality) and parallelizing uploads (150 threads) for 80% faster manual review. Structured JSON outputs with AI explanations enabled rapid auditing.",
      "Cost-Optimized Cloud Storage: Designed an AWS S3 image compression pipeline with Boto3 and PIL, reducing storage costs by 60% via metadata-preserving compression (40% quality) and parallel processing (150 workers). Tracked 10K+ files via automated logs.",
      "Container Health Monitoring System: Developed and implemented an AWS Lambda monitoring solution that checks critical container health status and automatically sends alerts through Slack and SNS channels, improving system reliability and reducing downtime through proactive monitoring",
      "Automated data pipelines for preprocessing and transforming raw data, reducing manual effort by 30% and improving workflow efficiency."
    ],
    skills: ["Python", "Computer Vision", "Streamlit", "PyTorch", "Git"]
  }
];

const Experience: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [animatedItems, setAnimatedItems] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100');
          entry.target.classList.remove('opacity-0');
          observer.unobserve(entry.target);

          // Auto-select the first experience when section becomes visible
          setActiveIndex(0);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Handle item animation when an experience becomes active
  useEffect(() => {
    if (activeIndex !== null) {
      // Reset animations for all items
      setAnimatedItems({});

      // Animate items of the active experience with a delay
      const timer = setTimeout(() => {
        setAnimatedItems({ [activeIndex]: true });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  return (
    <section id="experience" className="py-24 bg-black relative overflow-hidden">
      {/* Moving stars background */}
      <MovingStarsBackground starCount={100} />

      {/* Space-themed decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/5 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-purple-500/5 rounded-tr-full"></div>

      {/* Floating icons with space theme */}
      <div className="absolute top-1/4 right-1/4 opacity-20">
        <Code size={40} className="text-blue-400 animate-float" style={{ animationDelay: '0.5s', filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }} />
      </div>
      <div className="absolute bottom-1/3 left-1/5 opacity-20">
        <Database size={32} className="text-purple-400 animate-float" style={{ animationDelay: '1.5s', filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.5))' }} />
      </div>

      {/* Additional space elements */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div
        ref={sectionRef}
        className="container mx-auto px-4 opacity-0 transition-opacity duration-1000 relative z-10"
      >
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="px-4 py-1 bg-blue-900/30 text-blue-300 text-sm font-medium rounded-full backdrop-blur-sm border border-blue-800/30">
              Career
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"
              style={{ textShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}>
            Professional Experience
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8 rounded-full animate-pulse-slow"></div>
          <p className="max-w-2xl mx-auto text-blue-200 text-lg">
            My professional journey and key achievements in the tech industry
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className={`relative pl-10 mb-16 ${
                index !== experiences.length - 1 ? 'before:absolute before:left-3 before:top-6 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-blue-600 before:to-purple-600 before:opacity-70' : ''
              }`}
            >
              {/* Timeline node with pulse effect */}
              <div
                className="absolute -left-1 top-0 z-10"
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110"
                       style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}>
                    <Briefcase size={16} className="text-white" />
                  </div>
                  {activeIndex === index && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-75"></div>
                  )}
                </div>
              </div>

              {/* Experience card with enhanced styling */}
              <div
                className={`bg-gray-900/60 rounded-xl shadow-xl p-8 transform transition-all duration-500 backdrop-blur-sm border border-blue-900/30 ${
                  activeIndex === index ? 'translate-x-2 scale-[1.02] shadow-blue-500/20' : 'hover:shadow-blue-500/10'
                }`}
                style={{
                  boxShadow: activeIndex === index ? '0 0 20px rgba(59, 130, 246, 0.2)' : 'none'
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {/* Header with company badge */}
                <div className="flex flex-wrap justify-between items-start mb-6">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-900/40 flex items-center justify-center mr-3"
                           style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}>
                        <Award size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300"
                            style={{ textShadow: '0 0 8px rgba(59, 130, 246, 0.3)' }}>{exp.title}</h3>
                        <p className="text-blue-400 font-medium">{exp.company}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/80 rounded-lg px-4 py-3 flex flex-col space-y-2 border border-blue-900/30">
                    <div className="flex items-center text-blue-200">
                      <Calendar size={16} className="mr-2 text-blue-400" />
                      <span>{exp.duration}</span>
                    </div>
                    <div className="flex items-center text-blue-200">
                      <MapPin size={16} className="mr-2 text-blue-400" />
                      <span>{exp.location}</span>
                    </div>
                  </div>
                </div>

                {/* Description with enhanced styling */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-blue-200 mb-3">Key Achievements</h4>
                  <ul className="space-y-4">
                    {exp.description.map((item, i) => (
                      <li
                        key={i}
                        className={`flex items-start group transition-all duration-500 ${
                          animatedItems[index] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                        }`}
                        style={{ transitionDelay: `${i * 100}ms` }}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-900/40 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 group-hover:bg-blue-800/60 transition-colors duration-300 border border-blue-800/50">
                          <ChevronRight size={14} className="text-blue-400" />
                        </div>
                        <p className="text-blue-100 leading-relaxed">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills tags */}
                {exp.skills && (
                  <div>
                    <h4 className="text-sm font-semibold text-blue-300 mb-3 uppercase tracking-wider">Skills Utilized</h4>
                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map((skill, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 text-xs font-medium rounded-full bg-blue-900/40 text-blue-300 border border-blue-800/50 transition-all duration-300 hover:bg-blue-800/60 ${
                            animatedItems[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                          }`}
                          style={{
                            transitionDelay: `${(exp.description.length + i) * 100}ms`,
                            boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Timeline end marker */}
          <div className="relative pl-10">
            <div className="absolute -left-1 top-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg opacity-50"
                   style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}>
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <p className="text-blue-300 italic ml-4">Beginning of my professional journey</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
