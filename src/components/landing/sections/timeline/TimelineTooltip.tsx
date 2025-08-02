
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleSpring } from '@/lib/motion';

interface TimelineTooltipProps {
  title: string;
  description: string;
  details: string[];
  position: number;
  isVisible: boolean;
}

const TimelineTooltip: React.FC<TimelineTooltipProps> = ({
  title,
  description,
  details,
  position,
  isVisible
}) => {
  const prefersReducedMotion = useReducedMotion();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [showAbove, setShowAbove] = useState(true);

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Get the parent timeline point position
      const parentElement = tooltipRef.current.parentElement;
      if (parentElement) {
        const parentRect = parentElement.getBoundingClientRect();
        const spaceAbove = parentRect.top;
        const spaceBelow = viewportHeight - parentRect.bottom;
        
        // Show above if there's enough space (at least 200px), otherwise show below
        setShowAbove(spaceAbove > 200);
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  // Position tooltip relative to its parent container (the timeline point)
  const positionClasses = showAbove 
    ? "absolute bottom-full left-1/2 -translate-x-1/2 mb-2" 
    : "absolute top-full left-1/2 -translate-x-1/2 mt-2";

  const arrowClasses = showAbove
    ? "absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-slate-800"
    : "absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white dark:border-b-slate-800";

  return (
    <motion.div
      ref={tooltipRef}
      className={`${positionClasses} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-xl min-w-64 max-w-80 z-50`}
      initial={{ opacity: 0, scale: 0.8, y: showAbove ? 10 : -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: showAbove ? 10 : -10 }}
      transition={{ 
        ...appleSpring.bouncy,
        duration: prefersReducedMotion ? 0.01 : 0.4
      }}
    >
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
        {title}
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
        {description}
      </div>
      <div className="space-y-2">
        {details.map((detail, idx) => (
          <motion.div 
            key={idx} 
            className="text-xs text-slate-500 dark:text-slate-400 flex items-start"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: idx * 0.05,
              duration: prefersReducedMotion ? 0.01 : 0.3
            }}
          >
            <span className="text-primary mr-2">•</span>
            <span>{detail}</span>
          </motion.div>
        ))}
      </div>
      {/* Tooltip Arrow */}
      <div className={arrowClasses} />
    </motion.div>
  );
};

export default TimelineTooltip;
