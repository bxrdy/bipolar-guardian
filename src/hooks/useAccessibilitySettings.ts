/**
 * Accessibility Settings Hook
 * Manages user accessibility preferences including high contrast, font scaling, and motion
 */

import { useState, useEffect, useCallback } from 'react'

interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  fontSize: number // Multiplier: 1.0 = normal, 1.2 = 120%, etc.
  lineHeight: number // Multiplier: 1.0 = normal, 1.5 = 150%, etc.
  focusRingEnhanced: boolean
  colorBlindFriendly: boolean
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 1.0,
  lineHeight: 1.0,
  focusRingEnhanced: false,
  colorBlindFriendly: false,
}

const STORAGE_KEY = 'bipolar-guardian-accessibility-settings'

/**
 * Hook for managing accessibility settings
 */
export const useAccessibilitySettings = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedSettings = JSON.parse(stored)
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings })
      }
      
      // Check system preferences
      const systemHighContrast = window.matchMedia('(prefers-contrast: high)').matches
      const systemReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      
      setSettings(prev => ({
        ...prev,
        highContrast: prev.highContrast || systemHighContrast,
        reducedMotion: prev.reducedMotion || systemReducedMotion,
      }))
      
      setIsLoaded(true)
    } catch (error) {
      console.error('Failed to load accessibility settings:', error)
      setIsLoaded(true)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: AccessibilitySettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
      setSettings(newSettings)
    } catch (error) {
      console.error('Failed to save accessibility settings:', error)
    }
  }, [])

  // Individual setting updaters
  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }, [settings, saveSettings])

  const toggleHighContrast = useCallback(() => {
    updateSetting('highContrast', !settings.highContrast)
  }, [settings.highContrast, updateSetting])

  const toggleReducedMotion = useCallback(() => {
    updateSetting('reducedMotion', !settings.reducedMotion)
  }, [settings.reducedMotion, updateSetting])

  const setFontSize = useCallback((size: number) => {
    // Clamp between 0.8 and 2.0
    const clampedSize = Math.max(0.8, Math.min(2.0, size))
    updateSetting('fontSize', clampedSize)
  }, [updateSetting])

  const setLineHeight = useCallback((height: number) => {
    // Clamp between 1.0 and 2.0
    const clampedHeight = Math.max(1.0, Math.min(2.0, height))
    updateSetting('lineHeight', clampedHeight)
  }, [updateSetting])

  const toggleFocusRingEnhanced = useCallback(() => {
    updateSetting('focusRingEnhanced', !settings.focusRingEnhanced)
  }, [settings.focusRingEnhanced, updateSetting])

  const toggleColorBlindFriendly = useCallback(() => {
    updateSetting('colorBlindFriendly', !settings.colorBlindFriendly)
  }, [settings.colorBlindFriendly, updateSetting])

  const resetToDefaults = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS)
  }, [saveSettings])

  return {
    settings,
    isLoaded,
    updateSetting,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    setLineHeight,
    toggleFocusRingEnhanced,
    toggleColorBlindFriendly,
    resetToDefaults,
  }
}

/**
 * Hook for applying accessibility settings to the document
 */
export const useAccessibilityStylesheet = (settings: AccessibilitySettings) => {
  useEffect(() => {
    const root = document.documentElement
    
    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // Apply enhanced focus rings
    if (settings.focusRingEnhanced) {
      root.classList.add('enhanced-focus')
    } else {
      root.classList.remove('enhanced-focus')
    }

    // Apply color blind friendly mode
    if (settings.colorBlindFriendly) {
      root.classList.add('colorblind-friendly')
    } else {
      root.classList.remove('colorblind-friendly')
    }

    // Apply font scaling
    root.style.setProperty('--font-scale', settings.fontSize.toString())
    root.style.setProperty('--line-height-scale', settings.lineHeight.toString())

  }, [settings])
}

/**
 * CSS variables for accessibility scaling
 */
export const accessibilityCSS = `
  :root {
    --font-scale: 1;
    --line-height-scale: 1;
  }

  /* High contrast mode */
  .high-contrast {
    --background: 0 0% 100%;
    --foreground: 0 0% 0%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 0%;
    --primary: 240 100% 30%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 95%;
    --secondary-foreground: 0 0% 5%;
    --muted: 0 0% 90%;
    --muted-foreground: 0 0% 10%;
    --accent: 240 100% 30%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 100% 40%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 20%;
    --input: 0 0% 20%;
    --ring: 240 100% 30%;
  }

  .dark.high-contrast {
    --background: 0 0% 0%;
    --foreground: 0 0% 100%;
    --card: 0 0% 0%;
    --card-foreground: 0 0% 100%;
    --primary: 240 100% 70%;
    --primary-foreground: 0 0% 0%;
    --secondary: 0 0% 10%;
    --secondary-foreground: 0 0% 90%;
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 85%;
    --accent: 240 100% 70%;
    --accent-foreground: 0 0% 0%;
    --destructive: 0 100% 70%;
    --destructive-foreground: 0 0% 0%;
    --border: 0 0% 80%;
    --input: 0 0% 80%;
    --ring: 240 100% 70%;
  }

  /* Enhanced focus rings */
  .enhanced-focus *:focus-visible {
    outline: 3px solid hsl(var(--ring)) !important;
    outline-offset: 3px !important;
  }

  /* Reduced motion */
  .reduce-motion *,
  .reduce-motion *::before,
  .reduce-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Font scaling */
  .font-scaled {
    font-size: calc(1rem * var(--font-scale));
    line-height: calc(1.5 * var(--line-height-scale));
  }

  .font-scaled .text-display-large { font-size: calc(57px * var(--font-scale)); }
  .font-scaled .text-display-medium { font-size: calc(45px * var(--font-scale)); }
  .font-scaled .text-display-small { font-size: calc(36px * var(--font-scale)); }
  .font-scaled .text-headline-large { font-size: calc(32px * var(--font-scale)); }
  .font-scaled .text-headline-medium { font-size: calc(28px * var(--font-scale)); }
  .font-scaled .text-headline-small { font-size: calc(24px * var(--font-scale)); }
  .font-scaled .text-title-large { font-size: calc(22px * var(--font-scale)); }
  .font-scaled .text-title-medium { font-size: calc(16px * var(--font-scale)); }
  .font-scaled .text-title-small { font-size: calc(14px * var(--font-scale)); }
  .font-scaled .text-body-large { font-size: calc(16px * var(--font-scale)); }
  .font-scaled .text-body-medium { font-size: calc(14px * var(--font-scale)); }
  .font-scaled .text-body-small { font-size: calc(12px * var(--font-scale)); }
  .font-scaled .text-label-large { font-size: calc(14px * var(--font-scale)); }
  .font-scaled .text-label-medium { font-size: calc(12px * var(--font-scale)); }
  .font-scaled .text-label-small { font-size: calc(11px * var(--font-scale)); }

  /* Color blind friendly mode */
  .colorblind-friendly {
    /* Use patterns/shapes in addition to colors for critical information */
  }

  /* Apply font scaling to body when enabled */
  body.font-scaled {
    font-size: calc(14px * var(--font-scale));
    line-height: calc(1.5 * var(--line-height-scale));
  }
`