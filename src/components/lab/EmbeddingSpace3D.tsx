import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

type Vec3 = [number, number, number];

export interface SpacePoint {
  pos: Vec3;
  color: string;
  label: string;
}

interface EmbeddingSpace3DProps {
  points: SpacePoint[];
  query: Vec3 | null;
  /** Indices into `points`, best first. */
  hits: number[];
  reducedMotion?: boolean;
}

const MAX_BEAMS = 8;
const ORIGIN = new THREE.Vector3();

const Scene: React.FC<EmbeddingSpace3DProps> = ({ points, query, hits, reducedMotion }) => {
  const group = useRef<THREE.Group>(null);
  const probe = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const target = useMemo(() => new THREE.Vector3(), []);

  // One LineSegments for all query→hit beams, updated in place each frame so they track the moving probe.
  const beams = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_BEAMS * 6), 3));
    return new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({ color: '#7dd3fc', transparent: true, opacity: 0.85 })
    );
  }, []);
  useEffect(
    () => () => {
      beams.geometry.dispose();
      (beams.material as THREE.Material).dispose();
    },
    [beams]
  );

  useFrame((state, dt) => {
    const g = group.current;
    const p = probe.current;
    if (!g || !p) return;
    if (!reducedMotion) g.rotation.y += dt * 0.12;
    g.rotation.x += (state.pointer.y * 0.35 - g.rotation.x) * Math.min(1, dt * 3);

    p.position.lerp(query ? target.set(...query) : ORIGIN, reducedMotion ? 1 : 1 - Math.exp(-dt * 4));
    if (halo.current) halo.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.15);

    const attr = beams.geometry.getAttribute('position') as THREE.BufferAttribute;
    const n = query ? Math.min(hits.length, MAX_BEAMS) : 0;
    for (let i = 0; i < n; i++) {
      attr.setXYZ(i * 2, p.position.x, p.position.y, p.position.z);
      attr.setXYZ(i * 2 + 1, ...points[hits[i]].pos);
    }
    attr.needsUpdate = true;
    beams.geometry.setDrawRange(0, n * 2);
  });

  const rank = new Map(hits.map((h, i) => [h, i]));

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[2.4, 18, 18]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.05} />
      </mesh>

      <primitive object={beams} />

      {points.map((pt, i) => {
        const r = rank.get(i);
        const isHit = r !== undefined;
        return (
          <group key={i} position={pt.pos}>
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(i);
              }}
              onPointerOut={() => setHovered((h) => (h === i ? null : h))}
            >
              <sphereGeometry args={[isHit ? 0.09 : 0.055, 14, 14]} />
              <meshBasicMaterial color={pt.color} transparent opacity={isHit || !query ? 1 : 0.35} />
            </mesh>
            {(hovered === i || r === 0) && (
              <Html center position={[0, 0.22, 0]} style={{ pointerEvents: 'none' }}>
                <div className="px-2 py-1 rounded-md bg-[#0c1017]/95 border border-white/15 font-mono text-[10px] text-slate-200 whitespace-nowrap shadow-xl">
                  {isHit && <span className="text-sky-300 mr-1">#{r + 1}</span>}
                  {pt.label}
                </div>
              </Html>
            )}
          </group>
        );
      })}

      <group ref={probe} visible={!!query}>
        <mesh>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh ref={halo}>
          <ringGeometry args={[0.15, 0.18, 40]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

const EmbeddingSpace3D: React.FC<EmbeddingSpace3DProps> = (props) => (
  <Canvas camera={{ position: [0, 0, 7.6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
    <Scene {...props} />
  </Canvas>
);

export default EmbeddingSpace3D;
