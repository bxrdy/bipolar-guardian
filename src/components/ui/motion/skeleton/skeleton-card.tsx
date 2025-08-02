
/**
 * Card skeleton component with header, content, and footer
 */

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { staggerItem } from "@/lib/motion"
import { MotionSkeleton } from "./motion-skeleton-base"
import { SkeletonGroup } from "./skeleton-group"
import { SkeletonText } from "./skeleton-text"

interface SkeletonCardProps {
  className?: string
  disableAnimation?: boolean
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  className,
  disableAnimation = false 
}) => (
  <motion.div
    className={cn("rounded-xl border border-apple-gray-200 dark:border-apple-gray-700 p-6", className)}
    variants={staggerItem}
  >
    <SkeletonGroup disableAnimation={disableAnimation}>
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <MotionSkeleton className="h-12 w-12 rounded-full" disableAnimation={disableAnimation} />
        <div className="space-y-2 flex-1">
          <MotionSkeleton className="h-4 w-1/2" disableAnimation={disableAnimation} />
          <MotionSkeleton className="h-3 w-1/3" disableAnimation={disableAnimation} />
        </div>
      </div>
      
      {/* Content */}
      <SkeletonText lines={2} disableAnimation={disableAnimation} />
      
      {/* Footer */}
      <div className="flex justify-between items-center mt-4">
        <MotionSkeleton className="h-8 w-20 rounded-lg" disableAnimation={disableAnimation} />
        <MotionSkeleton className="h-8 w-16 rounded-lg" disableAnimation={disableAnimation} />
      </div>
    </SkeletonGroup>
  </motion.div>
);

export { SkeletonCard, type SkeletonCardProps }
