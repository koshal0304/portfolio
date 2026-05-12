import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface SkillData {
  name: string;
  category: string;
}

const ALL_SKILLS: SkillData[] = [
  // AI/ML Core
  { name: 'PyTorch', category: 'AI/ML Core' },
  { name: 'TensorFlow', category: 'AI/ML Core' },
  { name: 'scikit-learn', category: 'AI/ML Core' },
  { name: 'Hugging Face', category: 'AI/ML Core' },
  { name: 'LangChain', category: 'AI/ML Core' },
  { name: 'LangGraph', category: 'AI/ML Core' },
  { name: 'RAG Pipelines', category: 'AI/ML Core' },
  { name: 'LLM Fine-tuning', category: 'AI/ML Core' },
  { name: 'Prompt Engineering', category: 'AI/ML Core' },
  { name: 'Computer Vision', category: 'AI/ML Core' },
  { name: 'YOLO', category: 'AI/ML Core' },
  { name: 'Sentence Transformers', category: 'AI/ML Core' },
  { name: 'MLflow', category: 'AI/ML Core' },
  { name: 'W&B', category: 'AI/ML Core' },
  { name: 'DVC', category: 'AI/ML Core' },
  // LLM & Agents
  { name: 'OpenAI API', category: 'LLM & Agents' },
  { name: 'Azure OpenAI', category: 'LLM & Agents' },
  { name: 'Gemini API', category: 'LLM & Agents' },
  { name: 'Pinecone', category: 'LLM & Agents' },
  { name: 'FAISS', category: 'LLM & Agents' },
  { name: 'ChromaDB', category: 'LLM & Agents' },
  { name: 'LlamaIndex', category: 'LLM & Agents' },
  { name: 'Vector Search', category: 'LLM & Agents' },
  { name: 'Semantic Routing', category: 'LLM & Agents' },
  // Backend & APIs
  { name: 'Python', category: 'Backend & APIs' },
  { name: 'Node.js', category: 'Backend & APIs' },
  { name: 'TypeScript', category: 'Backend & APIs' },
  { name: 'FastAPI', category: 'Backend & APIs' },
  { name: 'Django', category: 'Backend & APIs' },
  { name: 'REST APIs', category: 'Backend & APIs' },
  { name: 'JWT/OAuth2', category: 'Backend & APIs' },
  { name: 'Redis', category: 'Backend & APIs' },
  { name: 'Celery', category: 'Backend & APIs' },
  { name: 'WebSockets', category: 'Backend & APIs' },
  { name: 'Prisma ORM', category: 'Backend & APIs' },
  // Cloud & Infra
  { name: 'AWS S3', category: 'Cloud & Infra' },
  { name: 'AWS EC2', category: 'Cloud & Infra' },
  { name: 'AWS Lambda', category: 'Cloud & Infra' },
  { name: 'Docker', category: 'Cloud & Infra' },
  { name: 'GitHub Actions', category: 'Cloud & Infra' },
  { name: 'Boto3', category: 'Cloud & Infra' },
  // Databases & Storage
  { name: 'PostgreSQL', category: 'Databases & Storage' },
  { name: 'MongoDB', category: 'Databases & Storage' },
  { name: 'MySQL', category: 'Databases & Storage' },
  { name: 'SQLGlot', category: 'Databases & Storage' },
  // Data & Dev Tools
  { name: 'Pandas', category: 'Data & Dev Tools' },
  { name: 'NumPy', category: 'Data & Dev Tools' },
  { name: 'OpenCV', category: 'Data & Dev Tools' },
  { name: 'Metabase', category: 'Data & Dev Tools' },
  { name: 'Postman', category: 'Data & Dev Tools' },
  { name: 'GitHub', category: 'Data & Dev Tools' },
];

const CATEGORIES = ['All', 'AI/ML Core', 'LLM & Agents', 'Backend & APIs', 'Cloud & Infra', 'Databases & Storage', 'Data & Dev Tools'];

