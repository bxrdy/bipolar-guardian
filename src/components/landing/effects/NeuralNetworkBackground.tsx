
import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Node {
  id: string;
  x: number;
  y: number;
  connections: string[];
  intensity: number;
  type: 'input' | 'hidden' | 'output';
}

interface NeuralNetworkBackgroundProps {
  brainState: 'calm' | 'active' | 'alert';
  scrollProgress: number;
}

const NeuralNetworkBackground: React.FC<NeuralNetworkBackgroundProps> = ({ 
  brainState, 
  scrollProgress 
}) => {
  const prefersReducedMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Generate neural network nodes
  const nodes = useMemo(() => {
    const nodeCount = 24;
    const generatedNodes: Node[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const layer = Math.floor(i / 8);
      const posInLayer = i % 8;
      
      generatedNodes.push({
        id: `node-${i}`,
        x: 15 + (layer * 35) + (Math.random() - 0.5) * 10,
        y: 15 + (posInLayer * 10) + (Math.random() - 0.5) * 8,
        connections: [],
        intensity: Math.random(),
        type: layer === 0 ? 'input' : layer === 2 ? 'output' : 'hidden'
      });
    }
    
    // Create connections
    generatedNodes.forEach((node, i) => {
      const connectionCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * generatedNodes.length);
        if (targetIndex !== i) {
          node.connections.push(generatedNodes[targetIndex].id);
        }
      }
    });
    
    return generatedNodes;
  }, []);

  const getBrainStateColor = () => {
    switch (brainState) {
      case 'calm': return 'hsl(210, 100%, 60%)';
      case 'active': return 'hsl(120, 80%, 50%)';
      case 'alert': return 'hsl(0, 90%, 60%)';
      default: return 'hsl(210, 100%, 60%)';
    }
  };

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full opacity-30"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <radialGradient id="nodeGradient">
            <stop offset="0%" stopColor={getBrainStateColor()} stopOpacity="0.8" />
            <stop offset="100%" stopColor={getBrainStateColor()} stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Neural connections */}
        {nodes.map((node) =>
          node.connections.map((connectionId) => {
            const targetNode = nodes.find(n => n.id === connectionId);
            if (!targetNode) return null;
            
            return (
              <motion.line
                key={`${node.id}-${connectionId}`}
                x1={node.x}
                y1={node.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={getBrainStateColor()}
                strokeWidth="0.2"
                opacity="0.4"
                filter="url(#glow)"
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  strokeWidth: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            );
          })
        )}

        {/* Neural nodes */}
        {nodes.map((node, index) => (
          <motion.g key={node.id}>
            {/* Node pulse effect */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="1.5"
              fill="url(#nodeGradient)"
              animate={{
                r: [1, 2.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 1.5 + Math.random() * 2,
                repeat: Infinity,
                delay: (scrollProgress * 5 + index * 0.1) % 3,
              }}
            />
            
            {/* Node core */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="0.8"
              fill={getBrainStateColor()}
              filter="url(#glow)"
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          </motion.g>
        ))}

        {/* Data flow particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.circle
            key={i}
            r="0.5"
            fill={getBrainStateColor()}
            opacity="0.7"
            animate={{
              x: [10, 90],
              y: [20 + i * 5, 40 + i * 3],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default NeuralNetworkBackground;
