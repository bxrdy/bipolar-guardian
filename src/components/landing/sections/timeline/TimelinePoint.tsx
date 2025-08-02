
import React, { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleSpring, staggerItem } from '@/lib/motion';

interface TimelinePointProps {
  icon: LucideIcon;
  color: string;
  isVisible: boolean;
  index: number;
  onMouseEnter: (element: HTMLElement) => void;
  onMouseLeave: () => void;
  position: number;
}

// Design system colors for timeline progression
const designSystemColors = [
  'rgb(100, 116, 139)', // slate-500
  'rgb(59, 130, 246)',  // blue-500  
  'rgb(245, 158, 11)',  // amber-500
  'rgb(249, 115, 22)',  // orange-500
  'rgb(239, 68, 68)',   // red-500
  'rgb(34, 197, 94)'    // green-500
];

const TimelinePoint: React.FC<TimelinePointProps> = ({
  icon: Icon,
  color,
  isVisible,
  index,
  onMouseEnter,
  onMouseLeave,
  position
}) => {
  const prefersReducedMotion = useReducedMotion();
  const pointRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const [isHovered, setIsHovered] = useState(false);

  // Get design system color
  const systemColor = designSystemColors[index] || designSystemColors[0];

  // Debounced hover handlers to prevent stuttering
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      if (pointRef.current) {
        setIsHovered(true);
        onMouseEnter(pointRef.current);
      }
    }, 100); // Small delay to prevent accidental triggers
  }, [onMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      onMouseLeave();
    }, 150); // Slight delay to prevent flickering
  }, [onMouseLeave]);

  // Cleanup timeouts
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const timelinePointVariants = {
    hidden: { 
      scale: 0, 
      opacity: 0,
      y: 20,
      rotate: -90
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        ...appleSpring.bouncy,
        duration: prefersReducedMotion ? 0.01 : 0.6
      }
    },
    hover: {
      scale: 1.15,
      y: -3,
      transition: {
        ...appleSpring.gentle,
        duration: prefersReducedMotion ? 0.01 : 0.25
      }
    }
  };

  return (
    <motion.div
      ref={pointRef}
      className="cursor-pointer group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      variants={staggerItem}
    >
      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"
        style={{ backgroundColor: systemColor }}
        animate={{
          scale: isHovered ? 1.8 : 1.2,
          opacity: isHovered ? 0.2 : 0
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Main timeline point */}
      <motion.div
        className="relative flex items-center justify-center w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-lg backdrop-blur-sm"
        style={{ 
          backgroundColor: systemColor,
          boxShadow: `0 4px 12px ${systemColor}25, 0 2px 4px rgba(0,0,0,0.1)`
        }}
        variants={timelinePointVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        whileHover={prefersReducedMotion ? {} : "hover"}
        {...(!prefersReducedMotion && isVisible ? {
          animate: {
            ...timelinePointVariants.visible,
            y: [0, -2, 0],
            transition: {
              ...timelinePointVariants.visible.transition,
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse"
              }
            }
          }
        } : {})}
      >
        {/* Icon with enhanced animation */}
        <motion.div
          initial={{ rotate: -180, scale: 0, opacity: 0 }}
          animate={isVisible ? { 
            rotate: 0, 
            scale: 1, 
            opacity: 1 
          } : { 
            rotate: -180, 
            scale: 0, 
            opacity: 0 
          }}
          transition={{ 
            ...appleSpring.bouncy,
            delay: index * 0.15 + 0.2,
            duration: prefersReducedMotion ? 0.01 : 0.5
          }}
          whileHover={{
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.4 }
          }}
        >
          <Icon className="w-6 h-6 text-white drop-shadow-sm" />
        </motion.div>

        {/* Pulse ring effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 opacity-0"
          style={{ borderColor: systemColor }}
          animate={isVisible && !prefersReducedMotion ? {
            scale: [1, 1.5, 2],
            opacity: [0.5, 0.2, 0]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.3
          }}
        />
      </motion.div>

      {/* Focus indicator for accessibility */}
      <div className="absolute inset-0 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background opacity-0 focus-within:opacity-100 transition-opacity" />
    </motion.div>
  );
};

export default TimelinePoint;
