import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Text, 
  PerspectiveCamera, 
  RoundedBox,
  MeshWobbleMaterial,
  OrbitControls,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import ModelLoader from './ModelLoader';

interface SkillBox3DProps {
  text: string;
  color?: string;
  wobble?: boolean;
  speed?: number;
  position?: [number, number, number];
}

// The inner 3D skill box
const SkillBox: React.FC<SkillBox3DProps> = ({ 
  text, 
  color = "#4299e1", 
  wobble = true,
  speed = 1,
  position = [0, 0, 0]
}) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Animation logic
  useFrame((state) => {
    if (!mesh.current) return;
    
    // Add a slight rotation
    mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3 * speed) * 0.1;
    mesh.current.rotation.y += 0.003 * speed;
    
    // Scale up when hovered or clicked
    mesh.current.scale.x = THREE.MathUtils.lerp(
      mesh.current.scale.x,
      hovered || clicked ? 1.15 : 1,
      0.1
    );
    mesh.current.scale.y = THREE.MathUtils.lerp(
      mesh.current.scale.y,
      hovered || clicked ? 1.15 : 1,
      0.1
    );
    mesh.current.scale.z = THREE.MathUtils.lerp(
      mesh.current.scale.z,
      hovered || clicked ? 1.15 : 1,
      0.1
    );
  });
  
  // Determine lighter color for text
  const textColor = new THREE.Color(color).getHSL({ h: 0, s: 0, l: 0 });
  const lightTextColor = new THREE.Color().setHSL(
    textColor.h,
    Math.max(0, textColor.s - 0.3),
    Math.min(0.9, textColor.l + 0.5)
  ).getStyle();
  
  return (
    <RoundedBox
      ref={mesh}
      args={[1.2, 0.5, 0.1]} // width, height, depth
      radius={0.1}
      smoothness={4}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked(!clicked)}
    >
      {wobble ? (
        <MeshWobbleMaterial
          factor={0.2}
          speed={0.5 * speed}
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          metalness={0.6}
          roughness={0.3}
        />
      ) : (
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          metalness={0.6}
          roughness={0.3}
        />
      )}
      
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.15}
        color={lightTextColor}
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        maxWidth={1}
        textAlign="center"
      >
        {text}
      </Text>
    </RoundedBox>
  );
};

interface SkillIcon3DProps {
  skill: string;
  color?: string;
  className?: string;
  wobble?: boolean;
}

// Main component that wraps the 3D canvas
const SkillIcon3D: React.FC<SkillIcon3DProps> = ({ 
  skill, 
  color = "#4299e1", 
  className = "",
  wobble = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  
  // Check if component is in viewport
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    observer.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);
  
  const speed = Math.random() * 0.5 + 0.8; // Slightly randomize animation speed
  
  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className={`aspect-video h-16 ${className}`}
    >
      <ModelLoader color={color} showBar={false} showPercentage={false}>
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 2]} fov={40} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <SkillBox 
            text={skill} 
            color={color} 
            wobble={wobble} 
            speed={speed}
          />
          
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.5}
            enableDamping
            dampingFactor={0.1}
            autoRotate
            autoRotateSpeed={0.5 * speed}
          />
          
          <Environment preset="sunset" />
        </Canvas>
      </ModelLoader>
    </motion.div>
  );
};

export default SkillIcon3D; 