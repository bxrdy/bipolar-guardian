
import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FloatingContentProps {
  children: React.ReactNode;
  index: number;
  className?: string;
}

const FloatingContent: React.FC<FloatingContentProps> = ({ 
  children, 
  index, 
  className = "" 
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      viewport={{ once: true }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
};

export default FloatingContent;
