
/**
 * Main export file for motion utilities
 */

// Spring configurations
export { appleSpring } from "./spring-configs";

// Timing configurations  
export { appleTiming } from "./timing-configs";

// Animation variants
export {
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
} from "./variants";

// Motion presets
export { motionPresets } from "./presets";

// Utility functions
export {
  getReducedMotionConfig,
  prefersReducedMotion,
  createMotionProps,
  type MotionComponentProps,
} from "./utils";
