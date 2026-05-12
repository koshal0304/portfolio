import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { motion } from 'framer-motion';

interface ModelLoaderProps {
  children: React.ReactNode;
  showPercentage?: boolean;
  showBar?: boolean;
  color?: string;
  backgroundColor?: string;
}

/**
 * A component to display loading progress for 3D models
 */
const ModelLoader: React.FC<ModelLoaderProps> = ({
  children,
  showPercentage = true,
  showBar = true,
  color = '#4299e1',
  backgroundColor = 'rgba(0, 0, 0, 0.5)'
}) => {
  const { active, progress, errors, item, loaded, total } = useProgress();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // When progress reaches 100%, wait a bit before showing content
    if (progress === 100 && !isLoaded) {
      const timeout = setTimeout(() => {
        setIsLoaded(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [progress, isLoaded]);
  
  if (isLoaded && !active) {
    return <>{children}</>;
  }
  
  return (
    <div className="relative w-full h-full">
      {/* Loading overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoaded ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ backgroundColor, zIndex: 10 }}
      >
        {/* Spinner */}
        <div className="relative w-12 h-12 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute w-full h-full rounded-full border-t-2 border-r-2 border-transparent"
            style={{ borderTopColor: color, borderRightColor: color }}
          />
        </div>
        
        {/* Loading text */}
        {showPercentage && (
          <div className="text-white font-medium text-lg">
            {Math.round(progress)}%
          </div>
        )}
        
        {/* Loading item name */}
        <div className="text-white/70 text-sm mt-1 max-w-xs truncate">
          {item}
        </div>
        
        {/* Progress bar */}
        {showBar && (
          <div className="w-48 h-1 bg-gray-800 rounded-full mt-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
        )}
      </motion.div>
      
      {/* Actual content */}
      <div className={`w-full h-full ${isLoaded ? 'visible' : 'invisible'}`}>
        {children}
      </div>
    </div>
  );
};

export default ModelLoader; 