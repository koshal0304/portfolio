import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Director } from './director';
import type { GuideSignal } from './signal';

// Mixamo ("mixamorig:RightArm"), Ready Player Me / Avaturn ("RightArm") and similar humanoid rigs.
const norm = (name: string) => name.toLowerCase().replace(/^mixamorig[:_]?/, '').replace(/[^a-z0-9]/g, '');

// ARKit + Oculus viseme blendshapes (Avaturn, Ready Player Me). ARKit's Left/Right are the
// character's own sides, so looking toward screen-right is the left eye out + right eye in.
const FACE = {
  jaw: ['jawOpen'],
  aa: ['viseme_aa'],
  E: ['viseme_E'],
  I: ['viseme_I'],
  O: ['viseme_O'],
  U: ['viseme_U'],
  SS: ['viseme_SS'],
  FF: ['viseme_FF'],
  blink: ['eyeBlinkLeft', 'eyeBlinkRight'],
  smile: ['mouthSmileLeft', 'mouthSmileRight'],
  cheek: ['cheekSquintLeft', 'cheekSquintRight'],
  squint: ['eyeSquintLeft', 'eyeSquintRight'],
  wide: ['eyeWideLeft', 'eyeWideRight'],
  browInner: ['browInnerUp'],
  browOuter: ['browOuterUpLeft', 'browOuterUpRight'],
  browDown: ['browDownLeft', 'browDownRight'],
  lookUp: ['eyeLookUpLeft', 'eyeLookUpRight'],
  lookDown: ['eyeLookDownLeft', 'eyeLookDownRight'],
  lookRight: ['eyeLookOutLeft', 'eyeLookInRight'],
  lookLeft: ['eyeLookInLeft', 'eyeLookOutRight'],
} as const;
type FaceKey = keyof typeof FACE;

const _from = new THREE.Vector3();
const _to = new THREE.Vector3();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _wq = new THREE.Quaternion();
const _pq = new THREE.Quaternion();
const _before = new THREE.Quaternion();
const _aimed = new THREE.Quaternion();
const _e = new THREE.Euler();
const _head = new THREE.Vector3();

/** Rotate `bone` (in world space, minimal arc) so the segment bone→child points along `dir`. Rig-axis agnostic. */
function aim(bone: THREE.Object3D, child: THREE.Object3D, dir: THREE.Vector3, weight: number) {
  if (!bone.parent || weight <= 0.001) return;
  _before.copy(bone.quaternion);
  child.getWorldPosition(_from).sub(bone.getWorldPosition(_p)).normalize();
  _q.setFromUnitVectors(_from, _to.copy(dir).normalize());
  bone.getWorldQuaternion(_wq);
  bone.parent.getWorldQuaternion(_pq);
  bone.quaternion.copy(_pq.invert().multiply(_q.multiply(_wq)));
  // slerpQuaternions(a, b) copies a into `this` first, so b must not be the bone's own quaternion.
  if (weight < 0.999) bone.quaternion.slerpQuaternions(_before, _aimed.copy(bone.quaternion), weight);
}

const HEAD_Y = 0.86; // shared stage framing with the hologram
const HEAD_TO_HIPS = 1.15;

// The twin materialises from a rising scan line on first appearance (world-space Y of the front).
const REVEAL = { value: 100 };
const REVEAL_COLOR = { value: new THREE.Color('#f4b678') };
const REVEAL_FROM = -1.25;
const REVEAL_TO = 1.65;

function patchReveal(material: THREE.Material) {
  if (material.userData.revealPatched) return;
  material.userData.revealPatched = true;
  if ('envMapIntensity' in material) (material as THREE.MeshStandardMaterial).envMapIntensity = 0.55;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = REVEAL;
    shader.uniforms.uRevealColor = REVEAL_COLOR;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vRevealY;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n  vRevealY = (modelMatrix * vec4(transformed, 1.0)).y;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uReveal;\nuniform vec3 uRevealColor;\nvarying float vRevealY;')
      .replace('void main() {', 'void main() {\n  if (vRevealY > uReveal) discard;')
      .replace(
        '#include <opaque_fragment>',
        '#include <opaque_fragment>\n  gl_FragColor.rgb += uRevealColor * (1.0 - smoothstep(0.0, 0.09, uReveal - vRevealY)) * 2.4;'
      );
  };
  material.customProgramCacheKey = () => 'twin-reveal';
}

