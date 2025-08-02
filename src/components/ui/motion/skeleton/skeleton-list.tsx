
/**
 * List skeleton component with multiple items
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { MotionSkeleton } from "./motion-skeleton-base"
import { SkeletonGroup } from "./skeleton-group"

interface SkeletonListProps {
  items?: number
  className?: string
  disableAnimation?: boolean
}

const SkeletonList: React.FC<SkeletonListProps> = ({ 
  items = 5, 
  className,
  disableAnimation = false 
}) => (
  <SkeletonGroup className={cn("space-y-4", className)} disableAnimation={disableAnimation}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <MotionSkeleton className="h-10 w-10 rounded-full" disableAnimation={disableAnimation} />
        <div className="space-y-2 flex-1">
          <MotionSkeleton className="h-4 w-full" disableAnimation={disableAnimation} />
          <MotionSkeleton className="h-3 w-2/3" disableAnimation={disableAnimation} />
        </div>
        <MotionSkeleton className="h-6 w-6 rounded" disableAnimation={disableAnimation} />
      </div>
    ))}
  </SkeletonGroup>
);

export { SkeletonList, type SkeletonListProps }
