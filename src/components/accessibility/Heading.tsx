/**
 * Semantic Heading Component with Proper Hierarchy Management
 * Ensures proper heading levels (h1-h6) for screen reader navigation
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const headingVariants = cva(
  "font-semibold tracking-tight text-foreground",
  {
    variants: {
      level: {
        1: "text-display-large leading-none", // h1 - Page title
        2: "text-headline-large leading-tight", // h2 - Major sections
        3: "text-headline-medium leading-tight", // h3 - Subsections
        4: "text-title-large leading-normal", // h4 - Sub-subsections
        5: "text-title-medium leading-normal", // h5 - Minor headings
        6: "text-label-large leading-normal", // h6 - Smallest headings
      },
      visual: {
        "display-large": "text-display-large leading-none",
        "display-medium": "text-display-medium leading-tight",
        "display-small": "text-display-small leading-tight",
        "headline-large": "text-headline-large leading-tight",
        "headline-medium": "text-headline-medium leading-tight",
        "headline-small": "text-headline-small leading-tight",
        "title-large": "text-title-large leading-normal",
        "title-medium": "text-title-medium leading-normal",
        "title-small": "text-title-small leading-normal",
      },
    },
    defaultVariants: {
      level: 1,
    },
  }
)

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  level: 1 | 2 | 3 | 4 | 5 | 6
  visual?: VariantProps<typeof headingVariants>["visual"]
  children: React.ReactNode
}

/**
 * Semantic heading component that separates semantic meaning from visual appearance
 * This allows you to have proper heading hierarchy while maintaining design flexibility
 */
const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, visual, children, ...props }, ref) => {
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
    
    return React.createElement(
      HeadingTag,
      {
        ref,
        className: cn(
          headingVariants({ 
            level: visual ? undefined : level, 
            visual 
          }), 
          className
        ),
        ...props,
      },
      children
    )
  }
)
Heading.displayName = "Heading"

/**
 * Heading context for managing hierarchy levels
 */
interface HeadingContextType {
  level: number
  increment: () => number
  decrement: () => void
  reset: (level?: number) => void
}

const HeadingContext = React.createContext<HeadingContextType | undefined>(undefined)

/**
 * Heading provider for managing heading levels in a component tree
 */
export const HeadingProvider: React.FC<{
  children: React.ReactNode
  startLevel?: number
}> = ({ children, startLevel = 1 }) => {
  const [level, setLevel] = React.useState(startLevel)

  const increment = React.useCallback(() => {
    const newLevel = Math.min(level + 1, 6)
    setLevel(newLevel)
    return newLevel
  }, [level])

  const decrement = React.useCallback(() => {
    setLevel(Math.max(level - 1, 1))
  }, [level])

  const reset = React.useCallback((newLevel?: number) => {
    setLevel(newLevel || startLevel)
  }, [startLevel])

  const value = React.useMemo(() => ({
    level,
    increment,
    decrement,
    reset,
  }), [level, increment, decrement, reset])

  return (
    <HeadingContext.Provider value={value}>
      {children}
    </HeadingContext.Provider>
  )
}

/**
 * Hook to access heading context
 */
export const useHeadingContext = () => {
  const context = React.useContext(HeadingContext)
  if (context === undefined) {
    throw new Error('useHeadingContext must be used within a HeadingProvider')
  }
  return context
}

/**
 * Auto-incrementing heading component that uses context
 */
export const AutoHeading: React.FC<
  Omit<HeadingProps, 'level'> & { increment?: boolean }
> = ({ increment = true, children, ...props }) => {
  const { level: contextLevel, increment: incrementLevel } = useHeadingContext()
  
  const headingLevel = increment ? incrementLevel() : contextLevel
  
  return (
    <Heading level={headingLevel as 1 | 2 | 3 | 4 | 5 | 6} {...props}>
      {children}
    </Heading>
  )
}

/**
 * Page title component (always h1)
 */
export const PageTitle: React.FC<
  Omit<HeadingProps, 'level'> & { visualLevel?: VariantProps<typeof headingVariants>["visual"] }
> = ({ children, visualLevel, className, ...props }) => (
  <Heading
    level={1}
    visual={visualLevel}
    className={cn("mb-6", className)}
    {...props}
  >
    {children}
  </Heading>
)

/**
 * Section heading component
 */
export const SectionHeading: React.FC<
  Omit<HeadingProps, 'level'> & { 
    level?: 2 | 3 | 4 | 5 | 6
    visualLevel?: VariantProps<typeof headingVariants>["visual"]
  }
> = ({ level = 2, visualLevel, children, className, ...props }) => (
  <Heading
    level={level}
    visual={visualLevel}
    className={cn("mb-4", className)}
    {...props}
  >
    {children}
  </Heading>
)

/**
 * Card/Component heading
 */
export const ComponentHeading: React.FC<
  Omit<HeadingProps, 'level'> & { 
    level?: 3 | 4 | 5 | 6
    visualLevel?: VariantProps<typeof headingVariants>["visual"]
  }
> = ({ level = 3, visualLevel, children, className, ...props }) => (
  <Heading
    level={level}
    visual={visualLevel}
    className={cn("mb-2", className)}
    {...props}
  >
    {children}
  </Heading>
)

/**
 * Utility function to validate heading hierarchy
 * Useful for development and testing
 */
export const validateHeadingHierarchy = (container: HTMLElement = document.body): {
  valid: boolean
  issues: string[]
} => {
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  const issues: string[] = []
  
  if (headings.length === 0) {
    return { valid: true, issues: [] }
  }

  // Check for h1
  const h1Count = headings.filter(h => h.tagName === 'H1').length
  if (h1Count === 0) {
    issues.push('Page should have exactly one h1 element')
  } else if (h1Count > 1) {
    issues.push(`Page has ${h1Count} h1 elements, should have exactly one`)
  }

  // Check heading sequence
  let previousLevel = 0
  headings.forEach((heading, index) => {
    const currentLevel = parseInt(heading.tagName.substring(1))
    
    if (index === 0 && currentLevel !== 1) {
      issues.push(`First heading should be h1, found ${heading.tagName.toLowerCase()}`)
    }
    
    if (currentLevel > previousLevel + 1) {
      issues.push(
        `Heading level jumps from h${previousLevel} to h${currentLevel}. ` +
        `Should not skip heading levels.`
      )
    }
    
    previousLevel = currentLevel
  })

  return {
    valid: issues.length === 0,
    issues
  }
}

export { Heading, headingVariants }