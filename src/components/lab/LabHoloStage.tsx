import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { useInView } from 'react-intersection-observer';
import * as THREE from 'three';

export interface LabHoloStageProps {
  mode: 'copilot' | 'pipeline' | 'guardrails';
  /** Copilot mode: number of active thought steps (0..4) */
  copilotStep?: number;
  /** Copilot mode: hovered architecture pillar index (0..3) */
  copilotPillar?: number | null;
  /** Pipeline mode: active execution stage (0..4) */
  pipelineStep?: number;
  /** Guardrails mode: live verdict */
  guardVerdict?: { blocked: boolean; risk: number; findingsCount: number } | null;
  /** Increment to replay threat/pass pulse */
  pulseNonce?: number;
  reducedMotion?: boolean;
}

const DUST_COUNT = 120;

/** Shared ambient orbital micro-particles */
const ChamberDust: React.FC<{ color: string; reducedMotion: boolean }> = ({ color, reducedMotion }) => {
  const ref = useRef<THREE.Points>(null);
  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      const r = 1.8 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.0;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({
      color,
      size: 0.036,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return { geo: g, mat: m };
  }, [color]);

  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat]
  );

  useFrame((_, dt) => {
    if (ref.current && !reducedMotion) {
      ref.current.rotation.y += dt * 0.06;
    }
  });

  return <points ref={ref} geometry={geo} material={mat} />;
};

// ═══════════════════════════════════════════════════════════════════════
// MODE 1: MULTI-AGENT LANGGRAPH TOPOLOGY (COPILOT)
// ═══════════════════════════════════════════════════════════════════════
const AGENT_NODES: { label: string; pos: [number, number, number]; color: string }[] = [
  { label: 'STATE_DAG', pos: [-2.05, 0.72, 0.5], color: '#f4b678' },
  { label: 'NL2SQL', pos: [2.05, 0.68, 0.4], color: '#a5b4fc' },
  { label: 'GUARDRAIL', pos: [-1.85, -0.78, -0.45], color: '#f5a3b7' },
  { label: 'EVALUATOR', pos: [1.9, -0.74, -0.5], color: '#7ee0c0' },
];

