import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from '@/hooks/use-mobile'

const MobileDialog = DialogPrimitive.Root

const MobileDialogTrigger = DialogPrimitive.Trigger

const MobileDialogPortal = DialogPrimitive.Portal

const MobileDialogClose = DialogPrimitive.Close

const MobileDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
MobileDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const MobileDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <MobileDialogPortal>
      <MobileDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 flex flex-col",
          isMobile 
            ? "inset-x-4 top-4 max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] rounded-xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom" 
            : "left-[50%] top-[50%] max-h-[90vh] translate-x-[-50%] translate-y-[-50%] rounded-lg data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          className
        )}
        {...props}
      >
        {children}
        <MobileDialogClose 
          className={cn(
            "absolute rounded-lg transition-all duration-200 hover:bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200/50 z-50",
            isMobile ? "right-4 top-4 h-12 w-12 min-h-[48px] min-w-[48px]" : "right-4 top-4 h-10 w-10 min-h-[40px] min-w-[40px]"
          )}
        >
          <X className={isMobile ? "h-6 w-6" : "h-5 w-5"} />
          <span className="sr-only">Close</span>
        </MobileDialogClose>
      </DialogPrimitive.Content>
    </MobileDialogPortal>
  )
})
MobileDialogContent.displayName = DialogPrimitive.Content.displayName

const MobileDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useIsMobile()
  
  return (
    <div
      className={cn(
        "flex flex-col text-center sm:text-left flex-shrink-0",
        isMobile ? "pr-8 mb-4 p-4 pb-0" : "space-y-1.5 mb-4 p-6 pb-0",
        className
      )}
      {...props}
    />
  )
}
MobileDialogHeader.displayName = "MobileDialogHeader"

const MobileDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useIsMobile()
  
  return (
    <div
      className={cn(
        "flex-shrink-0 border-t bg-background",
        isMobile 
          ? "flex flex-col space-y-2 p-4" 
          : "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6",
        className
      )}
      {...props}
    />
  )
}
MobileDialogFooter.displayName = "MobileDialogFooter"

const MobileDialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useIsMobile()
  
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto",
        isMobile ? "px-4 pb-2" : "px-6 pb-2",
        className
      )}
      {...props}
    />
  )
}
MobileDialogBody.displayName = "MobileDialogBody"

const MobileDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
MobileDialogTitle.displayName = DialogPrimitive.Title.displayName

const MobileDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
MobileDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  MobileDialog,
  MobileDialogPortal,
  MobileDialogOverlay,
  MobileDialogClose,
  MobileDialogTrigger,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogFooter,
  MobileDialogBody,
  MobileDialogTitle,
  MobileDialogDescription,
}
