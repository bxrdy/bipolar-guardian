import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "grouped" | "search";
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", error = false, ...props }, ref) => {
    const baseClasses = "flex w-full bg-background text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-250 ease-gentle";
    
    const variantClasses = {
      default: "h-11 px-4 py-3 rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary text-body-medium",
      
      grouped: "h-11 px-4 py-3 border-0 bg-muted focus-visible:outline-none focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary text-body-medium first:rounded-t-xl last:rounded-b-xl only:rounded-xl border-b border-border last:border-b-0",
      
      search: "h-9 px-3 py-2 rounded-lg bg-muted border-0 focus-visible:outline-none focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary text-body-medium",
    };
    
    const errorClasses = error 
      ? "border-destructive focus-visible:ring-destructive focus-visible:border-destructive" 
      : "";

    return (
      <input
        type={type}
        className={cn(
          baseClasses,
          variantClasses[variant],
          errorClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
