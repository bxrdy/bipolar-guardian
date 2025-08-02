/**
 * Keyboard Shortcuts Management System
 * Provides centralized keyboard shortcut management and documentation
 */

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Keyboard, X, Command } from "lucide-react"
import { useKeyboardShortcuts } from "@/hooks/useFocusManagement"
import { MotionDialog, MotionDialogContent, MotionDialogHeader, MotionDialogTitle, MotionDialogTrigger } from "@/components/ui/motion/motion-dialog"
import { MotionButton } from "@/components/ui/motion/motion-button"
import { MotionCard, MotionCardContent } from "@/components/ui/motion/motion-card"
import { SectionHeading, ComponentHeading } from "./Heading"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface KeyboardShortcut {
  key: string
  description: string
  category: string
  action: () => void
  global?: boolean
}

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[]
  registerShortcut: (shortcut: KeyboardShortcut) => void
  unregisterShortcut: (key: string) => void
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

const KeyboardShortcutsContext = React.createContext<KeyboardShortcutsContextType | undefined>(undefined)

/**
 * Provider for managing keyboard shortcuts throughout the app
 */
export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shortcuts, setShortcuts] = React.useState<KeyboardShortcut[]>([])
  const [enabled, setEnabled] = React.useState(true)

  const registerShortcut = React.useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      const filtered = prev.filter(s => s.key !== shortcut.key)
      return [...filtered, shortcut]
    })
  }, [])

  const unregisterShortcut = React.useCallback((key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key))
  }, [])

  // Convert shortcuts to the format expected by useKeyboardShortcuts
  const shortcutMap = React.useMemo(() => {
    return shortcuts.reduce((acc, shortcut) => {
      acc[shortcut.key] = shortcut.action
      return acc
    }, {} as Record<string, () => void>)
  }, [shortcuts])

  // Set up global keyboard shortcuts
  useKeyboardShortcuts(shortcutMap, enabled)

  const value = React.useMemo(() => ({
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    enabled,
    setEnabled,
  }), [shortcuts, registerShortcut, unregisterShortcut, enabled])

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  )
}

export const useKeyboardShortcutsContext = () => {
  const context = React.useContext(KeyboardShortcutsContext)
  if (context === undefined) {
    throw new Error('useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider')
  }
  return context
}

/**
 * Hook for registering shortcuts within components
 */
export const useRegisterShortcuts = (shortcuts: Omit<KeyboardShortcut, 'action'>[], actions: (() => void)[]) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcutsContext()

  React.useEffect(() => {
    shortcuts.forEach((shortcut, index) => {
      if (actions[index]) {
        registerShortcut({
          ...shortcut,
          action: actions[index]
        })
      }
    })

    return () => {
      shortcuts.forEach(shortcut => {
        unregisterShortcut(shortcut.key)
      })
    }
  }, [shortcuts, actions, registerShortcut, unregisterShortcut])
}

/**
 * Component for displaying keyboard shortcuts
 */
interface KeyDisplayProps {
  keys: string
  className?: string
}

const KeyDisplay: React.FC<KeyDisplayProps> = ({ keys, className }) => {
  const keyParts = keys.split('+').map(key => key.trim())
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {keyParts.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && <span className="text-apple-gray-400 text-xs">+</span>}
          <Badge 
            variant="outline" 
            className="px-2 py-1 text-xs font-mono bg-apple-gray-50 dark:bg-apple-gray-800 border-apple-gray-300 dark:border-apple-gray-600"
          >
            {key === 'mod' ? (
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                {navigator.platform.toLowerCase().includes('mac') ? 'Cmd' : 'Ctrl'}
              </span>
            ) : (
              key
            )}
          </Badge>
        </React.Fragment>
      ))}
    </div>
  )
}

/**
 * Keyboard shortcuts help dialog
 */
