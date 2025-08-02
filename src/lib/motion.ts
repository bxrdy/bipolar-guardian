
/**
 * Apple-inspired Motion Configuration for Framer Motion
 * 
 * This file contains reusable motion presets, spring configurations, and utilities
 * that follow Apple's Human Interface Guidelines for animations and micro-interactions.
 */

export {
  // Spring configurations
  appleSpring,
  
  // Timing configurations
  appleTiming,
  
  // Animation variants
  buttonVariants,
  cardVariants,
  modalVariants,
  sheetVariants,
  pageVariants,
  staggerContainer,
  staggerItem,
  fadeVariants,
  scaleVariants,
  pulseVariants,
  
  // Motion presets
  motionPresets,
  
  // Utility functions
  getReducedMotionConfig,
  prefersReducedMotion,
  createMotionProps,
  type MotionComponentProps,
} from "./motion/index"
