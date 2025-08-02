/**
 * Skip Links Component for Screen Reader and Keyboard Navigation
 * Provides quick navigation to main content areas following WCAG guidelines
 */

import * as React from "react"
import { cn } from "@/lib/utils"

interface SkipLink {
  href: string
  label: string
  description?: string
}

interface SkipLinksProps {
  links?: SkipLink[]
  className?: string
}

const defaultSkipLinks: SkipLink[] = [
  {
    href: "#main-content",
    label: "Skip to main content",
    description: "Jump to the primary content of the page"
  },
  {
    href: "#navigation",
    label: "Skip to navigation",
    description: "Jump to the main navigation menu"
  },
  {
    href: "#sidebar",
    label: "Skip to sidebar",
    description: "Jump to the sidebar navigation (desktop only)"
  },
  {
    href: "#bottom-navigation",
    label: "Skip to bottom navigation",
    description: "Jump to the bottom navigation (mobile only)"
  }
]

const SkipLinks: React.FC<SkipLinksProps> = ({ 
  links = defaultSkipLinks,
  className 
}) => {
  return (
    <nav 
      className={cn("skip-links", className)}
      aria-label="Skip navigation links"
    >
      <ul className="sr-only focus-within:not-sr-only fixed top-0 left-0 z-[9999] bg-background border border-apple-gray-300 dark:border-apple-gray-600 rounded-lg shadow-elevation-3 p-2 m-2">
        {links.map((link, index) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={cn(
                "block px-4 py-2 text-body-medium font-medium text-apple-blue-600 dark:text-apple-blue-400",
                "hover:bg-apple-blue-50 dark:hover:bg-apple-blue-900/20",
                "focus:bg-apple-blue-50 dark:focus:bg-apple-blue-900/20",
                "focus:outline-none focus:ring-2 focus:ring-apple-blue-500 focus:ring-offset-2",
                "rounded-lg transition-all duration-250 ease-apple-ease",
                index > 0 && "border-t border-apple-gray-200 dark:border-apple-gray-700"
              )}
              title={link.description}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * Hook to manage skip link targets
 * Ensures all skip link targets exist and are properly labeled
 */
export const useSkipLinkTargets = () => {
  React.useEffect(() => {
    // Ensure all skip link targets have proper IDs and are focusable
    const targets = [
      { id: 'main-content', label: 'Main content area' },
      { id: 'navigation', label: 'Main navigation' },
      { id: 'sidebar', label: 'Sidebar navigation' },
      { id: 'bottom-navigation', label: 'Bottom navigation' }
    ]

    targets.forEach(target => {
      const element = document.getElementById(target.id)
      
      if (element) {
        // Make sure the element is focusable
        if (!element.hasAttribute('tabindex')) {
          element.setAttribute('tabindex', '-1')
        }
        
        // Add aria-label if not present
        if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
          element.setAttribute('aria-label', target.label)
        }
      }
    })
  }, [])
}

/**
 * Skip Link Target wrapper component
 * Provides proper semantic markup for skip link destinations
 */
interface SkipLinkTargetProps {
  id: string
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
  'aria-label'?: string
}

export const SkipLinkTarget: React.FC<SkipLinkTargetProps> = ({
  id,
  children,
  className,
  as: Component = 'div',
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <Component
      id={id}
      tabIndex={-1}
      aria-label={ariaLabel}
      className={cn("focus:outline-none focus:ring-2 focus:ring-apple-blue-500 focus:ring-offset-2 rounded-lg", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export default SkipLinks