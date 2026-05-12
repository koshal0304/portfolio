import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
    gl_PointSize = pulse * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vDistanceFromCenter = pos.y / 50.0;
    vAlpha = 0.7;
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
    vec3 purple = vec3(0.486, 0.227, 0.929);
    float mix_factor = clamp(vDistanceFromCenter + 0.5, 0.0, 1.0);
    vec3 color = mix(cyan, purple, mix_factor);

    gl_FragColor = vec4(color, alpha);
  }
`;

// ─── Line Material ─────────────────────────────────────────────────
const lineVertexShader = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lineFragmentShader = `
  void main() {
    gl_FragColor = vec4(0.0, 0.83, 1.0, 0.12);
  }
`;

// ─── Particle Network ──────────────────────────────────────────────
interface ParticleNetworkProps {
  scrollProgress: number;
  count: number;
}

const ParticleNetwork: React.FC<ParticleNetworkProps> = ({ scrollProgress, count }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, indices } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const idx = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
      idx[i] = i;
    }
    return { positions: pos, indices: idx };
  }, [count]);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // Pre-allocate max connections
    const maxLines = count * 3;
    const linePositions = new Float32Array(maxLines * 6);
    geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    geo.setDrawRange(0, 0);
    return geo;
  }, [count]);

  const lineMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uScrollProgress.value = scrollProgress;

    // Update connections - check every 3 frames for perf
    if (linesRef.current && Math.floor(clock.getElapsedTime() * 60) % 3 === 0) {
      const posAttr = linesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      let lineIdx = 0;
      const threshold = 8;
      const dispersal = 1 + scrollProgress * 0.5;
      const time = clock.getElapsedTime();

      // Sample subset for connections to avoid O(n²) cost
      const sampleSize = Math.min(count, 200);
      for (let i = 0; i < sampleSize; i++) {
        const ix = positions[i * 3] * dispersal + Math.sin(time * 0.3 + i * 0.1) * 0.5;
        const iy = positions[i * 3 + 1] * dispersal + Math.cos(time * 0.25 + i * 0.15) * 0.4;
        const iz = positions[i * 3 + 2] * dispersal + Math.sin(time * 0.2 + i * 0.05) * 0.3;

        for (let j = i + 1; j < sampleSize; j++) {
          const jx = positions[j * 3] * dispersal + Math.sin(time * 0.3 + j * 0.1) * 0.5;
          const jy = positions[j * 3 + 1] * dispersal + Math.cos(time * 0.25 + j * 0.15) * 0.4;
          const jz = positions[j * 3 + 2] * dispersal + Math.sin(time * 0.2 + j * 0.05) * 0.3;

          const dx = ix - jx;
          const dy = iy - jy;
          const dz = iz - jz;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < threshold && lineIdx < arr.length - 6) {
            arr[lineIdx++] = ix;
            arr[lineIdx++] = iy;
            arr[lineIdx++] = iz;
            arr[lineIdx++] = jx;
            arr[lineIdx++] = jy;
            arr[lineIdx++] = jz;
          }
        }
      }
      linesRef.current.geometry.setDrawRange(0, lineIdx / 3);
      posAttr.needsUpdate = true;
    }
  });

  return (
    <>
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
          uniforms={{
            uTime: { value: 0 },
            uScrollProgress: { value: 0 },
          }}
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeometry} material={lineMaterial} />
    </>
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
    targetX.current = mousePosition.x * 5;
    targetY.current = mousePosition.y * 3;

    camera.position.x += (targetX.current - camera.position.x) * 0.02;
    camera.position.y += (targetY.current - camera.position.y) * 0.02;
    camera.position.z = 50 - scrollProgress * 30;
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

  const particleCount = isMobile ? 600 : 2000;

  if (reducedMotion) {
    return (
      <div className="fixed inset-0 z-0" style={{ background: 'radial-gradient(ellipse at center, #111118 0%, #0a0a0f 100%)' }} />
    );
  }

  return (
    <div className="fixed inset-0 z-0">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <ambientLight intensity={0.1} />
        <ParticleNetwork scrollProgress={scrollProgress} count={particleCount} />
        <CameraController mousePosition={mousePosition} scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
};

export default HeroScene3D;