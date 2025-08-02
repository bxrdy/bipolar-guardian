
/**
 * Motion presets for common use cases
 */

import { MotionProps } from "framer-motion";
import { 
  buttonVariants, 
  cardVariants, 
  modalVariants, 
  sheetVariants, 
  pageVariants, 
  fadeVariants, 
  scaleVariants 
} from "./variants";

// Motion presets for common use cases
export const motionPresets = {
  // Button with haptic-like feedback
  button: {
    whileHover: "hover",
    whileTap: "pressed",
    variants: buttonVariants,
  } as MotionProps,

  // Card with subtle hover effect
  card: {
    whileHover: "hover",
    whileTap: "pressed",
    variants: cardVariants,
  } as MotionProps,

  // Modal with spring entrance
  modal: {
    initial: "hidden",
    animate: "visible",
    exit: "exit",
    variants: modalVariants,
  } as MotionProps,

  // Sheet sliding from bottom
  sheet: {
    initial: "hidden",
    animate: "visible",
    exit: "exit",
    variants: sheetVariants,
  } as MotionProps,

  // Page transition
  page: {
    initial: "initial",
    animate: "enter",
    exit: "exit",
    variants: pageVariants,
  } as MotionProps,

  // Fade in/out
  fade: {
    initial: "hidden",
    animate: "visible",
    exit: "exit",
    variants: fadeVariants,
  } as MotionProps,

  // Scale in/out
  scale: {
    initial: "hidden",
    animate: "visible",
    exit: "exit",
    variants: scaleVariants,
  } as MotionProps,
} as const;
