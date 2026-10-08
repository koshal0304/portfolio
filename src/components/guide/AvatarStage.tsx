import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import SafeBoundary from '../SafeBoundary';
import HoloAvatar from './HoloAvatar';
import { createDirector } from './director';
import type { GuideSignal } from './signal';

// Drop a rigged humanoid .glb into src/assets/avatar/ and it replaces the hologram (see README there).
const found = import.meta.glob('../../assets/avatar/*.glb', { query: '?url', import: 'default', eager: true });
const AVATAR_URL = (Object.values(found)[0] as string | undefined) ?? null;
const GlbAvatar = lazy(() => import('./GlbAvatar'));

interface AvatarStageProps {
  signal: React.MutableRefObject<GuideSignal>;
  stage: React.RefObject<HTMLElement>;
  reducedMotion: boolean;
}

const Body: React.FC<AvatarStageProps> = ({ signal, stage, reducedMotion }) => {
  const director = useMemo(() => createDirector(signal, stage, reducedMotion), [signal, stage, reducedMotion]);
  useEffect(() => director.dispose, [director]);
  const holo = <HoloAvatar director={director} reducedMotion={reducedMotion} />;
  if (!AVATAR_URL) return holo;
  return (
    <SafeBoundary fallback={holo}>
      <Suspense fallback={holo}>
        <GlbAvatar url={AVATAR_URL} director={director} />
      </Suspense>
    </SafeBoundary>
  );
};

const AvatarStage: React.FC<AvatarStageProps> = (props) => (
  <Canvas
    camera={{ position: [0, 0.2, 4.6], fov: 32 }}
    dpr={[1, 1.5]}
    gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
    // A full-body model is cropped at the waist; fade the cut instead of a hard edge.
    style={{ pointerEvents: 'none', maskImage: AVATAR_URL ? 'linear-gradient(to bottom, #000 72%, transparent)' : undefined }}
  >
    <Body {...props} />
  </Canvas>
);

export default AvatarStage;
