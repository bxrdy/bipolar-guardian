
/**
 * Page transition component with Apple-style slide animations
 */

import * as React from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { createMotionProps, pageVariants, appleSpring, appleTiming } from "@/lib/motion"

type Screen = 'login' | 'onboarding-step1' | 'onboarding-step2' | 'onboarding-step3' | 'dashboard' | 'data-streams' | 'health-data' | 'settings' | 'medications' | 'guardian';

interface PageTransitionProps {
  children: React.ReactNode
  currentScreen: Screen
  className?: string
  disableAnimation?: boolean
}

// Define the navigation direction for smooth transitions
const getNavigationDirection = (from: Screen, to: Screen): number => {
  const screenOrder: Screen[] = [
    'login',
    'onboarding-step1', 
    'onboarding-step2', 
    'onboarding-step3',
    'dashboard',
    'data-streams',
    'health-data',
    'medications',
    'guardian',
    'settings'
  ];
  
  const fromIndex = screenOrder.indexOf(from);
  const toIndex = screenOrder.indexOf(to);
  
  // Return 1 for forward navigation, -1 for backward
  return toIndex > fromIndex ? 1 : -1;
};

// Create direction-aware page variants
const createDirectionalVariants = (direction: number): Variants => ({
  initial: {
    opacity: 0,
    x: direction > 0 ? 30 : -30,
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      mass: 1.2,
    },
  },
  exit: {
    opacity: 0,
    x: direction > 0 ? -30 : 30,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
});

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  currentScreen, 
  className,
  disableAnimation = false 
}) => {
  const [previousScreen, setPreviousScreen] = React.useState<Screen>(currentScreen);
  const [direction, setDirection] = React.useState<number>(1);

  React.useEffect(() => {
    if (previousScreen !== currentScreen) {
      setDirection(getNavigationDirection(previousScreen, currentScreen));
      setPreviousScreen(currentScreen);
    }
  }, [currentScreen, previousScreen]);

  if (disableAnimation) {
    return <div className={className}>{children}</div>;
  }

  const variants = createDirectionalVariants(direction);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={currentScreen}
        className={className}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
