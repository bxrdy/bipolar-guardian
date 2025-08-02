
import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, CheckCircle } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleSpring, staggerContainer } from '@/lib/motion';
import TimelinePoint from './timeline/TimelinePoint';
import TimelineLabels from './timeline/TimelineLabels';
import PortalTooltip from './timeline/PortalTooltip';
import { timelineSteps } from './timeline/TimelineData';

interface CompactVisualTimelineProps {
  scrollProgress: number;
  onTimelineComplete?: () => void;
}

const CompactVisualTimeline: React.FC<CompactVisualTimelineProps> = ({ 
  scrollProgress, 
  onTimelineComplete 
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const hoverDebounceRef = useRef<NodeJS.Timeout>();

  // Progressive timeline reveal with staggered animation
  useEffect(() => {
    if (!isInView) return;

    const timer = setTimeout(() => {
      timelineSteps.forEach((_, index) => {
        setTimeout(() => {
          setVisibleSteps(prev => [...prev, index]);
        }, index * 250); // Slightly faster for better UX
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [isInView]);

  // Show success message after all steps are visible
  useEffect(() => {
    if (visibleSteps.length >= timelineSteps.length) {
      const successTimer = setTimeout(() => {
        setShowSuccessMessage(true);
        setTimeout(() => {
          onTimelineComplete?.();
        }, 800);
      }, 400);

      return () => clearTimeout(successTimer);
    }
  }, [visibleSteps.length, onTimelineComplete]);

  // Debounced hover handlers
  const handleMouseEnter = (index: number, element: HTMLElement) => {
    if (hoverDebounceRef.current) {
      clearTimeout(hoverDebounceRef.current);
    }
    
    hoverDebounceRef.current = setTimeout(() => {
      setHoveredStep(index);
      setHoveredElement(element);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverDebounceRef.current) {
      clearTimeout(hoverDebounceRef.current);
    }
    
    hoverDebounceRef.current = setTimeout(() => {
      setHoveredStep(null);
      setHoveredElement(null);
    }, 200);
  };

  return (
    <section 
      ref={sectionRef} 
      className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header with refined spacing */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ 
            ...appleSpring.smooth,
            duration: prefersReducedMotion ? 0.01 : 0.7 
          }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-slate-800 dark:text-slate-100">
            Episode Prevention
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text-safari mt-2">
              In Real Time
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Watch how our AI detects early warning signs and prevents episodes before they happen
          </p>
        </motion.div>

        {/* Desktop Timeline Container - Simplified Structure */}
        <div className="hidden md:block relative mb-8">
          <motion.div 
            className="relative min-h-32 mx-auto px-8 lg:px-16"
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {/* Timeline Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-full -translate-y-1/2" />
            
            {/* Animated Progress Line */}
            <motion.div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full -translate-y-1/2 shadow-lg"
              initial={{ width: 0 }}
              animate={{ 
                width: visibleSteps.length > 0 ? 
                  `${(visibleSteps.length / timelineSteps.length) * 100}%` : 0 
              }}
              transition={{ 
                duration: prefersReducedMotion ? 0.01 : 1.5,
                ease: "easeOut",
                delay: 0.5
              }}
            />

            {/* Timeline Points Grid */}
            <div className="relative grid grid-cols-6 gap-0 items-center justify-items-center">
              {timelineSteps.map((step, index) => {
                const isVisible = visibleSteps.includes(index);
                
                return (
                  <div key={step.day} className="flex flex-col items-center">
                    {/* Top Labels */}
                    <div className="mb-8 text-center">
                      <TimelineLabels
                        day={step.day}
                        title={step.title}
                        keyMetric={step.keyMetric}
                        color={step.color}
                        isVisible={isVisible}
                        index={index}
                        position={50}
                      />
                    </div>

                    {/* Timeline Point */}
                    <TimelinePoint
                      icon={step.icon}
                      color={step.color}
                      isVisible={isVisible}
                      index={index}
                      position={50}
                      onMouseEnter={(element) => handleMouseEnter(index, element)}
                      onMouseLeave={handleMouseLeave}
                    />

                    {/* Bottom Day Label */}
                    <motion.div
                      className="mt-6 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={{ 
                        delay: index * 0.1 + 0.4,
                        duration: prefersReducedMotion ? 0.01 : 0.4
                      }}
                    >
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-600/50">
                        Day {step.day}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Mobile Timeline - Enhanced Cards */}
        <div className="md:hidden space-y-4">
          {timelineSteps.map((step, index) => {
            const isVisible = visibleSteps.includes(index);
            const Icon = step.icon;
            
            return (
              <motion.div
                key={step.day}
                className="flex items-center space-x-4 p-5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-600/60 shadow-lg"
                initial={{ opacity: 0, x: -30 }}
                animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ 
                  delay: index * 0.15,
                  ...appleSpring.smooth
                }}
              >
                <div 
                  className="flex items-center justify-center w-14 h-14 rounded-2xl border-2 border-white dark:border-slate-800 shadow-lg flex-shrink-0"
                  style={{ 
                    backgroundColor: step.color,
                    boxShadow: `0 4px 12px ${step.color}25`
                  }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Day {step.day}
                    </span>
                    <span 
                      className="text-xs px-3 py-1.5 rounded-full font-semibold text-white shadow-sm"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.keyMetric.value}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Success Message */}
        {showSuccessMessage && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: prefersReducedMotion ? 0.01 : 0.6,
              ...appleSpring.bouncy
            }}
          >
            <div className="inline-flex items-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/60 dark:border-green-700/60 backdrop-blur-sm shadow-xl">
              <div className="relative">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="absolute inset-0 animate-ping">
                  <CheckCircle className="w-8 h-8 text-green-400 opacity-20" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Episode Successfully Prevented
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Crisis averted through early intervention
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Portal Tooltip */}
        {hoveredStep !== null && (
          <PortalTooltip
            title={timelineSteps[hoveredStep].title}
            description={timelineSteps[hoveredStep].description}
            details={timelineSteps[hoveredStep].details}
            isVisible={hoveredStep !== null}
            triggerElement={hoveredElement}
          />
        )}
      </div>
    </section>
  );
};

export default CompactVisualTimeline;
