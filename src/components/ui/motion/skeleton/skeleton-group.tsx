
/**
 * Skeleton Group component with stagger animation
 */

import * as React from "react"
import { motion } from "framer-motion"
import { staggerContainer, staggerItem } from "@/lib/motion"

interface SkeletonGroupProps {
  children: React.ReactNode
  className?: string
  disableAnimation?: boolean
}

const SkeletonGroup: React.FC<SkeletonGroupProps> = ({ 
  children, 
  className,
  disableAnimation = false 
}) => {
  if (disableAnimation) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={staggerItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export { SkeletonGroup, type SkeletonGroupProps }
