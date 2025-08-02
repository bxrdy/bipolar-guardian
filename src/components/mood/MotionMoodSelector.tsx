/**
 * Motion-enhanced MoodSelector with Apple-style spring animations and haptic feedback
 */

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { MOOD_LABELS } from '@/types/mood';
import { appleSpring, staggerContainer, staggerItem, createMotionProps } from '@/lib/motion';

interface MotionMoodSelectorProps {
  selectedMood: number;
  onMoodChange: (mood: number) => void;
  disableAnimation?: boolean;
}

// Animation variants for emoji display
const emojiVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: appleSpring.bouncy,
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

// Animation variants for mood buttons
const moodButtonVariants: Variants = {
  idle: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.1,
    y: -2,
    transition: appleSpring.gentle,
  },
  selected: {
    scale: 1.15,
    y: -3,
    transition: appleSpring.bouncy,
  },
  pressed: {
    scale: 0.95,
    y: 0,
    transition: appleSpring.snappy,
  },
};

// Animation variants for text transitions
const textVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: appleSpring.gentle,
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.1 },
  },
};

const MotionMoodSelector = ({ 
  selectedMood, 
  onMoodChange, 
  disableAnimation = false 
}: MotionMoodSelectorProps) => {
  const [hoveredMood, setHoveredMood] = useState<number | null>(null);

  const displayMood = hoveredMood || selectedMood;
  const currentMoodData = MOOD_LABELS.find(mood => mood.value === displayMood);

  if (disableAnimation) {
    // Fallback to original component structure if animations are disabled
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-2">
            {currentMoodData?.emoji || '😶'}
          </div>
          <h3 className="text-title-large font-semibold text-foreground">
            {currentMoodData?.label || 'Select your mood'}
          </h3>
          <p className="text-body-medium text-apple-gray-600 dark:text-apple-gray-400 mt-1">
            How are you feeling right now?
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-label-medium text-apple-gray-500">
            <span>Terrible</span>
            <span>Amazing</span>
          </div>
          
          <div className="flex justify-between items-center gap-2">
            {MOOD_LABELS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => onMoodChange(mood.value)}
                onMouseEnter={() => setHoveredMood(mood.value)}
                onMouseLeave={() => setHoveredMood(null)}
                className={`
                  flex-1 h-8 rounded-xl border-2 transition-all duration-250 ease-apple-ease
                  ${selectedMood === mood.value 
                    ? 'border-apple-gray-900 dark:border-apple-gray-100 scale-110' 
                    : 'border-apple-gray-200 dark:border-apple-gray-600 hover:border-apple-gray-400 dark:hover:border-apple-gray-400'
                  }
                  ${hoveredMood === mood.value ? 'scale-105' : ''}
                `}
                style={{ backgroundColor: mood.color }}
              >
                <span className="sr-only">{mood.label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex justify-between text-label-small text-apple-gray-400">
            {MOOD_LABELS.map((mood) => (
              <span key={mood.value}>{mood.value}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Emoji and text display */}
      <motion.div className="text-center" variants={staggerItem}>
        <AnimatePresence mode="wait">
          <motion.div
            key={displayMood}
            className="text-6xl mb-2"
            variants={emojiVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {currentMoodData?.emoji || '😶'}
          </motion.div>
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          <motion.h3
            key={`title-${displayMood}`}
            className="text-title-large font-semibold text-foreground"
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {currentMoodData?.label || 'Select your mood'}
          </motion.h3>
        </AnimatePresence>
        
        <motion.p 
          className="text-body-medium text-apple-gray-600 dark:text-apple-gray-400 mt-1"
          variants={staggerItem}
        >
          How are you feeling right now?
        </motion.p>
      </motion.div>

      {/* Mood selector */}
      <motion.div className="space-y-4" variants={staggerItem}>
        <motion.div 
          className="flex justify-between items-center text-label-medium text-apple-gray-500"
          variants={staggerItem}
        >
          <span>Terrible</span>
          <span>Amazing</span>
        </motion.div>
        
        <motion.div 
          className="flex justify-between items-center gap-2"
          variants={staggerContainer}
        >
          {MOOD_LABELS.map((mood, index) => (
            <motion.button
              key={mood.value}
              onClick={() => onMoodChange(mood.value)}
              onMouseEnter={() => setHoveredMood(mood.value)}
              onMouseLeave={() => setHoveredMood(null)}
              className={`
                flex-1 h-8 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-apple-blue-500 focus:ring-offset-2
                ${selectedMood === mood.value 
                  ? 'border-apple-gray-900 dark:border-apple-gray-100' 
                  : 'border-apple-gray-200 dark:border-apple-gray-600'
                }
              `}
              style={{ backgroundColor: mood.color }}
              variants={moodButtonVariants}
              initial="idle"
              animate={selectedMood === mood.value ? "selected" : "idle"}
              whileHover="hover"
              whileTap="pressed"
              custom={index}
            >
              <span className="sr-only">{mood.label}</span>
            </motion.button>
          ))}
        </motion.div>
        
        <motion.div 
          className="flex justify-between text-label-small text-apple-gray-400"
          variants={staggerContainer}
        >
          {MOOD_LABELS.map((mood, index) => (
            <motion.span 
              key={mood.value}
              variants={staggerItem}
              custom={index}
            >
              {mood.value}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MotionMoodSelector;