const CopilotScene: React.FC<{ step: number; activePillar: number | null; reducedMotion: boolean }> = ({
  step,
  activePillar,
  reducedMotion,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const pulseMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const nodeGroups = useRef<(THREE.Group | null)[]>([]);

  // Curved synaptic conduits from Supervisor (0,0,0) to each satellite node
  const conduits = useMemo(() => {
    const segsPerCurve = 18;
    const pts: number[] = [];
    const cols: number[] = [];
    const cCore = new THREE.Color('#fddbb4');

    AGENT_NODES.forEach((node, idx) => {
      const end = new THREE.Vector3(...node.pos);
      const mid = end.clone().multiplyScalar(0.5);
      mid.y += idx % 2 === 0 ? 0.55 : -0.42;
      mid.z += 0.35;
      const cNode = new THREE.Color(node.color);
      const prev = new THREE.Vector3();
      const curr = new THREE.Vector3();

      for (let s = 1; s <= segsPerCurve; s++) {
        const u = s / segsPerCurve;
        const inv = 1 - u;
        curr.set(
          2 * inv * u * mid.x + u * u * end.x,
          2 * inv * u * mid.y + u * u * end.y,
          2 * inv * u * mid.z + u * u * end.z
        );
        pts.push(prev.x, prev.y, prev.z, curr.x, curr.y, curr.z);
        const cm = cCore.clone().lerp(cNode, u);
        cols.push(cm.r, cm.g, cm.b, cm.r, cm.g, cm.b);
        prev.copy(curr);
      }
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.LineSegments(geo, mat);
  }, []);

  useEffect(
    () => () => {
      conduits.geometry.dispose();
      (conduits.material as THREE.Material).dispose();
    },
    [conduits]
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (rootRef.current && !reducedMotion) {
      rootRef.current.rotation.x += (state.pointer.y * 0.22 - rootRef.current.rotation.x) * Math.min(1, dt * 3);
      rootRef.current.rotation.y += (state.pointer.x * 0.28 - rootRef.current.rotation.y) * Math.min(1, dt * 3);
    }
    if (!reducedMotion) {
      if (coreRef.current) {
        coreRef.current.rotation.y = t * 0.65;
        coreRef.current.rotation.x = t * 0.35;
      }
      if (ringA.current) {
        ringA.current.rotation.z = t * 0.55;
        ringA.current.rotation.x = Math.PI / 3;
      }
      if (ringB.current) {
        ringB.current.rotation.y = -t * 0.45;
        ringB.current.rotation.x = -Math.PI / 3;
      }
    }

    AGENT_NODES.forEach((node, idx) => {
      const active = step > idx || activePillar === idx;
      const g = nodeGroups.current[idx];
      if (g) {
        const targetScale = activePillar === idx ? 1.38 : active ? 1.12 : 0.88;
        g.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        if (!reducedMotion) {
          g.position.y = node.pos[1] + Math.sin(t * 1.4 + idx * 1.6) * 0.08;
        }
      }

      const photon = pulseMeshes.current[idx];
      if (photon) {
        photon.visible = !reducedMotion && active;
        if (active) {
          const u = (t * (activePillar === idx ? 1.1 : 0.65) + idx * 0.25) % 1;
          const inv = 1 - u;
          const end = node.pos;
          const midX = end[0] * 0.5;
          const midY = end[1] * 0.5 + (idx % 2 === 0 ? 0.55 : -0.42);
          const midZ = end[2] * 0.5 + 0.35;
          photon.position.set(
            2 * inv * u * midX + u * u * end[0],
            2 * inv * u * midY + u * u * end[1],
            2 * inv * u * midZ + u * u * end[2]
          );
          photon.scale.setScalar(0.75 + 0.55 * Math.sin(u * Math.PI));
        }
      }
    });
  });

  return (
    <group ref={rootRef}>
      <ChamberDust color="#a5b4fc" reducedMotion={reducedMotion} />

      {/* Central Supervisor Core */}
      <group>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.42, 0]} />
          <meshBasicMaterial color="#f4b678" wireframe />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.2, 0]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh ref={ringA}>
          <torusGeometry args={[0.72, 0.012, 10, 64]} />
          <meshBasicMaterial color="#f4b678" transparent opacity={0.6} />
        </mesh>
        <mesh ref={ringB}>
          <torusGeometry args={[0.92, 0.008, 10, 64]} />
          <meshBasicMaterial color="#a5b4fc" transparent opacity={0.42} />
        </mesh>
        <Html center position={[0, -0.78, 0]} style={{ pointerEvents: 'none' }}>
          <span className="rounded-full border border-accent-300/40 bg-deep/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent-200 whitespace-nowrap">
            SUPERVISOR_CORE
          </span>
        </Html>
      </group>

      {/* Synaptic Conduits */}
      <primitive object={conduits} />

      {/* Travelling Signal Photons */}
      {AGENT_NODES.map((node, i) => (
        <mesh
          key={`sig-${i}`}
          ref={(el) => {
            pulseMeshes.current[i] = el;
          }}
          visible={false}
        >
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshBasicMaterial color={node.color} />
        </mesh>
      ))}

      {/* Specialized Sub-Agent Satellites */}
      {AGENT_NODES.map((node, i) => {
        const active = step > i || activePillar === i;
        return (
          <group
            key={node.label}
            ref={(el) => {
              nodeGroups.current[i] = el;
            }}
            position={node.pos}
          >
            <mesh>
              <octahedronGeometry args={[0.17, 0]} />
              <meshBasicMaterial color={node.color} wireframe={!active} transparent opacity={active ? 0.95 : 0.5} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.24, 0.27, 32]} />
              <meshBasicMaterial color={node.color} transparent opacity={active ? 0.78 : 0.22} side={THREE.DoubleSide} />
            </mesh>
            <Html center position={[0, 0.36, 0]} style={{ pointerEvents: 'none' }}>
              <span
                className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] tracking-wider whitespace-nowrap transition-all ${
                  activePillar === i
                    ? 'border-white/50 bg-raised/95 text-white shadow-lg'
                    : active
                      ? 'border-white/20 bg-deep/90 text-slate-200'
                      : 'border-white/5 bg-deep/65 text-slate-500'
                }`}
              >
                {node.label}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MODE 2: 4-STAGE NL-TO-SQL ACCELERATOR TUNNEL (PIPELINE)
// ═══════════════════════════════════════════════════════════════════════
const PIPELINE_GATES = [
  { label: '01 INTENT', x: -2.4, color: '#f4b678' },
  { label: '02 FAISS', x: -0.8, color: '#a5b4fc' },
  { label: '03 SQL_AST', x: 0.8, color: '#7ee0c0' },
  { label: '04 EXEC', x: 2.4, color: '#fbbf24' },
];

const PipelineScene: React.FC<{ step: number; reducedMotion: boolean }> = ({ step, reducedMotion }) => {
  const rootRef = useRef<THREE.Group>(null);
  const gateRefs = useRef<(THREE.Mesh | null)[]>([]);
  const runnerRef = useRef<THREE.Group>(null);
  const runnerX = useRef(-3.2);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (rootRef.current && !reducedMotion) {
      rootRef.current.rotation.x += (0.12 + state.pointer.y * 0.16 - rootRef.current.rotation.x) * Math.min(1, dt * 3);
      rootRef.current.rotation.y += (-0.22 + state.pointer.x * 0.22 - rootRef.current.rotation.y) * Math.min(1, dt * 3);
    }
    PIPELINE_GATES.forEach((_, idx) => {
      const m = gateRefs.current[idx];
      if (!m || reducedMotion) return;
      const lit = step >= idx + 1;
      m.rotation.z += dt * (lit ? 1.55 : 0.35) * (idx % 2 === 0 ? 1 : -1);
      const targetS = lit ? 1.08 + Math.sin(t * 4 + idx) * 0.03 : 0.92;
      m.scale.lerp(new THREE.Vector3(targetS, targetS, targetS), 0.12);
    });

    if (runnerRef.current) {
      const targetX = step === 0 ? -3.1 : PIPELINE_GATES[Math.min(3, step - 1)].x;
      runnerX.current += (targetX - runnerX.current) * (reducedMotion ? 1 : Math.min(1, dt * 5));
      runnerRef.current.position.x = runnerX.current;
      runnerRef.current.rotation.x = t * 2.4;
      runnerRef.current.rotation.y = t * 1.8;
    }
  });

  return (
    <group ref={rootRef} rotation={[0.12, -0.22, 0]}>
      <ChamberDust color="#7ee0c0" reducedMotion={reducedMotion} />

      {/* Central Quantum Rail */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 6.2, 8]} />
        <meshBasicMaterial color="#a5b4fc" transparent opacity={0.35} />
      </mesh>

      {/* Active Plasma Progress Spine */}
      {step > 0 && (
        <mesh position={[(-3.1 + PIPELINE_GATES[Math.min(3, step - 1)].x) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.026, 0.026, Math.max(0.2, PIPELINE_GATES[Math.min(3, step - 1)].x + 3.1), 10]} />
          <meshBasicMaterial color="#fddbb4" transparent opacity={0.85} />
        </mesh>
      )}

      {/* Travelling Query Core */}
      <group ref={runnerRef} position={[-3.1, 0, 0]}>
        <mesh>
          <octahedronGeometry args={[0.16, 0]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshBasicMaterial color="#f4b678" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>

      {/* Four Toroidal Aperture Gates */}
      {PIPELINE_GATES.map((g, i) => {
        const lit = step >= i + 1;
        return (
          <group key={g.label} position={[g.x, 0, 0]}>
            <mesh
              ref={(el) => {
                gateRefs.current[i] = el;
              }}
              rotation={[0, Math.PI / 2, 0]}
            >
              <torusGeometry args={[0.78, lit ? 0.032 : 0.018, 12, 48]} />
              <meshBasicMaterial color={lit ? g.color : '#64748b'} transparent opacity={lit ? 0.95 : 0.35} />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <ringGeometry args={[0.56, 0.59, 6]} />
              <meshBasicMaterial
                color={lit ? g.color : '#94a3b8'}
                transparent
                opacity={lit ? 0.65 : 0.14}
                side={THREE.DoubleSide}
              />
            </mesh>
            <Html center position={[0, -1.08, 0]} style={{ pointerEvents: 'none' }}>
              <span
                className={`rounded-md border px-2 py-0.5 font-mono text-[9px] tracking-wider whitespace-nowrap ${
                  lit
                    ? 'border-white/25 bg-deep/92 text-slate-100 shadow-md'
                    : 'border-white/5 bg-deep/65 text-slate-500'
                }`}
              >
                {g.label}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MODE 3: ADVERSARIAL CONTAINMENT DOME (GUARDRAILS)
// ═══════════════════════════════════════════════════════════════════════
const THREAT_DIRS: [number, number, number][] = [
  [-2.6, 0.85, 0.7],
  [2.5, 0.95, -0.5],
  [-2.2, -0.9, -0.8],
  [2.4, -0.75, 0.65],
];

const GuardrailScene: React.FC<{
  verdict: { blocked: boolean; risk: number; findingsCount: number } | null;
  pulseNonce: number;
  reducedMotion: boolean;
}> = ({ verdict, pulseNonce, reducedMotion }) => {
  const outerDome = useRef<THREE.Mesh>(null);
  const innerDome = useRef<THREE.Mesh>(null);
  const scanner = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const projectiles = useRef<(THREE.Mesh | null)[]>([]);
  const flare = useRef(0);
  const lastNonce = useRef(pulseNonce);

  useEffect(() => {
    if (pulseNonce !== lastNonce.current) {
      lastNonce.current = pulseNonce;
      flare.current = 1;
    }
  }, [pulseNonce]);

  const blocked = verdict?.blocked ?? false;
  const safe = verdict !== null && !verdict.blocked;
  const shieldColor = blocked ? '#fb7185' : safe ? '#34d399' : '#a5b4fc';

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    flare.current = Math.max(0, flare.current - dt * 1.2);

    if (!reducedMotion) {
      const spinMult = blocked ? 2.2 : safe ? 0.8 : 1.0;
      if (outerDome.current) {
        outerDome.current.rotation.y += dt * 0.25 * spinMult;
        outerDome.current.rotation.x = Math.sin(t * 0.4) * 0.18;
        const s = 1 + flare.current * 0.14;
        outerDome.current.scale.setScalar(s);
      }
      if (innerDome.current) {
        innerDome.current.rotation.y -= dt * 0.4 * spinMult;
        innerDome.current.rotation.z += dt * 0.18;
      }
      if (scanner.current) {
        scanner.current.rotation.z = t * 1.1;
        scanner.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.8) * 0.35;
      }
      if (core.current) {
        core.current.rotation.y = -t * 0.9;
        core.current.rotation.x = t * 0.6;
      }
    }

    // Threat projectiles strike and deflect off radius ~1.35 when blocked; pass cleanly when safe
    THREAT_DIRS.forEach((dir, i) => {
      const p = projectiles.current[i];
      if (!p) return;
      if (reducedMotion || verdict === null) {
        p.visible = false;
        return;
      }
      p.visible = true;
      const cycle = (t * 0.95 + i * 0.24) % 1;
      if (blocked) {
        // Approach shield boundary (0..0.55) then sharply deflect outward (0.55..1)
        const k = cycle < 0.55 ? 1 - (cycle / 0.55) * 0.52 : 0.48 + ((cycle - 0.55) / 0.45) * 0.85;
        const scatter = cycle >= 0.55 ? (cycle - 0.55) * 1.6 : 0;
        p.position.set(dir[0] * k + scatter * (i % 2 ? 0.6 : -0.6), dir[1] * k + scatter * 0.8, dir[2] * k);
        p.scale.setScalar(cycle < 0.55 ? 1 : Math.max(0.05, 1 - (cycle - 0.55) * 2.1));
      } else {
        // Benign green streams glide gently into the core
        const k = 1 - cycle;
        p.position.set(dir[0] * k * 0.9, dir[1] * k * 0.9, dir[2] * k * 0.9);
        p.scale.setScalar(Math.sin(cycle * Math.PI) * 0.9);
      }
    });
  });

  return (
    <group>
      <ChamberDust color={shieldColor} reducedMotion={reducedMotion} />

      {/* Protected Golden LLM Core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.36, 1]} />
        <meshBasicMaterial color="#f4b678" wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshBasicMaterial color="#fff7ee" />
      </mesh>

      {/* Dual-Shell Geodesic Defense Barrier */}
      <mesh ref={outerDome}>
        <icosahedronGeometry args={[1.38, 1]} />
        <meshBasicMaterial color={shieldColor} wireframe transparent opacity={blocked ? 0.65 : 0.34} />
      </mesh>
      <mesh ref={innerDome}>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshBasicMaterial color={shieldColor} wireframe transparent opacity={blocked ? 0.42 : 0.2} />
      </mesh>

      {/* Orbital Threat Scanner Ring */}
      <mesh ref={scanner}>
        <torusGeometry args={[1.68, 0.015, 10, 80]} />
        <meshBasicMaterial color={shieldColor} transparent opacity={0.68} />
      </mesh>

      {/* Inbound Threat / Benign Vectors */}
      {THREAT_DIRS.map((_, i) => (
        <mesh
          key={`proj-${i}`}
          ref={(el) => {
            projectiles.current[i] = el;
          }}
          visible={false}
        >
          <octahedronGeometry args={[0.095, 0]} />
          <meshBasicMaterial color={blocked ? '#fb7185' : '#34d399'} />
        </mesh>
      ))}

      <Html center position={[0, -1.78, 0]} style={{ pointerEvents: 'none' }}>
        <span
          className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] whitespace-nowrap ${
            blocked
              ? 'border-rose-400/50 bg-rose-950/80 text-rose-200'
              : safe
                ? 'border-emerald-400/45 bg-emerald-950/75 text-emerald-200'
                : 'border-white/15 bg-deep/85 text-slate-300'
          }`}
        >
          {blocked
            ? `SHIELD ENGAGED · RISK ${(verdict?.risk ?? 0).toFixed(2)}`
            : safe
              ? 'PERIMETER CLEAR · PASS'
              : 'CONTAINMENT DOME · STANDBY'}
        </span>
      </Html>
    </group>
  );
};

