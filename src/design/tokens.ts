/**
 * Apple-inspired Design Tokens for Bipolar Guardian
 * 
 * This file contains semantic design tokens that follow Apple's Human Interface Guidelines
 * while maintaining accessibility standards for mental health applications.
 */

// Typography Scale
export const typography = {
  fontFamily: {
    display: '-apple-system, BlinkMacSystemFont, system-ui',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif',
  },
  fontSize: {
    displayLarge: '57px',
    displayMedium: '45px',
    displaySmall: '36px',
    headlineLarge: '32px',
    headlineMedium: '28px',
    headlineSmall: '24px',
    titleLarge: '22px',
    titleMedium: '16px',
    titleSmall: '14px',
    bodyLarge: '16px',
    bodyMedium: '14px',
    bodySmall: '12px',
    labelLarge: '14px',
    labelMedium: '12px',
    labelSmall: '11px',
  },
  lineHeight: {
    displayLarge: '64px',
    displayMedium: '52px',
    displaySmall: '44px',
    headlineLarge: '40px',
    headlineMedium: '36px',
    headlineSmall: '32px',
    titleLarge: '28px',
    titleMedium: '24px',
    titleSmall: '20px',
    bodyLarge: '24px',
    bodyMedium: '20px',
    bodySmall: '16px',
    labelLarge: '20px',
    labelMedium: '16px',
    labelSmall: '16px',
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Gentle Precision Color System (2-3 colors + neutrals)
export const colors = {
  // Primary: Soft Blue - Trustworthy, calming, medical
  gentleBlue: {
    50: '#EBF5FF',
    100: '#D6EAFF',
    200: '#B3D6FF',
    300: '#80BDFF',
    400: '#4A90E2',
    500: '#4A90E2', // Primary shade
    600: '#3A73B8',
    700: '#2D5A8F',
    800: '#1F4166',
    900: '#122A3D',
  },
  // Secondary: Warm Green - Growth, positive progress, success
  warmGreen: {
    50: '#EAFDF2',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34C759',
    500: '#34C759', // Primary shade
    600: '#2AA047',
    700: '#1F7A35',
    800: '#155424',
    900: '#0A2E13',
  },
  // Accent: Light Coral - Attention, alerts, emotional moments
  lightCoral: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FF6B84',
    500: '#FF6B84', // Primary shade
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#7F1D1D',
  },
  // Cool Grays - Professional, clean, balanced
  coolGray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
} as const;

// Generous Spacing System (50% more padding for comfort)
export const spacing = {
  xs: '3px',    // Increased from 2px
  sm: '6px',    // Increased from 4px
  md: '12px',   // Increased from 8px
  lg: '18px',   // Increased from 12px
  xl: '24px',   // Increased from 16px
  '2xl': '30px',  // Increased from 20px
  '3xl': '36px',  // Increased from 24px
  '4xl': '48px',  // Increased from 32px
  '5xl': '60px',  // Increased from 40px
  '6xl': '72px',  // Increased from 48px
  '7xl': '84px',  // Increased from 56px
  '8xl': '96px',  // Increased from 64px
} as const;

// Organic Border Radius (12px minimum for friendly feel)
export const borderRadius = {
  xs: '6px',   // Minimum for small elements
  sm: '8px',   // Small cards
  md: '12px',  // Standard cards (minimum)
  lg: '16px',  // Large cards
  xl: '20px',  // Hero elements
  '2xl': '24px', // Major sections
  '3xl': '28px', // Extra large
  full: '9999px',
} as const;

// Soft Colored Shadows System
export const elevation = {
  none: 'none',
  sm: '0 1px 3px rgba(74, 144, 226, 0.08), 0 1px 2px rgba(74, 144, 226, 0.12)',
  md: '0 3px 6px rgba(74, 144, 226, 0.10), 0 3px 6px rgba(74, 144, 226, 0.15)',
  lg: '0 10px 20px rgba(74, 144, 226, 0.12), 0 6px 6px rgba(74, 144, 226, 0.18)',
  xl: '0 14px 28px rgba(74, 144, 226, 0.15), 0 10px 10px rgba(74, 144, 226, 0.20)',
  '2xl': '0 19px 38px rgba(74, 144, 226, 0.18), 0 15px 12px rgba(74, 144, 226, 0.22)',
  // Colored shadows for special states
  green: '0 4px 12px rgba(52, 199, 89, 0.15), 0 2px 4px rgba(52, 199, 89, 0.20)',
  coral: '0 4px 12px rgba(255, 107, 132, 0.15), 0 2px 4px rgba(255, 107, 132, 0.20)',
} as const;

// Spring-Based Motion System
export const motion = {
  duration: {
    fast: '200ms',      // Increased for smoother feel
    normal: '300ms',    // Increased from 250ms
    slow: '450ms',      // Increased from 350ms
    slower: '650ms',    // Increased from 500ms
  },
  easing: {
    // Spring-inspired easing curves for natural movement
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    // Apple-style easing
    appleEase: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
} as const;

// Gentle Precision Semantic Colors
export const semanticColors = {
  // Light theme - Clean, warm, supportive
  light: {
    background: '#FFFFFF',
    foreground: '#0F172A',        // Cool gray 900
    primary: '#4A90E2',           // Gentle blue
    primaryForeground: '#FFFFFF',
    secondary: '#F1F5F9',         // Cool gray 100
    secondaryForeground: '#0F172A',
    accent: '#34C759',            // Warm green
    accentForeground: '#FFFFFF',
    destructive: '#FF6B84',       // Light coral (softer than red)
    destructiveForeground: '#FFFFFF',
    muted: '#F8FAFC',            // Cool gray 50
    mutedForeground: '#64748B',   // Cool gray 500
    border: '#E2E8F0',           // Cool gray 200
    input: '#E2E8F0',            // Cool gray 200
    ring: '#4A90E2',             // Gentle blue for focus
    card: '#FFFFFF',
    cardForeground: '#0F172A',
    popover: '#FFFFFF',
    popoverForeground: '#0F172A',
  },
  // Dark theme - Comfortable, accessible
  dark: {
    background: '#0F172A',        // Cool gray 900
    foreground: '#F8FAFC',        // Cool gray 50
    primary: '#4A90E2',           // Gentle blue (consistent)
    primaryForeground: '#FFFFFF',
    secondary: '#1E293B',         // Cool gray 800
    secondaryForeground: '#F8FAFC',
    accent: '#34C759',            // Warm green (consistent)
    accentForeground: '#FFFFFF',
    destructive: '#FF6B84',       // Light coral (consistent)
    destructiveForeground: '#FFFFFF',
    muted: '#334155',            // Cool gray 700
    mutedForeground: '#94A3B8',   // Cool gray 400
    border: '#475569',           // Cool gray 600
    input: '#475569',            // Cool gray 600
    ring: '#4A90E2',             // Gentle blue for focus
    card: '#1E293B',             // Cool gray 800
    cardForeground: '#F8FAFC',
    popover: '#1E293B',          // Cool gray 800
    popoverForeground: '#F8FAFC',
  },
} as const;

// Accessibility Helpers
export const accessibility = {
  // Minimum contrast ratios
  contrast: {
    normal: 4.5,
    large: 3.0,
    enhanced: 7.0,
  },
  // Focus ring styles - larger for better accessibility
  focusRing: {
    width: '3px',           // Increased for better visibility
    style: 'solid',
    color: '#4A90E2',       // Gentle blue
    offset: '2px',
  },
  // Reduced motion preferences
  reducedMotion: {
    duration: '0.01ms',
    easing: 'linear',
  },
} as const;

// Export all tokens as a single object
export const designTokens = {
  typography,
  colors,
  spacing,
  borderRadius,
  elevation,
  motion,
  semanticColors,
  accessibility,
} as const;

export type DesignTokens = typeof designTokens;