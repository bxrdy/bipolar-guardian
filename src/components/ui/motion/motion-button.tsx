
/**
 * Motion-enhanced Button component with Apple-style spring animations
 */

import * as React from "react"
import { motion } from "framer-motion"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants, motionPresets, createMotionProps } from "@/lib/motion"

const motionButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Apple-style filled button (primary)
        default: "bg-apple-blue-500 text-white hover:bg-apple-blue-600 rounded-xl text-body-medium",
        
        // Apple-style destructive button
        destructive: "bg-apple-red-500 text-white hover:bg-apple-red-600 rounded-xl text-body-medium",
        
        // Apple-style tinted button
        tinted: "bg-apple-blue-500/10 text-apple-blue-600 dark:text-apple-blue-400 hover:bg-apple-blue-500/20 rounded-xl text-body-medium",
        
        // Apple-style plain button
        plain: "text-apple-blue-600 dark:text-apple-blue-400 hover:bg-apple-blue-500/10 rounded-xl text-body-medium",
        
        // Apple-style outline button
        outline: "border border-apple-gray-300 dark:border-apple-gray-600 bg-background hover:bg-apple-gray-50 dark:hover:bg-apple-gray-800 text-foreground rounded-xl text-body-medium",
        
        // Apple-style secondary button
        secondary: "bg-apple-gray-100 dark:bg-apple-gray-800 text-apple-gray-900 dark:text-apple-gray-100 hover:bg-apple-gray-200 dark:hover:bg-apple-gray-700 rounded-xl text-body-medium",
        
        // Apple-style ghost button
        ghost: "hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 text-foreground rounded-xl text-body-medium",
        
        // Apple-style link button
        link: "text-apple-blue-600 dark:text-apple-blue-400 underline-offset-4 hover:underline text-body-medium",
      },
      size: {
        default: "h-11 px-4 py-3 min-h-[44px]",
        sm: "h-9 px-3 py-2 min-h-[36px] text-label-medium",
        lg: "h-12 px-6 py-3 min-h-[48px] text-body-large",
        icon: "h-11 w-11 min-h-[44px] rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface MotionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 
    'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop' |
    'onTransitionStart' | 'onTransitionEnd' | 'onTransitionRun' | 'onTransitionCancel'
  >,
    VariantProps<typeof motionButtonVariants> {
  asChild?: boolean
  disableAnimation?: boolean
}

const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant, size, asChild = false, disableAnimation = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Create motion props with Apple-style button animations
    const motionProps = createMotionProps({
      variant: "button",
    })
    
    // If animation is disabled, return regular button
    if (disableAnimation) {
      return (
        <Comp
          className={cn(motionButtonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      )
    }
    
    // Return motion-enhanced button
    return (
      <motion.button
        className={cn(motionButtonVariants({ variant, size, className }))}
        ref={ref}
        {...motionProps}
        {...props}
      />
    )
  }
)
MotionButton.displayName = "MotionButton"

export { MotionButton, motionButtonVariants }