const SPARKS = 70;

/** Golden sparks riding the scan line while the twin materialises. */
const RevealSparks: React.FC = () => {
  const points = useRef<THREE.Points>(null);
  const { geo, seeds, mat } = useMemo(() => {
    const seeds = Array.from({ length: SPARKS }, () => ({
      a: Math.random() * Math.PI * 2,
      r: 0.25 + Math.random() * 0.45,
      off: -Math.random() * 0.35,
      drift: 0.2 + Math.random() * 0.6,
    }));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
    const mat = new THREE.PointsMaterial({
      color: '#fddbb4',
      size: 0.035,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geo, seeds, mat };
  }, []);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat]
  );

  useFrame((state) => {
    const y = REVEAL.value;
    const active = y < REVEAL_TO + 0.2;
    mat.opacity += ((active ? 0.9 : 0) - mat.opacity) * 0.1;
    if (mat.opacity < 0.01) return;
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    seeds.forEach((s, i) => {
      const a = s.a + t * s.drift;
      pos.setXYZ(i, Math.cos(a) * s.r, Math.min(y, REVEAL_TO) + s.off + ((t * s.drift * 0.4) % 0.25), Math.sin(a) * s.r * 0.6);
    });
    pos.needsUpdate = true;
  });

  return <points ref={points} geometry={geo} material={mat} frustumCulled={false} />;
};

interface GlbAvatarProps {
  url: string;
  director: Director;
  signal: React.MutableRefObject<GuideSignal>;
  reducedMotion: boolean;
}

