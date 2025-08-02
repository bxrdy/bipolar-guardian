
/**
 * Base Motion-enhanced skeleton component with Apple-style shimmer animations
 */

import * as React from "react"
import { motion, Variants } from "framer-motion"
import { cn } from "@/lib/utils"

interface MotionSkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 
  'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop' |
  'onTransitionStart' | 'onTransitionEnd' | 'onTransitionRun' | 'onTransitionCancel'
> {
  disableAnimation?: boolean
}

// Apple-style shimmer animation
const shimmerVariants: Variants = {
  shimmer: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const MotionSkeleton = React.forwardRef<HTMLDivElement, MotionSkeletonProps>(
  ({ className, disableAnimation = false, ...props }, ref) => {
    if (disableAnimation) {
      return (
        <div
          ref={ref}
          className={cn("animate-pulse rounded-lg bg-apple-gray-100 dark:bg-apple-gray-800", className)}
          {...props}
        />
      )
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-lg bg-gradient-to-r from-apple-gray-100 via-apple-gray-200 to-apple-gray-100 dark:from-apple-gray-800 dark:via-apple-gray-700 dark:to-apple-gray-800 bg-[length:200%_100%]",
          className
        )}
        variants={shimmerVariants}
        animate="shimmer"
        {...props}
      />
    )
  }
)
MotionSkeleton.displayName = "MotionSkeleton"

export { MotionSkeleton, type MotionSkeletonProps }
