import React, { useEffect, useState } from 'react';

interface MovingStarsBackgroundProps {
  starCount?: number;
  className?: string;
  density?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'medium' | 'fast';
  colorScheme?: 'white' | 'blue' | 'purple' | 'mixed';
  withNebula?: boolean;
}

const MovingStarsBackground: React.FC<MovingStarsBackgroundProps> = ({
  starCount = 50,
  className = "absolute inset-0 overflow-hidden pointer-events-none",
  density = 'medium',
  speed = 'medium',
  colorScheme = 'white',
  withNebula = false
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Adjust star count based on density
  const getStarCount = () => {
    const baseCounts = {
      low: starCount * 0.5,
      medium: starCount,
      high: starCount * 2
    };
    return Math.floor(baseCounts[density]);
  };

  // Adjust animation duration based on speed
  const getAnimationDuration = () => {
    const baseSpeed = {
      slow: [80, 120], // [min, max]
      medium: [40, 80],
      fast: [20, 40]
    };
    const [min, max] = baseSpeed[speed];
    return Math.random() * (max - min) + min;
  };

  // Get star color based on colorScheme
  const getStarColor = (isLargeStar: boolean) => {
    switch (colorScheme) {
      case 'blue':
        return isLargeStar ? '#e0f2ff' : '#a0d8ff';
      case 'purple':
        return isLargeStar ? '#f0e6ff' : '#d8b4ff';
      case 'mixed':
        const colors = ['#ffffff', '#e0f2ff', '#f0e6ff', '#ffe6f0'];
        return colors[Math.floor(Math.random() * colors.length)];
      case 'white':
      default:
        return isLargeStar ? '#f0f9ff' : '#ffffff';
    }
  };

  // Get star glow color based on colorScheme
  const getStarGlow = (isLargeStar: boolean) => {
    const intensity = isLargeStar ? 0.8 : 0.5;
    switch (colorScheme) {
      case 'blue':
        return `0 0 ${isLargeStar ? 8 : 4}px rgba(59, 130, 246, ${intensity})`;
      case 'purple':
        return `0 0 ${isLargeStar ? 8 : 4}px rgba(139, 92, 246, ${intensity})`;
      case 'mixed':
        const colors = [
          `rgba(255, 255, 255, ${intensity})`,
          `rgba(59, 130, 246, ${intensity})`,
          `rgba(139, 92, 246, ${intensity})`,
          `rgba(236, 72, 153, ${intensity})`
        ];
        return `0 0 ${isLargeStar ? 8 : 4}px ${colors[Math.floor(Math.random() * colors.length)]}`;
      case 'white':
      default:
        return `0 0 ${isLargeStar ? 8 : 4}px rgba(255, 255, 255, ${intensity})`;
    }
  };

  if (!mounted) return null;

  return (
    <div className={className}>
      {/* Stars */}
      {Array.from({ length: getStarCount() }).map((_, i) => {
        // Calculate animation properties for continuous movement
        const animationDuration = getAnimationDuration();
        const animationDelay = Math.random() * -80; // Negative delay for immediate start at different positions
        const isLargeStar = Math.random() < 0.2; // 20% chance of being a larger star

        // Choose a random movement direction for each star
        const movementTypes = ['moveStar', 'moveStarRight', 'moveStarLeft', 'moveStarDiagonal'];
        const randomMovement = movementTypes[Math.floor(Math.random() * movementTypes.length)];

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${isLargeStar ? Math.random() * 3 + 2 : Math.random() * 2 + 1}px`,
              height: `${isLargeStar ? Math.random() * 3 + 2 : Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.9 + 0.1,
              backgroundColor: getStarColor(isLargeStar),
              boxShadow: getStarGlow(isLargeStar),
              animation: `${randomMovement} ${animationDuration}s linear infinite ${animationDelay}s, pulse ${Math.random() * 4 + 1}s ease-in-out infinite`
            }}
          />
        );
      })}

      {/* Optional nebula effects */}
      {withNebula && (
        <>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-2/3 left-1/2 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </>
      )}
    </div>
  );
};

export default MovingStarsBackground;
