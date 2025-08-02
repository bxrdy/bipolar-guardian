
import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleSpring } from '@/lib/motion';

interface TimelineLineProps {
  visibleSteps: number[];
  totalSteps: number;
}

const TimelineLine: React.FC<TimelineLineProps> = ({ visibleSteps, totalSteps }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2">
      <div className="w-full h-full bg-gradient-to-r from-green-500/20 via-yellow-500/20 via-orange-500/20 to-red-500/20 rounded-full" />
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500/60 via-yellow-500/60 via-orange-500/60 to-red-500/60 rounded-full origin-left"
        initial={{ scaleX: 0 }}
        animate={{ 
          scaleX: visibleSteps.length > 0 ? (Math.max(...visibleSteps, -1) + 1) / totalSteps : 0 
        }}
        transition={{ 
          ...appleSpring.smooth,
          duration: prefersReducedMotion ? 0.01 : 1.2,
          delay: 0.3
        }}
      />
    </div>
  );
};

export default TimelineLine;
