
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface HolographicCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  delay?: number;
  className?: string;
}

const HolographicCard: React.FC<HolographicCardProps> = ({
  icon: Icon,
  title,
  description,
  color,
  delay = 0,
  className = ""
}) => {
  return (
    <motion.div
      className={`relative group ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      {/* Holographic Background */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl border border-white/10" />
      
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, transparent 30%, ${color}20 50%, transparent 70%)`,
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear',
        }}
      />

      {/* Content */}
      <div className="relative p-8 text-center">
        {/* Icon Container */}
        <motion.div
          className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
          style={{ background: `${color}15` }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon className="w-8 h-8" style={{ color }} />
          
          {/* Icon Glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ 
              background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
              filter: 'blur(10px)',
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <h3 className="text-xl font-semibold text-foreground mb-4">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Bottom Accent Line */}
        <motion.div
          className="absolute bottom-0 left-1/2 h-0.5 rounded-full"
          style={{ background: color }}
          initial={{ width: 0, x: '-50%' }}
          whileInView={{ width: '60%' }}
          transition={{ duration: 0.8, delay: delay + 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default HolographicCard;
