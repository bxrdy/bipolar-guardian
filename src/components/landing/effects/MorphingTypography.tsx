
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MorphingTypographyProps {
  texts: string[];
  className?: string;
  scrollProgress: number;
}

const MorphingTypography: React.FC<MorphingTypographyProps> = ({ 
  texts, 
  className = "",
  scrollProgress 
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  
  useEffect(() => {
    const textIndex = Math.floor(scrollProgress * texts.length) % texts.length;
    setCurrentTextIndex(textIndex);
  }, [scrollProgress, texts.length]);

  const currentText = texts[currentTextIndex];
  const nextText = texts[(currentTextIndex + 1) % texts.length];

  if (prefersReducedMotion) {
    return (
      <h1 className={className}>
        {currentText}
      </h1>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Current text */}
      <motion.h1
        key={currentTextIndex}
        className="relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
      >
        {currentText.split('').map((char, index) => (
          <motion.span
            key={index}
            className="inline-block"
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{
              duration: 0.1,
              delay: index * 0.02,
            }}
            whileHover={{
              color: 'hsl(var(--primary))',
              scale: 1.1,
              transition: { duration: 0.1 }
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h1>

      {/* Particle dissolve effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            animate={{
              x: Math.random() * 200 - 100,
              y: Math.random() * 200 - 100,
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Gradient text effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text-safari opacity-30"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {currentText}
      </motion.div>
    </div>
  );
};

export default MorphingTypography;
