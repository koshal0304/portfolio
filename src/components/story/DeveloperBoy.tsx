import React, { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { COLORS } from './constants';
import { createKKTexture, createSpeechBubbleTexture } from './textures';

export interface BoyRefs {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  head: THREE.Mesh;
  bubble: THREE.Group;
  cursor: THREE.Mesh;
}

const DeveloperBoy = forwardRef<BoyRefs>((_, ref) => {
  const groupRef = useRef<THREE.Group>(null!);
  const leftArmRef = useRef<THREE.Group>(null!);
  const rightArmRef = useRef<THREE.Group>(null!);
  const leftLegRef = useRef<THREE.Group>(null!);
  const rightLegRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Mesh>(null!);
  const bubbleRef = useRef<THREE.Group>(null!);
  const cursorRef = useRef<THREE.Mesh>(null!);

  useImperativeHandle(ref, () => ({
    group: groupRef.current,
    leftArm: leftArmRef.current,
    rightArm: rightArmRef.current,
    leftLeg: leftLegRef.current,
    rightLeg: rightLegRef.current,
    head: headRef.current,
    bubble: bubbleRef.current,
    cursor: cursorRef.current,
  }));

  const kkTexture = useMemo(() => createKKTexture(), []);
  const bubbleTexture = useMemo(() => createSpeechBubbleTexture(), []);

  const skinMat = useMemo(() => new THREE.MeshToonMaterial({ color: COLORS.skin, flatShading: true }), []);
  const hoodieMat = useMemo(() => new THREE.MeshToonMaterial({ color: COLORS.hoodie, flatShading: true }), []);
  const hairMat = useMemo(() => new THREE.MeshToonMaterial({ color: COLORS.hair, flatShading: true }), []);
  const eyeMat = useMemo(() => new THREE.MeshToonMaterial({ color: COLORS.eyes }), []);
  const jeansMat = useMemo(() => new THREE.MeshToonMaterial({ color: COLORS.jeans, flatShading: true }), []);
  const shoeMat = useMemo(() => new THREE.MeshToonMaterial({ color: COLORS.shoes, flatShading: true }), []);

  // Arm geometry with pivot at top (shoulder)
  const armGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.055, 0.05, 0.28, 6);
    g.translate(0, -0.14, 0);
    return g;
  }, []);

  // Leg geometry with pivot at top (hip)
  const legGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.075, 0.065, 0.32, 6);
    g.translate(0, -0.16, 0);
    return g;
  }, []);

  return (
    <group ref={groupRef}>
      {/* ── Head ── */}
      <mesh ref={headRef} position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <primitive object={skinMat} attach="material" />
      </mesh>

      {/* ── Hair ── */}
      <mesh position={[0, 0.4, -0.02]} scale={[1, 0.7, 1]}>
        <sphereGeometry args={[0.21, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <primitive object={hairMat} attach="material" />
      </mesh>

      {/* ── Eyes ── */}
      <mesh position={[-0.07, 0.37, 0.16]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <primitive object={eyeMat} attach="material" />
      </mesh>
      <mesh position={[0.07, 0.37, 0.16]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <primitive object={eyeMat} attach="material" />
      </mesh>

      {/* ── Body (hoodie) ── */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.38, 8]} />
        <primitive object={hoodieMat} attach="material" />
      </mesh>

      {/* ── KK Monogram on chest ── */}
      <mesh position={[0, 0.08, 0.151]}>
        <planeGeometry args={[0.1, 0.08]} />
        <meshBasicMaterial map={kkTexture} transparent opacity={0.9} />
      </mesh>

      {/* ── Left Arm ── */}
      <group ref={leftArmRef} position={[-0.19, 0.14, 0]}>
        <mesh geometry={armGeo}>
          <primitive object={hoodieMat} attach="material" />
        </mesh>
        <mesh position={[0, -0.31, 0]}>
          <sphereGeometry args={[0.055, 6, 6]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
      </group>

      {/* ── Right Arm ── */}
      <group ref={rightArmRef} position={[0.19, 0.14, 0]}>
        <mesh geometry={armGeo}>
          <primitive object={hoodieMat} attach="material" />
        </mesh>
        <mesh position={[0, -0.31, 0]}>
          <sphereGeometry args={[0.055, 6, 6]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
      </group>

      {/* ── Left Leg ── */}
      <group ref={leftLegRef} position={[-0.07, -0.15, 0]}>
        <mesh geometry={legGeo}>
          <primitive object={jeansMat} attach="material" />
        </mesh>
        <mesh position={[0, -0.36, 0.02]}>
          <boxGeometry args={[0.11, 0.07, 0.16]} />
          <primitive object={shoeMat} attach="material" />
        </mesh>
      </group>

      {/* ── Right Leg ── */}
      <group ref={rightLegRef} position={[0.07, -0.15, 0]}>
        <mesh geometry={legGeo}>
          <primitive object={jeansMat} attach="material" />
        </mesh>
        <mesh position={[0, -0.36, 0.02]}>
          <boxGeometry args={[0.11, 0.07, 0.16]} />
          <primitive object={shoeMat} attach="material" />
        </mesh>
      </group>

      {/* ── Speech Bubble (Act 6, starts hidden) ── */}
      <group ref={bubbleRef} position={[0, 0.75, 0]} scale={[0, 0, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.45]} />
          <meshBasicMaterial map={bubbleTexture} transparent side={THREE.DoubleSide} />
        </mesh>
        {/* Blinking cursor */}
        <mesh ref={cursorRef} position={[0.42, -0.02, 0.001]}>
          <boxGeometry args={[0.02, 0.08, 0.001]} />
          <meshBasicMaterial color={COLORS.hoodie} transparent />
        </mesh>
      </group>
    </group>
  );
});

DeveloperBoy.displayName = 'DeveloperBoy';
export default DeveloperBoy;