const GlbAvatar: React.FC<GlbAvatarProps> = ({ url, director, signal, reducedMotion }) => {
  const { scene, animations } = useGLTF(url);
  const { gl, scene: world, camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const kicker = useRef<THREE.DirectionalLight>(null);
  const facing = useRef(1);
  const revealStart = useRef(-1);
  const [compiled, setCompiled] = useState(false);

  // Image-based light for the PBR materials, generated locally (no HDR download).
  useEffect(() => {
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(room, 0.04).texture;
    world.environment = env;
    return () => {
      world.environment = null;
      env.dispose();
      pmrem.dispose();
      room.dispose();
    };
  }, [gl, world]);

  // Compile his shaders without blocking before he steps on stage: a first-render compile freezes his
  // canvas for a second or two on many GPUs, and would swallow the greeting's wave.
  useEffect(() => {
    let alive = true;
    const done = () => alive && setCompiled(true);
    // Upload every texture now too, so his first visible frame isn't a GPU stall.
    scene.traverse((o) => {
      const mats = (o as THREE.Mesh).material;
      for (const m of Array.isArray(mats) ? mats : mats ? [mats] : [])
        for (const v of Object.values(m)) if (v instanceof THREE.Texture) gl.initTexture(v);
    });
    if (gl.compileAsync) gl.compileAsync(scene, camera, world).then(done, done);
    else done();
    return () => {
      alive = false;
    };
  }, [gl, scene, camera, world]);

  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  useEffect(() => {
    const clip = animations[0];
    const action = clip ? mixer.clipAction(clip).play() : null;
    return () => {
      action?.stop();
    };
  }, [mixer, animations]);

  const rig = useMemo(() => {
    const bones: Record<string, THREE.Object3D> = {};
    const faces: { influences: number[]; idx: Partial<Record<FaceKey, number[]>> }[] = [];
    scene.traverse((o) => {
      if ((o as THREE.Bone).isBone) bones[norm(o.name)] ??= o;
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = false; // skinned bounds don't follow posed bones
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(patchReveal);
      if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
        const dict = mesh.morphTargetDictionary;
        const idx: Partial<Record<FaceKey, number[]>> = {};
        for (const key of Object.keys(FACE) as FaceKey[]) {
          const found = FACE[key].map((n) => dict[n]).filter((i): i is number => i !== undefined);
          if (found.length) idx[key] = found;
        }
        faces.push({ influences: mesh.morphTargetInfluences, idx });
      }
    });
    const b = (...names: string[]) => names.map((n) => bones[n]).find(Boolean) ?? null;
    // The loaded scene is cached across remounts, so record the bind pose once, on the bones themselves.
    const rest = new Map(
      [...new Set(Object.values(bones))].map((bone) => [bone, (bone.userData.restQ ??= bone.quaternion.clone()) as THREE.Quaternion])
    );
    rest.forEach((q, bone) => bone.quaternion.copy(q));

    // Frame the upper body like the hologram: fixed head height, consistent scale.
    scene.updateMatrixWorld(true);
    const at = (o: THREE.Object3D) => scene.worldToLocal(o.getWorldPosition(new THREE.Vector3())).applyMatrix4(scene.matrix);
    const head = b('head');
    const hips = b('hips', 'pelvis');
    let scale = 1;
    let offset = new THREE.Vector3();
    if (head && hips) {
      const hp = at(head);
      const span = hp.y - at(hips).y;
      scale = span > 0 ? HEAD_TO_HIPS / span : 1;
      offset = new THREE.Vector3(-hp.x * scale, HEAD_Y - hp.y * scale, -hp.z * scale);
    } else {
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      scale = 2.2 / (size.y || 1);
      offset = new THREE.Vector3(0, 1.2 - box.max.y * scale, 0);
    }

    return {
      // The clip's latest pose: three's mixer only writes a bone when its value changes, so each frame
      // restores this (undoing last frame's gestures) instead of the bind pose, or held poses would snap back.
      base: new Map([...rest].map(([bone, q]) => [bone, q.clone()])),
      faces,
      scale,
      offset,
      animated: animations.length > 0,
      spine: b('spine2', 'spine1', 'spine', 'chest'),
      neck: b('neck'),
      head,
      // The model faces the viewer, so its right arm is on screen-left.
      armL: [b('rightarm', 'rightupperarm'), b('rightforearm', 'rightlowerarm'), b('righthand')],
      armR: [b('leftarm', 'leftupperarm'), b('leftforearm', 'leftlowerarm'), b('lefthand')],
    };
  }, [scene, animations]);

  useFrame((state, delta) => {
    if (!compiled) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = signal.current;
    const live = director.step(t, dt);

    // Materialise the first time he's drawn; dissolve and re-form when he teleports between docks.
    // The reveal runs on rendered frame time (clamped dt), so a stalled GPU delays it rather than skipping it.
    if (revealStart.current < 0) {
      revealStart.current = 0;
      REVEAL.value = reducedMotion ? 100 : REVEAL_FROM;
    }
    const tp = (performance.now() - s.teleportAt) / 1000;
    if (!reducedMotion && tp >= 0 && tp < 0.95) {
      // Out top-down (0.36s), back in bottom-up (0.55s); the stage jumps to the other dock in between.
      REVEAL.value =
        tp < 0.36
          ? REVEAL_TO + (REVEAL_FROM - REVEAL_TO) * (tp / 0.36) ** 2
          : tp < 0.4
            ? REVEAL_FROM
            : REVEAL_FROM + (REVEAL_TO - REVEAL_FROM) * (1 - (1 - (tp - 0.4) / 0.55) ** 3);
    } else if (REVEAL.value < 100) {
      revealStart.current += dt;
      const k = Math.min(1, revealStart.current / 1.9);
      REVEAL.value = k >= 1 ? 100 : REVEAL_FROM + (REVEAL_TO - REVEAL_FROM) * (1 - (1 - k) ** 3);
    }
    if (!s.readyAt && REVEAL.value >= 100) s.readyAt = performance.now();

    // Body angles toward the page content (a presenter's three-quarter stance); the head turns back to the visitor.
    facing.current += (s.side - facing.current) * (1 - Math.exp(-dt * 3));
    if (group.current) {
      group.current.position.set(rig.offset.x, rig.offset.y + live.lift, rig.offset.z);
      group.current.rotation.y = rig.animated ? 0.56 - 0.39 * facing.current : -0.35 * facing.current;
    }

    rig.base.forEach((q, bone) => bone.quaternion.copy(q));
    mixer.update(reducedMotion ? 0 : dt);
    rig.base.forEach((q, bone) => q.copy(bone.quaternion));

    const faceYaw = rig.animated ? 0.3 * facing.current : 0.35 * facing.current;
    const turn = (bone: THREE.Object3D | null, k: number, x: number, y: number, z: number) =>
      bone?.quaternion.multiply(_q.setFromEuler(_e.set(x * k, y * k, z * k)));
    turn(rig.spine, 0.6, live.torso.x, live.torso.y, live.torso.z);
    turn(rig.neck, 0.4, live.head.x, live.head.y + faceYaw, live.head.z);
    turn(rig.head, 0.6, live.head.x, live.head.y + faceYaw, live.head.z);

    // Gestures blend over the body's own idle motion; at rest the clip's natural arms win.
    const w = rig.animated ? live.armWeight : 1;
    for (const [chain, [upper, fore]] of [
      [rig.armL, live.armL],
      [rig.armR, live.armR],
    ] as const) {
      const [u, f, h] = chain;
      if (u && f) aim(u, f, upper, w);
      if (f && h) aim(f, h, fore, w);
    }

    const open = live.open;
    const values: Record<FaceKey, number> = {
      jaw: open * 0.3,
      aa: open * Math.max(0, 1 - live.wide - live.round) * 0.5,
      E: live.wide * 0.45,
      I: live.wide * 0.2,
      O: live.round * 0.5,
      U: live.round * 0.28,
      SS: live.hiss * 0.45,
      FF: live.hiss * 0.15,
      blink: live.blink,
      smile: live.smile * 0.62,
      cheek: live.smile * 0.35,
      squint: live.smile * 0.18 * (1 - live.surprise),
      wide: live.surprise * 0.6,
      browInner: live.brow * 0.45 + live.surprise * 0.3,
      browOuter: live.brow * 0.25,
      browDown: live.frown * 0.6,
      lookUp: Math.max(0, live.gaze.y) * 0.45,
      lookDown: Math.max(0, -live.gaze.y) * 0.55,
      lookRight: Math.max(0, live.gaze.x) * 0.6,
      lookLeft: Math.max(0, -live.gaze.x) * 0.6,
    };
    for (const m of rig.faces) {
      for (const key in m.idx) {
        const v = values[key as FaceKey];
        for (const i of m.idx[key as FaceKey]!) m.influences[i] = v;
      }
    }

    kicker.current?.color.copy(live.color);

    // Framing: knees-up portrait in the hero, closer head-and-shoulders once docked.
    const cam = camera as THREE.PerspectiveCamera;
    const d = s.dock;
    const centreY = 0.36 + 0.18 * d;
    cam.position.set(0, centreY, 4.25 - 1.2 * d); // headroom for a raised hand in the hero
    cam.lookAt(0, centreY, 0);

    // Tell the DOM where the head is, so the speech bubble can sit next to it.
    if (rig.head) {
      rig.head.getWorldPosition(_head);
      _head.y += 0.3;
      _head.project(cam);
      s.head.x = (_head.x + 1) / 2;
      s.head.y = (1 - _head.y) / 2;
    }
  });

  return (
    <>
      <hemisphereLight args={['#c9d3ff', '#3a3f4e', 0.6]} />
      <directionalLight position={[2.2, 2.6, 3.2]} intensity={2.2} color="#ffd9b8" />
      <directionalLight position={[-2.8, 1.8, -2.2]} intensity={2.8} color="#a5b4fc" />
      <directionalLight ref={kicker} position={[2.4, 0.6, -2.6]} intensity={1.4} />
      {compiled && (
        <group ref={group} scale={rig.scale}>
          <primitive object={scene} />
        </group>
      )}
      {compiled && !reducedMotion && <RevealSparks />}
    </>
  );
};

export default GlbAvatar;
