
/**
 * Chart skeleton component with bars and labels
 */

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { staggerItem } from "@/lib/motion"
import { MotionSkeleton } from "./motion-skeleton-base"
import { SkeletonGroup } from "./skeleton-group"

interface SkeletonChartProps {
  className?: string
  disableAnimation?: boolean
}

const SkeletonChart: React.FC<SkeletonChartProps> = ({ 
  className,
  disableAnimation = false 
}) => (
  <motion.div
    className={cn("rounded-xl border border-apple-gray-200 dark:border-apple-gray-700 p-6", className)}
    variants={staggerItem}
  >
    <SkeletonGroup disableAnimation={disableAnimation}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <MotionSkeleton className="h-6 w-1/3" disableAnimation={disableAnimation} />
        <MotionSkeleton className="h-8 w-20 rounded-lg" disableAnimation={disableAnimation} />
      </div>
      
      {/* Chart bars */}
      <div className="flex items-end space-x-2 h-32">
        {Array.from({ length: 7 }).map((_, i) => (
          <MotionSkeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${Math.random() * 80 + 20}%` }}
            disableAnimation={disableAnimation}
          />
        ))}
      </div>
      
      {/* Chart labels */}
      <div className="flex justify-between mt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <MotionSkeleton key={i} className="h-3 w-8" disableAnimation={disableAnimation} />
        ))}
      </div>
    </SkeletonGroup>
  </motion.div>
);

export { SkeletonChart, type SkeletonChartProps }
