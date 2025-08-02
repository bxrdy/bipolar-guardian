
/**
 * Motion-enhanced Card component with Apple-style hover and press animations
 */

import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { createMotionProps } from "@/lib/motion"

const motionCardVariants = cva(
  "bg-card text-card-foreground",
  {
    variants: {
      variant: {
        default: "rounded-xl border border-apple-gray-200 dark:border-apple-gray-700",
        elevated: "rounded-xl border-0",
        inset: "rounded-xl bg-apple-gray-50 dark:bg-apple-gray-800 border-0",
        grouped: "bg-apple-gray-50 dark:bg-apple-gray-800 border-0 first:rounded-t-xl last:rounded-b-xl only:rounded-xl border-b border-apple-gray-200 dark:border-apple-gray-700 last:border-b-0",
      },
      interactive: {
        true: "cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
)

export interface MotionCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 
    'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop' |
    'onTransitionStart' | 'onTransitionEnd' | 'onTransitionRun' | 'onTransitionCancel'
  >,
    VariantProps<typeof motionCardVariants> {
  disableAnimation?: boolean
}

const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, variant, interactive, disableAnimation = false, onClick, ...props }, ref) => {
    // Create motion props with Apple-style card animations
    const motionProps = createMotionProps({
      variant: interactive ? "card" : undefined,
    })
    
    // If animation is disabled, return regular div
    if (disableAnimation) {
      return (
        <div
          ref={ref}
          className={cn(motionCardVariants({ variant, interactive, className }))}
          onClick={onClick}
          {...props}
        />
      )
    }
    
    // Return motion-enhanced card
    return (
      <motion.div
        ref={ref}
        className={cn(motionCardVariants({ variant, interactive, className }))}
        onClick={onClick}
        {...motionProps}
        {...props}
      />
    )
  }
)
MotionCard.displayName = "MotionCard"

const MotionCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-2 p-6", className)} {...props} />
))
MotionCardHeader.displayName = "MotionCardHeader"

const MotionCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-title-large font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
MotionCardTitle.displayName = "MotionCardTitle"

const MotionCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body-medium text-apple-gray-600 dark:text-apple-gray-400", className)}
    {...props}
  />
))
MotionCardDescription.displayName = "MotionCardDescription"

const MotionCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
MotionCardContent.displayName = "MotionCardContent"

const MotionCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
MotionCardFooter.displayName = "MotionCardFooter"

export { 
  MotionCard, 
  MotionCardHeader, 
  MotionCardFooter, 
  MotionCardTitle, 
  MotionCardDescription, 
  MotionCardContent, 
  motionCardVariants 
}
