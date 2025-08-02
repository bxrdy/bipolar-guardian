
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Smartphone, Brain, Shield, Zap, Heart, Activity } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CinematicSequencesProps {
  scrollY: any;
}

const CinematicSequences: React.FC<CinematicSequencesProps> = ({ scrollY }) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Sequence 1: Data Dive (0-500px scroll)
  const dataDiveScale = useTransform(scrollY, [0, 500], [1, 0.3]);
  const dataDiveOpacity = useTransform(scrollY, [0, 300, 500], [1, 1, 0]);
  const phoneScale = useTransform(scrollY, [200, 600], [0.5, 3]);
  
  // Sequence 2: Pattern Recognition (500-1000px)
  const particleOpacity = useTransform(scrollY, [500, 700, 1000], [0, 1, 0]);
  const particleSpread = useTransform(scrollY, [500, 1000], [0, 200]);
  
  // Sequence 3: AI Processing (1000-1500px)
  const brainScale = useTransform(scrollY, [1000, 1200, 1500], [0, 1.5, 1]);
  const brainGlow = useTransform(scrollY, [1000, 1500], [0, 1]);
  
  // Sequence 4: Prediction Emergence (1500-2000px)
  const alertScale = useTransform(scrollY, [1500, 1800], [0, 1]);
  const alertRotation = useTransform(scrollY, [1500, 2000], [0, 360]);
  
  // Sequence 5: Protection Deploy (2000px+)
  const shieldScale = useTransform(scrollY, [2000, 2300], [0, 1]);
  const shieldOpacity = useTransform(scrollY, [2000, 2500], [0, 1]);

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Sequence 1: Data Dive */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ scale: dataDiveScale, opacity: dataDiveOpacity }}
      >
        <motion.div
          className="relative"
          style={{ scale: phoneScale }}
        >
          <div className="w-64 h-128 bg-gradient-to-br from-gray-900 to-black rounded-[3rem] p-2 shadow-2xl">
            <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-[2.5rem] p-6 overflow-hidden">
              {/* Simulated app interface */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-400" />
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <motion.div 
                      className="bg-red-400 h-full rounded-full"
                      animate={{ width: ["20%", "80%", "40%"] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-green-400" />
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <motion.div 
                      className="bg-green-400 h-full rounded-full"
                      animate={{ width: ["60%", "30%", "90%"] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Sequence 2: Pattern Recognition */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: particleOpacity }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              x: Math.sin(i) * particleSpread.get(),
              y: Math.cos(i) * particleSpread.get(),
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>

      {/* Sequence 3: AI Processing */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ scale: brainScale }}
      >
        <motion.div
          className="relative"
          style={{ filter: `drop-shadow(0 0 ${brainGlow.get() * 50}px hsl(var(--primary)))` }}
        >
          <Brain className="w-32 h-32 text-primary" />
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "linear" }}
            >
              <div 
                className="absolute w-2 h-2 bg-accent rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) translateY(-${60 + i * 10}px)`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Sequence 4: Prediction Emergence */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ scale: alertScale, rotate: alertRotation }}
      >
        <div className="relative">
          <Zap className="w-24 h-24 text-yellow-400" />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-yellow-400/50"
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Sequence 5: Protection Deploy */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ scale: shieldScale, opacity: shieldOpacity }}
      >
        <div className="relative">
          <Shield className="w-40 h-40 text-green-400" />
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-green-400/30"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.6, 0, 0.6]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CinematicSequences;
