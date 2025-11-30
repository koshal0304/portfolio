import { useEffect, useRef, useState } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  magneticDistance?: number;
  magneticStrength?: number;
  onClick?: () => void;
  href?: string;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  magneticDistance = 50,
  magneticStrength = 0.3,
  onClick,
  href
}) => {
  const buttonRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      if (distance < magneticDistance) {
        setPosition({
          x: distanceX * magneticStrength,
          y: distanceY * magneticStrength
        });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [magneticDistance, magneticStrength]);

  const Component = href ? 'a' : 'button';

  return (
    <Component
      ref={buttonRef as any}
      className={`magnetic-btn ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
      onClick={onClick}
      href={href}
    >
      {children}
    </Component>
  );
};

export default MagneticButton;
