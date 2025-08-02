
/**
 * Motion utility functions and helpers
 */

import { MotionProps, Variants, Transition } from "framer-motion";
import { motionPresets } from "./presets";

// Utility for reduced motion
export const getReducedMotionConfig = (shouldReduce: boolean): MotionProps => {
  if (shouldReduce) {
    return {
      initial: {},
      animate: {},
      exit: {},
      transition: { duration: 0 },
    };
  }
  return {};
};

// Utility to check for reduced motion preference
export const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Higher-order component props for motion elements
export interface MotionComponentProps {
  reducedMotion?: boolean;
  variant?: keyof typeof motionPresets;
  customVariants?: Variants;
  customTransition?: Transition;
}

// Utility to merge motion props with reduced motion handling
export const createMotionProps = ({
  reducedMotion = prefersReducedMotion(),
  variant,
  customVariants,
  customTransition,
}: MotionComponentProps = {}): MotionProps => {
  if (reducedMotion) {
    return getReducedMotionConfig(true);
  }

  const baseProps = variant ? motionPresets[variant] : {};
  
  return {
    ...baseProps,
    ...(customVariants && { variants: customVariants }),
    ...(customTransition && { transition: customTransition }),
  };
};
