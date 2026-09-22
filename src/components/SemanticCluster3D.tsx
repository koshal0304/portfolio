import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface EmbeddingPoint {
  position: THREE.Vector3;
  cluster: number;
  label: string;
  simScore: number;
}

const CLUSTERS = [
  { name: 'CLIP Visual Embeddings', color: '#38bdf8' },
  { name: 'Natural Language Queries', color: '#818cf8' },
  { name: 'FAISS Nearest Top-K', color: '#34d399' },
];

const VectorSpace: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Generate synthetic semantic embeddings in 3D
  const { points, queryPoint, neighborIndices, neighborLines } = useMemo(() => {
    const pts: EmbeddingPoint[] = [];
    const count = 90;

    // Cluster centers
    const c1 = new THREE.Vector3(-1.2, 0.6, -0.4);
    const c2 = new THREE.Vector3(1.1, -0.5, 0.3);
    const c3 = new THREE.Vector3(0.1, 0.8, 0.8);

    for (let i = 0; i < count; i++) {
      const cluster = i % 3;
      const center = cluster === 0 ? c1 : cluster === 1 ? c2 : c3;
      const r = Math.pow(Math.random(), 1.5) * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      const pos = new THREE.Vector3(
        center.x + r * Math.cos(theta) * Math.cos(phi),
        center.y + r * Math.sin(phi),
        center.z + r * Math.sin(theta) * Math.cos(phi)
      );

      const sim = Number((0.72 + Math.random() * 0.26).toFixed(3));
      pts.push({
        position: pos,
        cluster,
        label: `Vector #${1042 + i}`,
        simScore: sim,
      });
    }

    // A central query point
    const qPoint = new THREE.Vector3(0.2, 0.4, 0.2);

    // Compute 4 closest neighbors to query point
    const sorted = pts
      .map((p, idx) => ({ idx, dist: p.position.distanceTo(qPoint) }))
      .sort((a, b) => a.dist - b.dist);
    const nearest = sorted.slice(0, 5).map((s) => s.idx);

    // Create line geometries from query to nearest
    const lines: THREE.BufferGeometry[] = [];
    nearest.forEach((nIdx) => {
      const geom = new THREE.BufferGeometry().setFromPoints([qPoint, pts[nIdx].position]);
      lines.push(geom);
    });

    return { points: pts, queryPoint: qPoint, neighborIndices: nearest, neighborLines: lines };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Bounding sphere wireframe for latent manifold */}
      <mesh>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.06}
        />
      </mesh>

      {/* Query Probe Vector Node */}
      <mesh position={queryPoint}>
        <sphereGeometry args={[0.08, 20, 20]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#38bdf8"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Query Pulse Halo */}
      <mesh position={queryPoint}>
        <ringGeometry args={[0.12, 0.15, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Nearest Neighbor Search Rays */}
      {neighborLines.map((lineGeo, idx) => (
        <line key={idx} geometry={lineGeo}>
          <lineDashedMaterial
            color="#34d399"
            dashSize={0.1}
            gapSize={0.05}
            transparent
            opacity={0.5}
            linewidth={1}
          />
        </line>
      ))}

      {/* Embedding Points */}
      {points.map((pt, i) => {
        const isNeighbor = neighborIndices.includes(i);
        const color = isNeighbor ? '#34d399' : CLUSTERS[pt.cluster].color;
        const size = isNeighbor ? 0.065 : 0.04;

        return (
          <group key={i} position={pt.position}>
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredIdx(i);
              }}
              onPointerOut={() => setHoveredIdx(null)}
            >
              <sphereGeometry args={[size, 12, 12]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isNeighbor ? 0.9 : 0.4}
                roughness={0.3}
                metalness={0.7}
              />
            </mesh>

            {/* Hover Tooltip */}
            {hoveredIdx === i && (
              <Html distanceFactor={8} position={[0, 0.2, 0]} center>
                <div className="px-2 py-1 rounded bg-[#0c1017]/95 border border-white/20 text-[10px] font-mono text-slate-200 shadow-xl whitespace-nowrap pointer-events-none">
                  <span className="text-sky-400 font-bold">{pt.label}</span>
                  <div className="text-emerald-400">Cosine: {pt.simScore}</div>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Floating Query Label */}
      <Html position={[queryPoint.x, queryPoint.y + 0.22, queryPoint.z]} center distanceFactor={8}>
        <div className="px-2 py-0.5 rounded-full bg-[#0c1017]/90 border border-sky-400/40 text-[9px] font-mono text-sky-200 tracking-wider whitespace-nowrap shadow-lg pointer-events-none">
          QUERY_VECTOR (CLIP)
        </div>
      </Html>
    </group>
  );
};

interface SemanticCluster3DProps {
  className?: string;
}

const SemanticCluster3D: React.FC<SemanticCluster3DProps> = ({ className = '' }) => {
  return (
    <div className={`relative rounded-xl overflow-hidden glass-panel border border-white/[0.08] ${className}`}>
      {/* Top Header Tag */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0c1017]/80 border border-white/10 backdrop-blur pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
        <span className="font-mono text-[10px] text-slate-300 tracking-wider uppercase">
          3D FAISS Latent Cluster
        </span>
      </div>

      {/* Bottom Metrics Pill */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-3 px-3 py-1 rounded-full bg-[#0c1017]/80 border border-white/10 backdrop-blur pointer-events-none">
        <span className="font-mono text-[10px] text-slate-400">
          Metric: <span className="text-sky-300 font-medium">IndexFlatIP</span>
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          Recall: <span className="text-emerald-300 font-medium">0.81</span>
        </span>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-full min-h-[220px]">
        <Canvas camera={{ position: [0, 0, 5], fov: 42 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 4, 3]} intensity={1.2} color="#38bdf8" />
          <directionalLight position={[-4, -4, -3]} intensity={0.9} color="#a78bfa" />
          <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
            <VectorSpace />
          </Float>
        </Canvas>
      </div>
    </div>
  );
};

export default SemanticCluster3D;
