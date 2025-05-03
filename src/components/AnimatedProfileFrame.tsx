import React, { useEffect, useRef, useState } from 'react';

interface AnimatedProfileFrameProps {
  imageSrc: string;
  altText: string;
  className?: string;
}

const AnimatedProfileFrame: React.FC<AnimatedProfileFrameProps> = ({ 
  imageSrc, 
  altText,
  className = ""
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  
  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!frameRef.current) return;
    
    const rect = frameRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate rotation based on mouse position relative to center
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 10; // Max 10 degrees
    const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 10; // Max 10 degrees
    
    setRotation({ x: rotateX, y: rotateY });
  };
  
  // Animate glow effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHovered) {
      let intensity = 0;
      let direction = 1;
      
      interval = setInterval(() => {
        intensity += 0.05 * direction;
        
        // Reverse direction when reaching limits
        if (intensity >= 1) direction = -1;
        if (intensity <= 0.3) direction = 1;
        
        setGlowIntensity(intensity);
      }, 50);
    } else {
      // Reset glow when not hovered
      setGlowIntensity(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered]);
  
  return (
    <div 
      ref={frameRef}
      className={`relative perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 });
      }}
    >
      {/* Animated border frame */}
      <div 
        className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-pulse-slow"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: 'transform 0.1s ease-out',
          boxShadow: `0 0 ${20 + glowIntensity * 30}px ${glowIntensity * 15}px rgba(59, 130, 246, ${0.3 + glowIntensity * 0.4})`,
        }}
      ></div>
      
      {/* Outer glow ring */}
      <div 
        className="absolute inset-4 rounded-full border-2 border-blue-400/20"
        style={{
          transform: `rotateX(${rotation.x * 1.2}deg) rotateY(${rotation.y * 1.2}deg)`,
          transition: 'transform 0.15s ease-out',
          boxShadow: `0 0 ${10 + glowIntensity * 20}px ${glowIntensity * 10}px rgba(59, 130, 246, ${0.2 + glowIntensity * 0.3})`,
        }}
      ></div>
      
      {/* Image container */}
      <div 
        className="relative rounded-full overflow-hidden transform-gpu"
        style={{
          transform: `rotateX(${rotation.x * 0.8}deg) rotateY(${rotation.y * 0.8}deg)`,
          transition: 'transform 0.2s ease-out',
          boxShadow: `0 0 ${15 + glowIntensity * 25}px ${glowIntensity * 12}px rgba(59, 130, 246, ${0.25 + glowIntensity * 0.35})`,
        }}
      >
        {/* Actual image */}
        <img 
          src={imageSrc} 
          alt={altText}
          className="w-full h-full object-cover rounded-full"
        />
        
        {/* Overlay effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent pointer-events-none"
          style={{
            opacity: 0.3 + glowIntensity * 0.4,
            transition: 'opacity 0.3s ease-out'
          }}
        ></div>
      </div>
      
      {/* Floating particles around the image */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 52 + (isHovered ? 5 : 0); // Expand slightly on hover
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const size = 2 + Math.random() * 3;
        const animationDelay = i * 0.5;
        
        return (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400 animate-pulse-slow"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `calc(50% + ${x}%)`,
              top: `calc(50% + ${y}%)`,
              transform: 'translate(-50%, -50%)',
              opacity: 0.6 + glowIntensity * 0.4,
              boxShadow: `0 0 ${5 + glowIntensity * 10}px ${glowIntensity * 5}px rgba(59, 130, 246, ${0.4 + glowIntensity * 0.6})`,
              animationDelay: `${animationDelay}s`,
            }}
          ></div>
        );
      })}
      
      {/* Orbital ring */}
      <div 
        className="absolute inset-0 rounded-full border border-blue-400/30"
        style={{
          transform: `rotateX(75deg) rotateY(${rotation.y * 0.5}deg)`,
          transition: 'transform 0.25s ease-out',
        }}
      ></div>
    </div>
  );
};

export default AnimatedProfileFrame;
