import React, { useEffect, useRef, useState } from 'react';

interface ParallaxEffectProps {
  children: React.ReactNode;
  className?: string;
  speed?: 'slow' | 'medium' | 'fast';
  direction?: 'up' | 'down' | 'left' | 'right';
  factor?: number; // Movement factor (higher = more movement)
}

const ParallaxEffect: React.FC<ParallaxEffectProps> = ({
  children,
  className = '',
  speed = 'medium',
  direction = 'up',
  factor = 0.1
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Get the appropriate CSS class based on speed
  const getSpeedClass = () => {
    switch (speed) {
      case 'slow': return 'parallax-slow';
      case 'fast': return 'parallax-fast';
      default: return 'parallax-medium';
    }
  };

  // Calculate movement direction
  const getTransform = (scrollY: number, mouseX: number, mouseY: number) => {
    // Base movement on scroll position
    let x = 0;
    let y = 0;

    // Apply scroll-based movement
    if (direction === 'up') y = scrollY * factor;
    if (direction === 'down') y = -scrollY * factor;
    if (direction === 'left') x = scrollY * factor;
    if (direction === 'right') x = -scrollY * factor;

    // Add subtle mouse movement effect (reduced factor for subtlety)
    const mouseFactor = factor * 0.05;
    x += (mouseX - window.innerWidth / 2) * mouseFactor;
    y += (mouseY - window.innerHeight / 2) * mouseFactor;

    return { x, y };
  };

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;

    const handleScroll = () => {
      if (!elementRef.current) return;
      
      const scrollY = window.scrollY;
      const { x, y } = getTransform(scrollY, mouseX, mouseY);
      setOffset({ x, y });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!elementRef.current) return;
      
      const scrollY = window.scrollY;
      const { x, y } = getTransform(scrollY, mouseX, mouseY);
      setOffset({ x, y });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [factor, direction]);

  return (
    <div
      ref={elementRef}
      className={`${getSpeedClass()} ${className}`}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxEffect;
