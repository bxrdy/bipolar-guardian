
/**
 * Apple-style spring configurations for Framer Motion
 */

export const appleSpring = {
  // Gentle spring for subtle interactions
  gentle: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  },
  
  // Bouncy spring for button presses and feedback
  bouncy: {
    type: "spring" as const,
    stiffness: 600,
    damping: 25,
    mass: 0.8,
  },
  
  // Snappy spring for quick interactions
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 35,
    mass: 0.6,
  },
  
  // Smooth spring for page transitions
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 1.2,
  },
} as const;
