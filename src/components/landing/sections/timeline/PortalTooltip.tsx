
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleSpring } from '@/lib/motion';

interface PortalTooltipProps {
  title: string;
  description: string;
  details: string[];
  isVisible: boolean;
  triggerElement: HTMLElement | null;
}

const PortalTooltip: React.FC<PortalTooltipProps> = ({
  title,
  description,
  details,
  isVisible,
  triggerElement
}) => {
  const prefersReducedMotion = useReducedMotion();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, showAbove: true });
  const positionTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced position calculation to prevent stuttering
  const calculatePosition = useCallback(() => {
    if (!triggerElement || !tooltipRef.current) return;
    
    // Clear any pending calculations
    if (positionTimeoutRef.current) {
      clearTimeout(positionTimeoutRef.current);
    }
    
    // Use requestAnimationFrame for smooth calculations
    requestAnimationFrame(() => {
      const triggerRect = triggerElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate horizontal position (centered on trigger)
      let x = triggerRect.left + (triggerRect.width / 2);
      
      // Ensure tooltip doesn't overflow viewport horizontally
      const tooltipWidth = 320;
      if (x + tooltipWidth / 2 > viewportWidth - 16) {
        x = viewportWidth - tooltipWidth / 2 - 16;
      } else if (x - tooltipWidth / 2 < 16) {
        x = tooltipWidth / 2 + 16;
      }
      
      // Calculate vertical position with better logic
      const spaceAbove = triggerRect.top;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const showAbove = spaceAbove > 250 && spaceAbove > spaceBelow;
      
      const y = showAbove 
        ? triggerRect.top - 12
        : triggerRect.bottom + 12;
      
      setPosition({ x, y, showAbove });
    });
  }, [triggerElement]);

  // Debounced effect to prevent rapid recalculations
  useEffect(() => {
    if (isVisible && triggerElement) {
      // Small delay to ensure DOM is stable
      positionTimeoutRef.current = setTimeout(() => {
        calculatePosition();
      }, 50);
    }
    
    return () => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
    };
  }, [isVisible, triggerElement, calculatePosition]);

  // Handle window resize and scroll
  useEffect(() => {
    if (!isVisible) return;
    
    const handleResize = () => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      positionTimeoutRef.current = setTimeout(calculatePosition, 100);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isVisible, calculatePosition]);

  if (!isVisible || !triggerElement) return null;

  const tooltipContent = (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        className="fixed bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-600/60 rounded-2xl p-5 shadow-2xl shadow-slate-900/20 min-w-80 max-w-96 z-[9999]"
        style={{
          left: position.x,
          top: position.showAbove ? position.y : position.y,
          transform: position.showAbove 
            ? 'translate(-50%, -100%)' 
            : 'translate(-50%, 0%)',
          pointerEvents: 'none'
        }}
        initial={{ 
          opacity: 0, 
          scale: 0.85, 
          y: position.showAbove ? 8 : -8,
          filter: 'blur(4px)'
        }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          filter: 'blur(0px)'
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.85, 
          y: position.showAbove ? 8 : -8,
          filter: 'blur(4px)'
        }}
        transition={{ 
          ...appleSpring.smooth,
          duration: prefersReducedMotion ? 0.01 : 0.35
        }}
      >
        {/* Modern glass-morphism header */}
        <div className="mb-4 pb-3 border-b border-slate-200/50 dark:border-slate-600/50">
          <div className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {title}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </div>
        </div>

        {/* Enhanced details list */}
        <div className="space-y-3">
          {details.map((detail, idx) => (
            <motion.div 
              key={idx} 
              className="text-sm text-slate-700 dark:text-slate-300 flex items-start leading-relaxed"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: idx * 0.05 + 0.1,
                duration: prefersReducedMotion ? 0.01 : 0.25,
                ease: "easeOut"
              }}
            >
              <span className="w-1.5 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full mt-2 mr-3 flex-shrink-0" />
              <span>{detail}</span>
            </motion.div>
          ))}
        </div>

        {/* Modern tooltip arrow */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 ${
            position.showAbove 
              ? 'top-full border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-white/95 dark:border-t-slate-800/95'
              : 'bottom-full border-l-[8px] border-r-[8px] border-b-[8px] border-transparent border-b-white/95 dark:border-b-slate-800/95'
          }`}
        />
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(tooltipContent, document.body);
};

export default PortalTooltip;
