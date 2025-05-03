import React, { useEffect, useRef, useState } from 'react';

interface ScrollAnimationWrapperProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-in-up' | 'fade-in-left' | 'fade-in-right' | 'scale-in' | 'rotate-in';
  threshold?: number; // 0 to 1, percentage of element visible to trigger animation
  delay?: number; // delay in ms
  duration?: number; // duration in ms
  once?: boolean; // animate only once or every time element enters viewport
}

const ScrollAnimationWrapper: React.FC<ScrollAnimationWrapperProps> = ({
  children,
  className = '',
  animation = 'fade-in-up',
  threshold = 0.2,
  delay = 0,
  duration = 600,
  once = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!isVisible && entry.isIntersecting) {
            // Set a timeout for the delay
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else if (!once && !entry.isIntersecting) {
            // Reset visibility if not once and element is out of viewport
            setIsVisible(false);
          }
        });
      },
      { threshold }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isVisible, threshold, delay, once]);

  return (
    <div
      ref={domRef}
      className={`animate-on-scroll ${animation} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

export default ScrollAnimationWrapper;
