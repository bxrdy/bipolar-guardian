
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Heart, Activity, Shield, Zap, Clock, Pill } from 'lucide-react';

interface DataConstellationProps {
  isVisible: boolean;
  phase: number;
}

const DataConstellation: React.FC<DataConstellationProps> = ({ isVisible, phase }) => {
  const [nodes] = useState(() => [
    { 
      id: 'mood', 
      icon: Heart, 
      x: 25, 
      y: 35, 
      color: 'hsl(0 70% 60%)', 
      connections: ['sleep', 'medication', 'activity'],
      label: 'Mood Patterns'
    },
    { 
      id: 'sleep', 
      icon: Clock, 
      x: 15, 
      y: 20, 
      color: 'hsl(214 100% 60%)', 
      connections: ['ai', 'activity', 'medication'],
      label: 'Sleep Cycles'
    },
    { 
      id: 'activity', 
      icon: Activity, 
      x: 75, 
      y: 30, 
      color: 'hsl(120 60% 50%)', 
      connections: ['ai', 'mood'],
      label: 'Activity Levels'
    },
    { 
      id: 'medication', 
      icon: Pill, 
      x: 35, 
      y: 65, 
      color: 'hsl(280 100% 70%)', 
      connections: ['ai', 'mood', 'sleep'],
      label: 'Medication Adherence'
    },
    { 
      id: 'ai', 
      icon: Brain, 
      x: 50, 
      y: 45, 
      color: 'hsl(var(--primary))', 
      connections: ['protection'],
      label: 'AI Analysis'
    },
    { 
      id: 'protection', 
      icon: Shield, 
      x: 65, 
      y: 60, 
      color: 'hsl(45 100% 60%)', 
      connections: [],
      label: 'Episode Prevention'
    },
  ]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg className="w-full h-full max-w-5xl max-h-[500px]" viewBox="0 0 100 80">
        {/* Connection Lines with Data Flow Animation */}
        {isVisible && phase >= 2 && nodes.map((node) =>
          node.connections.map((connectionId) => {
            const target = nodes.find(n => n.id === connectionId);
            if (!target) return null;
            
            return (
              <g key={`${node.id}-${connectionId}`}>
                {/* Base connection line */}
                <motion.line
                  x1={node.x}
                  y1={node.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="hsl(var(--primary) / 0.2)"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
                
                {/* Data flow particles */}
                <motion.circle
                  r="0.8"
                  fill={node.color}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    x: [node.x, target.x],
                    y: [node.y, target.y]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                />
              </g>
            );
          })
        )}

        {/* Data Nodes */}
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <motion.g
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Node Glow Effect */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="4"
                fill={node.color}
                opacity="0.2"
                animate={{
                  r: [4, 6, 4],
                  opacity: [0.2, 0.05, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5,
                }}
              />
              
              {/* Node Background */}
              <circle
                cx={node.x}
                cy={node.y}
                r="3"
                fill="hsl(var(--background))"
                stroke={node.color}
                strokeWidth="1"
                opacity="0.9"
              />
              
              {/* Node Core */}
              <circle
                cx={node.x}
                cy={node.y}
                r="2"
                fill={node.color}
                opacity="0.3"
              />
              
              {/* Icon Container */}
              <foreignObject
                x={node.x - 2}
                y={node.y - 2}
                width="4"
                height="4"
                className="pointer-events-none"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="w-2.5 h-2.5 text-white" />
                </div>
              </foreignObject>

              {/* Label (visible on hover-like effect) */}
              {phase >= 3 && (
                <motion.text
                  x={node.x}
                  y={node.y - 6}
                  textAnchor="middle"
                  className="text-xs fill-current text-foreground"
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={{ delay: index * 0.3 + 1 }}
                >
                  {node.label}
                </motion.text>
              )}
            </motion.g>
          );
        })}

        {/* Neural Network Pattern in Background */}
        {phase >= 4 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 2, delay: 2 }}
          >
            {/* Create a subtle grid pattern representing AI processing */}
            <defs>
              <pattern id="neuralGrid" patternUnits="userSpaceOnUse" width="8" height="8">
                <circle cx="4" cy="4" r="0.5" fill="hsl(var(--primary))" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#neuralGrid)" />
          </motion.g>
        )}
      </svg>
    </div>
  );
};

export default DataConstellation;
