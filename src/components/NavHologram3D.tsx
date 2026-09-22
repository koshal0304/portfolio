import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HologramSceneProps {
  isHovered: boolean;
}

const HologramScene: React.FC<HologramSceneProps> = ({ isHovered }) => {
  const crystalRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);
  const speedRef = useRef(1);

  useFrame((_, delta) => {
    // Smooth speed acceleration on hover
    const targetSpeed = isHovered ? 3.2 : 1.0;
    speedRef.current += (targetSpeed - speedRef.current) * 0.08;

    const rotStep = delta * speedRef.current;

    if (crystalRef.current) {
      crystalRef.current.rotation.y += rotStep * 1.2;
      crystalRef.current.rotation.x += rotStep * 0.6;
    }

    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= rotStep * 0.9;
      wireframeRef.current.rotation.z += rotStep * 0.7;
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 3;
      ringRef.current.rotation.z += rotStep * 1.5;
    }

    if (nucleusRef.current) {
      const pulse = 1 + Math.sin(Date.now() * 0.006) * (isHovered ? 0.2 : 0.08);
      nucleusRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 3, 4]} intensity={1.8} color="#38bdf8" />
      <directionalLight position={[-3, -3, -2]} intensity={1.2} color="#a855f7" />

      <group position={[0, 0, 0]}>
        {/* Outer Gyro Ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[1.35, 0.04, 16, 40]} />
          <meshStandardMaterial
            color={isHovered ? '#67e8f9' : '#38bdf8'}
            emissive={isHovered ? '#38bdf8' : '#0284c7'}
            emissiveIntensity={isHovered ? 0.9 : 0.4}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Faceted Geometric Crystal */}
        <mesh ref={crystalRef}>
          <octahedronGeometry args={[0.82, 0]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#1e40af"
            emissiveIntensity={isHovered ? 0.7 : 0.3}
            metalness={0.9}
            roughness={0.15}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Counter-rotating Wireframe Cage */}
        <mesh ref={wireframeRef}>
          <icosahedronGeometry args={[1.05, 0]} />
          <meshStandardMaterial
            color={isHovered ? '#c084fc' : '#818cf8'}
            emissive={isHovered ? '#a855f7' : '#6366f1'}
            emissiveIntensity={isHovered ? 0.8 : 0.35}
            wireframe
            transparent
            opacity={isHovered ? 0.85 : 0.5}
          />
        </mesh>

        {/* Pulsing Energy Nucleus */}
        <mesh ref={nucleusRef}>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshBasicMaterial color={isHovered ? '#ffffff' : '#e0f2fe'} />
        </mesh>
      </group>
    </>
  );
};

export const NavHologram3D: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Neural AI Core — Operational"
    >
      {/* 3D Micro-Canvas Frame with animated glow */}
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Glow backdrop behind 3D core */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 blur-md pointer-events-none ${
            isHovered
              ? 'bg-gradient-to-tr from-sky-400/40 via-indigo-500/40 to-pink-500/40 scale-125'
              : 'bg-sky-500/20 scale-100'
          }`}
        />

        {/* Canvas */}
        <div className="w-8 h-8 relative z-10 pointer-events-none">
          <Canvas
            camera={{ position: [0, 0, 3.4], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
          >
            <HologramScene isHovered={isHovered} />
          </Canvas>
        </div>
      </div>

      {/* Live Status Pill */}
      <div className="hidden lg:flex flex-col justify-center leading-none select-none">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          <span className="font-mono text-[9px] font-bold tracking-widest text-slate-300 uppercase group-hover:text-sky-300 transition-colors">
            AI CORE
          </span>
        </div>
        <span className="font-mono text-[8px] text-slate-300/80 tracking-tighter">
          ONLINE
        </span>
      </div>
    </div>
  );
};

export default NavHologram3D;
