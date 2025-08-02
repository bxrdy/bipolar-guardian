
/**
 * Motion-enhanced Dialog component with Apple-style modal presentations
 */

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { createMotionProps, fadeVariants, modalVariants } from "@/lib/motion"

const MotionDialog = DialogPrimitive.Root

const MotionDialogTrigger = DialogPrimitive.Trigger

const MotionDialogPortal = DialogPrimitive.Portal

const MotionDialogClose = DialogPrimitive.Close

interface MotionDialogOverlayProps 
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>, 
    'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop' |
    'onTransitionStart' | 'onTransitionEnd' | 'onTransitionRun' | 'onTransitionCancel'
  > {
  disableAnimation?: boolean
}

const MotionDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  MotionDialogOverlayProps
>(({ className, disableAnimation = false, ...props }, ref) => {
  const motionProps = createMotionProps({
    variant: "fade",
  })

  if (disableAnimation) {
    return (
      <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <DialogPrimitive.Overlay ref={ref} asChild>
      <motion.div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
          className
        )}
        {...motionProps}
        {...props}
      />
    </DialogPrimitive.Overlay>
  )
})
MotionDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface MotionDialogContentProps 
  extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, 
    'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop' |
    'onTransitionStart' | 'onTransitionEnd' | 'onTransitionRun' | 'onTransitionCancel'
  > {
  disableAnimation?: boolean
}

const MotionDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  MotionDialogContentProps
>(({ className, children, disableAnimation = false, ...props }, ref) => {
  const motionProps = createMotionProps({
    variant: "modal",
  })

  if (disableAnimation) {
    return (
      <MotionDialogPortal>
        <MotionDialogOverlay disableAnimation />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-apple-gray-200 dark:border-apple-gray-700 bg-background p-6 shadow-elevation-3 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl",
            className
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-apple-blue-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </MotionDialogPortal>
    )
  }

  return (
    <MotionDialogPortal>
      <MotionDialogOverlay />
      <DialogPrimitive.Content ref={ref} asChild>
        <motion.div
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-apple-gray-200 dark:border-apple-gray-700 bg-background p-6 shadow-elevation-3 rounded-xl",
            className
          )}
          {...motionProps}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg opacity-70 ring-offset-background transition-all duration-250 ease-apple-ease hover:opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-apple-blue-500 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </motion.div>
      </DialogPrimitive.Content>
    </MotionDialogPortal>
  )
})
MotionDialogContent.displayName = DialogPrimitive.Content.displayName

const MotionDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
MotionDialogHeader.displayName = "MotionDialogHeader"

const MotionDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
MotionDialogFooter.displayName = "MotionDialogFooter"

const MotionDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-title-large font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
MotionDialogTitle.displayName = DialogPrimitive.Title.displayName

const MotionDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-body-medium text-apple-gray-600 dark:text-apple-gray-400", className)}
    {...props}
  />
))
MotionDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  MotionDialog,
  MotionDialogPortal,
  MotionDialogOverlay,
  MotionDialogClose,
  MotionDialogTrigger,
  MotionDialogContent,
  MotionDialogHeader,
  MotionDialogFooter,
  MotionDialogTitle,
  MotionDialogDescription,
}
