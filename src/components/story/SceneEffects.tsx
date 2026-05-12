import React, { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { COLORS, ACHIEVEMENTS } from './constants';
import { createAchievementTexture, createLabelTexture } from './textures';

// ─── Orbiting Icons ────────────────────────────────────────────────
export interface IconsRefs {
  groups: THREE.Group[];
  container: THREE.Group;
}

export const OrbitingIcons = forwardRef<IconsRefs>((_, ref) => {
  const containerRef = useRef<THREE.Group>(null!);
  const g0 = useRef<THREE.Group>(null!);
  const g1 = useRef<THREE.Group>(null!);
  const g2 = useRef<THREE.Group>(null!);
  const g3 = useRef<THREE.Group>(null!);

  const cyanMat = useMemo(() => new THREE.MeshToonMaterial({ color: COLORS.cyan, flatShading: true }), []);
  const purpleMat = useMemo(() => new THREE.MeshToonMaterial({ color: COLORS.purple, flatShading: true }), []);

  const labels = useMemo(() => [
    createLabelTexture('AI / ML'),
    createLabelTexture('SQL Agent'),
    createLabelTexture('RAG'),
    createLabelTexture('Backend'),
  ], []);

  useImperativeHandle(ref, () => ({
    groups: [g0.current, g1.current, g2.current, g3.current],
    container: containerRef.current,
  }));

  return (
    <group ref={containerRef} scale={[0, 0, 0]}>
      {/* Icon 1 — Brain (AI/ML) */}
      <group ref={g0}>
        <mesh>
          <icosahedronGeometry args={[0.15, 1]} />
          <primitive object={cyanMat} attach="material" />
        </mesh>
        <sprite position={[0, -0.25, 0]} scale={[0.5, 0.2, 1]}>
          <spriteMaterial map={labels[0]} transparent />
        </sprite>
      </group>

      {/* Icon 2 — Database (SQL) */}
      <group ref={g1}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 12]} />
          <primitive object={purpleMat} attach="material" />
        </mesh>
        <sprite position={[0, -0.25, 0]} scale={[0.5, 0.2, 1]}>
          <spriteMaterial map={labels[1]} transparent />
        </sprite>
      </group>

      {/* Icon 3 — Document Stack (RAG) */}
      <group ref={g2}>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.18, 0.03, 0.22]} />
          <primitive object={cyanMat} attach="material" />
        </mesh>
        <mesh position={[0.02, 0, 0.01]}>
          <boxGeometry args={[0.18, 0.03, 0.22]} />
          <primitive object={cyanMat} attach="material" />
        </mesh>
        <mesh position={[-0.02, -0.04, -0.01]}>
          <boxGeometry args={[0.18, 0.03, 0.22]} />
          <primitive object={cyanMat} attach="material" />
        </mesh>
        <sprite position={[0, -0.2, 0]} scale={[0.5, 0.2, 1]}>
          <spriteMaterial map={labels[2]} transparent />
        </sprite>
      </group>

      {/* Icon 4 — Gear (Backend) */}
      <group ref={g3}>
        <mesh>
          <torusGeometry args={[0.12, 0.04, 6, 8]} />
          <primitive object={purpleMat} attach="material" />
        </mesh>
        <sprite position={[0, -0.25, 0]} scale={[0.5, 0.2, 1]}>
          <spriteMaterial map={labels[3]} transparent />
        </sprite>
      </group>
    </group>
  );
});
OrbitingIcons.displayName = 'OrbitingIcons';

// ─── Achievement Sprites ───────────────────────────────────────────
export interface AchievementRefs {
  sprites: THREE.Sprite[];
}

