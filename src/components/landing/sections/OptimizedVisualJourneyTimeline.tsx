
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Activity, AlertTriangle, Shield, Heart, Clock, Brain } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface OptimizedVisualJourneyTimelineProps {
  scrollProgress: number;
}

const OptimizedVisualJourneyTimeline: React.FC<OptimizedVisualJourneyTimelineProps> = ({ scrollProgress }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const prefersReducedMotion = useReducedMotion();
  
  // Use refs to prevent unnecessary observer recreations
  const observersRef = useRef<IntersectionObserver[]>([]);
  const isInitializedRef = useRef(false);

  // Memoize timeline steps to prevent recreation
  const timelineSteps = useMemo(() => [
    {
      day: 1,
      title: "Normal Baseline",
      icon: Heart,
      color: "hsl(120 60% 50%)",
      keyMetric: { label: "Sleep", value: "8.2h", color: "bg-green-400" },
      description: "All systems normal",
      status: "stable"
    },
    {
      day: 3,
      title: "Pattern Shift",
      icon: Activity,
      color: "hsl(214 100% 60%)",
      keyMetric: { label: "Activity", value: "↑23%", color: "bg-blue-400" },
      description: "Increased activity detected",
      status: "monitoring"
    },
    {
      day: 5,
      title: "Sleep Disruption",
      icon: Clock,
      color: "hsl(45 100% 60%)",
      keyMetric: { label: "Sleep", value: "5.3h", color: "bg-yellow-400" },
      description: "Sleep pattern changing",
      status: "caution"
    },
    {
      day: 7,
      title: "AI Alert",
      icon: AlertTriangle,
      color: "hsl(25 100% 60%)",
      keyMetric: { label: "Risk", value: "High", color: "bg-orange-400" },
      description: "Multiple patterns converging",
      status: "warning"
    },
    {
      day: 8,
      title: "Intervention",
      icon: Brain,
      color: "hsl(280 100% 70%)",
      keyMetric: { label: "Action", value: "Taken", color: "bg-purple-400" },
      description: "Care team contacted",
      status: "intervention"
    },
    {
      day: 12,
      title: "Crisis Averted",
      icon: Shield,
      color: "hsl(120 60% 50%)",
      keyMetric: { label: "Status", value: "Stable", color: "bg-green-400" },
      description: "Back to healthy patterns",
      status: "recovered"
    }
  ], []);

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Heavily optimized intersection observer with proper cleanup
  useEffect(() => {
    if (!isInView || isInitializedRef.current) return;

    // Cleanup existing observers
    observersRef.current.forEach(observer => observer?.disconnect());
    observersRef.current = [];

    const initializeObservers = () => {
      stepRefs.current.forEach((ref, index) => {
        if (!ref) return;
        
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleSteps(prev => {
                if (!prev.includes(index)) {
                  return [...prev, index].sort((a, b) => a - b);
                }
                return prev;
              });
            }
          },
          { 
            threshold: 0.15, // Reduced sensitivity for better performance
            rootMargin: '-5% 0px -5% 0px' // Reduced margin
          }
        );
        
        observer.observe(ref);
        observersRef.current.push(observer);
      });
      
      isInitializedRef.current = true;
    };

    // Delay initialization to prevent blocking the main thread
    const timeoutId = setTimeout(initializeObservers, 200);

    return () => {
      clearTimeout(timeoutId);
      observersRef.current.forEach(observer => observer?.disconnect());
      observersRef.current = [];
    };
  }, [isInView]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observersRef.current.forEach(observer => observer?.disconnect());
    };
  }, []);

  const getStatusText = useCallback((status: string) => {
    const statusMap: Record<string, string> = {
      'stable': 'All Normal',
      'monitoring': 'Monitoring',
      'caution': 'Caution',
      'warning': 'Alert Active',
      'intervention': 'Action Taken',
      'recovered': 'Crisis Averted',
    };
    return statusMap[status] || 'Monitoring';
  }, []);

  // Optimized animation variants with proper separation
  const cardVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 15, scale: 0.98 }, // Reduced movement
    visible: { opacity: 1, y: 0, scale: 1 }
  }), []);

  // Cached transition configuration
  const cardTransition = useMemo(() => ({
    duration: prefersReducedMotion ? 0.01 : 0.25, // Slightly faster
    ease: [0.4, 0, 0.2, 1] as const
  }), [prefersReducedMotion]);

  // Cached hover animation
  const hoverAnimation = useMemo(() => 
    prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.15 } }
  , [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Optimized Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 10 }} // Reduced movement
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.3 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-slate-100">
            Episode Prevention
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text-safari">
              In Real Time
            </span>
          </h2>
        </motion.div>

        {/* Timeline Cards */}
        <div className="relative">
          {/* Optimized Progress Indicator with cached calculation */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 -z-10">
            <div className="h-px bg-gradient-to-r from-green-500/15 via-yellow-500/15 via-orange-500/15 to-red-500/15 rounded-full" />
            <div
              className="absolute top-0 left-0 h-px bg-gradient-to-r from-green-500/30 via-yellow-500/30 via-orange-500/30 to-red-500/30 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(Math.max(...visibleSteps, -1) + 1) / timelineSteps.length * 100}%`
              }}
            />
          </div>

          {/* Optimized Timeline Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {timelineSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = visibleSteps.includes(index);
              
              return (
                <motion.div
                  key={step.day}
                  ref={el => stepRefs.current[index] = el}
                  className={`relative p-6 rounded-2xl backdrop-blur-sm border transition-all duration-200 ${
                    isActive 
                      ? 'bg-card/95 border-border/20 shadow-sm' 
                      : 'bg-card/70 border-border/10'
                  }`}
                  variants={cardVariants}
                  initial="hidden"
                  animate={isActive ? "visible" : "hidden"}
                  transition={cardTransition}
                  whileHover={hoverAnimation}
                >
                  {/* Day Badge */}
                  <div
                    className="absolute -top-3 left-6 px-3 py-1 rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    Day {step.day}
                  </div>

                  {/* Icon */}
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl mb-6 mx-auto"
                       style={{ backgroundColor: `${step.color}10` }}>
                    <Icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-center mb-3 text-slate-800 dark:text-slate-100">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-center mb-4 text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>

                  {/* Key Metric */}
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${step.keyMetric.color}`}>
                      {step.keyMetric.label}
                    </div>
                    <span className="text-base font-semibold text-slate-700 dark:text-slate-200">
                      {step.keyMetric.value}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <div
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: `${step.color}90` }}
                    >
                      {getStatusText(step.status)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Success Message with optimized trigger */}
        {visibleSteps.length >= timelineSteps.length - 1 && (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.3 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-green-500/10 to-primary/10 border border-green-500/20 backdrop-blur-sm">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-100">Episode Successfully Prevented</span>
              <div className="w-2 h-2 bg-green-400 rounded-full" />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default OptimizedVisualJourneyTimeline;
