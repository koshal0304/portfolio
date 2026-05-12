import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// ─── Custom Shader Material ────────────────────────────────────────
const vertexShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  attribute float aIndex;
  varying float vDistanceFromCenter;
  varying float vAlpha;

  void main() {
    float idx = aIndex;
    float dispersal = 1.0 + uScrollProgress * 0.5;
    vec3 pos = position * dispersal;

    // Slow drift using sin/cos noise on position
    float drift = sin(uTime * 0.3 + idx * 0.1) * 0.5;
    float drift2 = cos(uTime * 0.25 + idx * 0.15) * 0.4;
    pos.x += drift;
    pos.y += drift2;
    pos.z += sin(uTime * 0.2 + idx * 0.05) * 0.3;

    // Pulse size
    float pulse = 1.0 + sin(uTime * 1.5 + idx) * 0.3;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = pulse * (150.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vDistanceFromCenter = pos.y / 50.0;
    vAlpha = 0.5;
  }
`;

const fragmentShader = `
  varying float vDistanceFromCenter;
  varying float vAlpha;

  void main() {
    // Circular point with soft edge
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.2, dist) * vAlpha;

    // Cyan to purple shift based on y-position
    vec3 cyan = vec3(0.0, 0.83, 1.0);
    vec3 pink = vec3(1.0, 0.16, 0.56);
    float mix_factor = clamp(vDistanceFromCenter + 0.5, 0.0, 1.0);
    vec3 color = mix(cyan, pink, mix_factor);

    gl_FragColor = vec4(color, alpha);
  }
`;

// ─── Particle Network ──────────────────────────────────────────────
interface ParticleNetworkProps {
  scrollProgress: number;
  count: number;
}

const ParticleNetwork: React.FC<ParticleNetworkProps> = ({ scrollProgress, count }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, indices } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const idx = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      idx[i] = i;
    }
    return { positions: pos, indices: idx };
  }, [count]);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uScrollProgress.value = scrollProgress;
    if (pointsRef.current) {
        pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aIndex"
          count={count}
          array={indices}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uScrollProgress: { value: 0 },
        }}
      />
    </points>
  );
};

// ─── Glass Orb ──────────────────────────────────────────────
const GlassOrb = ({ scrollProgress }: { scrollProgress: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock, pointer }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      
      // React to pointer
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, pointer.x * 2, 0.05);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, pointer.y * 2, 0.05);
      
      // Scale down slightly on scroll
      const scale = 1 - scrollProgress * 0.3;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#00d4ff"
          emissive="#7c3aed"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.8}
          distort={0.4}
          speed={3}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.8}
        />
      </Sphere>
    </Float>
  );
};

// ─── Camera Controller ─────────────────────────────────────────────
interface CameraControllerProps {
  mousePosition: { x: number; y: number };
  scrollProgress: number;
}

const CameraController: React.FC<CameraControllerProps> = ({ mousePosition, scrollProgress }) => {
  const { camera } = useThree();
  const targetX = useRef(0);
  const targetY = useRef(0);

  useFrame(() => {
    targetX.current = mousePosition.x * 3;
    targetY.current = mousePosition.y * 2;

    camera.position.x += (targetX.current - camera.position.x) * 0.02;
    camera.position.y += (targetY.current - camera.position.y) * 0.02;
    camera.position.z = 8 + scrollProgress * 20; // Adjusted for the new scale
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// ─── Main Scene Component ──────────────────────────────────────────
interface HeroScene3DProps {
  scrollProgress?: number;
}

const HeroScene3D: React.FC<HeroScene3DProps> = ({ scrollProgress = 0 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const particleCount = isMobile ? 800 : 3000;

  if (reducedMotion) {
    return (
      <div className="fixed inset-0 z-0 bg-background" />
    );
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas 
        dpr={[1, 1.5]} 
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 8], fov: 45 }}
      >
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#00d4ff" />
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#ff2a8f" />
        
        <GlassOrb scrollProgress={scrollProgress} />
        <ParticleNetwork scrollProgress={scrollProgress} count={particleCount} />
        <CameraController mousePosition={mousePosition} scrollProgress={scrollProgress} />
        
        <EffectComposer disableNormalPass multisampling={4}>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default HeroScene3D;