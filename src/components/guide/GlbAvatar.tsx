import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Director } from './director';

// Mixamo ("mixamorig:RightArm"), Ready Player Me / Avaturn ("RightArm") and similar humanoid rigs.
const norm = (name: string) => name.toLowerCase().replace(/^mixamorig[:_]?/, '').replace(/[^a-z0-9]/g, '');

const MORPHS = {
  jaw: ['jawOpen', 'mouthOpen', 'viseme_aa', 'viseme_AA', 'MouthOpen'],
  blink: ['eyeBlinkLeft', 'eyeBlinkRight', 'eyesClosed', 'eyeBlink_L', 'eyeBlink_R', 'Blink'],
  smile: ['mouthSmile', 'mouthSmileLeft', 'mouthSmileRight', 'mouthSmile_L', 'mouthSmile_R', 'Smile'],
};

const _from = new THREE.Vector3();
const _to = new THREE.Vector3();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _wq = new THREE.Quaternion();
const _pq = new THREE.Quaternion();
const _e = new THREE.Euler();

/** Rotate `bone` (in world space, minimal arc) so the segment bone→child points along `dir`. Rig-axis agnostic. */
function aim(bone: THREE.Object3D, child: THREE.Object3D, dir: THREE.Vector3) {
  if (!bone.parent) return;
  child.getWorldPosition(_from).sub(bone.getWorldPosition(_p)).normalize();
  _q.setFromUnitVectors(_from, _to.copy(dir).normalize());
  bone.getWorldQuaternion(_wq);
  bone.parent.getWorldQuaternion(_pq);
  bone.quaternion.copy(_pq.invert().multiply(_q.multiply(_wq)));
}

const HEAD_Y = 0.86; // match the hologram's head height so the stage framing is shared
const HEAD_TO_HIPS = 1.15;

interface GlbAvatarProps {
  url: string;
  director: Director;
}

const GlbAvatar: React.FC<GlbAvatarProps> = ({ url, director }) => {
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null);

  const rig = useMemo(() => {
    const bones: Record<string, THREE.Object3D> = {};
    const morphs: { influences: number[]; jaw: number[]; blink: number[]; smile: number[] }[] = [];
    scene.traverse((o) => {
      if ((o as THREE.Bone).isBone) bones[norm(o.name)] ??= o;
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.frustumCulled = false; // skinned bounds don't follow posed bones
      if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
        const dict = mesh.morphTargetDictionary;
        const pick = (names: string[]) => names.map((n) => dict[n]).filter((i): i is number => i !== undefined);
        morphs.push({ influences: mesh.morphTargetInfluences, jaw: pick(MORPHS.jaw), blink: pick(MORPHS.blink), smile: pick(MORPHS.smile) });
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
    // Positions in the scene's parent space, independent of wherever a previous mount attached it.
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
      rest,
      morphs,
      scale,
      offset,
      spine: b('spine2', 'spine1', 'spine', 'chest'),
      neck: b('neck'),
      head,
      // The model faces the viewer, so its right arm is on screen-left.
      armL: [b('rightarm', 'rightupperarm'), b('rightforearm', 'rightlowerarm'), b('righthand')],
      armR: [b('leftarm', 'leftupperarm'), b('leftforearm', 'leftlowerarm'), b('lefthand')],
    };
  }, [scene]);

  useFrame((state, delta) => {
    const live = director.step(state.clock.elapsedTime, Math.min(delta, 0.05));
    if (group.current) group.current.position.set(rig.offset.x, rig.offset.y + live.lift, rig.offset.z);
    rig.rest.forEach((q, bone) => bone.quaternion.copy(q));

    const turn = (bone: THREE.Object3D | null, k: number, r: THREE.Vector3) =>
      bone?.quaternion.multiply(_q.setFromEuler(_e.set(r.x * k, r.y * k, r.z * k)));
    turn(rig.spine, 0.6, live.torso);
    turn(rig.neck, 0.4, live.head);
    turn(rig.head, 0.6, live.head);

    for (const [chain, [upper, fore]] of [
      [rig.armL, live.armL],
      [rig.armR, live.armR],
    ] as const) {
      const [u, f, h] = chain;
      if (u && f) aim(u, f, upper);
      if (f && h) aim(f, h, fore);
    }

    for (const m of rig.morphs) {
      m.jaw.forEach((i) => (m.influences[i] = live.mouth * 0.7));
      m.blink.forEach((i) => (m.influences[i] = live.blink));
      m.smile.forEach((i) => (m.influences[i] = live.smile * 0.6));
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 4]} intensity={1.6} />
      <directionalLight position={[-3, 1, -2]} intensity={1.4} color="#38bdf8" />
      <group ref={group} scale={rig.scale}>
        <primitive object={scene} />
      </group>
    </>
  );
};

export default GlbAvatar;
