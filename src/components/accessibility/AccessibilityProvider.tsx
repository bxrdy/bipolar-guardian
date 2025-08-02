
import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useAccessibilitySettings, useAccessibilityStylesheet } from '@/hooks/useAccessibilitySettings';

interface AccessibilityContextType {
  settings: ReturnType<typeof useAccessibilitySettings>['settings'];
  isLoaded: boolean;
  updateSetting: ReturnType<typeof useAccessibilitySettings>['updateSetting'];
  toggleHighContrast: ReturnType<typeof useAccessibilitySettings>['toggleHighContrast'];
  toggleReducedMotion: ReturnType<typeof useAccessibilitySettings>['toggleReducedMotion'];
  setFontSize: ReturnType<typeof useAccessibilitySettings>['setFontSize'];
  setLineHeight: ReturnType<typeof useAccessibilitySettings>['setLineHeight'];
  toggleFocusRingEnhanced: ReturnType<typeof useAccessibilitySettings>['toggleFocusRingEnhanced'];
  toggleColorBlindFriendly: ReturnType<typeof useAccessibilitySettings>['toggleColorBlindFriendly'];
  resetToDefaults: ReturnType<typeof useAccessibilitySettings>['resetToDefaults'];
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const accessibilityHook = useAccessibilitySettings();
  const previousSettings = useRef(accessibilityHook.settings);
  const isInitialRender = useRef(true);
  
  // Apply accessibility styles to document
  useAccessibilityStylesheet(accessibilityHook.settings);

  // Completely prevent DOM manipulation during initial load to eliminate micro-refreshes
  useEffect(() => {
    // Skip initial render to prevent micro-refreshes
    if (isInitialRender.current) {
      isInitialRender.current = false;
      previousSettings.current = accessibilityHook.settings;
      return;
    }
    
    // Only update if settings actually changed AND page is ready
    if (accessibilityHook.isLoaded && 
        (accessibilityHook.settings.fontSize !== previousSettings.current.fontSize ||
         accessibilityHook.settings.lineHeight !== previousSettings.current.lineHeight)) {
      
      // Batch DOM updates and defer them significantly
      setTimeout(() => {
        const shouldAddClass = accessibilityHook.settings.fontSize !== 1.0 || accessibilityHook.settings.lineHeight !== 1.0;
        const hasClass = document.body.classList.contains('font-scaled');
        
        if (shouldAddClass && !hasClass) {
          document.body.classList.add('font-scaled');
        } else if (!shouldAddClass && hasClass) {
          document.body.classList.remove('font-scaled');
        }
        
        previousSettings.current = accessibilityHook.settings;
      }, 200);
    }
  }, [accessibilityHook.settings.fontSize, accessibilityHook.settings.lineHeight, accessibilityHook.isLoaded]);

  return (
    <AccessibilityContext.Provider value={accessibilityHook}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
