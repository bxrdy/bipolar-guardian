
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary button - uses semantic primary color with proper contrast
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elevation-2 hover:shadow-elevation-3 rounded-xl font-semibold border-0",
        
        // Secondary button - uses semantic secondary color
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-elevation-1 hover:shadow-elevation-2 rounded-xl font-medium border-0",
        
        // Tertiary button - subtle with proper contrast
        tertiary: "bg-transparent text-primary hover:bg-primary/10 hover:text-primary rounded-xl font-medium border border-border/50 hover:border-primary/30",
        
        // Destructive button - uses semantic destructive color
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-elevation-2 hover:shadow-coral rounded-xl font-semibold border-0",
        
        // Outline button - proper contrast with border
        outline: "border-2 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/50 rounded-xl font-medium shadow-elevation-1",
        
        // Ghost button - minimal but visible
        ghost: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground rounded-xl font-medium",
        
        // Link button - underlined text
        link: "text-primary underline-offset-4 hover:underline bg-transparent rounded-none font-medium",

        // Success variant using accent (green) color
        success: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-elevation-2 hover:shadow-green rounded-xl font-semibold border-0",
      },
      size: {
        sm: "h-9 px-4 text-sm py-2",     // Increased height and padding
        default: "h-11 px-6 py-3 text-sm", // Increased from h-10
        lg: "h-12 px-8 py-3.5 text-base",  // Increased padding
        icon: "h-11 w-11",                  // Increased from h-10 w-10
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Add debugging to understand visibility issues
    React.useEffect(() => {
      console.log('Button rendered with variant:', variant, 'size:', size, 'className:', className);
    }, [variant, size, className]);
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
