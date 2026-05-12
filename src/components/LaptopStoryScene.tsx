import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import StoryScene from './story/StoryScene';

interface LaptopStorySceneProps {
  scrollProgress: number;
}

const LaptopStoryScene: React.FC<LaptopStorySceneProps> = ({ scrollProgress }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (reducedMotion) {
    return null; // HeroScene3D handles reduced-motion fallback
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ fov: 50, position: [0, 0.2, 3.8], near: 0.1, far: 100 }}
        style={{ background: 'transparent' }}
      >
        <StoryScene
          scrollProgress={scrollProgress}
          isMobile={isMobile}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
};

export default LaptopStoryScene;
