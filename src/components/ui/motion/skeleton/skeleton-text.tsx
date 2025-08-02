
/**
 * Text skeleton component with multiple lines
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { MotionSkeleton } from "./motion-skeleton-base"
import { SkeletonGroup } from "./skeleton-group"

interface SkeletonTextProps {
  lines?: number
  className?: string
  disableAnimation?: boolean
}

const SkeletonText: React.FC<SkeletonTextProps> = ({ 
  lines = 3, 
  className,
  disableAnimation = false 
}) => (
  <SkeletonGroup className={cn("space-y-3", className)} disableAnimation={disableAnimation}>
    {Array.from({ length: lines }).map((_, i) => (
      <MotionSkeleton
        key={i}
        className={cn(
          "h-4",
          i === lines - 1 ? "w-3/4" : "w-full"
        )}
        disableAnimation={disableAnimation}
      />
    ))}
  </SkeletonGroup>
);

export { SkeletonText, type SkeletonTextProps }