// Fibonacci sphere distribution
function fibonacciSphere(count: number, radius: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    points.push([r * Math.cos(theta) * radius, y * radius, r * Math.sin(theta) * radius]);
  }
  return points;
}

// ─── 3D Skill Sphere ──────────────────────────────────────────────
interface SkillSphereProps {
  skills: SkillData[];
  activeCategory: string;
}

const SkillSphere: React.FC<SkillSphereProps> = ({ skills, activeCategory }) => {
  const groupRef = useRef<THREE.Group>(null);
  const positions = useMemo(() => fibonacciSphere(skills.length, 5), [skills.length]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002 * delta * 60;
    }
  });

  return (
    <group ref={groupRef}>
      {skills.map((skill, i) => {
        const isActive = activeCategory === 'All' || skill.category === activeCategory;
        return (
          <Html
            key={skill.name}
            position={positions[i]}
            center
            distanceFactor={12}
            style={{ pointerEvents: 'auto' }}
          >
            <div
              className={`font-mono text-xs whitespace-nowrap px-2.5 py-1 rounded-full transition-all duration-500 cursor-default select-none ${
                isActive
                  ? 'text-white'
                  : 'text-white/20'
              }`}
              style={
                isActive
                  ? {
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      background: 'rgba(0, 212, 255, 0.08)',
                      boxShadow: '0 0 12px rgba(0, 212, 255, 0.15)',
                    }
                  : {
                      border: '1px solid transparent',
                    }
              }
              title={skill.category}
            >
              {skill.name}
            </div>
          </Html>
        );
      })}
    </group>
  );
};

// ─── Mobile Skill Grid ────────────────────────────────────────────
interface MobileSkillGridProps {
  skills: SkillData[];
  activeCategory: string;
}

const MobileSkillGrid: React.FC<MobileSkillGridProps> = ({ skills, activeCategory }) => {
  const filtered = activeCategory === 'All' ? skills : skills.filter((s) => s.category === activeCategory);
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {filtered.map((skill, i) => (
        <motion.span
          key={skill.name}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.02 }}
          className="font-mono text-xs px-3 py-1.5 rounded-full transition-all duration-300 cursor-default"
          style={{
            border: '1px solid rgba(0, 212, 255, 0.25)',
            color: 'rgba(0, 212, 255, 0.8)',
            background: 'rgba(0, 212, 255, 0.05)',
          }}
        >
          {skill.name}
        </motion.span>
      ))}
    </div>
  );
};

// ─── Main Skills Component ────────────────────────────────────────
const Skills: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <section id="skills" className="bg-surface/70 py-24 relative overflow-hidden">
      {/* Background aurora */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="float-orb"
          style={{
            width: '350px',
            height: '350px',
            background: 'var(--aurora-1)',
            top: '30%',
            left: '-8%',
            opacity: 0.05,
            animationDelay: '-6s',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-base mb-4">
            Technical Arsenal
          </h2>
          <p className="text-text-muted font-body">Tools I've shipped real features with</p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="aurora-divider mx-auto mt-6"
            style={{ maxWidth: '100px', transformOrigin: 'center' }}
          />
        </motion.div>

        {/* 3D Sphere or Mobile Grid */}
        <div className="h-[500px] md:h-[600px] mb-8">
          {isMobile ? (
            <div className="h-full flex items-center">
              <MobileSkillGrid skills={ALL_SKILLS} activeCategory={activeCategory} />
            </div>
          ) : (
            <Canvas camera={{ position: [0, 0, 14], fov: 60 }} dpr={[1, 1.5]}>
              <ambientLight intensity={0.5} />
              <SkillSphere skills={ALL_SKILLS} activeCategory={activeCategory} />
            </Canvas>
          )}
        </div>

        {/* Category pills with neon active state */}
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="font-mono text-xs px-4 py-2 rounded-full transition-all duration-300 cursor-pointer"
              style={
                activeCategory === cat
                  ? {
                      background: 'var(--aurora-1)',
                      color: 'var(--bg-deep)',
                      boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                    }
                  : {
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }
              }
              data-cursor-text="Filter"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;