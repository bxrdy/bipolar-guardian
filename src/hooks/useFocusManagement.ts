/**
 * Focus Management Hooks for Enhanced Accessibility
 * Provides focus trapping, restoration, and keyboard navigation utilities
 */

import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook for managing focus traps in modals and overlays
 * Follows ARIA guidelines for modal focus management
 */
export const useFocusTrap = (isActive: boolean = false) => {
  const containerRef = useRef<HTMLElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(el => {
      return el.offsetWidth > 0 && 
             el.offsetHeight > 0 && 
             !el.hasAttribute('disabled') &&
             el.getAttribute('tabindex') !== '-1'
    })
  }, [])

  // Handle Tab key navigation within the trap
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || event.key !== 'Tab') return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    const activeElement = document.activeElement as HTMLElement

    if (event.shiftKey) {
      // Shift + Tab: moving backwards
      if (activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab: moving forwards
      if (activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }, [isActive, getFocusableElements])

  // Set up focus trap
  useEffect(() => {
    if (!isActive) return

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Focus the first focusable element in the container
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      
      // Restore focus to the previously active element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isActive, handleKeyDown, getFocusableElements])

  return containerRef
}

/**
 * Hook for managing focus restoration
 * Useful for temporary overlays or state changes
 */
export const useFocusRestore = (shouldRestore: boolean = true) => {
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const storeFocus = useCallback(() => {
    previousActiveElement.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (shouldRestore && previousActiveElement.current) {
      previousActiveElement.current.focus()
    }
  }, [shouldRestore])

  return { storeFocus, restoreFocus }
}

/**
 * Hook for managing roving tabindex in widget groups
 * Useful for toolbars, grids, and other composite widgets
 */
export const useRovingTabIndex = (
  orientation: 'horizontal' | 'vertical' | 'both' = 'horizontal'
) => {
  const containerRef = useRef<HTMLElement>(null)
  const currentIndexRef = useRef(0)

  const getNavigableElements = useCallback(() => {
    if (!containerRef.current) return []
    
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>('[role="option"], [role="tab"], [role="gridcell"], button, [tabindex]')
    ).filter(el => !el.hasAttribute('disabled'))
  }, [])

  const updateTabIndexes = useCallback((focusedIndex: number) => {
    const elements = getNavigableElements()
    elements.forEach((element, index) => {
      element.setAttribute('tabindex', index === focusedIndex ? '0' : '-1')
    })
    currentIndexRef.current = focusedIndex
  }, [getNavigableElements])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const elements = getNavigableElements()
    if (elements.length === 0) return

    let newIndex = currentIndexRef.current
    let handled = false

    switch (event.key) {
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          newIndex = (currentIndexRef.current + 1) % elements.length
          handled = true
        }
        break
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          newIndex = currentIndexRef.current === 0 ? elements.length - 1 : currentIndexRef.current - 1
          handled = true
        }
        break
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          newIndex = (currentIndexRef.current + 1) % elements.length
          handled = true
        }
        break
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          newIndex = currentIndexRef.current === 0 ? elements.length - 1 : currentIndexRef.current - 1
          handled = true
        }
        break
      case 'Home':
        newIndex = 0
        handled = true
        break
      case 'End':
        newIndex = elements.length - 1
        handled = true
        break
    }

    if (handled) {
      event.preventDefault()
      updateTabIndexes(newIndex)
      elements[newIndex].focus()
    }
  }, [orientation, getNavigableElements, updateTabIndexes])

  // Set up roving tabindex
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Initialize tabindexes
    updateTabIndexes(0)

    container.addEventListener('keydown', handleKeyDown)
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, updateTabIndexes])

  return containerRef
}

/**
 * Hook for managing keyboard shortcuts
 * Provides a centralized way to handle global keyboard shortcuts
 */
export const useKeyboardShortcuts = (
  shortcuts: Record<string, () => void>,
  enabled: boolean = true
) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Create key combination string
    const keys = []
    if (event.ctrlKey || event.metaKey) keys.push('mod')
    if (event.shiftKey) keys.push('shift')
    if (event.altKey) keys.push('alt')
    keys.push(event.key.toLowerCase())

    const combination = keys.join('+')
    
    if (shortcuts[combination]) {
      event.preventDefault()
      shortcuts[combination]()
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

/**
 * Hook for announcing changes to screen readers
 * Uses aria-live regions to communicate dynamic content changes
 */
export const useScreenReaderAnnouncements = () => {
  const announceRef = useRef<HTMLDivElement>(null)

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceRef.current) return

    announceRef.current.setAttribute('aria-live', priority)
    announceRef.current.textContent = message

    // Clear the message after a short delay to allow for re-announcements
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = ''
      }
    }, 1000)
  }, [])

  // Create the announcement element
  useEffect(() => {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.id = 'screen-reader-announcements'
    
    document.body.appendChild(announcer)
    announceRef.current = announcer

    return () => {
      if (announcer.parentNode) {
        announcer.parentNode.removeChild(announcer)
      }
    }
  }, [])

  return announce
}