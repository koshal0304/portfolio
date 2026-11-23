import React, { Suspense, lazy, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import SafeBoundary from '../SafeBoundary';
import HoloAvatar from './HoloAvatar';
import { AVATAR_URL } from './avatarAsset';
import { createDirector } from './director';
import type { GuideSignal } from './signal';

const GlbAvatar = lazy(() => import('./GlbAvatar'));

interface AvatarStageProps {
  signal: React.MutableRefObject<GuideSignal>;
  stage: React.RefObject<HTMLElement>;
  reducedMotion: boolean;
}

/** Render resolution follows the on-screen size: full in the hero, about half once docked. */
const Resolution: React.FC<{ signal: React.MutableRefObject<GuideSignal> }> = ({ signal }) => {
  const setDpr = useThree((s) => s.setDpr);
  const docked = useRef<boolean | null>(null);
  useFrame(() => {
    const d = signal.current.dock > 0.85;
    if (d === docked.current) return;
    docked.current = d;
    setDpr(d ? Math.max(1, window.devicePixelRatio) * 0.6 : Math.min(window.devicePixelRatio, 1.75));
  });
  return null;
};

const Body: React.FC<AvatarStageProps> = ({ signal, stage, reducedMotion }) => {
  const director = useMemo(() => createDirector(signal, stage, reducedMotion), [signal, stage, reducedMotion]);
  useEffect(() => director.dispose, [director]);
  useEffect(() => {
    if (!AVATAR_URL) signal.current.readyAt ||= performance.now(); // the hologram needs no loading
  }, [signal]);
  const holo = <HoloAvatar director={director} reducedMotion={reducedMotion} />;
  if (!AVATAR_URL) return holo;
  return (
    <SafeBoundary fallback={holo}>
      <Suspense fallback={null}>
        <GlbAvatar url={AVATAR_URL} director={director} signal={signal} reducedMotion={reducedMotion} />
      </Suspense>
    </SafeBoundary>
  );
};

const AvatarStage: React.FC<AvatarStageProps & { paused: boolean }> = ({ paused, ...props }) => (
  <Canvas
    camera={{ position: [0, 0.2, 4.6], fov: 32 }}
    dpr={[1, 1.75]}
    frameloop={paused ? 'never' : 'always'}
    // The stage is CSS-scaled into the dock; measure layout size so scaling never resizes the canvas.
    resize={{ scroll: false, offsetSize: true }}
    gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    // A full-body model is cropped above the knees; fade the cut instead of a hard edge.
    style={{ pointerEvents: 'none', maskImage: AVATAR_URL ? 'linear-gradient(to bottom, #000 70%, transparent 96%)' : undefined }}
  >
    <Resolution signal={props.signal} />
    <Body {...props} />
  </Canvas>
);

export default AvatarStage;
