import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface SkillData {
  name: string;
  category: string;
}

const ALL_SKILLS: SkillData[] = [
  // LLM & Agents
  { name: 'LangGraph', category: 'LLM & Agents' },
  { name: 'LangChain', category: 'LLM & Agents' },
  { name: 'Multi-Agent Systems', category: 'LLM & Agents' },
  { name: 'RAG Pipelines', category: 'LLM & Agents' },
  { name: 'Agentic RAG', category: 'LLM & Agents' },
  { name: 'NL-to-SQL Engines', category: 'LLM & Agents' },
  { name: 'Prompt Engineering', category: 'LLM & Agents' },
  { name: 'Evaluation Harnesses', category: 'LLM & Agents' },
  { name: 'Model Context Protocol (MCP)', category: 'LLM & Agents' },
  { name: 'Semantic Routing', category: 'LLM & Agents' },
  { name: 'LLM Fine-Tuning', category: 'LLM & Agents' },

  // Model APIs & Retrieval
  { name: 'OpenAI API', category: 'Model APIs & Retrieval' },
  { name: 'Azure OpenAI', category: 'Model APIs & Retrieval' },
  { name: 'Google Gemini API', category: 'Model APIs & Retrieval' },
  { name: 'Hugging Face', category: 'Model APIs & Retrieval' },
  { name: 'Vector Search', category: 'Model APIs & Retrieval' },
  { name: 'Hybrid Search', category: 'Model APIs & Retrieval' },
  { name: 'Embeddings (BGE/CLIP)', category: 'Model APIs & Retrieval' },
  { name: 'Pinecone', category: 'Model APIs & Retrieval' },
  { name: 'FAISS', category: 'Model APIs & Retrieval' },
  { name: 'ChromaDB', category: 'Model APIs & Retrieval' },
  { name: 'LlamaIndex', category: 'Model APIs & Retrieval' },

  // Backend & APIs
  { name: 'Python', category: 'Backend & APIs' },
  { name: 'FastAPI', category: 'Backend & APIs' },
  { name: 'Node.js', category: 'Backend & APIs' },
  { name: 'TypeScript', category: 'Backend & APIs' },
  { name: 'Django', category: 'Backend & APIs' },
  { name: 'Async SQLAlchemy', category: 'Backend & APIs' },
  { name: 'REST API Design', category: 'Backend & APIs' },
  { name: 'JWT / OAuth2', category: 'Backend & APIs' },
  { name: 'Redis', category: 'Backend & APIs' },
  { name: 'Celery', category: 'Backend & APIs' },
  { name: 'WebSockets', category: 'Backend & APIs' },
  { name: 'Prisma ORM', category: 'Backend & APIs' },
  { name: 'Microsoft Graph API', category: 'Backend & APIs' },

  // Cloud & Infra
  { name: 'AWS (S3, EC2, Lambda)', category: 'Cloud & Infra' },
  { name: 'Boto3', category: 'Cloud & Infra' },
  { name: 'Docker', category: 'Cloud & Infra' },
  { name: 'Azure DevOps', category: 'Cloud & Infra' },
  { name: 'GitHub Actions', category: 'Cloud & Infra' },
  { name: 'Microservices', category: 'Cloud & Infra' },
  { name: 'Rate-Limiting Middleware', category: 'Cloud & Infra' },
  { name: 'Structured Logging', category: 'Cloud & Infra' },

  // Data & ML
  { name: 'PyTorch', category: 'Data & ML' },
  { name: 'TensorFlow', category: 'Data & ML' },
  { name: 'scikit-learn', category: 'Data & ML' },
  { name: 'ResNet18', category: 'Data & ML' },
  { name: 'DistilBERT', category: 'Data & ML' },
  { name: 'YOLO', category: 'Data & ML' },
  { name: 'Computer Vision', category: 'Data & ML' },
  { name: 'OpenCV', category: 'Data & ML' },
  { name: 'Sentence Transformers', category: 'Data & ML' },
  { name: 'SQLGlot', category: 'Data & ML' },
  { name: 'Pandas', category: 'Data & ML' },
  { name: 'NumPy', category: 'Data & ML' },
  { name: 'MLflow', category: 'Data & ML' },
  { name: 'Weights & Biases', category: 'Data & ML' },

  // Databases
  { name: 'PostgreSQL', category: 'Databases' },
  { name: 'MongoDB', category: 'Databases' },
  { name: 'MySQL', category: 'Databases' },
  { name: 'Redis (Cache/Queue)', category: 'Databases' },
  { name: 'Pinecone (Vector DB)', category: 'Databases' },
];