export const AchievementSprites = forwardRef<AchievementRefs>((_, ref) => {
  const s0 = useRef<THREE.Sprite>(null!);
  const s1 = useRef<THREE.Sprite>(null!);
  const s2 = useRef<THREE.Sprite>(null!);
  const s3 = useRef<THREE.Sprite>(null!);

  const textures = useMemo(
    () => ACHIEVEMENTS.map((a) => createAchievementTexture(a)),
    []
  );

  useImperativeHandle(ref, () => ({
    sprites: [s0.current, s1.current, s2.current, s3.current],
  }));

  return (
    <group>
      {ACHIEVEMENTS.map((_, i) => (
        <sprite
          key={i}
          ref={[s0, s1, s2, s3][i]}
          position={[0, 0, 0]}
          scale={[0, 0, 0]}
          visible={false}
        >
          <spriteMaterial map={textures[i]} transparent opacity={0} />
        </sprite>
      ))}
    </group>
  );
});
AchievementSprites.displayName = 'AchievementSprites';

// ─── Coffee Cup ────────────────────────────────────────────────────
export interface CoffeeRefs {
  group: THREE.Group;
}

export const CoffeeCup = forwardRef<CoffeeRefs>((_, ref) => {
  const groupRef = useRef<THREE.Group>(null!);
  const mugMat = useMemo(() => new THREE.MeshToonMaterial({ color: COLORS.hoodie, flatShading: true }), []);

  useImperativeHandle(ref, () => ({ group: groupRef.current }));

  return (
    <group ref={groupRef} position={[-0.8, -0.25, 0.3]} scale={[0, 0, 0]}>
      {/* Mug body */}
      <mesh>
        <cylinderGeometry args={[0.065, 0.055, 0.12, 12]} />
        <primitive object={mugMat} attach="material" />
      </mesh>
      {/* Handle */}
      <mesh position={[0.085, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.045, 0.015, 6, 8]} />
        <primitive object={mugMat} attach="material" />
      </mesh>
      {/* Steam particles (3 small spheres) */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i - 1) * 0.025, 0.1 + i * 0.03, 0]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshBasicMaterial color={COLORS.white} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
});
CoffeeCup.displayName = 'CoffeeCup';

// ─── Floating Desk ─────────────────────────────────────────────────
export interface DeskRefs {
  mesh: THREE.Mesh;
}

export const FloatingDesk = forwardRef<DeskRefs>((_, ref) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  useImperativeHandle(ref, () => ({ mesh: meshRef.current }));

  return (
    <mesh ref={meshRef} position={[0, -0.2, 0.3]}>
      <boxGeometry args={[1.0, 0.05, 0.6]} />
      <meshToonMaterial color={COLORS.laptopDark} flatShading transparent opacity={1} />
    </mesh>
  );
});
FloatingDesk.displayName = 'FloatingDesk';

// ─── Ambient Dust Particles ────────────────────────────────────────
const dustVertexShader = `
  uniform float uTime;
  attribute float aIndex;
  varying float vAlpha;
  void main() {
    float i = aIndex;
    vec3 pos = position;
    pos.x += sin(uTime * 0.2 + i * 0.3) * 0.3;
    pos.y += cos(uTime * 0.15 + i * 0.5) * 0.2;
    pos.z += sin(uTime * 0.1 + i * 0.7) * 0.2;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.5 * (100.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vAlpha = 0.15 + sin(uTime + i) * 0.05;
  }
`;

const dustFragmentShader = `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.15, d) * vAlpha;
    gl_FragColor = vec4(0.0, 0.83, 1.0, alpha);
  }
`;

interface AmbientDustProps {
  count: number;
}

export const AmbientDust: React.FC<AmbientDustProps> = ({ count }) => {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { positions, indices } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const idx = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      idx[i] = i;
    }
    return { positions: pos, indices: idx };
  }, [count]);

  // Expose matRef on the points for external time update
  const pointsRef = useRef<THREE.Points>(null!);

  return (
    <points ref={pointsRef} userData={{ matRef }}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aIndex" count={count} array={indices} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={dustVertexShader}
        fragmentShader={dustFragmentShader}
        transparent
        depthWrite={false}
        uniforms={{ uTime: { value: 0 } }}
      />
    </points>
  );
};
