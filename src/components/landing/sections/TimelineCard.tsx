
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineCardProps {
  point: {
    day: string;
    status: string;
    icon: any;
    color: string;
    title: string;
    details: string[];
    riskLevel: string;
  };
  index: number;
  isVisible: boolean;
  position: 'top' | 'bottom' | 'mobile';
}

const TimelineCard: React.FC<TimelineCardProps> = ({ point, index, isVisible, position }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = point.icon;

  // Different layouts for mobile vs desktop
  if (position === 'mobile') {
    return (
      <motion.div
        className="flex items-start gap-4 group cursor-pointer"
        initial={{ opacity: 0, x: -30 }}
        animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
        transition={{ duration: 0.6, delay: index * 0.15 }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Timeline Point */}
        <div className="relative z-10 flex-shrink-0">
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm border-2 shadow-lg"
            style={{ 
              backgroundColor: `${point.color}20`,
              borderColor: point.color
            }}
            whileHover={{ scale: 1.1 }}
          >
            <Icon className="w-8 h-8" style={{ color: point.color }} />
          </motion.div>
        </div>

        {/* Card Content */}
        <div className="flex-1 min-w-0">
          <div className="p-6 rounded-xl backdrop-blur-xl border border-white/10 bg-background/90 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-lg text-foreground">{point.day}</h4>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: `${point.color}20`,
                    color: point.color
                  }}
                >
                  {point.riskLevel}
                </span>
              </div>
              
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            
            <h5 className="font-medium text-foreground mb-3">{point.title}</h5>
            
            {/* Always show first detail */}
            <div className="text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                {point.details[0]}
              </div>
            </div>

            {/* Expandable details */}
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2 border-t border-white/10">
                {point.details.slice(1).map((detail, i) => (
                  <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    {detail}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Desktop layout
  const cardPositionClass = position === 'top' 
    ? '-top-32' 
    : 'top-8';

  return (
    <motion.div
      className="relative flex flex-col items-center group cursor-pointer"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Timeline Point */}
      <motion.div
        className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm border-2 shadow-lg"
        style={{ 
          backgroundColor: `${point.color}20`,
          borderColor: point.color
        }}
        whileHover={{ scale: 1.15 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Icon className="w-8 h-8" style={{ color: point.color }} />
        
        {/* Pulsing effect for critical points */}
        {(point.status === 'warning' || point.status === 'intervention') && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: point.color }}
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>

      {/* Data Card */}
      <motion.div
        className={`absolute ${cardPositionClass} w-72 p-5 rounded-xl backdrop-blur-xl border border-white/10 bg-background/95 shadow-xl`}
        initial={{ opacity: 0, y: position === 'top' ? 10 : -10 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: position === 'top' ? 10 : -10 }}
        transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-foreground">{point.day}</h4>
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${point.color}20`,
                color: point.color
              }}
            >
              {point.riskLevel}
            </span>
          </div>
          
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        <h5 className="font-medium text-sm text-foreground mb-3">{point.title}</h5>
        
        {/* Summary Info */}
        <div className="text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-current opacity-50" />
            {point.details[0]}
          </div>
        </div>

        {/* Detailed Info */}
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="space-y-1 pt-2 border-t border-white/10">
            {point.details.slice(1).map((detail, i) => (
              <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-current opacity-50" />
                {detail}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Status indicator */}
        <div className="mt-3 flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: point.color }}
          />
          <span className="text-xs font-medium" style={{ color: point.color }}>
            {point.status === 'intervention' ? 'AI Intervention Successful' : 
             point.status === 'warning' ? 'Episode Risk Detected' :
             point.status === 'recovery' ? 'Crisis Averted' : 'Monitoring Active'}
          </span>
        </div>

        {/* Connecting line to timeline point */}
        <div 
          className={`absolute ${position === 'top' ? 'bottom-0 translate-y-full' : 'top-0 -translate-y-full'} left-1/2 -translate-x-1/2 w-0.5 h-4`}
          style={{ backgroundColor: `${point.color}60` }}
        />
      </motion.div>

      {/* Day Label */}
      <motion.div
        className="mt-20 text-sm font-medium text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
      >
        {point.day}
      </motion.div>
    </motion.div>
  );
};

export default TimelineCard;
