import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  id: string;
  className?: string;
  transitionType?: 'fade' | 'slide' | 'scale' | 'rotate' | 'flip';
  duration?: number;
  delay?: number;
  threshold?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  id,
  className = '',
  transitionType = 'fade',
  duration = 0.5,
  delay = 0,
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Once animation is triggered, we don't need to watch anymore
          if (!hasAnimated) {
            setHasAnimated(true);
          }
        } else if (!hasAnimated) {
          // Only hide if we haven't fully animated yet
          setIsVisible(false);
        }
      },
      { threshold }
    );
    
    const element = document.getElementById(id);
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [id, hasAnimated, threshold]);
  
  // Define different animation variants
  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    slide: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 }
    },
    rotate: {
      hidden: { opacity: 0, rotateZ: -5 },
      visible: { opacity: 1, rotateZ: 0 }
    },
    flip: {
      hidden: { opacity: 0, rotateX: 90 },
      visible: { opacity: 1, rotateX: 0 }
    }
  };
  
  // Select the appropriate animation variant
  const selectedVariant = variants[transitionType];
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        id={id}
        className={`transition-container ${className}`}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        exit="hidden"
        variants={selectedVariant}
        transition={{ 
          duration,
          delay,
          ease: "easeOut"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition; 