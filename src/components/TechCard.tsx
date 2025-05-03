import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TechCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
  delay?: number;
}

const TechCard: React.FC<TechCardProps> = ({ 
  icon, 
  title, 
  description, 
  color = 'blue', 
  delay = 0 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get color classes based on the color prop
  const getColorClasses = () => {
    switch (color) {
      case 'purple':
        return {
          bgLight: 'bg-purple-500/10',
          bgDark: 'bg-purple-600/20',
          border: 'border-purple-500/30',
          glow: '0 0 20px rgba(147, 51, 234, 0.5)',
          iconColor: 'text-purple-400',
          titleColor: 'text-purple-300',
          rgb: '147, 51, 234'
        };
      case 'indigo':
        return {
          bgLight: 'bg-indigo-500/10',
          bgDark: 'bg-indigo-600/20',
          border: 'border-indigo-500/30',
          glow: '0 0 20px rgba(99, 102, 241, 0.5)',
          iconColor: 'text-indigo-400',
          titleColor: 'text-indigo-300',
          rgb: '99, 102, 241'
        };
      case 'cyan':
        return {
          bgLight: 'bg-cyan-500/10',
          bgDark: 'bg-cyan-600/20',
          border: 'border-cyan-500/30',
          glow: '0 0 20px rgba(6, 182, 212, 0.5)',
          iconColor: 'text-cyan-400',
          titleColor: 'text-cyan-300',
          rgb: '6, 182, 212'
        };
      case 'blue':
      default:
        return {
          bgLight: 'bg-blue-500/10',
          bgDark: 'bg-blue-600/20',
          border: 'border-blue-500/30',
          glow: '0 0 20px rgba(59, 130, 246, 0.5)',
          iconColor: 'text-blue-400',
          titleColor: 'text-blue-300',
          rgb: '59, 130, 246'
        };
    }
  };
  
  const colors = getColorClasses();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + delay }}
      className={`relative p-5 rounded-xl backdrop-blur-sm ${colors.bgLight} border ${colors.border} hover-lift`}
      style={{
        boxShadow: isHovered ? colors.glow : 'none',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease, background-color 0.3s ease',
        '--glow-rgb': colors.rgb
      } as React.CSSProperties}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background glow effect */}
      <div 
        className={`absolute inset-0 rounded-xl ${colors.bgDark} opacity-0 transition-opacity duration-300`}
        style={{ opacity: isHovered ? 0.6 : 0 }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className={`${colors.iconColor} mb-3`}>
          {icon}
        </div>
        
        <h3 className={`${colors.titleColor} text-lg font-semibold mb-2`}>
          {title}
        </h3>
        
        <p className="text-gray-300 text-sm">
          {description}
        </p>
      </div>
      
      {/* Corner accent */}
      <div 
        className={`absolute top-0 right-0 w-8 h-8 ${colors.border} opacity-30`}
        style={{
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
          opacity: isHovered ? 0.6 : 0.3,
          transition: 'opacity 0.3s ease'
        }}
      ></div>
    </motion.div>
  );
};

export default TechCard;
