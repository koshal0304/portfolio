import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Director } from './director';

const VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vY;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vY = wp.y;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

// Fresnel rim + scanlines + a rising sweep band; dissolves below uFloor and above uReveal (materialize).
const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uReveal;
  uniform float uFloor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vY;
  void main() {
    if (vY > uReveal) discard;
    float fres = pow(1.0 - clamp(abs(dot(normalize(vNormal), normalize(vView))), 0.0, 1.0), 2.0);
    float scan = 0.72 + 0.28 * sin(vY * 140.0 - uTime * 4.0);
    float sweep = smoothstep(0.07, 0.0, abs(fract(vY * 0.35 - uTime * 0.18) - 0.5));
    float edge = smoothstep(0.08, 0.0, uReveal - vY) * 1.5;
    float fade = smoothstep(uFloor, uFloor + 0.4, vY);
    float flicker = 0.94 + 0.06 * sin(uTime * 41.0) * sin(uTime * 7.3);
    float a = (0.13 + fres * 0.85 + sweep * 0.35 + edge) * scan * flicker * fade * uOpacity;
    gl_FragColor = vec4(uColor * (0.5 + fres * 1.3 + sweep * 0.8) + vec3(edge), a);
  }
`;

const BEAM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec3 vLocal;
  void main() {
    float h = vLocal.y / 0.95 + 0.5;
    float rays = 0.6 + 0.4 * sin(atan(vLocal.z, vLocal.x) * 24.0 + uTime * 1.5);
    gl_FragColor = vec4(uColor, (1.0 - h) * 0.16 * rays + 0.015);
  }
`;
const BEAM_VERT = /* glsl */ `
  varying vec3 vLocal;
  void main() { vLocal = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const DOWN = new THREE.Vector3(0, -1, 0);
const PARTICLES = 70;
const FLOOR_Y = -0.95;

interface HoloAvatarProps {
  director: Director;
  reducedMotion: boolean;
}

const HoloAvatar: React.FC<HoloAvatarProps> = ({ director, reducedMotion }) => {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const shoulders = { L: useRef<THREE.Group>(null), R: useRef<THREE.Group>(null) };
  const elbows = { L: useRef<THREE.Group>(null), R: useRef<THREE.Group>(null) };
  const eyes = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const mouth = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const dust = useRef<THREE.Points>(null);

  const { holo, wire, face, beam, glow, uniforms } = useMemo(() => {
    const uniforms = {
      uColor: { value: new THREE.Color('#38bdf8') },
      uTime: { value: 0 },
      uReveal: { value: reducedMotion ? 10 : FLOOR_Y },
      uFloor: { value: -0.5 },
    };
    const shader = (opacity: number, wireframe = false) =>
      new THREE.ShaderMaterial({
        uniforms: { ...uniforms, uOpacity: { value: opacity } },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        wireframe,
      });
    const additive = (color: string, opacity: number) =>
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    return {
      uniforms,
      holo: shader(1),
      wire: shader(0.3, true),
      face: additive('#e0faff', 1),
      glow: additive('#38bdf8', 0.5),
      beam: new THREE.ShaderMaterial({
        uniforms: { uColor: uniforms.uColor, uTime: uniforms.uTime },
        vertexShader: BEAM_VERT,
        fragmentShader: BEAM_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    };
  }, [reducedMotion]);

  const torsoGeo = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0.17, -0.55],
          [0.22, -0.3],
          [0.27, -0.05],
          [0.33, 0.2],
          [0.4, 0.37],
          [0.33, 0.47],
          [0.11, 0.52],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        20
      ),
    []
  );

  const dustGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(PARTICLES * 3);
    for (let i = 0; i < PARTICLES; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.5;
      p.set([Math.cos(a) * r, FLOOR_Y + Math.random() * 1.6, Math.sin(a) * r], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, []);

  useEffect(
    () => () => {
      [holo, wire, face, beam, glow].forEach((m) => m.dispose());
      torsoGeo.dispose();
      dustGeo.dispose();
    },
    [holo, wire, face, beam, glow, torsoGeo, dustGeo]
  );

  const tmpQ = useMemo(() => new THREE.Quaternion(), []);
  const tmpV = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const live = director.step(t, dt);

    uniforms.uTime.value = t;
    uniforms.uColor.value.copy(live.color);
    if (uniforms.uReveal.value < 10) uniforms.uReveal.value += dt * 1.6; // materialize upward on first mount
    uniforms.uFloor.value = -0.62 + live.lift;
    glow.color.copy(live.color);

    if (root.current) root.current.position.y = live.lift;
    torso.current?.rotation.set(live.torso.x, live.torso.y, live.torso.z);
    head.current?.rotation.set(live.head.x, live.head.y, live.head.z);

    for (const side of ['L', 'R'] as const) {
      const sh = shoulders[side].current;
      const el = elbows[side].current;
      const [upper, fore] = side === 'L' ? live.armL : live.armR;
      if (!sh || !el) continue;
      sh.quaternion.setFromUnitVectors(DOWN, upper);
      // Forearm direction is given in torso space; express it relative to the upper arm.
      el.quaternion.setFromUnitVectors(DOWN, tmpV.copy(fore).applyQuaternion(tmpQ.copy(sh.quaternion).invert()));
    }

    const eyeY = Math.max(0.08, (1 - live.blink) * (1 - live.smile * 0.45));
    eyes.forEach((e) => e.current?.scale.set(1, eyeY, 1));
    mouth.current?.scale.set(1 + live.smile * 0.35 - live.mouth * 0.25, 1 + live.mouth * 5, 1);
    core.current?.scale.setScalar(1 + live.mouth * 0.35 + Math.sin(t * 2) * 0.04);

    if (!reducedMotion) {
      if (rings.current) rings.current.rotation.y = t * 0.6;
      if (halo.current) halo.current.rotation.z = t * 0.4;
      const pos = dustGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLES; i++) {
        let y = pos.getY(i) + dt * (0.18 + (i % 5) * 0.05);
        if (y > 0.9) y = FLOOR_Y;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
  });

  const arm = (side: 'L' | 'R') => (
    <group ref={shoulders[side]} position={[side === 'L' ? -0.42 : 0.42, 0.36, 0]}>
      <mesh material={holo}>
        <sphereGeometry args={[0.095, 14, 10]} />
      </mesh>
      <mesh material={holo} position={[0, -0.2, 0]}>
        <capsuleGeometry args={[0.065, 0.3, 4, 10]} />
      </mesh>
      <group ref={elbows[side]} position={[0, -0.41, 0]}>
        <mesh material={holo} position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.055, 0.28, 4, 10]} />
        </mesh>
        <mesh material={holo} position={[0, -0.4, 0]} scale={[0.9, 1.15, 0.6]}>
          <sphereGeometry args={[0.065, 12, 10]} />
        </mesh>
      </group>
    </group>
  );

  return (
    <group>
      {/* Projector: emitter rings, light cone, rising data dust */}
      <group ref={rings} position={[0, FLOOR_Y, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={glow}>
          <torusGeometry args={[0.46, 0.008, 6, 64]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={glow} scale={0.7}>
          <torusGeometry args={[0.46, 0.006, 6, 6]} />
        </mesh>
      </group>
      <mesh position={[0, FLOOR_Y + 0.475, 0]} material={beam}>
        <cylinderGeometry args={[0.55, 0.42, 0.95, 32, 1, true]} />
      </mesh>
      <points ref={dust} geometry={dustGeo}>
        <pointsMaterial color="#7dd3fc" size={0.025} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      <group ref={root}>
        <group ref={torso}>
          <mesh geometry={torsoGeo} material={holo} scale={[1, 1, 0.62]} />
          <mesh geometry={torsoGeo} material={wire} scale={[1.01, 1, 0.63]} />
          <mesh ref={core} position={[0, 0.22, 0.2]} material={glow}>
            <ringGeometry args={[0.035, 0.055, 6]} />
          </mesh>
          <mesh material={holo} position={[0, 0.58, 0]}>
            <cylinderGeometry args={[0.075, 0.09, 0.16, 12, 1, true]} />
          </mesh>

          <group ref={head} position={[0, 0.64, 0]}>
            <group position={[0, 0.27, 0]}>
              <mesh material={holo} scale={[0.92, 1.12, 0.95]}>
                <sphereGeometry args={[0.27, 28, 20]} />
              </mesh>
              <mesh material={wire} scale={[0.93, 1.13, 0.96]}>
                <icosahedronGeometry args={[0.27, 2]} />
              </mesh>
              <mesh ref={eyes[0]} material={face} position={[-0.09, 0.04, 0.245]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.02, 0.045, 3, 8]} />
              </mesh>
              <mesh ref={eyes[1]} material={face} position={[0.09, 0.04, 0.245]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.02, 0.045, 3, 8]} />
              </mesh>
              <mesh ref={mouth} material={face} position={[0, -0.1, 0.25]}>
                <boxGeometry args={[0.1, 0.012, 0.01]} />
              </mesh>
              <mesh ref={halo} material={glow} position={[0, 0.38, -0.02]} rotation={[Math.PI / 2.3, 0, 0]}>
                <torusGeometry args={[0.2, 0.006, 6, 48, Math.PI * 1.6]} />
              </mesh>
            </group>
          </group>

          {arm('L')}
          {arm('R')}
        </group>
      </group>
    </group>
  );
};

export default HoloAvatar;