export const KeyboardShortcutsDialog: React.FC = () => {
  const { shortcuts } = useKeyboardShortcutsContext()
  
  // Group shortcuts by category
  const groupedShortcuts = React.useMemo(() => {
    return shortcuts.reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = []
      }
      acc[shortcut.category].push(shortcut)
      return acc
    }, {} as Record<string, KeyboardShortcut[]>)
  }, [shortcuts])

  return (
    <MotionDialog>
      <MotionDialogTrigger asChild>
        <MotionButton 
          variant="ghost" 
          size="icon"
          aria-label="View keyboard shortcuts"
          title="Keyboard shortcuts (? to open)"
        >
          <Keyboard className="w-4 h-4" />
        </MotionButton>
      </MotionDialogTrigger>
      <MotionDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <MotionDialogHeader>
          <MotionDialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </MotionDialogTitle>
        </MotionDialogHeader>
        
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SectionHeading level={3} visualLevel="title-medium" className="mb-3">
                {category}
              </SectionHeading>
              
              <div className="space-y-2">
                {categoryShortcuts.map(shortcut => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-apple-gray-50 dark:bg-apple-gray-800"
                  >
                    <span className="text-body-medium text-foreground">
                      {shortcut.description}
                    </span>
                    <KeyDisplay keys={shortcut.key} />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
          
          {Object.keys(groupedShortcuts).length === 0 && (
            <div className="text-center py-8">
              <Keyboard className="w-12 h-12 mx-auto text-apple-gray-400 mb-4" />
              <p className="text-body-medium text-apple-gray-600 dark:text-apple-gray-400">
                No keyboard shortcuts registered
              </p>
            </div>
          )}
        </div>
      </MotionDialogContent>
    </MotionDialog>
  )
}

/**
 * Default shortcuts for the app
 */
export const useDefaultShortcuts = () => {
  const [showShortcuts, setShowShortcuts] = React.useState(false)
  
  const defaultShortcuts = React.useMemo(() => [
    {
      key: 'mod+/',
      description: 'Show keyboard shortcuts',
      category: 'General',
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      category: 'General',
    },
    {
      key: 'mod+k',
      description: 'Open command palette',
      category: 'General',
    },
    {
      key: 'escape',
      description: 'Close modal or cancel action',
      category: 'General',
    },
    {
      key: 'mod+enter',
      description: 'Submit form or save changes',
      category: 'Forms',
    },
    {
      key: 'mod+shift+l',
      description: 'Log mood entry',
      category: 'Mood Tracking',
    },
    {
      key: 'mod+shift+m',
      description: 'Add medication',
      category: 'Medications',
    },
    {
      key: 'mod+shift+t',
      description: 'View trends',
      category: 'Analytics',
    },
    {
      key: 'mod+shift+g',
      description: 'Open AI Guardian chat',
      category: 'AI Guardian',
    },
  ], [])

  const actions = React.useMemo(() => [
    () => setShowShortcuts(true),
    () => setShowShortcuts(true),
    () => {
      // TODO: Implement command palette
      console.log('Command palette not implemented yet')
    },
    () => {
      // Handle escape - close modals, etc.
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)
    },
    () => {
      // TODO: Handle form submission
      console.log('Form submission shortcut')
    },
    () => {
      // TODO: Open mood logging
      console.log('Open mood logging')
    },
    () => {
      // TODO: Add medication
      console.log('Add medication')
    },
    () => {
      // TODO: View trends
      console.log('View trends')
    },
    () => {
      // TODO: Open AI Guardian
      console.log('Open AI Guardian')
    },
  ], [])

  useRegisterShortcuts(defaultShortcuts, actions)

  return {
    showShortcuts,
    setShowShortcuts,
  }
}

/**
 * Keyboard shortcuts indicator for the UI
 */
export const KeyboardShortcutsIndicator: React.FC = () => {
  const { enabled, setEnabled } = useKeyboardShortcutsContext()
  
  return (
    <div className="flex items-center gap-2">
      <MotionButton
        variant="ghost"
        size="sm"
        onClick={() => setEnabled(!enabled)}
        className={cn(
          "transition-all duration-250",
          enabled ? "text-apple-blue-600 dark:text-apple-blue-400" : "text-apple-gray-400"
        )}
      >
        <Keyboard className="w-4 h-4 mr-2" />
        {enabled ? 'Enabled' : 'Disabled'}
      </MotionButton>
      
      <KeyboardShortcutsDialog />
    </div>
  )
}

export default KeyboardShortcutsDialog