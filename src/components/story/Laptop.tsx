import React, { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { COLORS } from './constants';
import { createKeyboardTexture, createScreenCanvas } from './textures';

export interface LaptopRefs {
  group: THREE.Group;
  lidPivot: THREE.Group;
  screenMesh: THREE.Mesh;
  screenLight: THREE.PointLight;
  screenCanvas: HTMLCanvasElement;
  screenTexture: THREE.CanvasTexture;
}

const Laptop = forwardRef<LaptopRefs>((_, ref) => {
  const groupRef = useRef<THREE.Group>(null!);
  const lidPivotRef = useRef<THREE.Group>(null!);
  const screenMeshRef = useRef<THREE.Mesh>(null!);
  const screenLightRef = useRef<THREE.PointLight>(null!);

  const keyboardTex = useMemo(() => createKeyboardTexture(), []);
  const { canvas: scrCanvas, texture: scrTexture } = useMemo(() => createScreenCanvas(), []);

  const laptopMat = useMemo(
    () => new THREE.MeshToonMaterial({ color: COLORS.laptop }),
    []
  );
  const hingeMat = useMemo(
    () => new THREE.MeshToonMaterial({ color: '#3a4a5a' }),
    []
  );

  const screenMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: COLORS.screenBg,
        emissive: new THREE.Color(COLORS.cyan),
        emissiveIntensity: 0,
        map: scrTexture,
        side: THREE.FrontSide,
      }),
    [scrTexture]
  );

  useImperativeHandle(ref, () => ({
    group: groupRef.current,
    lidPivot: lidPivotRef.current,
    screenMesh: screenMeshRef.current,
    screenLight: screenLightRef.current,
    screenCanvas: scrCanvas,
    screenTexture: scrTexture,
  }));

  return (
    <group ref={groupRef} position={[0, -0.1, 0.3]}>
      {/* ── Base (keyboard deck) ── */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.5]} />
        <primitive object={laptopMat} attach="material" />
      </mesh>

      {/* ── Keyboard surface ── */}
      <mesh position={[0, 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.62, 0.42]} />
        <meshBasicMaterial map={keyboardTex} />
      </mesh>

      {/* ── Hinge cylinders ── */}
      <mesh position={[-0.28, 0.02, -0.25]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
        <primitive object={hingeMat} attach="material" />
      </mesh>
      <mesh position={[0.28, 0.02, -0.25]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
        <primitive object={hingeMat} attach="material" />
      </mesh>

      {/* ── Lid Pivot (rotates from hinge at back edge) ── */}
      <group ref={lidPivotRef} position={[0, 0.02, -0.25]}>
        {/* Lid back panel */}
        <mesh position={[0, 0, -0.25]}>
          <boxGeometry args={[0.7, 0.04, 0.5]} />
          <primitive object={laptopMat} attach="material" />
        </mesh>

        {/* Screen (emissive, on inside face of lid) */}
        <mesh
          ref={screenMeshRef}
          position={[0, 0.021, -0.25]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.62, 0.42]} />
          <primitive object={screenMat} attach="material" />
        </mesh>

        {/* Screen glow light */}
        <pointLight
          ref={screenLightRef}
          position={[0, 0.1, -0.15]}
          color={COLORS.cyan}
          intensity={0}
          distance={3}
          decay={2}
        />
      </group>
    </group>
  );
});

Laptop.displayName = 'Laptop';
export default Laptop;
