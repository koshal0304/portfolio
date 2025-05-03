import React, { useEffect, useRef } from 'react';
import MovingStarsBackground from './MovingStarsBackground';

interface SkillCategory {
  category: string;
  skills: string[];
}

const skillsData: SkillCategory[] = [
  {
    category: 'Languages',
    skills: ['Python', 'JavaScript', 'TypeScript', 'SQL', 'HTML', 'CSS', 'Java', 'C++']
  },
  {
    category: 'Frameworks & Libraries',
    skills: ['React', 'Next.js', 'Node.js', 'Express', 'Streamlit', 'Flask', 'Django', 'Tailwind CSS', 'Bootstrap']
  },
  {
    category: 'Data Science & ML',
    skills: ['Pandas', 'NumPy', 'scikit-learn', 'TensorFlow', 'PyTorch', 'Matplotlib', 'Seaborn', 'LangChain', 'Hugging Face']
  },
  {
    category: 'Databases',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Supabase', 'Firebase', 'Vector Databases']
  },
  {
    category: 'AI & Machine Learning',
    skills: ['Computer Vision', 'Natural Language Processing', 'Generative AI', 'Large Language Models', 'YOLO', 'OpenCV', 'Transformers', 'Reinforcement Learning']
  },
  {
    category: 'Cloud & DevOps',
    skills: ['AWS', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Vercel', 'Netlify']
  },
  {
    category: 'Tools & Platforms',
    skills: ['Git', 'GitHub', 'Jupyter', 'VS Code', 'Postman', 'Figma', 'Notion', 'Jira', 'Slack']
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
    switch(category) {
      case 'Languages':
        return 'from-blue-600 to-blue-800';
      case 'Frameworks & Libraries':
        return 'from-indigo-600 to-indigo-800';
      case 'Databases':
        return 'from-cyan-600 to-cyan-800';
      case 'Data Science & ML':
        return 'from-teal-600 to-teal-800';
      case 'AI & Machine Learning':
        return 'from-purple-600 to-purple-800';
      case 'Cloud & DevOps':
        return 'from-blue-600 to-indigo-800';
      case 'Tools & Platforms':
        return 'from-violet-600 to-violet-800';
      default:
        return 'from-blue-600 to-indigo-800';
    }
  };

  return (
    <div
      ref={badgeRef}
      className={`px-4 py-2 bg-gradient-to-r ${getGradient()} text-white rounded-lg shadow-md
        transition-all duration-500 ease-out opacity-0 translate-y-4 transform hover:scale-105 hover:shadow-lg
        border border-opacity-30 backdrop-blur-sm`}
      style={{
        boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}
    >
      {skill}
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
      className="mb-10 opacity-0 translate-y-10 transition-all duration-700 ease-out"
    >
      <h3 className="text-xl font-semibold mb-4 text-blue-200" style={{ textShadow: '0 0 8px rgba(59, 130, 246, 0.3)' }}>{category}</h3>
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