
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface OptimizedFuturisticBackgroundProps {
  phase: number;
  scrollY: number;
}

const OptimizedFuturisticBackground: React.FC<OptimizedFuturisticBackgroundProps> = ({ phase, scrollY }) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Optimized particles with minimal count
  const particles = useMemo(() => 
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1 + 0.5,
      speed: Math.random() * 0.1 + 0.05,
      opacity: Math.random() * 0.2 + 0.05,
    }))
  , []);

  // Optimized aurora background with cached calculation
  const auroraOpacity = useMemo(() => {
    const scrollOpacity = Math.max(0.1, 0.3 - scrollY * 0.001);
    return Math.min(scrollOpacity, 0.3);
  }, [scrollY]);

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Optimized Aurora Background */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{
          opacity: auroraOpacity,
          background: `radial-gradient(ellipse at 50% 40%, 
            hsl(var(--primary) / 0.04) 0%, 
            hsl(var(--accent) / 0.02) 40%, 
            transparent 70%)`,
        }}
      />

      {/* Optimized Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/8 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              willChange: 'transform, opacity',
            }}
            animate={{
              y: [0, -6, 0],
              opacity: [particle.opacity, particle.opacity * 0.3, particle.opacity],
            }}
            transition={{
              duration: 5 + particle.speed * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.id * 0.5,
            }}
          />
        ))}
      </div>

      {/* Simplified Sacred Geometry */}
      <div className="absolute inset-0 opacity-1">
        <svg className="w-full h-full" viewBox="0 0 800 600">
          <defs>
            <pattern id="optimizedHexPattern" patternUnits="userSpaceOnUse" width="120" height="104">
              <polygon
                points="60,0 104,30 104,74 60,104 16,74 16,30"
                fill="none"
                stroke="hsl(var(--primary) / 0.02)"
                strokeWidth="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#optimizedHexPattern)" />
        </svg>
      </div>

      {/* Phase-based Neural Network - minimal rendering */}
      {phase >= 2 && (
        <svg className="absolute inset-0 w-full h-full opacity-4">
          <motion.line
            x1="30%"
            y1="45%"
            x2="35%"
            y2="55%"
            stroke="hsl(var(--primary) / 0.2)"
            strokeWidth="0.8"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.2 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
      )}
    </div>
  );
};

export default OptimizedFuturisticBackground;
