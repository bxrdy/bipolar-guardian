import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "Inter",
          "SF Pro Display", 
          "-apple-system", 
          "BlinkMacSystemFont", 
          "system-ui", 
          "sans-serif"
        ],
      },
      fontSize: {
        // Apple-inspired semantic typography scale with proper weights and spacing
        "display-large": ["57px", { 
          lineHeight: "64px", 
          fontWeight: "300", 
          letterSpacing: "-0.025em" 
        }],
        "display-medium": ["45px", { 
          lineHeight: "52px", 
          fontWeight: "300", 
          letterSpacing: "-0.022em" 
        }],
        "display-small": ["36px", { 
          lineHeight: "44px", 
          fontWeight: "400", 
          letterSpacing: "-0.019em" 
        }],
        "headline-large": ["32px", { 
          lineHeight: "40px", 
          fontWeight: "500", 
          letterSpacing: "-0.016em" 
        }],
        "headline-medium": ["28px", { 
          lineHeight: "36px", 
          fontWeight: "500", 
          letterSpacing: "-0.014em" 
        }],
        "headline-small": ["24px", { 
          lineHeight: "32px", 
          fontWeight: "500", 
          letterSpacing: "-0.012em" 
        }],
        "title-large": ["22px", { 
          lineHeight: "28px", 
          fontWeight: "600", 
          letterSpacing: "-0.011em" 
        }],
        "title-medium": ["16px", { 
          lineHeight: "24px", 
          fontWeight: "600", 
          letterSpacing: "-0.009em" 
        }],
        "title-small": ["14px", { 
          lineHeight: "20px", 
          fontWeight: "600", 
          letterSpacing: "-0.008em" 
        }],
        "body-large": ["16px", { 
          lineHeight: "24px", 
          fontWeight: "400", 
          letterSpacing: "-0.009em" 
        }],
        "body-medium": ["14px", { 
          lineHeight: "20px", 
          fontWeight: "400", 
          letterSpacing: "-0.008em" 
        }],
        "body-small": ["12px", { 
          lineHeight: "16px", 
          fontWeight: "400", 
          letterSpacing: "-0.006em" 
        }],
        "label-large": ["14px", { 
          lineHeight: "20px", 
          fontWeight: "500", 
          letterSpacing: "-0.008em" 
        }],
        "label-medium": ["12px", { 
          lineHeight: "16px", 
          fontWeight: "500", 
          letterSpacing: "-0.006em" 
        }],
        "label-small": ["11px", { 
          lineHeight: "16px", 
          fontWeight: "500", 
          letterSpacing: "-0.005em" 
        }],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Gentle Precision Color System
        "gentle-blue": {
          DEFAULT: "#4A90E2",
          50: "#EBF5FF",
          100: "#D6EAFF", 
          200: "#B3D6FF",
          300: "#80BDFF",
          400: "#4A90E2",
          500: "#4A90E2",
          600: "#3A73B8",
          700: "#2D5A8F",
          800: "#1F4166",
          900: "#122A3D",
        },
        "warm-green": {
          DEFAULT: "#34C759",
          50: "#EAFDF2",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34C759",
          500: "#34C759",
          600: "#2AA047",
          700: "#1F7A35",
          800: "#155424",
          900: "#0A2E13",
        },
        "light-coral": {
          DEFAULT: "#FF6B84",
          50: "#FFF1F2",
          100: "#FFE4E6",
          200: "#FECDD3",
          300: "#FDA4AF",
          400: "#FF6B84",
          500: "#FF6B84",
          600: "#E11D48",
          700: "#BE123C",
          800: "#9F1239",
          900: "#7F1D1D",
        },
        "cool-gray": {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "6px",        // Increased minimum
        xl: "20px",       // Increased for friendly feel
        "2xl": "24px",    // Increased 
        "3xl": "28px",    // Increased
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        // Generous spacing system (50% increase)
        '0.5': '3px',   // Increased from 2px
        '1.5': '9px',   // Increased from 6px
        '2.5': '15px',  // Increased from 10px
        '3.5': '21px',  // Increased from 14px
        '4.5': '27px',  // Increased from 18px
        '5.5': '33px',  // Increased from 22px
        '6.5': '39px',  // Increased from 26px
        '7.5': '45px',  // Increased from 30px
        '8.5': '51px',  // Increased from 34px
        '9.5': '57px',  // Increased from 38px
        '15': '90px',   // Increased from 60px
        '18': '108px',  // Increased from 72px
        '22': '132px',  // Increased from 88px
        '26': '156px',  // Increased from 104px
        '30': '180px',  // Increased from 120px
      },
      boxShadow: {
        // Soft colored shadows using Gentle Blue
        'elevation-1': '0 1px 3px rgba(74, 144, 226, 0.08), 0 1px 2px rgba(74, 144, 226, 0.12)',
        'elevation-2': '0 3px 6px rgba(74, 144, 226, 0.10), 0 3px 6px rgba(74, 144, 226, 0.15)',
        'elevation-3': '0 10px 20px rgba(74, 144, 226, 0.12), 0 6px 6px rgba(74, 144, 226, 0.18)',
        'elevation-4': '0 14px 28px rgba(74, 144, 226, 0.15), 0 10px 10px rgba(74, 144, 226, 0.20)',
        'elevation-5': '0 19px 38px rgba(74, 144, 226, 0.18), 0 15px 12px rgba(74, 144, 226, 0.22)',
        // Special colored shadows
        'green': '0 4px 12px rgba(52, 199, 89, 0.15), 0 2px 4px rgba(52, 199, 89, 0.20)',
        'coral': '0 4px 12px rgba(255, 107, 132, 0.15), 0 2px 4px rgba(255, 107, 132, 0.20)',
      },
      transitionTimingFunction: {
        // Spring-inspired easing for natural movement
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'apple-ease': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'gentle': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'gentle-in': 'cubic-bezier(0.42, 0, 1, 1)',
        'gentle-out': 'cubic-bezier(0, 0, 0.58, 1)',
        'gentle-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
      },
      transitionDuration: {
        '200': '200ms',   // Increased for smoother feel
        '300': '300ms',   // Increased default
        '450': '450ms',   // Increased for slow
        '650': '650ms',   // New slower option
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "icon-rotate": {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "100%": { transform: "rotate(10deg) scale(1.05)" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "icon-rotate": "icon-rotate 0.3s ease-in-out forwards",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
