
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import React from 'react';

export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
};

interface MotionContextType {
  prefersReducedMotion: boolean;
  disableAnimation: boolean;
  setDisableAnimation: (disabled: boolean) => void;
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

interface MotionProviderProps {
  children: ReactNode;
}

export const MotionProvider: React.FC<MotionProviderProps> = ({ children }) => {
  const prefersReducedMotion = useReducedMotion();
  const [userDisableAnimation, setUserDisableAnimation] = useState(false);

  const disableAnimation = prefersReducedMotion || userDisableAnimation;

  const value = {
    prefersReducedMotion,
    disableAnimation,
    setDisableAnimation: setUserDisableAnimation,
  };

  return (
    <MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>
  );
};

export const useMotionPreferences = (): MotionContextType => {
  const context = useContext(MotionContext);
  if (context === undefined) {
    throw new Error('useMotionPreferences must be used within a MotionProvider');
  }
  return context;
};
