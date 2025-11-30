import { useEffect, useRef } from 'react';

interface CursorTrailProps {
  color?: string;
  size?: number;
  trailLength?: number;
}

const CursorTrail: React.FC<CursorTrailProps> = ({
  color = 'rgba(59, 130, 246, 0.6)',
  size = 4,
  trailLength = 20
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const trail = useRef<Array<{ x: number; y: number; opacity: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };

      // Add new point to trail
      trail.current.unshift({
        x: e.clientX,
        y: e.clientY,
        opacity: 1
      });

      // Limit trail length
      if (trail.current.length > trailLength) {
        trail.current = trail.current.slice(0, trailLength);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw trail
      trail.current.forEach((point, index) => {
        const opacity = (1 - index / trailLength) * point.opacity;
        const currentSize = size * (1 - index / trailLength);

        ctx.beginPath();
        ctx.arc(point.x, point.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/g, `${opacity})`);
        ctx.fill();

        // Fade out
        point.opacity *= 0.95;
      });

      // Remove fully faded points
      trail.current = trail.current.filter(point => point.opacity > 0.01);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, [color, size, trailLength]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 hidden md:block"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default CursorTrail;
