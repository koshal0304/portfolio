import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { useInView } from 'react-intersection-observer';
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
  /** Optional point index highlighted from the external evidence list. */
  activeHit?: number | null;
  /** Notify external UI when a 3D node is hovered. */
  onHoverPoint?: (index: number | null) => void;
  /** Increments on each new query to fire an expanding shockwave ring. */
  queryNonce?: number;
  reducedMotion?: boolean;
}

const MAX_BEAMS = 6;
const ARC_STEPS = 16;
const ORIGIN = new THREE.Vector3();
const AMBIENT_COUNT = 160;

/**
 * Interactive 3D Orbital Vector Observatory:
 * - Precision counter-precessing gyroscope rings + geodesic manifold
 * - Ambient latent particle dust
 * - Curved 3D Bezier energy conduits from the Query Probe to Top-K matches
 * - Travelling photon packets pulsing along each match beam
 * - Volumetric expanding shockwave whenever a new query executes
 * - Bidirectional hover sync with the evidence list + OrbitControls
 */
const Scene: React.FC<EmbeddingSpace3DProps> = ({
  points,
  query,
  hits,
  activeHit = null,
  onHoverPoint,
  queryNonce = 0,
  reducedMotion = false,
}) => {
  const group = useRef<THREE.Group>(null);
  const gyroA = useRef<THREE.Mesh>(null);
  const gyroB = useRef<THREE.Mesh>(null);
  const coreLattice = useRef<THREE.Mesh>(null);
  const probe = useRef<THREE.Group>(null);
  const probeCore = useRef<THREE.Mesh>(null);
  const haloA = useRef<THREE.Mesh>(null);
  const haloB = useRef<THREE.Mesh>(null);
  const shockwave = useRef<THREE.Mesh>(null);
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  const [hovered, setHovered] = useState<number | null>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const shockProgress = useRef(1);
  const lastNonce = useRef(queryNonce);

  useEffect(() => {
    if (queryNonce !== lastNonce.current) {
      lastNonce.current = queryNonce;
      shockProgress.current = 0;
    }
  }, [queryNonce]);

  // Curved quadratic beams from query probe → top-K evidence nodes (updated in-place per frame)
  const beams = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const totalSegs = MAX_BEAMS * ARC_STEPS;
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(totalSegs * 6), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(totalSegs * 6), 3));
    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.LineSegments(geo, mat);
  }, []);

  // Subtle ambient starfield inside the embedding chamber
  const dust = useMemo(() => {
    const pos = new Float32Array(AMBIENT_COUNT * 3);
    for (let i = 0; i < AMBIENT_COUNT; i++) {
      const r = 1.6 + Math.random() * 1.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: '#c7d2fe',
      size: 0.032,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return { geo, mat };
  }, []);

  useEffect(
    () => () => {
      beams.geometry.dispose();
      (beams.material as THREE.Material).dispose();
      dust.geo.dispose();
      dust.mat.dispose();
    },
    [beams, dust]
  );

  // Reusable scratch vectors (zero per-frame GC allocations)
  const vStart = useMemo(() => new THREE.Vector3(), []);
  const vEnd = useMemo(() => new THREE.Vector3(), []);
  const vMid = useMemo(() => new THREE.Vector3(), []);
  const vPrev = useMemo(() => new THREE.Vector3(), []);
  const vCurr = useMemo(() => new THREE.Vector3(), []);
  const cGold = useMemo(() => new THREE.Color('#fddbb4'), []);
  const cMint = useMemo(() => new THREE.Color('#7ee0c0'), []);
  const cActive = useMemo(() => new THREE.Color('#ffffff'), []);
  const cMix = useMemo(() => new THREE.Color(), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = probe.current;
    if (!p) return;

    // Counter-precessing orbital gyroscope rings
    if (!reducedMotion) {
      if (gyroA.current) {
        gyroA.current.rotation.z = t * 0.22;
        gyroA.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.3) * 0.14;
      }
      if (gyroB.current) {
        gyroB.current.rotation.y = -t * 0.18;
        gyroB.current.rotation.x = -Math.PI / 4 + Math.cos(t * 0.25) * 0.12;
      }
      if (coreLattice.current) {
        coreLattice.current.rotation.y = -t * 0.07;
        coreLattice.current.rotation.x = t * 0.04;
      }
    }

    // Smoothly glide query probe into latent coordinate
    p.position.lerp(query ? target.set(...query) : ORIGIN, reducedMotion ? 1 : 1 - Math.exp(-dt * 4.5));
    if (probeCore.current && !reducedMotion) {
      probeCore.current.rotation.y = t * 1.4;
      probeCore.current.rotation.x = t * 0.9;
    }
    if (haloA.current) {
      haloA.current.rotation.z = t * 0.9;
      haloA.current.scale.setScalar(1 + Math.sin(t * 3.2) * 0.12);
    }
    if (haloB.current) {
      haloB.current.rotation.x = Math.PI / 2;
      haloB.current.rotation.y = -t * 1.1;
    }

    // Expanding shockwave ring on query execution
    if (shockwave.current) {
      if (shockProgress.current < 1 && !reducedMotion) {
        shockProgress.current = Math.min(1, shockProgress.current + dt * 1.15);
        const k = 1 - Math.pow(1 - shockProgress.current, 3);
        shockwave.current.visible = true;
        shockwave.current.scale.setScalar(0.25 + k * 2.2);
        shockwave.current.lookAt(state.camera.position);
        const mat = shockwave.current.material as THREE.MeshBasicMaterial;
        mat.opacity = (1 - shockProgress.current) * 0.72;
      } else {
        shockwave.current.visible = false;
      }
    }

    // Update curved quadratic energy splines + travelling photons
    const posAttr = beams.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = beams.geometry.getAttribute('color') as THREE.BufferAttribute;
    const n = query ? Math.min(hits.length, MAX_BEAMS) : 0;
    let segCursor = 0;

    vStart.copy(p.position);
    for (let i = 0; i < MAX_BEAMS; i++) {
      const photon = pulseRefs.current[i];
      if (i >= n) {
        if (photon) photon.visible = false;
        continue;
      }
      const ptIdx = hits[i];
      const pt = points[ptIdx];
      if (!pt) {
        if (photon) photon.visible = false;
        continue;
      }
      vEnd.set(...pt.pos);
      const dist = vStart.distanceTo(vEnd);
      // Elevate midpoint gracefully outward for a 3D orbital arc
      vMid
        .copy(vStart)
        .add(vEnd)
        .multiplyScalar(0.5);
      const bend = Math.min(0.75, dist * 0.28);
      vMid.y += bend * (i % 2 === 0 ? 1 : -0.65);
      vMid.z += bend * 0.4;

      const isFocused = activeHit === ptIdx || hovered === ptIdx || i === 0;
      const baseColor = isFocused ? cActive : i % 2 === 0 ? cGold : cMint;

      vPrev.copy(vStart);
      for (let s = 1; s <= ARC_STEPS; s++) {
        const u = s / ARC_STEPS;
        const inv = 1 - u;
        vCurr.set(
          inv * inv * vStart.x + 2 * inv * u * vMid.x + u * u * vEnd.x,
          inv * inv * vStart.y + 2 * inv * u * vMid.y + u * u * vEnd.y,
          inv * inv * vStart.z + 2 * inv * u * vMid.z + u * u * vEnd.z
        );

        const idx = segCursor * 2;
        posAttr.setXYZ(idx, vPrev.x, vPrev.y, vPrev.z);
        posAttr.setXYZ(idx + 1, vCurr.x, vCurr.y, vCurr.z);

        const intensity = (isFocused ? 1 : 0.48) * (0.45 + 0.55 * Math.sin(u * Math.PI));
        cMix.copy(baseColor).multiplyScalar(intensity);
        colAttr.setXYZ(idx, cMix.r, cMix.g, cMix.b);
        colAttr.setXYZ(idx + 1, cMix.r, cMix.g, cMix.b);

        vPrev.copy(vCurr);
        segCursor++;
      }

      // Travelling photon packet gliding along the arc
      if (photon) {
        photon.visible = !reducedMotion;
        const u = (t * (0.55 + i * 0.08) + i * 0.27) % 1;
        const inv = 1 - u;
        photon.position.set(
          inv * inv * vStart.x + 2 * inv * u * vMid.x + u * u * vEnd.x,
          inv * inv * vStart.y + 2 * inv * u * vMid.y + u * u * vEnd.y,
          inv * inv * vStart.z + 2 * inv * u * vMid.z + u * u * vEnd.z
        );
        const s = (isFocused ? 1.25 : 0.8) * Math.sin(u * Math.PI);
        photon.scale.setScalar(Math.max(0.01, s));
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    beams.geometry.setDrawRange(0, segCursor * 2);
  });

  const rank = useMemo(() => new Map(hits.map((h, i) => [h, i])), [hits]);

  return (
    <group ref={group}>
      {/* Geodesic latent manifold core */}
      <mesh ref={coreLattice}>
        <icosahedronGeometry args={[2.35, 2]} />
        <meshBasicMaterial color="#a5b4fc" wireframe transparent opacity={0.055} />
      </mesh>

      {/* Precision counter-precessing orbital gyroscope rings */}
      <mesh ref={gyroA}>
        <torusGeometry args={[2.55, 0.009, 10, 96]} />
        <meshBasicMaterial color="#f4b678" transparent opacity={0.32} />
      </mesh>
      <mesh ref={gyroB}>
        <torusGeometry args={[2.82, 0.007, 10, 96]} />
        <meshBasicMaterial color="#7ee0c0" transparent opacity={0.22} />
      </mesh>

      {/* Ambient latent starfield */}
      <points geometry={dust.geo} material={dust.mat} />

      {/* Curved energy beams */}
      <primitive object={beams} />

      {/* Travelling photons along top-K arcs */}
      {Array.from({ length: MAX_BEAMS }).map((_, i) => (
        <mesh
          key={`photon-${i}`}
          ref={(el) => {
            pulseRefs.current[i] = el;
          }}
          visible={false}
        >
          <sphereGeometry args={[0.048, 10, 10]} />
          <meshBasicMaterial color={i === 0 ? '#ffffff' : '#fddbb4'} />
        </mesh>
      ))}

      {/* Evidence vectors in PCA-3D latent space */}
      {points.map((pt, i) => {
        const r = rank.get(i);
        const isHit = r !== undefined;
        const isFocused = hovered === i || activeHit === i;
        const radius = isFocused ? 0.12 : isHit ? (r === 0 ? 0.105 : 0.085) : 0.048;

        return (
          <group key={i} position={pt.pos}>
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(i);
                onHoverPoint?.(i);
              }}
              onPointerOut={() => {
                setHovered((h) => (h === i ? null : h));
                onHoverPoint?.(null);
              }}
            >
              <sphereGeometry args={[radius, 16, 16]} />
              <meshBasicMaterial
                color={isFocused ? '#ffffff' : pt.color}
                transparent
                opacity={isFocused || isHit || !query ? 1 : 0.28}
              />
            </mesh>

            {/* Orbital highlight ring on matched or focused vectors */}
            {(isHit || isFocused) && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius + 0.045, radius + 0.072, 28]} />
                <meshBasicMaterial
                  color={isFocused ? '#ffffff' : pt.color}
                  transparent
                  opacity={isFocused ? 0.9 : 0.5}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {(isFocused || (hovered === null && activeHit === null && r === 0)) && (
              <Html center position={[0, 0.26, 0]} style={{ pointerEvents: 'none' }}>
                <div className="flex items-center gap-1.5 rounded-lg border border-accent-300/35 bg-deep/92 px-2.5 py-1 font-mono text-[10px] text-slate-100 whitespace-nowrap shadow-[0_12px_28px_-6px_rgba(0,0,0,0.85)] backdrop-blur-md">
                  {isHit && <span className="font-semibold text-accent-300">#{r + 1}</span>}
                  <span>{pt.label}</span>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Crystalline Query Probe + Dual Orbital Halos + Shockwave */}
      <group ref={probe} visible={!!query}>
        <mesh ref={probeCore}>
          <octahedronGeometry args={[0.125, 0]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh ref={haloA}>
          <ringGeometry args={[0.18, 0.215, 40]} />
          <meshBasicMaterial color="#f4b678" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={haloB}>
          <ringGeometry args={[0.25, 0.275, 40]} />
          <meshBasicMaterial color="#7ee0c0" transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={shockwave} visible={false}>
          <ringGeometry args={[0.42, 0.46, 48]} />
          <meshBasicMaterial
            color="#fddbb4"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};

const EmbeddingSpace3D: React.FC<EmbeddingSpace3DProps> = (props) => {
  const { ref, inView } = useInView({ rootMargin: '160px' });
  return (
    <div ref={ref} data-cursor="Orbit" className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0.6, 7.2], fov: 44 }}
        dpr={[1, 1.5]}
        frameloop={inView ? 'always' : 'never'}
        resize={{ scroll: false, offsetSize: true }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Scene {...props} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.55}
          autoRotate={!props.reducedMotion}
          autoRotateSpeed={0.55}
        />
      </Canvas>
    </div>
  );
};

export default EmbeddingSpace3D;
