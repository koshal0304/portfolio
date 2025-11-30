import React, { useEffect, useRef } from 'react';
import MovingStarsBackground from './MovingStarsBackground';

interface SkillCategory {
  category: string;
  skills: string[];
}

const skillsData: SkillCategory[] = [
  {
    category: 'Programming & Development',
    skills: ['Python', 'JavaScript', 'TypeScript', 'Node.js', 'Express.js', 'ReactJS', 'HTML', 'CSS', 'Django', 'FastAPI', 'Java', 'C++']
  },
  {
    category: 'Frameworks & Libraries',
    skills: ['React', 'Next.js', 'Node.js', 'Express', 'Streamlit', 'Flask', 'Django', 'Tailwind CSS', 'Bootstrap', 'LangChain']
  },
  {
    category: 'Data Science & ML',
    skills: ['Pandas', 'NumPy', 'scikit-learn', 'TensorFlow', 'PyTorch', 'Matplotlib', 'Seaborn', 'Hugging Face']
  },
  {
    category: 'Database Management',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'AWS S3', 'SQL', 'Redis', 'SQLite', 'Supabase', 'Firebase', 'Vector Databases']
  },
  {
    category: 'AI & Machine Learning',
    skills: ['Computer Vision', 'Natural Language Processing', 'Generative AI', 'Large Language Models', 'LLM', 'RAG', 'YOLO', 'SAM', 'ResNet', 'OpenCV', 'Transformers', 'Reinforcement Learning']
  },
  {
    category: 'Cloud & DevOps',
    skills: ['AWS', 'AWS EC2', 'AWS Lambda', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Vercel', 'Netlify']
  },
  {
    category: 'Tools & Platforms',
    skills: ['Git', 'GitHub', 'Jira', 'Tableau', 'Postman', 'Power BI', 'Jupyter', 'VS Code', 'Figma', 'Notion', 'Slack']
  }
];

const SkillBadge: React.FC<{ skill: string; index: number; category: string }> = ({ skill, index, category }) => {
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-4');
          }, index * 50);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (badgeRef.current) {
      observer.observe(badgeRef.current);
    }

    return () => {
      if (badgeRef.current) {
        observer.unobserve(badgeRef.current);
      }
    };
  }, [index]);

  const getGradient = () => {
    switch (category) {
      case 'Programming & Development':
        return 'from-blue-600 via-blue-500 to-blue-600';
      case 'Frameworks & Libraries':
        return 'from-indigo-600 via-indigo-500 to-indigo-600';
      case 'Database Management':
        return 'from-cyan-600 via-cyan-500 to-cyan-600';
      case 'Data Science & ML':
        return 'from-teal-600 via-teal-500 to-teal-600';
      case 'AI & Machine Learning':
        return 'from-purple-600 via-purple-500 to-purple-600';
      case 'Cloud & DevOps':
        return 'from-blue-600 via-indigo-500 to-indigo-600';
      case 'Tools & Platforms':
        return 'from-violet-600 via-violet-500 to-violet-600';
      default:
        return 'from-blue-600 via-indigo-500 to-indigo-600';
    }
  };

  return (
    <div
      ref={badgeRef}
      className={`group relative px-4 py-2.5 bg-gradient-to-r ${getGradient()} text-white rounded-xl shadow-lg
        transition-all duration-500 ease-out opacity-0 translate-y-4 transform hover:scale-110 hover:shadow-2xl
        border border-white/20 backdrop-blur-sm animate-gradient overflow-hidden`}
      style={{
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), 0 4px 15px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

      {/* Text with shadow */}
      <span className="relative z-10 font-medium text-sm" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        {skill}
      </span>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

const SkillCategory: React.FC<SkillCategory & { index: number }> = ({ category, skills, index }) => {
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (categoryRef.current) {
      observer.observe(categoryRef.current);
    }

    return () => {
      if (categoryRef.current) {
        observer.unobserve(categoryRef.current);
      }
    };
  }, [index]);

  return (
    <div
      ref={categoryRef}
      className="mb-12 opacity-0 translate-y-10 transition-all duration-700 ease-out group"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:w-16 transition-all duration-300" />
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300"
          style={{ textShadow: '0 0 8px rgba(59, 130, 246, 0.3)' }}>
          {category}
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent" />
      </div>
      <div className="flex flex-wrap gap-3">
        {skills.map((skill, i) => (
          <SkillBadge key={skill} skill={skill} index={i} category={category} />
        ))}
      </div>
    </div>
  );
};

const Skills: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100');
          entry.target.classList.remove('opacity-0');
          observer.unobserve(entry.target);
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

  return (
    <section id="skills" className="py-20 bg-black relative overflow-hidden">
      {/* Moving stars background */}
      <MovingStarsBackground starCount={80} />

      {/* Space-themed decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-900/10 to-transparent"></div>
      <div className="absolute -top-10 -right-10 w-60 h-60 bg-blue-500/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      <div
        ref={sectionRef}
        className="container mx-auto px-4 opacity-0 transition-opacity duration-1000 relative z-10"
      >
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-1 bg-blue-900/30 text-blue-300 text-sm font-medium rounded-full backdrop-blur-sm border border-blue-800/30">
              Expertise
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"
            style={{ textShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}>
            Skills & Technologies
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8 rounded-full animate-pulse-slow"></div>
          <p className="max-w-2xl mx-auto text-blue-200 text-lg">
            A comprehensive overview of my technical skills and proficiencies.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {skillsData.map((skillCategory, index) => (
            <SkillCategory
              key={skillCategory.category}
              index={index}
              {...skillCategory}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;