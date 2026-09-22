import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

export type NeuralMode = 'attention' | 'langgraph' | 'latent';

// ─── Procedural Holographic Code Texture Generator ─────────────────
function createCodeCanvasTexture(lines: string[], title: string, accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark background with subtle gradient & border
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 256);
  bgGrad.addColorStop(0, 'rgba(10, 15, 25, 0.95)');
  bgGrad.addColorStop(1, 'rgba(5, 8, 16, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.roundRect(4, 4, 504, 248, 16);
  ctx.fill();

  // Neon glowing border
  ctx.lineWidth = 2;
  ctx.strokeStyle = accentColor;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 12;
  ctx.roundRect(4, 4, 504, 248, 16);
  ctx.stroke();

  // Reset shadow for text
  ctx.shadowBlur = 0;

  // Window titlebar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(4, 4, 504, 38);

  // Terminal dots
  const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
  dotColors.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(22 + i * 18, 23, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // Title tag
  ctx.font = 'bold 14px "Space Grotesk", monospace';
  ctx.fillStyle = accentColor;
  ctx.fillText(`// ${title}`, 90, 28);

  // Code lines with syntax highlighting simulation
  ctx.font = '13px "Courier New", monospace';
  lines.forEach((line, idx) => {
    const y = 68 + idx * 24;
    if (line.startsWith('#') || line.startsWith('//')) {
      ctx.fillStyle = 'rgba(150, 160, 180, 0.6)';
    } else if (line.includes('def ') || line.includes('class ') || line.includes('import ') || line.includes('return ')) {
      ctx.fillStyle = '#ff79c6';
    } else if (line.includes('StateGraph') || line.includes('MultiheadAttention') || line.includes('FAISS') || line.includes('SQLGlot')) {
      ctx.fillStyle = '#00d4ff';
    } else if (line.includes('"') || line.includes("'")) {
      ctx.fillStyle = '#f1fa8c';
    } else {
      ctx.fillStyle = '#f8f8f2';
    }
    ctx.fillText(line, 24, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// ─── Floating Code Plaques (Peripheral Background) ──────────────────
const CODE_SNIPPETS = [
  {
    title: 'LANGGRAPH_AGENT_DAG.py',
    accent: '#38bdf8',
    position: [-5.6, 1.8, -2.5] as [number, number, number],
    rotation: [0.08, 0.45, -0.05] as [number, number, number],
    lines: [
      'class AgentState(TypedDict):',
      '    query: str; sql: str; is_safe: bool',
      'workflow = StateGraph(AgentState)',
      'workflow.add_node("sql_agent", run_sqlglot)',
      'workflow.add_edge("planner", "sql_agent")',
      '# Dispatched with conditional routing',
    ],
  },
  {
    title: 'ATTENTION_CORE.pt',
    accent: '#f472b6',
    position: [5.6, 1.6, -2.8] as [number, number, number],
    rotation: [-0.08, -0.45, 0.05] as [number, number, number],
    lines: [
      'class MultiHeadAttention(nn.Module):',
      '    scores = (Q @ K.T) / sqrt(d_k)',
      '    attn_weights = F.softmax(scores, dim=-1)',
      '    return attn_weights @ V',
      '# Latency: 1.4ms on CUDA stream',
    ],
  },
  {
    title: 'VECTOR_SEARCH_FAISS.py',
    accent: '#818cf8',
    position: [-5.4, -2.4, -2.2] as [number, number, number],
    rotation: [0.12, 0.4, 0.02] as [number, number, number],
    lines: [
      'index = faiss.IndexFlatIP(1024)',
      'embeddings = bge_large.encode(docs)',
      'index.add(embeddings)',
      '# Column recall: 0.48 -> 0.81 (+69%)',
    ],
  },
  {
    title: 'GUARDRAIL_DEFENSE.py',
    accent: '#34d399',
    position: [5.4, -2.2, -2.5] as [number, number, number],
    rotation: [-0.1, -0.38, -0.04] as [number, number, number],
    lines: [
      'def inspect_prompt(prompt: str) -> bool:',
      '    if detector.is_jailbreak_or_sqli(prompt):',
      '        audit_log.quarantine(prompt)',
      '        return False # 0 Leaked Tokens',
    ],
  },
];

const FloatingCodePlanes: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const groupRef = useRef<THREE.Group>(null);

  const textures = useMemo(() => {
    return CODE_SNIPPETS.map((c) => createCodeCanvasTexture(c.lines, c.title, c.accent));
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Subtle breathing drift
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.08 - scrollProgress * 2;
  });

  return (
    <group ref={groupRef}>
      {CODE_SNIPPETS.map((snippet, i) => (
        <Float key={snippet.title} speed={1.5 + i * 0.2} rotationIntensity={0.25} floatIntensity={0.5}>
          <mesh position={snippet.position} rotation={snippet.rotation}>
            <planeGeometry args={[2.5, 1.25]} />
            <meshBasicMaterial
              map={textures[i]}
              transparent
              opacity={0.32}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

// ─── Mode 1: Transformer Multi-Head Attention Core ──────────────────
const AttentionMesh: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const pulsesRef = useRef<THREE.Points>(null);

  // Layer 1: Input Tokens (left), Layer 2: Attention Heads (center), Layer 3: Output (right)
  const { nodes, curves, pulsePositions } = useMemo(() => {
    const n: { pos: THREE.Vector3; color: string; size: number }[] = [];
    const crvs: { curve: THREE.QuadraticBezierCurve3; color: string }[] = [];

    // Tokens
    const inputY = [-1.5, -0.75, 0, 0.75, 1.5];
    const inputs: THREE.Vector3[] = [];
    inputY.forEach((y) => {
      const v = new THREE.Vector3(-2.2, y, (Math.random() - 0.5) * 0.8);
      inputs.push(v);
      n.push({ pos: v, color: '#38bdf8', size: 0.12 });
    });

    // Heads (Center)
    const headY = [-1.2, -0.4, 0.4, 1.2];
    const heads: THREE.Vector3[] = [];
    headY.forEach((y) => {
      const v = new THREE.Vector3(0, y, (Math.random() - 0.5) * 1.2);
      heads.push(v);
      n.push({ pos: v, color: '#818cf8', size: 0.18 });
    });

    // Outputs
    const outY = [-1.0, 0, 1.0];
    const outputs: THREE.Vector3[] = [];
    outY.forEach((y) => {
      const v = new THREE.Vector3(2.2, y, (Math.random() - 0.5) * 0.8);
      outputs.push(v);
      n.push({ pos: v, color: '#f472b6', size: 0.14 });
    });

    // Connections: Inputs -> Heads
    inputs.forEach((inp) => {
      heads.forEach((hd) => {
        const mid = new THREE.Vector3(
          (inp.x + hd.x) / 2,
          (inp.y + hd.y) / 2 + (Math.random() - 0.5) * 0.4,
          (inp.z + hd.z) / 2 + (Math.random() - 0.5) * 0.6
        );
        crvs.push({
          curve: new THREE.QuadraticBezierCurve3(inp, mid, hd),
          color: '#38bdf8',
        });
      });
    });

    // Connections: Heads -> Outputs
    heads.forEach((hd) => {
      outputs.forEach((out) => {
        const mid = new THREE.Vector3(
          (hd.x + out.x) / 2,
          (hd.y + out.y) / 2 + (Math.random() - 0.5) * 0.3,
          (hd.z + out.z) / 2 + (Math.random() - 0.5) * 0.5
        );
        crvs.push({
          curve: new THREE.QuadraticBezierCurve3(hd, mid, out),
          color: '#f472b6',
        });
      });
    });

    // Pulse positions pool (32 pulses traveling along curves)
    const pulsePos = new Float32Array(32 * 3);
    return { nodes: n, curves: crvs, pulsePositions: pulsePos };
  }, []);

  const curveObjects = useMemo(() => {
    return curves.map((c) => {
      const points = c.curve.getPoints(24);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return { geometry, color: c.color };
    });
  }, [curves]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.15;
      groupRef.current.rotation.x = Math.cos(t * 0.25) * 0.08;
    }

    // Update pulses
    if (pulsesRef.current) {
      const posAttr = pulsesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const count = 32;
      for (let i = 0; i < count; i++) {
        const curveIdx = (i * 3) % curves.length;
        const speed = 0.4 + (i % 4) * 0.15;
        const progress = (t * speed + i * 0.12) % 1.0;
        const pt = curves[curveIdx].curve.getPoint(progress);
        posAttr.setXYZ(i, pt.x, pt.y, pt.z);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Curved attention synapse lines */}
      {curveObjects.map((c, i) => (
        <line key={i} geometry={c.geometry}>
          <lineBasicMaterial color={c.color} transparent opacity={0.14} blending={THREE.AdditiveBlending} />
        </line>
      ))}

      {/* Nodes (Tokens, Attention Heads, Outputs) */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.pos}>
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={1.8}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}

      {/* Synaptic Light Pulses */}
      <points ref={pulsesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={32}
            array={pulsePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#ffffff"
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

// ─── Mode 2: LangGraph Multi-Agent State Machine DAG ────────────────
const AGENT_NODES = [
  { name: 'SUPERVISOR / ROUTER', pos: [0, 1.8, 0] as [number, number, number], color: '#38bdf8' },
  { name: 'NL-TO-SQL AGENT', pos: [-2.2, 0.4, 0.5] as [number, number, number], color: '#818cf8' },
  { name: 'VECTOR RETRIEVER', pos: [2.2, 0.4, -0.3] as [number, number, number], color: '#f472b6' },
  { name: 'SECURITY GUARDRAIL', pos: [-1.4, -1.4, 0.2] as [number, number, number], color: '#34d399' },
  { name: 'EVALUATION & SYNTHESIS', pos: [1.4, -1.4, 0.4] as [number, number, number], color: '#38bdf8' },
];

const EDGES = [
  [0, 1], // Supervisor -> SQL
  [0, 2], // Supervisor -> Vector
  [1, 3], // SQL -> Security
  [2, 3], // Vector -> Security
  [3, 4], // Security -> Evaluator
  [4, 0], // Evaluator -> Feedback loop
];

const LangGraphDAG: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Points>(null);

  const edgeGeometries = useMemo(() => {
    return EDGES.map(([from, to]) => {
      const p1 = new THREE.Vector3(...AGENT_NODES[from].pos);
      const p2 = new THREE.Vector3(...AGENT_NODES[to].pos);
      const mid = new THREE.Vector3(
        (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 0.4,
        (p1.y + p2.y) / 2,
        (p1.z + p2.z) / 2 + 0.3
      );
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(24);
      return {
        curve,
        geo: new THREE.BufferGeometry().setFromPoints(points),
      };
    });
  }, []);

  const pulsePos = useMemo(() => new Float32Array(EDGES.length * 3), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.08;
    }

    if (pulseRef.current) {
      const posAttr = pulseRef.current.geometry.attributes.position as THREE.BufferAttribute;
      edgeGeometries.forEach((e, idx) => {
        const progress = (t * 0.6 + idx * 0.25) % 1.0;
        const pt = e.curve.getPoint(progress);
        posAttr.setXYZ(idx, pt.x, pt.y, pt.z);
      });
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* DAG Connections */}
      {edgeGeometries.map((e, idx) => (
        <line key={idx} geometry={e.geo}>
          <lineBasicMaterial color="#38bdf8" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
        </line>
      ))}

      {/* Agent Nodes */}
      {AGENT_NODES.map((agent) => (
        <group key={agent.name} position={agent.pos}>
          {/* Glowing node sphere */}
          <mesh>
            <sphereGeometry args={[0.2, 24, 24]} />
            <meshStandardMaterial
              color={agent.color}
              emissive={agent.color}
              emissiveIntensity={0.85}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Holographic orbital halo ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.28, 0.32, 32]} />
            <meshBasicMaterial color={agent.color} transparent opacity={0.45} side={THREE.DoubleSide} />
          </mesh>

          {/* Sleek Node Label with soft typography */}
          <Html position={[0, 0.42, 0]} center distanceFactor={10}>
            <div className="px-2.5 py-0.5 rounded-full bg-[#0c1017]/90 border border-white/10 text-[9px] font-mono text-slate-200 tracking-wider whitespace-nowrap backdrop-blur pointer-events-none shadow-md">
              {agent.name}
            </div>
          </Html>
        </group>
      ))}

      {/* Dynamic Agent Signal Packets */}
      <points ref={pulseRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={EDGES.length}
            array={pulsePos}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          color="#34d399"
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

// ─── Mode 3: Latent Vector Embedding Space ──────────────────────────
const LatentSpaceManifold: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1200;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    // 3 Distinct semantic clusters (RAG, SQL, Code)
    const clusterCenters = [
      new THREE.Vector3(-1.8, 0.8, -0.5), // Cluster 1: Cyan
      new THREE.Vector3(1.8, 0.5, 0.5),   // Cluster 2: Purple
      new THREE.Vector3(0, -1.2, 0),       // Cluster 3: Pink
    ];

    const clusterColors = [
      new THREE.Color('#38bdf8'),
      new THREE.Color('#818cf8'),
      new THREE.Color('#f472b6'),
    ];

    for (let i = 0; i < count; i++) {
      const clusterIdx = i % 3;
      const center = clusterCenters[clusterIdx];
      const color = clusterColors[clusterIdx];

      // Gaussian-ish dispersion around cluster
      const r = Math.pow(Math.random(), 2) * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      pos[i * 3] = center.x + r * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = center.y + r * Math.sin(phi);
      pos[i * 3 + 2] = center.z + r * Math.sin(theta) * Math.cos(phi);

      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.05;
    pointsRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          vertexColors
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Cluster Centroid Labels with soft professional typography */}
      <Html position={[-1.8, 1.8, -0.5]} center distanceFactor={12}>
        <div className="px-2.5 py-0.5 rounded-full bg-[#0c1017]/90 border border-sky-500/30 text-[9px] font-mono text-sky-300 tracking-wider whitespace-nowrap backdrop-blur pointer-events-none shadow-md">
          CLUSTER A: RAG & SEMANTIC RETRIEVAL
        </div>
      </Html>
      <Html position={[1.8, 1.4, 0.5]} center distanceFactor={12}>
        <div className="px-2.5 py-0.5 rounded-full bg-[#0c1017]/90 border border-indigo-500/30 text-[9px] font-mono text-indigo-300 tracking-wider whitespace-nowrap backdrop-blur pointer-events-none shadow-md">
          CLUSTER B: NL-TO-SQL & AST EMBEDDINGS
        </div>
      </Html>
      <Html position={[0, -2.1, 0]} center distanceFactor={12}>
        <div className="px-2.5 py-0.5 rounded-full bg-[#0c1017]/90 border border-pink-500/30 text-[9px] font-mono text-pink-300 tracking-wider whitespace-nowrap backdrop-blur pointer-events-none shadow-md">
          CLUSTER C: AGENT STATE MANIFOLD
        </div>
      </Html>
    </group>
  );
};

// ─── Central Cybernetic Neural Sphere Core ─────────────────────────
const NeuralCoreOrb: React.FC<{ mode: NeuralMode }> = ({ mode }) => {
  const crystalRef = useRef<THREE.Mesh>(null);
  const innerNucleusRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const ringRef3 = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const coreColor = mode === 'attention' ? '#38bdf8' : mode === 'langgraph' ? '#818cf8' : '#f472b6';
  const secondaryColor = mode === 'attention' ? '#818cf8' : mode === 'langgraph' ? '#f472b6' : '#38bdf8';

  // Floating orbit particles around the core
  const orbParticles = useMemo(() => {
    const count = 48;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const r = 1.35 + (Math.random() - 0.5) * 0.3;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (crystalRef.current) {
      crystalRef.current.rotation.y = t * 0.25;
      crystalRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
    }
    if (innerNucleusRef.current) {
      const pulse = 1 + Math.sin(t * 2) * 0.08;
      innerNucleusRef.current.scale.set(pulse, pulse, pulse);
      innerNucleusRef.current.rotation.y = -t * 0.4;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * 0.22;
      ringRef1.current.rotation.y = t * 0.18;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z = -t * 0.2;
      ringRef2.current.rotation.x = t * 0.15;
    }
    if (ringRef3.current) {
      ringRef3.current.rotation.y = t * 0.12;
      ringRef3.current.rotation.z = Math.sin(t * 0.3) * 0.2;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = -t * 0.15;
    }
  });

  return (
    <group position={[0, 0, -1.5]}>
      {/* Outer Faceted Geometric Crystal Core */}
      <mesh ref={crystalRef}>
        <dodecahedronGeometry args={[0.92, 0]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={0.25}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Outer Geometric Wireframe Overlay */}
      <mesh>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={0.25}
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Inner Pulsating Energetic Nucleus */}
      <mesh ref={innerNucleusRef}>
        <icosahedronGeometry args={[0.42, 2]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={coreColor}
          emissiveIntensity={0.75}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Concentric Gyroscopic Rings */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.45, 0.012, 16, 80]} />
        <meshBasicMaterial color={coreColor} transparent opacity={0.3} />
      </mesh>
      <mesh ref={ringRef2}>
        <torusGeometry args={[1.75, 0.009, 16, 80]} />
        <meshBasicMaterial color={secondaryColor} transparent opacity={0.2} />
      </mesh>
      <mesh ref={ringRef3}>
        <torusGeometry args={[2.05, 0.007, 16, 80]} />
        <meshBasicMaterial color={coreColor} transparent opacity={0.15} />
      </mesh>

      {/* Orbiting Quantum Dust Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={48}
            array={orbParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color={coreColor}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

// ─── Interactive Camera Controller with Mouse Parallax ─────────────
const InteractiveCameraController: React.FC<{
  mouse: { x: number; y: number };
  scrollProgress: number;
}> = ({ mouse, scrollProgress }) => {
  const { camera } = useThree();
  const target = useRef({ x: 0, y: 0, z: 6 });

  useFrame(() => {
    target.current.x = mouse.x * 1.0;
    target.current.y = mouse.y * 0.7 - scrollProgress * 1.5;
    target.current.z = 6 + scrollProgress * 2.5;

    camera.position.x += (target.current.x - camera.position.x) * 0.035;
    camera.position.y += (target.current.y - camera.position.y) * 0.035;
    camera.position.z += (target.current.z - camera.position.z) * 0.035;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// ─── Main NeuralCodeScene3D Component ──────────────────────────────
interface NeuralCodeScene3DProps {
  scrollProgress?: number;
  activeMode?: NeuralMode;
}

const NeuralCodeScene3D: React.FC<NeuralCodeScene3DProps> = ({
  scrollProgress = 0,
  activeMode: externalMode,
}) => {
  const mode = externalMode ?? 'attention';
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (reducedMotion) {
    return <div className="fixed inset-0 z-0 bg-[#06080d] pointer-events-none" />;
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6], fov: 46 }}
      >
        <color attach="background" args={['#06080d']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[7, 7, 5]} intensity={1.3} color="#38bdf8" />
        <directionalLight position={[-7, -7, -5]} intensity={1.1} color="#a78bfa" />

        {/* Central 3D Core with Crystal Lattice and Gimbal Rings */}
        <NeuralCoreOrb mode={mode} />

        {/* Dynamic AI Mode Layer */}
        {mode === 'attention' && <AttentionMesh />}
        {mode === 'langgraph' && <LangGraphDAG />}
        {mode === 'latent' && <LatentSpaceManifold />}

        {/* Floating Holographic AI Code Plaques (Subtle & Peripheral) */}
        <FloatingCodePlanes scrollProgress={scrollProgress} />

        {/* Camera Parallax */}
        <InteractiveCameraController mouse={mouse} scrollProgress={scrollProgress} />

        {/* Post-Processing Bloom — Soft, Cinematic & Clean */}
        <EffectComposer disableNormalPass multisampling={0}>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.7} intensity={0.45} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default NeuralCodeScene3D;
