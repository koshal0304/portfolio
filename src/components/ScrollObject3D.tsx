import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── GLSL Vertex Shader ────────────────────────────────────────────
const icoVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  uniform float uTime;
  uniform float uDistort;

  vec3 distort(vec3 pos) {
    float noise = sin(pos.x * 3.0 + uTime * 0.8) *
                  cos(pos.y * 2.5 + uTime * 0.6) *
                  sin(pos.z * 3.5 + uTime * 0.7);
    return pos + normal * noise * uDistort;
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 distorted = distort(position);
    vPosition = distorted;
    vWorldPosition = (modelMatrix * vec4(distorted, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(distorted, 1.0);
  }
`;

// ─── GLSL Fragment Shader ──────────────────────────────────────────
const icoFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uFresnelPower;
  uniform float uOpacity;

  void main() {
    // Vertical gradient between two colors
    float mixFactor = clamp((vPosition.y + 1.5) / 3.0, 0.0, 1.0);
    vec3 baseColor = mix(uColor2, uColor1, mixFactor);

    // Fresnel rim glow
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), uFresnelPower);
    vec3 rimColor = uColor1 * fresnel * 1.5;

    gl_FragColor = vec4(baseColor + rimColor, uOpacity);
  }
`;

// ─── Wireframe Vertex Shader (same distortion) ────────────────────
const wireVertexShader = `
  uniform float uTime;
  uniform float uDistort;

  vec3 distort(vec3 pos) {
    float noise = sin(pos.x * 3.0 + uTime * 0.8) *
                  cos(pos.y * 2.5 + uTime * 0.6) *
                  sin(pos.z * 3.5 + uTime * 0.7);
    return pos + normal * noise * uDistort;
  }

  void main() {
    vec3 distorted = distort(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(distorted, 1.0);
  }
`;

// ─── Wireframe Fragment Shader ─────────────────────────────────────
const wireFragmentShader = `
  uniform vec3 uColor1;
  uniform float uOpacity;

  void main() {
    gl_FragColor = vec4(uColor1, uOpacity * 0.6);
  }
`;

// ─── Scroll Act Definitions ────────────────────────────────────────
interface ActTarget {
  position: THREE.Vector3;
  scale: number;
  distort: number;
  color1: THREE.Color;
  color2: THREE.Color;
  rotationSpeed: { x: number; y: number; z: number };
  wireframe: boolean;
}

function createActs(isMobile: boolean): ActTarget[] {
  // Camera is at z=50 (scrolls to z=20). At z=50 + fov 75°,
  // visible half-width ≈ 38 units. Positions and scales must match.
  const xMul = isMobile ? 0.5 : 1;
  const sMul = isMobile ? 0.6 : 1;
  const dMul = isMobile ? 0.7 : 1;

  return [
    // Act 0 — Hero (0.00 → 0.20)
    {
      position: new THREE.Vector3(22 * xMul, 0.0, 0),
      scale: 8 * sMul,
      distort: 0.3 * dMul,
      color1: new THREE.Color(0x00d4ff),
      color2: new THREE.Color(0x7c3aed),
      rotationSpeed: { x: 0, y: 0.003, z: 0 },
      wireframe: false,
    },
    // Act 1 — Experience (0.20 → 0.40)
    {
      position: new THREE.Vector3(-22 * xMul, 4, 0),
      scale: 6 * sMul,
      distort: 0.6 * dMul,
      color1: new THREE.Color(0x7c3aed),
      color2: new THREE.Color(0x00d4ff),
      rotationSpeed: { x: 0.002, y: 0.003, z: 0 },
      wireframe: false,
    },
    // Act 2 — Skills (0.40 → 0.60)
    {
      position: new THREE.Vector3(0.0, -10, -5),
      scale: 12 * sMul,
      distort: 1.0 * dMul,
      color1: new THREE.Color(0x00d4ff),
      color2: new THREE.Color(0x7c3aed),
      rotationSpeed: { x: 0.004, y: 0.006, z: 0.002 },
      wireframe: true,
    },
    // Act 3 — Projects (0.60 → 0.80)
    {
      position: new THREE.Vector3(20 * xMul, 0.0, 0),
      scale: 7 * sMul,
      distort: 0.3 * dMul,
      color1: new THREE.Color(0x00d4ff),
      color2: new THREE.Color(0x7c3aed),
      rotationSpeed: { x: 0, y: 0.002, z: 0 },
      wireframe: false,
    },
    // Act 4 — Contact (0.80 → 1.00)
    {
      position: new THREE.Vector3(0.0, 0.0, 0),
      scale: 5 * sMul,
      distort: 0.08 * dMul,
      color1: new THREE.Color(0x00d4ff),
      color2: new THREE.Color(0x00d4ff),
      rotationSpeed: { x: 0, y: 0.001, z: 0 },
      wireframe: false,
    },
  ];
}

function getActIndex(progress: number): number {
  if (progress < 0.20) return 0;
  if (progress < 0.40) return 1;
  if (progress < 0.60) return 2;
  if (progress < 0.80) return 3;
  return 4;
}

// ─── lerp helper ───────────────────────────────────────────────────
function lerpScalar(current: number, target: number, factor: number, delta: number): number {
  const frameFactor = 1 - Math.pow(1 - factor, delta * 60);
  return current + (target - current) * frameFactor;
}

// ─── Component Props ──────────────────────────────────────────────
interface ScrollObject3DProps {
  scrollProgress: number;
}

// ─── Main Component ───────────────────────────────────────────────
const ScrollObject3D: React.FC<ScrollObject3DProps> = ({ scrollProgress }) => {
  const solidRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const solidMatRef = useRef<THREE.ShaderMaterial>(null);
  const wireMatRef = useRef<THREE.ShaderMaterial>(null);
  const pausedRef = useRef(false);

  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Pause on hidden tab
  useEffect(() => {
    const handleVisibility = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const acts = useMemo(() => createActs(isMobile), [isMobile]);

  // Mutable refs for lerped state (avoids React state in rAF)
  const currentColor1 = useRef(new THREE.Color(0x00d4ff));
  const currentColor2 = useRef(new THREE.Color(0x7c3aed));
  const currentDistort = useRef(0.3);
  const currentSolidOpacity = useRef(0.9);
  const currentWireOpacity = useRef(0.0);

  // Icosahedron geometry (shared between solid + wire)
  const icoGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 4), []);

  // Solid shader material
  const solidMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: icoVertexShader,
        fragmentShader: icoFragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uDistort: { value: 0.3 },
          uColor1: { value: new THREE.Color(0x00d4ff) },
          uColor2: { value: new THREE.Color(0x7c3aed) },
          uFresnelPower: { value: 2.0 },
          uOpacity: { value: 0.9 },
        },
      }),
    []
  );

  // Wireframe material
  const wireMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: wireVertexShader,
        fragmentShader: wireFragmentShader,
        transparent: true,
        depthWrite: false,
        wireframe: true,
        uniforms: {
          uTime: { value: 0 },
          uDistort: { value: 0.3 },
          uColor1: { value: new THREE.Color(0x00d4ff) },
          uOpacity: { value: 0.0 },
        },
      }),
    []
  );

  useFrame((_, delta) => {
    if (pausedRef.current) return;
    if (!solidRef.current || !wireRef.current) return;

    const actIdx = getActIndex(scrollProgress);
    const target = acts[actIdx];

    // ── Reduced motion: static at Act 0, no animation ──
    if (reducedMotion) {
      const act0 = acts[0];
      solidRef.current.position.copy(act0.position);
      solidRef.current.scale.setScalar(act0.scale);
      wireRef.current.position.copy(act0.position);
      wireRef.current.scale.setScalar(act0.scale);
      solidMaterial.uniforms.uDistort.value = act0.distort;
      solidMaterial.uniforms.uOpacity.value = 0.9;
      wireMaterial.uniforms.uOpacity.value = 0.0;
      return;
    }

    // ── Time ──
    solidMaterial.uniforms.uTime.value += delta;
    wireMaterial.uniforms.uTime.value += delta;

    // ── Position lerp (frame-rate independent) ──
    const posLerp = 1 - Math.pow(1 - 0.04, delta * 60);
    solidRef.current.position.lerp(target.position, posLerp);
    wireRef.current.position.copy(solidRef.current.position);

    // ── Scale lerp ──
    const targetScaleVec = new THREE.Vector3(target.scale, target.scale, target.scale);
    solidRef.current.scale.lerp(targetScaleVec, posLerp);
    wireRef.current.scale.copy(solidRef.current.scale);

    // ── Rotation ──
    solidRef.current.rotation.x += target.rotationSpeed.x * delta * 60;
    solidRef.current.rotation.y += target.rotationSpeed.y * delta * 60;
    solidRef.current.rotation.z += target.rotationSpeed.z * delta * 60;
    wireRef.current.rotation.copy(solidRef.current.rotation);

    // ── Distortion lerp ──
    currentDistort.current = lerpScalar(currentDistort.current, target.distort, 0.03, delta);
    solidMaterial.uniforms.uDistort.value = currentDistort.current;
    wireMaterial.uniforms.uDistort.value = currentDistort.current;

    // ── Color lerp ──
    const colorLerp = 1 - Math.pow(1 - 0.03, delta * 60);
    currentColor1.current.lerp(target.color1, colorLerp);
    currentColor2.current.lerp(target.color2, colorLerp);
    solidMaterial.uniforms.uColor1.value.copy(currentColor1.current);
    solidMaterial.uniforms.uColor2.value.copy(currentColor2.current);
    wireMaterial.uniforms.uColor1.value.copy(currentColor1.current);

    // ── Wireframe crossfade ──
    // Target: solid=0 wire=1 when wireframe, solid=0.9 wire=0 otherwise
    const targetSolidOpacity = target.wireframe ? 0.0 : 0.9;
    const targetWireOpacity = target.wireframe ? 1.0 : 0.0;
    currentSolidOpacity.current = lerpScalar(currentSolidOpacity.current, targetSolidOpacity, 0.04, delta);
    currentWireOpacity.current = lerpScalar(currentWireOpacity.current, targetWireOpacity, 0.04, delta);
    solidMaterial.uniforms.uOpacity.value = currentSolidOpacity.current;
    wireMaterial.uniforms.uOpacity.value = currentWireOpacity.current;
  });

  return (
    <group>
      {/* Solid icosahedron */}
      <mesh ref={solidRef} geometry={icoGeo} material={solidMaterial} />
      {/* Wireframe icosahedron (same geo, wireframe material, crossfades in at Act 2) */}
      <mesh ref={wireRef} geometry={icoGeo} material={wireMaterial} />
    </group>
  );
};

export default ScrollObject3D;
