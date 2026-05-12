import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Sphere, 
  MeshDistortMaterial, 
  Stars,
  OrbitControls
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import ModelLoader from './ModelLoader';

// No PostProcessing components to minimize compatibility issues

interface ParticleProps {
  position: [number, number, number];
  size: number;
  color: string;
  speed: number;
}

const Particle: React.FC<ParticleProps> = ({ position, size, color, speed }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const initialPos = useMemo(() => position, [position]);
  
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    
    // Move particles in a subtle wave pattern
    mesh.current.position.y = initialPos[1] + Math.sin(clock.getElapsedTime() * speed) * 0.1;
    mesh.current.rotation.x = clock.getElapsedTime() * speed * 0.2;
    mesh.current.rotation.z = clock.getElapsedTime() * speed * 0.1;
  });
  
  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
};

interface NebulaProps {
  position: [number, number, number];
  color: string;
  size: number;
  distort?: number;
  speed?: number;
}

const Nebula: React.FC<NebulaProps> = ({ position, color, size, distort = 0.4, speed = 0.5 }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    
    // Slow rotation
    mesh.current.rotation.y = clock.getElapsedTime() * 0.05 * speed;
    mesh.current.rotation.z = clock.getElapsedTime() * 0.03 * speed;
  });
  
  return (
    <Sphere ref={mesh} position={position} args={[size, 32, 32]}>
      <MeshDistortMaterial
        color={color}
        distort={distort}
        speed={0.4}
        transparent
        opacity={0.15}
      />
    </Sphere>
  );
};

interface ThreeDBackgroundProps {
  className?: string;
  color?: string;
  density?: 'low' | 'medium' | 'high';
  nebulae?: boolean;
  interactive?: boolean;
  showBigStar?: boolean;
}

const ThreeDBackground: React.FC<ThreeDBackgroundProps> = ({ 
  className = '',
  color = 'blue',
  density = 'medium',
  nebulae = true,
  interactive = false,
  showBigStar = true
}) => {
  // Determine number of particles based on density
  const particleCount = useMemo(() => {
    switch (density) {
      case 'low': return 100;
      case 'high': return 500;
      case 'medium':
      default: return 250;
    }
  }, [density]);
  
  // Color theme based on prop
  const colorScheme = useMemo(() => {
    switch (color) {
      case 'purple':
        return {
          primary: '#9c27b0',
          secondary: '#673ab7',
          tertiary: '#e1bee7',
          particles: ['#d1c4e9', '#b39ddb', '#9575cd', '#7e57c2']
        };
      case 'cyan':
        return {
          primary: '#00bcd4',
          secondary: '#0097a7',
          tertiary: '#b2ebf2',
          particles: ['#b2ebf2', '#80deea', '#4dd0e1', '#26c6da']
        };
      case 'red':
        return {
          primary: '#f44336',
          secondary: '#d32f2f',
          tertiary: '#ffcdd2',
          particles: ['#ffcdd2', '#ef9a9a', '#e57373', '#ef5350']
        };
      case 'blue':
      default:
        return {
          primary: '#2196f3',
          secondary: '#1976d2',
          tertiary: '#bbdefb',
          particles: ['#bbdefb', '#90caf9', '#64b5f6', '#42a5f5']
        };
    }
  }, [color]);
  
  // Particle positions - randomly distributed in a sphere
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      // Generate points in a sphere
      const radius = Math.random() * 15 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      const size = Math.random() * 0.05 + 0.02;
      const colorIndex = Math.floor(Math.random() * colorScheme.particles.length);
      const speed = Math.random() * 0.5 + 0.2;
      
      temp.push({
        position: [x, y, z] as [number, number, number],
        size,
        color: colorScheme.particles[colorIndex],
        speed
      });
    }
    return temp;
  }, [particleCount, colorScheme]);
  
  // Nebula cloud positions
  const nebulaPositions = useMemo(() => {
    if (!nebulae) return [];
    
    const positions = [];
    for (let i = 0; i < 5; i++) {
      const radius = Math.random() * 12 + 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      const size = Math.random() * 4 + 3;
      const distort = Math.random() * 0.5 + 0.2;
      const speed = Math.random() * 0.5 + 0.3;
      
      // Choose between primary and secondary color
      const nebulaColor = Math.random() > 0.5 ? colorScheme.primary : colorScheme.secondary;
      
      positions.push({
        position: [x, y, z] as [number, number, number],
        size,
        color: nebulaColor,
        distort,
        speed
      });
    }
    return positions;
  }, [nebulae, colorScheme]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={`w-full h-full ${className}`}
    >
      <ModelLoader color={colorScheme.primary} backgroundColor="rgba(0, 0, 0, 0.3)">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 20], fov: 50 }}>
          {interactive && <OrbitControls enableZoom={false} />}
          <ambientLight intensity={0.4} />
          
          {/* Stars from drei */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          
          {/* Custom particles */}
          {particles.map((particle, i) => (
            <Particle
              key={i}
              position={particle.position}
              size={particle.size}
              color={particle.color}
              speed={particle.speed}
            />
          ))}
          
          {/* Nebula clouds */}
          {nebulae && nebulaPositions.map((nebula, i) => (
            <Nebula
              key={i}
              position={nebula.position}
              size={nebula.size}
              color={nebula.color}
              distort={nebula.distort}
              speed={nebula.speed}
            />
          ))}
          
          {/* Big central star - optional */}
          {showBigStar && (
            <>
              <pointLight position={[0, 0, 0]} intensity={2} color={colorScheme.primary} distance={20} decay={2} />
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color={colorScheme.tertiary} />
              </mesh>
            </>
          )}
        </Canvas>
      </ModelLoader>
    </motion.div>
  );
};

export default ThreeDBackground; 