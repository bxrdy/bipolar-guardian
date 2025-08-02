
/**
 * Apple-inspired timing configurations for animations
 * Based on Apple's Human Interface Guidelines and Motion principles
 */

export const appleTiming = {
  // Ultra-fast interactions (button presses, toggles)
  instant: {
    duration: 0.08,
    ease: [0.25, 0.1, 0.25, 1],
  },
  
  // Fast interactions (hover states, small UI changes)
  fast: {
    duration: 0.15,
    ease: [0.25, 0.1, 0.25, 1],
  },
  
  // Standard interactions (modals, sheets, most UI)
  normal: {
    duration: 0.25,
    ease: [0.25, 0.1, 0.25, 1],
  },
  
  // Slower interactions (page transitions, large movements)
  slow: {
    duration: 0.35,
    ease: [0.25, 0.1, 0.25, 1],
  },
  
  // Very slow interactions (complex animations, reveals)
  slower: {
    duration: 0.5,
    ease: [0.25, 0.1, 0.25, 1],
  },
  
  // Spring-based animations
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  },
  
  // Gentle spring for larger elements
  gentleSpring: {
    type: "spring",
    stiffness: 200,
    damping: 25,
  },
  
  // Bouncy spring for playful interactions
  bouncySpring: {
    type: "spring",
    stiffness: 400,
    damping: 20,
  },
} as const;

// Reduced motion alternatives
export const reducedMotionTiming = {
  instant: { duration: 0.01 },
  fast: { duration: 0.01 },
  normal: { duration: 0.01 },
  slow: { duration: 0.01 },
  slower: { duration: 0.01 },
  spring: { duration: 0.01 },
  gentleSpring: { duration: 0.01 },
  bouncySpring: { duration: 0.01 },
} as const;
