
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FuturisticBackgroundProps {
  phase: number;
  scrollY: number;
}

const FuturisticBackground: React.FC<FuturisticBackgroundProps> = ({ phase, scrollY }) => {
  const [particles] = useState(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.6 + 0.2,
    }))
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Aurora Gradient Background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 50% ${50 - scrollY * 0.02}%, 
            hsl(var(--primary) / 0.1) 0%, 
            hsl(var(--accent) / 0.05) 40%, 
            transparent 70%)`,
        }}
        animate={{
          background: [
            `radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.1) 0%, transparent 50%)`,
            `radial-gradient(ellipse at 70% 80%, hsl(var(--accent) / 0.1) 0%, transparent 50%)`,
            `radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.1) 0%, transparent 50%)`,
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-primary/20 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity],
          }}
          transition={{
            duration: 4 + particle.speed * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.id * 0.1,
          }}
        />
      ))}

      {/* Sacred Geometry */}
      <motion.svg
        className="absolute inset-0 w-full h-full opacity-5"
        viewBox="0 0 800 600"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <pattern id="hexPattern" patternUnits="userSpaceOnUse" width="60" height="52">
            <polygon
              points="30,0 52,15 52,37 30,52 8,37 8,15"
              fill="none"
              stroke="hsl(var(--primary) / 0.1)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexPattern)" />
      </motion.svg>

      {/* Neural Network Connections */}
      {phase >= 2 && (
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {[...Array(5)].map((_, i) => (
            <motion.line
              key={i}
              x1={`${20 + i * 15}%`}
              y1="30%"
              x2={`${25 + i * 15}%`}
              y2="70%"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.3 }}
            />
          ))}
        </svg>
      )}
    </div>
  );
};

export default FuturisticBackground;
