
/**
 * Apple-inspired Typography System
 * Based on Apple's San Francisco font system and Human Interface Guidelines
 */

export const typography = {
  // Display styles - for hero sections and major headings
  display: {
    large: {
      fontSize: 'clamp(2.5rem, 4vw, 4rem)', // 40px-64px
      lineHeight: '1.1',
      fontWeight: '300',
      letterSpacing: '-0.02em',
    },
    medium: {
      fontSize: 'clamp(2rem, 3.5vw, 3rem)', // 32px-48px
      lineHeight: '1.15',
      fontWeight: '300',
      letterSpacing: '-0.015em',
    },
    small: {
      fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', // 28px-36px
      lineHeight: '1.2',
      fontWeight: '400',
      letterSpacing: '-0.01em',
    },
  },
  
  // Headline styles - for section headings
  headline: {
    large: {
      fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', // 24px-32px
      lineHeight: '1.25',
      fontWeight: '600',
      letterSpacing: '-0.005em',
    },
    medium: {
      fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', // 20px-28px
      lineHeight: '1.3',
      fontWeight: '600',
      letterSpacing: '0',
    },
    small: {
      fontSize: 'clamp(1.125rem, 1.5vw, 1.5rem)', // 18px-24px
      lineHeight: '1.35',
      fontWeight: '600',
      letterSpacing: '0',
    },
  },
  
  // Title styles - for card titles and labels
  title: {
    large: {
      fontSize: '1.375rem', // 22px
      lineHeight: '1.4',
      fontWeight: '600',
      letterSpacing: '0',
    },
    medium: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5',
      fontWeight: '500',
      letterSpacing: '0',
    },
    small: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      fontWeight: '500',
      letterSpacing: '0',
    },
  },
  
  // Body styles - for paragraphs and content
  body: {
    large: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.6',
      fontWeight: '400',
      letterSpacing: '0',
    },
    medium: {
      fontSize: '1rem', // 16px
      lineHeight: '1.6',
      fontWeight: '400',
      letterSpacing: '0',
    },
    small: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      fontWeight: '400',
      letterSpacing: '0',
    },
  },
  
  // Label styles - for small text and captions
  label: {
    large: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.4',
      fontWeight: '500',
      letterSpacing: '0',
    },
    medium: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.4',
      fontWeight: '500',
      letterSpacing: '0.01em',
    },
    small: {
      fontSize: '0.6875rem', // 11px
      lineHeight: '1.3',
      fontWeight: '500',
      letterSpacing: '0.015em',
    },
  },
} as const;

// CSS-in-JS helper for applying typography styles
export const applyTypography = (style: keyof typeof typography, variant: string) => {
  const typeScale = typography[style] as any;
  const config = typeScale[variant];
  
  if (!config) {
    console.warn(`Typography variant ${style}.${variant} not found`);
    return {};
  }
  
  return config;
};

// Tailwind utility class mappings
export const typographyClasses = {
  // Display classes
  'text-display-large': 'text-4xl md:text-6xl lg:text-7xl font-light leading-tight tracking-tight',
  'text-display-medium': 'text-3xl md:text-5xl lg:text-6xl font-light leading-tight tracking-tight',
  'text-display-small': 'text-2xl md:text-4xl lg:text-5xl font-normal leading-tight tracking-tight',
  
  // Headline classes
  'text-headline-large': 'text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
  'text-headline-medium': 'text-lg md:text-xl lg:text-2xl font-semibold leading-snug',
  'text-headline-small': 'text-base md:text-lg lg:text-xl font-semibold leading-normal',
  
  // Title classes
  'text-title-large': 'text-lg font-semibold leading-normal',
  'text-title-medium': 'text-base font-medium leading-normal',
  'text-title-small': 'text-sm font-medium leading-normal',
  
  // Body classes
  'text-body-large': 'text-lg leading-relaxed',
  'text-body-medium': 'text-base leading-relaxed',
  'text-body-small': 'text-sm leading-normal',
  
  // Label classes
  'text-label-large': 'text-sm font-medium leading-normal',
  'text-label-medium': 'text-xs font-medium leading-normal tracking-wide',
  'text-label-small': 'text-xs font-medium leading-tight tracking-wider',
} as const;

// Font family configurations
export const fontFamilies = {
  display: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
  text: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
} as const;

export type TypographyStyle = keyof typeof typography;
export type TypographyVariant<T extends TypographyStyle> = keyof typeof typography[T];
export type TypographyClass = keyof typeof typographyClasses;