const CATEGORIES = [
  'All',
  'LLM & Agents',
  'Model APIs & Retrieval',
  'Backend & APIs',
  'Cloud & Infra',
  'Data & ML',
  'Databases',
];

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

// ─── 3D Skill Constellation ──────────────────────────────────────────────
interface SkillSphereProps {
  skills: SkillData[];
  activeCategory: string;
}

const SkillSphere: React.FC<SkillSphereProps> = ({ skills, activeCategory }) => {
  const groupRef = useRef<THREE.Group>(null);
  const positions = useMemo(() => fibonacciSphere(skills.length, 5.2), [skills.length]);

  // Generate constellation connection lines between neighboring skills
  const constellationLines = useMemo(() => {
    const lines: THREE.BufferGeometry[] = [];
    const maxDist = 2.4;
    for (let i = 0; i < skills.length; i++) {
      const p1 = new THREE.Vector3(...positions[i]);
      for (let j = i + 1; j < skills.length; j++) {
        const p2 = new THREE.Vector3(...positions[j]);
        if (p1.distanceTo(p2) < maxDist) {
          const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
          lines.push(geom);
        }
      }
    }
    return lines;
  }, [skills.length, positions]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0016 * delta * 60;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner Geodesic Core Lattice */}
      <mesh>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshStandardMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Constellation Synapse Filaments */}
      {constellationLines.map((line, idx) => (
        <line key={idx} geometry={line}>
          <lineBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.07}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}

      {/* 3D Skill Nodes and Floating Badges */}
      {skills.map((skill, i) => {
        const isActive = activeCategory === 'All' || skill.category === activeCategory;
        const pos = positions[i];

        return (
          <group key={skill.name} position={pos}>
            {/* 3D Glowing Node Dot */}
            <mesh>
              <sphereGeometry args={[isActive ? 0.07 : 0.035, 12, 12]} />
              <meshStandardMaterial
                color={isActive ? '#38bdf8' : '#64748b'}
                emissive={isActive ? '#38bdf8' : '#334155'}
                emissiveIntensity={isActive ? 0.8 : 0.1}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            {/* Floating Soft Label */}
            <Html center distanceFactor={12} style={{ pointerEvents: 'auto' }}>
              <div
                className={`font-mono text-xs whitespace-nowrap px-2.5 py-1 rounded-full transition-all duration-400 cursor-default select-none ${
                  isActive
                    ? 'text-slate-100 font-medium'
                    : 'text-slate-500/30'
                }`}
                style={
                  isActive
                    ? {
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        background: 'rgba(12, 16, 23, 0.92)',
                        boxShadow: '0 0 16px rgba(56, 189, 248, 0.2)',
                      }
                    : {
                        border: '1px solid transparent',
                        background: 'transparent',
                      }
                }
                title={skill.category}
              >
                {skill.name}
              </div>
            </Html>
          </group>
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
          className="font-mono text-xs px-3 py-1.5 rounded-full transition-all duration-300 cursor-default border border-sky-400/20 text-slate-200 bg-sky-500/5"
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
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-100 mb-4 tracking-tight">
            Technical Arsenal
          </h2>
          <p className="text-slate-400 font-body">Production frameworks, algorithms, and infrastructure shipped to scale</p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="aurora-divider mx-auto mt-6"
            style={{ maxWidth: '100px', transformOrigin: 'center' }}
          />
        </motion.div>

        {/* 3D Constellation Sphere or Mobile Grid */}
        <div className="h-[500px] md:h-[600px] mb-8">
          {isMobile ? (
            <div className="h-full flex items-center">
              <MobileSkillGrid skills={ALL_SKILLS} activeCategory={activeCategory} />
            </div>
          ) : (
            <Canvas camera={{ position: [0, 0, 14], fov: 58 }} dpr={[1, 1.5]}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[6, 6, 6]} intensity={1} color="#38bdf8" />
              <SkillSphere skills={ALL_SKILLS} activeCategory={activeCategory} />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                rotateSpeed={0.5}
                dampingFactor={0.05}
              />
            </Canvas>
          )}
        </div>

        {/* Category pills with soft active state */}
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="font-mono text-xs px-4 py-2 rounded-full transition-all duration-300 cursor-pointer"
              style={
                activeCategory === cat
                  ? {
                      background: 'rgba(56, 189, 248, 0.18)',
                      color: '#38BDF8',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)',
                      fontWeight: 600,
                    }
                  : {
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#94A3B8',
                      background: 'rgba(255, 255, 255, 0.02)',
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