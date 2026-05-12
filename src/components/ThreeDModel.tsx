import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { motion } from 'framer-motion';

interface ModelProps {
  path: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  emissive?: string;
  metalness?: number;
  roughness?: number;
  interactive?: boolean;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

// Model component that handles the 3D object
const Model: React.FC<ModelProps> = ({ 
  path, 
  scale = 1, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  color = '#ffffff',
  emissive = '#000000',
  metalness = 0.5,
  roughness = 0.5,
  interactive = true,
  autoRotate = true,
  rotationSpeed = 0.005
}) => {
  const mesh = useRef<THREE.Object3D>(null);
  const gltf = useLoader(GLTFLoader, path);
  const scene = gltf.scene.clone();
  
  // Apply material properties to all meshes in the scene
  React.useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          emissive: new THREE.Color(emissive),
          metalness,
          roughness,
        });
      }
    });
  }, [scene, color, emissive, metalness, roughness]);

  // Handle auto-rotation
  useFrame(() => {
    if (mesh.current && autoRotate) {
      mesh.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <primitive
      ref={mesh}
      object={scene}
      position={position}
      rotation={rotation}
      scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
    />
  );
};

interface BoxProps {
  size?: number;
  position?: [number, number, number];
  color?: string;
  emissive?: string;
  metalness?: number;
  roughness?: number;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

// Simple Box component for fallback or basic shapes
const Box: React.FC<BoxProps> = ({ 
  size = 1, 
  position = [0, 0, 0], 
  color = '#ffffff',
  emissive = '#000000',
  metalness = 0.5,
  roughness = 0.5,
  autoRotate = true,
  rotationSpeed = 0.005
}) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const [clicked, setClick] = useState(false);

  useFrame(() => {
    if (mesh.current && autoRotate) {
      mesh.current.rotation.y += rotationSpeed;
      mesh.current.rotation.x += rotationSpeed * 0.5;
    }
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      scale={clicked ? 1.1 : 1}
      onClick={() => setClick(!clicked)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial 
        color={hovered ? '#2a6ed0' : color} 
        emissive={emissive}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  );
};

interface SphereProps {
  radius?: number;
  position?: [number, number, number];
  color?: string;
  emissive?: string;
  metalness?: number;
  roughness?: number;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

// Sphere component for planet-like objects
const Sphere: React.FC<SphereProps> = ({ 
  radius = 1, 
  position = [0, 0, 0], 
  color = '#ffffff',
  emissive = '#000000',
  metalness = 0.5,
  roughness = 0.5,
  autoRotate = true,
  rotationSpeed = 0.005
}) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame(() => {
    if (mesh.current && autoRotate) {
      mesh.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial 
        color={hovered ? '#2a6ed0' : color} 
        emissive={emissive}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  );
};

interface Text3DProps {
  text: string;
  position?: [number, number, number];
  color?: string;
  size?: number;
  height?: number;
  font?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

// Text component for 3D text using drei's Text
const Text3D: React.FC<Text3DProps> = ({ 
  text, 
  position = [0, 0, 0], 
  color = '#ffffff',
  size = 1,
  height = 0.2,
  font = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
  autoRotate = false,
  rotationSpeed = 0.005
}) => {
  const mesh = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (mesh.current && autoRotate) {
      mesh.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group ref={mesh} position={position}>
      <Text
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </group>
  );
};

interface ThreeDModelProps {
  modelPath?: string;
  modelType?: 'gltf' | 'box' | 'sphere' | 'text';
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  autoRotate?: boolean;
  interactive?: boolean;
  cameraPosition?: [number, number, number];
  text?: string;
  color?: string;
  emissive?: string;
  metalness?: number;
  roughness?: number;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  lightIntensity?: number;
  style?: React.CSSProperties;
  className?: string;
}

// Main component that sets up the 3D scene
const ThreeDModel: React.FC<ThreeDModelProps> = ({
  modelPath,
  modelType = 'gltf', // 'gltf', 'box', 'sphere', 'text'
  width = '100%',
  height = '300px',
  backgroundColor = 'transparent',
  autoRotate = true,
  interactive = true,
  cameraPosition = [0, 0, 5],
  text = '',
  color = '#ffffff',
  emissive = '#000000',
  metalness = 0.5,
  roughness = 0.5,
  scale = 1,
  position = [0, 0, 0],
  lightIntensity = 1,
  style = {},
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        width,
        height,
        backgroundColor,
        ...style
      }}
      className={`relative overflow-hidden ${className}`}
    >
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={cameraPosition} />
        {interactive && <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={lightIntensity} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -10]} intensity={lightIntensity * 0.5} />

        {modelType === 'gltf' && modelPath && (
          <Model 
            path={modelPath} 
            scale={scale} 
            position={position}
            color={color}
            emissive={emissive}
            metalness={metalness}
            roughness={roughness}
            autoRotate={autoRotate}
          />
        )}
        
        {modelType === 'box' && (
          <Box 
            size={typeof scale === 'number' ? scale : scale[0]} 
            position={position}
            color={color}
            emissive={emissive}
            metalness={metalness}
            roughness={roughness}
            autoRotate={autoRotate}
          />
        )}
        
        {modelType === 'sphere' && (
          <Sphere 
            radius={typeof scale === 'number' ? scale : scale[0]} 
            position={position}
            color={color}
            emissive={emissive}
            metalness={metalness}
            roughness={roughness}
            autoRotate={autoRotate}
          />
        )}
        
        {modelType === 'text' && text && (
          <Text3D 
            text={text} 
            position={position}
            color={color}
            size={typeof scale === 'number' ? scale : scale[0]}
            autoRotate={autoRotate}
          />
        )}

        <Environment preset="sunset" />
      </Canvas>
    </motion.div>
  );
};

export default ThreeDModel; 