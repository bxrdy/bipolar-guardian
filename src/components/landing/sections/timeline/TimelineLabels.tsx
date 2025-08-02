
import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleSpring } from '@/lib/motion';

interface TimelineLabelsProps {
  day: number;
  title: string;
  keyMetric: { label: string; value: string };
  color: string;
  isVisible: boolean;
  index: number;
  position: number;
}

const TimelineLabels: React.FC<TimelineLabelsProps> = ({
  day,
  title,
  keyMetric,
  color,
  isVisible,
  index,
  position
}) => {
  const prefersReducedMotion = useReducedMotion();

  const labelVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        ...appleSpring.smooth,
        duration: prefersReducedMotion ? 0.01 : 0.6
      }
    }
  };

  return (
    <>
      {/* Status and Metric - Above Timeline Point */}
      <motion.div
        className="text-center flex flex-col items-center space-y-2"
        variants={labelVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        transition={{ 
          delay: index * 0.1 + 0.2,
          duration: prefersReducedMotion ? 0.01 : 0.6
        }}
      >
        <motion.div 
          className="text-xs font-medium text-slate-800 dark:text-slate-200 text-center leading-tight"
          initial={{ opacity: 0, x: -10 }}
          animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{ 
            ...appleSpring.gentle,
            delay: index * 0.1 + 0.3,
            duration: prefersReducedMotion ? 0.01 : 0.4
          }}
        >
          {title}
        </motion.div>
        <motion.div 
          className="text-xs px-3 py-1 rounded-full font-semibold text-white shadow-sm whitespace-nowrap"
          style={{ backgroundColor: color }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{
            ...appleSpring.bouncy,
            delay: index * 0.1 + 0.4,
            duration: prefersReducedMotion ? 0.01 : 0.5
          }}
          whileHover={prefersReducedMotion ? {} : { 
            scale: 1.05,
            transition: appleSpring.gentle
          }}
        >
          {keyMetric.value}
        </motion.div>
      </motion.div>
    </>
  );
};

export default TimelineLabels;