const MODE_META = {
  copilot: { tag: '3D LANGGRAPH STATE TOPOLOGY', accent: 'text-accent-300', dot: 'bg-accent-400' },
  pipeline: { tag: '3D NL-TO-SQL QUANTUM PIPELINE', accent: 'text-indigo-300', dot: 'bg-indigo-400' },
  guardrails: { tag: '3D ADVERSARIAL DEFENSE DOME', accent: 'text-rose-300', dot: 'bg-rose-400' },
} as const;

const LabHoloStage: React.FC<LabHoloStageProps> = ({
  mode,
  copilotStep = 4,
  copilotPillar = null,
  pipelineStep = 0,
  guardVerdict = null,
  pulseNonce = 0,
  reducedMotion = false,
}) => {
  const { ref, inView } = useInView({ rootMargin: '140px' });
  const meta = MODE_META[mode];

  return (
    <div
      ref={ref}
      data-cursor="Orbit"
      className="relative h-56 w-full overflow-hidden rounded-2xl border border-white/[0.1] bg-deep/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:h-64"
    >
      {/* Subtle holographic HUD grid & scanlines */}
      <div aria-hidden="true" className="lab-chamber-grid pointer-events-none absolute inset-0 opacity-45" />
      <div aria-hidden="true" className="lab-scanlines pointer-events-none absolute inset-0 opacity-50" />

      {/* Top HUD corner readouts */}
      <div className="pointer-events-none absolute inset-x-3.5 top-3 z-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em]">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-deep/75 px-2.5 py-1 text-slate-300 backdrop-blur-sm">
          <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${meta.dot}`} />
          <span>{meta.tag}</span>
        </span>
        <span className="hidden rounded-full border border-white/10 bg-deep/70 px-2.5 py-1 text-slate-400 sm:inline-block">
          Drag to orbit · Live synced
        </span>
      </div>

      {/* Corner Targeting Brackets */}
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 left-2.5 h-3 w-3 border-b border-l border-accent-300/45" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 right-2.5 h-3 w-3 border-b border-r border-accent-300/45" />

      <Canvas
        camera={{ position: [0, 0.55, mode === 'pipeline' ? 6.4 : 5.4], fov: 44 }}
        dpr={[1, 1.5]}
        frameloop={inView ? 'always' : 'never'}
        resize={{ scroll: false, offsetSize: true }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {mode === 'copilot' && (
          <CopilotScene step={copilotStep} activePillar={copilotPillar} reducedMotion={reducedMotion} />
        )}
        {mode === 'pipeline' && <PipelineScene step={pipelineStep} reducedMotion={reducedMotion} />}
        {mode === 'guardrails' && (
          <GuardrailScene verdict={guardVerdict} pulseNonce={pulseNonce} reducedMotion={reducedMotion} />
        )}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.5}
          autoRotate={!reducedMotion && mode !== 'pipeline'}
          autoRotateSpeed={mode === 'guardrails' && guardVerdict?.blocked ? 1.4 : 0.45}
        />
      </Canvas>
    </div>
  );
};

export default LabHoloStage;
