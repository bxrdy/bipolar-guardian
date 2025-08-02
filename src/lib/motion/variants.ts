
/**
 * Reusable motion variants for consistent animations
 */

export const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const fadeInDown = {
  hidden: {
    opacity: 0,
    y: -30,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const fadeInLeft = {
  hidden: {
    opacity: 0,
    x: -30,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
};

export const fadeInRight = {
  hidden: {
    opacity: 0,
    x: 30,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
};

export const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

// Hero-specific animations
export const heroTitle = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const heroSubtitle = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const heroButtons = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

// Navigation animations
export const navBlur = {
  scrolled: {
    backdropFilter: "blur(20px)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  top: {
    backdropFilter: "blur(0px)",
    backgroundColor: "rgba(255, 255, 255, 0)",
  },
};

// Additional variants needed by index.ts and presets.ts
export const buttonVariants = {
  idle: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -1,
  },
  pressed: {
    scale: 0.98,
    y: 0,
  },
};

export const cardVariants = {
  idle: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.01,
    y: -2,
  },
  pressed: {
    scale: 0.99,
    y: 0,
  },
};

export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
};

export const sheetVariants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
  },
  exit: {
    y: "100%",
    opacity: 0,
  },
};

export const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  enter: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 20,
  },
};

export const fadeVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

export const scaleVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
  },
};

export const pulseVariants = {
  idle: {
    scale: 1,
    opacity: 1,
  },
  pulse: {
    scale: 1.05,
    opacity: 0.8,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};
