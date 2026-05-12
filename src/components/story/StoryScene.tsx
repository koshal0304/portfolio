import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { act, flerp, ACT, CAMERA_TARGETS, CODE_LINES } from './constants';
import DeveloperBoy, { BoyRefs } from './DeveloperBoy';
import Laptop, { LaptopRefs } from './Laptop';
import {
  OrbitingIcons, IconsRefs,
  AchievementSprites, AchievementRefs,
  CoffeeCup, CoffeeRefs,
  FloatingDesk, DeskRefs,
  AmbientDust,
} from './SceneEffects';

interface StorySceneProps {
  scrollProgress: number;
  isMobile: boolean;
  reducedMotion: boolean;
}

const StoryScene: React.FC<StorySceneProps> = ({ scrollProgress, isMobile, reducedMotion }) => {
  const { camera } = useThree();

  // ─── Refs ────────────────────────────────────────────────────────
  const boyRef = useRef<BoyRefs>(null!);
  const laptopRef = useRef<LaptopRefs>(null!);
  const iconsRef = useRef<IconsRefs>(null!);
  const achieveRef = useRef<AchievementRefs>(null!);
  const coffeeRef = useRef<CoffeeRefs>(null!);
  const deskRef = useRef<DeskRefs>(null!);
  const pausedRef = useRef(false);

  // Mutable animation state
  const orbitAngle = useRef(0);
  const orbitRadius = useRef(1.4);
  const screenFrameCount = useRef(0);
  const codeLineIdx = useRef(0);
  const achieveLife = useRef([0, 0, 0, 0]);
  const achieveActive = useRef([false, false, false, false]);
  const steamPhase = useRef(0);

  // Tab visibility
  useEffect(() => {
    const h = () => { pausedRef.current = document.hidden; };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, []);

  // Initial camera
  useEffect(() => {
    camera.position.set(0, 0.2, 3.8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Dust mat ref for time update
  const dustMatRef = useRef<THREE.ShaderMaterial | null>(null);

  useFrame((state, delta) => {
    if (pausedRef.current || !boyRef.current || !laptopRef.current) return;

    const t = scrollProgress;
    const dt = Math.min(delta, 0.05); // clamp for tab-switch spikes
    const time = state.clock.getElapsedTime();

    // ── Act progress values ──
    const a1 = act(t, ACT.STANDING.start, ACT.STANDING.end);
    const a2 = act(t, ACT.PICKUP.start, ACT.PICKUP.end);
    const a3 = act(t, ACT.DEEP_WORK.start, ACT.DEEP_WORK.end);
    const a4 = act(t, ACT.BREAKTHROUGH.start, ACT.BREAKTHROUGH.end);
    const a5 = act(t, ACT.WINDING_DOWN.start, ACT.WINDING_DOWN.end);
    const a6 = act(t, ACT.GOODBYE.start, ACT.GOODBYE.end);

    const boy = boyRef.current;
    const laptop = laptopRef.current;

    if (reducedMotion) {
      // Static pose — Act 1 standing
      boy.group.position.set(0, 0, 0);
      laptop.group.position.set(0, -0.1, 0.3);
      laptop.lidPivot.rotation.x = 0;
      return;
    }

    // ═════════════════════════════════════════════════════════════════
    // CAMERA
    // ═════════════════════════════════════════════════════════════════
    let camIdx = 0;
    if (t >= ACT.GOODBYE.start) camIdx = 5;
    else if (t >= ACT.WINDING_DOWN.start) camIdx = 4;
    else if (t >= ACT.BREAKTHROUGH.start) camIdx = 3;
    else if (t >= ACT.DEEP_WORK.start) camIdx = 2;
    else if (t >= ACT.PICKUP.start) camIdx = 1;

    const camTarget = CAMERA_TARGETS[camIdx];
    camera.position.x = flerp(camera.position.x, camTarget.x, 0.025, dt);
    camera.position.y = flerp(camera.position.y, camTarget.y, 0.025, dt);
    camera.position.z = flerp(camera.position.z, camTarget.z, 0.025, dt);
    camera.lookAt(0, 0, 0);

    // ═════════════════════════════════════════════════════════════════
    // LAPTOP LID
    // ═════════════════════════════════════════════════════════════════
    let lidTarget = 0; // closed
    if (a2 > 0 && a6 < 0.5) {
      lidTarget = -Math.PI * 0.55 * Math.min(a2, 1); // opening
    }
    if (a6 > 0) {
      lidTarget = flerp(-Math.PI * 0.55, 0, a6, 1); // closing back
    }
    laptop.lidPivot.rotation.x = flerp(laptop.lidPivot.rotation.x, lidTarget, 0.06, dt);

    // ═════════════════════════════════════════════════════════════════
    // SCREEN EMISSIVE + GLOW
    // ═════════════════════════════════════════════════════════════════
    let emissiveTarget = 0;
    if (a1 > 0) emissiveTarget = 0.2;
    if (a2 > 0) emissiveTarget = 1.5 * a2;
    if (a3 > 0) emissiveTarget = 2.5;
    if (a4 > 0) emissiveTarget = 3.0;
    if (a5 > 0) emissiveTarget = 1.0;
    if (a6 > 0) emissiveTarget = flerp(1.0, 0, a6, 1);

    const screenMat = laptop.screenMesh.material as THREE.MeshStandardMaterial;
    screenMat.emissiveIntensity = flerp(screenMat.emissiveIntensity, emissiveTarget, 0.04, dt);
    laptop.screenLight.intensity = flerp(laptop.screenLight.intensity, emissiveTarget * 0.8, 0.04, dt);

    // ═════════════════════════════════════════════════════════════════
    // SCREEN CODE TEXTURE (Act 3 only)
    // ═════════════════════════════════════════════════════════════════
    if (a3 > 0 && a3 < 1) {
      screenFrameCount.current++;
      if (screenFrameCount.current % 8 === 0) {
        const canvas = laptop.screenCanvas;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Shift content up
          const imgData = ctx.getImageData(0, 2, 256, 254);
          ctx.putImageData(imgData, 0, 0);
          // Draw new line at bottom
          ctx.fillStyle = '#001a2e';
          ctx.fillRect(0, 248, 256, 8);
          ctx.fillStyle = '#00d4ff';
          ctx.font = '9px monospace';
          const line = CODE_LINES[codeLineIdx.current % CODE_LINES.length];
          ctx.fillText(line, 4, 255);
          codeLineIdx.current++;
          laptop.screenTexture.needsUpdate = true;
        }
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // LAPTOP POSITION (desk → lap)
    // ═════════════════════════════════════════════════════════════════
    const laptopPosTarget = a2 > 0
      ? new THREE.Vector3(0, -0.15, 0.15)
      : new THREE.Vector3(0, -0.1, 0.3);
    laptop.group.position.lerp(laptopPosTarget, 0.04 * dt * 60);

    // ═════════════════════════════════════════════════════════════════
    // FLOATING DESK (fades out after Act 2)
    // ═════════════════════════════════════════════════════════════════
    if (deskRef.current) {
      const deskMat = deskRef.current.mesh.material as THREE.MeshToonMaterial;
      const deskOpacity = a2 > 0 ? Math.max(0, 1 - a2 * 2) : 1;
      deskMat.opacity = flerp(deskMat.opacity, deskOpacity, 0.05, dt);
    }

    // ═════════════════════════════════════════════════════════════════
    // BOY ARMS
    // ═════════════════════════════════════════════════════════════════
    // Act 2: right arm reaches forward
    if (a2 > 0 && a3 === 0) {
      boy.rightArm.rotation.x = flerp(boy.rightArm.rotation.x, -1.2 * a2, 0.06, dt);
      boy.leftArm.rotation.x = flerp(boy.leftArm.rotation.x, -0.3 * a2, 0.06, dt);
    }
    // Act 3: both arms type (oscillate)
    if (a3 > 0 && a4 === 0) {
      const typing = Math.sin(time * 8) * 0.15 * a3;
      boy.leftArm.rotation.x = flerp(boy.leftArm.rotation.x, -0.8 + typing, 0.08, dt);
      boy.rightArm.rotation.x = flerp(boy.rightArm.rotation.x, -0.8 - typing, 0.08, dt);
      boy.leftArm.rotation.z = 0;
      boy.rightArm.rotation.z = 0;
    }
    // Act 4: brief celebration
    if (a4 > 0 && a5 === 0) {
      boy.leftArm.rotation.x = flerp(boy.leftArm.rotation.x, -2.2, 0.05, dt);
      boy.rightArm.rotation.x = flerp(boy.rightArm.rotation.x, -2.2, 0.05, dt);
    }
    // Act 5: stretch then relax
    if (a5 > 0 && a6 === 0) {
      const stretchPhase = a5 < 0.3 ? a5 / 0.3 : 1 - (a5 - 0.3) / 0.7;
      boy.leftArm.rotation.x = flerp(boy.leftArm.rotation.x, -2.5 * stretchPhase, 0.05, dt);
      boy.rightArm.rotation.x = flerp(boy.rightArm.rotation.x, -2.5 * stretchPhase, 0.05, dt);
    }
    // Act 6: wave with right arm
    if (a6 > 0) {
      boy.leftArm.rotation.x = flerp(boy.leftArm.rotation.x, 0, 0.04, dt);
      boy.rightArm.rotation.x = flerp(boy.rightArm.rotation.x, -1.8, 0.06, dt);
      boy.rightArm.rotation.z = Math.sin(time * 4) * 0.4 * a6;
    }

    // Act 1: arms at rest
    if (a2 === 0) {
      boy.leftArm.rotation.x = flerp(boy.leftArm.rotation.x, 0, 0.04, dt);
      boy.rightArm.rotation.x = flerp(boy.rightArm.rotation.x, 0, 0.04, dt);
    }

    // ═════════════════════════════════════════════════════════════════
    // BOY LEGS (standing → sitting)
    // ═════════════════════════════════════════════════════════════════
    const sittingProgress = Math.min(1, a2);
    boy.leftLeg.rotation.x = flerp(boy.leftLeg.rotation.x, Math.PI / 2 * sittingProgress * 0.8, 0.04, dt);
    boy.rightLeg.rotation.x = flerp(boy.rightLeg.rotation.x, Math.PI / 2 * sittingProgress * 0.8, 0.04, dt);
    boy.leftLeg.rotation.z = flerp(boy.leftLeg.rotation.z, 0.15 * sittingProgress, 0.04, dt);
    boy.rightLeg.rotation.z = flerp(boy.rightLeg.rotation.z, -0.15 * sittingProgress, 0.04, dt);

    // ═════════════════════════════════════════════════════════════════
    // BOY BODY LEAN
    // ═════════════════════════════════════════════════════════════════
    let leanTarget = 0;
    if (a3 > 0) leanTarget = 0.15;
    if (a5 > 0) leanTarget = 0;
    if (a6 > 0) leanTarget = 0;
    boy.group.rotation.x = flerp(boy.group.rotation.x, leanTarget, 0.03, dt);

    // Act 6: face camera
    const yRotTarget = a6 > 0 ? 0 : 0;
    boy.group.rotation.y = flerp(boy.group.rotation.y, yRotTarget, 0.03, dt);

    // ═════════════════════════════════════════════════════════════════
    // ORBITING ICONS
    // ═════════════════════════════════════════════════════════════════
    if (iconsRef.current && !isMobile) {
      const icons = iconsRef.current;
      // Scale in during Act 3
      let iconScale = 0;
      if (a3 > 0) iconScale = Math.min(1, a3 * 3);
      if (a4 > 0) iconScale = Math.max(0, 1 - a4 * 2);
      if (a5 > 0) iconScale = 0;

      icons.container.scale.setScalar(flerp(icons.container.scale.x, iconScale, 0.05, dt));

      // Orbit
      if (iconScale > 0.01) {
        orbitAngle.current += dt * 0.4;
        // Burst outward in Act 4
        const radiusTarget = a4 > 0 ? 4.0 : 1.4;
        orbitRadius.current = flerp(orbitRadius.current, radiusTarget, 0.04, dt);

        for (let i = 0; i < 4; i++) {
          const angle = orbitAngle.current + (i * Math.PI / 2);
          const r = orbitRadius.current;
          const g = icons.groups[i];
          if (g) {
            g.position.x = Math.cos(angle) * r;
            g.position.z = Math.sin(angle) * r;
            g.position.y = Math.sin(angle * 2) * 0.15;
            g.rotation.y += dt * 0.8;
          }
        }
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // ACHIEVEMENT SPRITES (Act 4)
    // ═════════════════════════════════════════════════════════════════
    if (achieveRef.current) {
      const sprites = achieveRef.current.sprites;
      const thresholds = [0, 0.3, 0.5, 0.7];

      for (let i = 0; i < 4; i++) {
        const s = sprites[i];
        if (!s) continue;

        if (a4 > thresholds[i] && !achieveActive.current[i]) {
          achieveActive.current[i] = true;
          achieveLife.current[i] = 1;
          s.visible = true;
          s.position.set(0, 0.1, 0.5);
          s.scale.set(0.8, 0.4, 1);
        }

        if (achieveActive.current[i] && achieveLife.current[i] > 0) {
          achieveLife.current[i] -= dt * 0.8;
          s.position.y += dt * 0.5;
          s.scale.x = flerp(s.scale.x, 1.2, 0.03, dt);
          s.scale.y = flerp(s.scale.y, 0.6, 0.03, dt);
          const mat = s.material as THREE.SpriteMaterial;
          mat.opacity = Math.max(0, achieveLife.current[i]);
          if (achieveLife.current[i] <= 0) {
            s.visible = false;
            achieveActive.current[i] = false;
          }
        }
      }

      // Reset when leaving Act 4
      if (a4 === 0) {
        for (let i = 0; i < 4; i++) {
          achieveActive.current[i] = false;
          achieveLife.current[i] = 0;
          if (sprites[i]) sprites[i].visible = false;
        }
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // COFFEE CUP (Act 5)
    // ═════════════════════════════════════════════════════════════════
    if (coffeeRef.current && !isMobile) {
      let coffeeScale = 0;
      if (a5 > 0) coffeeScale = Math.min(0.6, a5 * 2);
      if (a6 > 0) coffeeScale = Math.max(0, 0.6 * (1 - a6));
      const g = coffeeRef.current.group;
      g.scale.setScalar(flerp(g.scale.x, coffeeScale, 0.04, dt));

      // Steam animation
      steamPhase.current += dt;
      g.children.forEach((child, i) => {
        if (i >= 2 && child instanceof THREE.Mesh) {
          child.position.y = 0.1 + (i - 2) * 0.03 + Math.sin(steamPhase.current * 2 + i) * 0.02;
          (child.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(steamPhase.current * 3 + i) * 0.1;
        }
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // SPEECH BUBBLE (Act 6)
    // ═════════════════════════════════════════════════════════════════
    let bubbleScale = 0;
    if (a6 > 0) bubbleScale = Math.min(1, a6 * 3);
    boy.bubble.scale.setScalar(flerp(boy.bubble.scale.x, bubbleScale, 0.06, dt));

    // Blinking cursor
    const cursorMat = boy.cursor.material as THREE.MeshBasicMaterial;
    cursorMat.opacity = Math.sin(time * 5) > 0 ? 1 : 0;

    // ═════════════════════════════════════════════════════════════════
    // AMBIENT DUST TIME UPDATE
    // ═════════════════════════════════════════════════════════════════
    // Find dust shader in scene and update time
    state.scene.traverse((obj) => {
      if (obj instanceof THREE.Points && obj.userData.matRef) {
        const mat = obj.userData.matRef.current as THREE.ShaderMaterial | null;
        if (mat) mat.uniforms.uTime.value = time;
      }
    });
  });

  const dustCount = isMobile ? 100 : 400;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} color="#0a0a1e" />
      <directionalLight position={[2, 3, 3]} intensity={0.8} color="#f0f0ff" />
      <pointLight position={[-2, 1, -2]} color="#7c3aed" intensity={0.6} />

      {/* Character */}
      <DeveloperBoy ref={boyRef} />

      {/* Laptop */}
      <Laptop ref={laptopRef} />

      {/* Floating Desk */}
      <FloatingDesk ref={deskRef} />

      {/* Orbiting Icons */}
      {!isMobile && <OrbitingIcons ref={iconsRef} />}

      {/* Achievement Sprites */}
      <AchievementSprites ref={achieveRef} />

      {/* Coffee Cup */}
      {!isMobile && <CoffeeCup ref={coffeeRef} />}

      {/* Ambient Dust */}
      <AmbientDust count={dustCount} />
    </>
  );
};

export default StoryScene;
