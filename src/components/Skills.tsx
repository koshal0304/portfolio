import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import * as THREE from 'three';
import { ALL_SKILLS, type SkillData } from '../data/profile';
import { scrollVelocity } from '../lib/smoothScroll';
import SectionHeader from './SectionHeader';
import { Magnetic3D, SlotRollText } from './KineticText';

const ACCENT = '#f4b678';
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CATEGORIES = ['All', 'LLM & Agents', 'Model APIs & Retrieval', 'Backend & APIs', 'Cloud & Infra', 'Data & ML', 'Databases'];

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
  const spin = useRef(0);
  const still = useReducedMotion();
  const positions = useMemo(() => fibonacciSphere(skills.length, 5.2), [skills.length]);

  // Constellation filaments between neighbouring skills
  const constellationLines = useMemo(() => {
    const lines: THREE.BufferGeometry[] = [];
    const maxDist = 2.4;
    for (let i = 0; i < skills.length; i++) {
      const p1 = new THREE.Vector3(...positions[i]);
      for (let j = i + 1; j < skills.length; j++) {
        const p2 = new THREE.Vector3(...positions[j]);
        if (p1.distanceTo(p2) < maxDist) lines.push(new THREE.BufferGeometry().setFromPoints([p1, p2]));
      }
    }
    return lines;
  }, [skills.length, positions]);

  // The sphere rolls with the page: scrolling spins it up (in the scroll's direction), then it settles.
  useFrame((_, delta) => {
    if (!groupRef.current || still) return;
    const push = Math.max(-0.9, Math.min(0.9, scrollVelocity() * 0.012));
    spin.current += (push - spin.current) * Math.min(1, delta * 4);
    groupRef.current.rotation.y += (0.096 + spin.current) * delta;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.05} />
      </mesh>

      {constellationLines.map((line, idx) => (
        // @ts-expect-error R3F <line> (THREE.Line) collides with the SVG <line> JSX type
        <line key={idx} geometry={line}>
          <lineBasicMaterial color={ACCENT} transparent opacity={0.1} />
        </line>
      ))}

      {skills.map((skill, i) => {
        const isActive = activeCategory === 'All' || skill.category === activeCategory;
        return (
          <group key={skill.name} position={positions[i]}>
            <mesh>
              <sphereGeometry args={[isActive ? 0.06 : 0.03, 12, 12]} />
              <meshBasicMaterial color={isActive ? ACCENT : '#7d8394'} />
            </mesh>
            <Html center distanceFactor={12} style={{ pointerEvents: 'auto' }}>
              <div
                title={skill.category}
                className={`cursor-default select-none whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-xs transition-colors duration-500 ${
                  isActive
                    ? 'border-white/15 bg-raised/90 text-slate-100 shadow-[0_8px_20px_-10px_rgba(10,12,20,0.8)]'
                    : 'border-transparent bg-transparent text-slate-500/40'
                }`}
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

// ─── Mobile Skill Grid: chips ripple out from the middle (and again on every filter) ───
const MobileSkillGrid: React.FC<SkillSphereProps> = ({ skills, activeCategory }) => {
  const filtered = activeCategory === 'All' ? skills : skills.filter((s) => s.category === activeCategory);
  const mid = (filtered.length - 1) / 2;
  return (
    <div key={activeCategory} className="flex flex-wrap justify-center gap-2">
      {filtered.map((skill, i) => (
        <motion.span
          key={skill.name}
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: Math.abs(i - mid) * 0.025, duration: 0.5, ease: EASE }}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-slate-200"
        >
          {skill.name}
        </motion.span>
      ))}
    </div>
  );
};

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

// ─── Main Skills Component ────────────────────────────────────────
const Skills: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const isMobile = useMedia('(max-width: 767px)');
  const stageRef = useRef<HTMLDivElement>(null);
  // The constellation arrives out of deep space as the section scrolls in.
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'center center'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.55, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const { ref: viewRef, inView } = useInView({ rootMargin: '200px 0px' });

  return (
    <section id="skills" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5">
        <SectionHeader
          chapter="04"
          eyebrow="Stack"
          title="The tools behind the systems."
          lead="Production frameworks, retrieval and infrastructure. Drag the constellation, or filter by layer."
          className="!mb-6 md:!mb-8"
        />

        <div ref={stageRef} style={{ perspective: 1200 }}>
          <motion.div
            ref={viewRef}
            style={isMobile ? undefined : { scale, opacity, rotateX }}
            data-guide="skills-sphere"
            data-cursor={isMobile ? undefined : 'Drag'}
            className={isMobile ? 'mb-8' : 'mb-8 h-[600px]'}
          >
            {isMobile ? (
              <MobileSkillGrid skills={ALL_SKILLS} activeCategory={activeCategory} />
            ) : (
              // Layout size, not the transformed rect: the stage is scaled while it flies in.
              <Canvas
                camera={{ position: [0, 0, 14], fov: 58 }}
                dpr={[1, 1.5]}
                frameloop={inView ? 'always' : 'never'}
                resize={{ scroll: false, offsetSize: true }}
              >
                <SkillSphere skills={ALL_SKILLS} activeCategory={activeCategory} />
                <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} dampingFactor={0.05} />
              </Canvas>
            )}
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Filter skills by category">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <Magnetic3D key={cat} strength={0.14} tilt={4}>
                <button
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={active}
                  className={`slot-roll-trigger relative cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-300 ${
                    active ? 'border-transparent text-slate-100' : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-100'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="skills-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full border border-accent-300/45 bg-white/[0.1] shadow-[0_8px_20px_-8px_rgba(244,182,120,0.45)]"
                    />
                  )}
                  <SlotRollText text={cat} active={active} className="relative" accentClassName="text-accent-200" />
                </button>
              </Magnetic3D>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
