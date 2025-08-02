/**
 * ARIA Live Regions for Dynamic Content Announcements
 * Provides screen reader announcements for dynamic content changes
 */

import * as React from "react"
import { useScreenReaderAnnouncements } from "@/hooks/useFocusManagement"

interface AriaLiveRegionProps {
  id?: string
  priority?: 'polite' | 'assertive'
  atomic?: boolean
  relevant?: 'additions' | 'removals' | 'text' | 'all'
  children?: React.ReactNode
  className?: string
}

/**
 * Generic ARIA Live Region component
 */
export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  id,
  priority = 'polite',
  atomic = true,
  relevant = 'all',
  children,
  className = 'sr-only'
}) => {
  return (
    <div
      id={id}
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={className}
    >
      {children}
    </div>
  )
}

/**
 * Status announcements for general updates
 */
export const StatusRegion: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AriaLiveRegion
    id="status-announcements"
    priority="polite"
    aria-label="Status updates"
  >
    {children}
  </AriaLiveRegion>
)

/**
 * Alert announcements for urgent messages
 */
export const AlertRegion: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AriaLiveRegion
    id="alert-announcements"
    priority="assertive"
    aria-label="Important alerts"
  >
    {children}
  </AriaLiveRegion>
)

/**
 * Progress announcements for loading states
 */
export const ProgressRegion: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AriaLiveRegion
    id="progress-announcements"
    priority="polite"
    relevant="text"
    aria-label="Progress updates"
  >
    {children}
  </AriaLiveRegion>
)

/**
 * Navigation announcements for screen changes
 */
export const NavigationRegion: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AriaLiveRegion
    id="navigation-announcements"
    priority="polite"
    aria-label="Navigation updates"
  >
    {children}
  </AriaLiveRegion>
)

/**
 * Hook for managing announcements across the app
 */
export const useAnnouncements = () => {
  const announce = useScreenReaderAnnouncements()

  const announceStatus = React.useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  const announceAlert = React.useCallback((message: string) => {
    announce(message, 'assertive')
  }, [announce])

  const announceProgress = React.useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  const announceNavigation = React.useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  // Common announcement patterns
  const announcements = React.useMemo(() => ({
    // Data loading
    dataLoading: () => announceStatus("Loading data, please wait"),
    dataLoaded: (count?: number) => announceStatus(
      count ? `Data loaded, ${count} items available` : "Data loaded successfully"
    ),
    dataError: (error?: string) => announceAlert(
      error ? `Error loading data: ${error}` : "Error loading data"
    ),

    // Form interactions
    formSaved: () => announceStatus("Changes saved successfully"),
    formError: (field?: string) => announceAlert(
      field ? `Error in ${field} field` : "Please correct form errors"
    ),
    formValidation: (message: string) => announceAlert(message),

    // Navigation
    screenChanged: (screenName: string) => announceNavigation(`Navigated to ${screenName}`),
    modalOpened: (modalName: string) => announceNavigation(`${modalName} dialog opened`),
    modalClosed: (modalName: string) => announceNavigation(`${modalName} dialog closed`),

    // Mood tracking specific
    moodSelected: (mood: string) => announceStatus(`Selected mood: ${mood}`),
    moodSaved: () => announceStatus("Mood entry saved"),
    medicationAdded: (name: string) => announceStatus(`Added medication: ${name}`),
    medicationRemoved: (name: string) => announceStatus(`Removed medication: ${name}`),

    // AI interactions
    aiThinking: () => announceStatus("AI Guardian is processing your request"),
    aiResponse: () => announceStatus("AI Guardian has responded"),
    aiError: () => announceAlert("AI Guardian is currently unavailable"),

    // Settings changes
    settingChanged: (setting: string, value: string) => 
      announceStatus(`${setting} changed to ${value}`),
    themeChanged: (theme: string) => announceStatus(`Theme changed to ${theme}`),
  }), [announceStatus, announceAlert, announceNavigation])

  return {
    announce,
    announceStatus,
    announceAlert,
    announceProgress,
    announceNavigation,
    ...announcements
  }
}

/**
 * Context for managing announcements throughout the app
 */
interface AnnouncementContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  announceStatus: (message: string) => void
  announceAlert: (message: string) => void
  announceProgress: (message: string) => void
  announceNavigation: (message: string) => void
}

const AnnouncementContext = React.createContext<AnnouncementContextType | undefined>(undefined)

export const AnnouncementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const announcements = useAnnouncements()

  return (
    <AnnouncementContext.Provider value={announcements}>
      {children}
      <StatusRegion />
      <AlertRegion />
      <ProgressRegion />
      <NavigationRegion />
    </AnnouncementContext.Provider>
  )
}

export const useAnnouncementContext = () => {
  const context = React.useContext(AnnouncementContext)
  if (context === undefined) {
    throw new Error('useAnnouncementContext must be used within an AnnouncementProvider')
  }
  return context
}

/**
 * Higher-order component to wrap components with announcement capabilities
 */
export const withAnnouncements = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const announcements = useAnnouncements()
    
    return <Component {...props} announcements={announcements} />
  }

  WrappedComponent.displayName = `withAnnouncements(${Component.displayName || Component.name})`
  
  return WrappedComponent
}