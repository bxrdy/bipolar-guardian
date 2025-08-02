
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleTiming, reducedMotionTiming } from '@/lib/motion/timing-configs';
import { AccessibilityProvider } from '../accessibility/AccessibilityProvider';
import AccessibilityAnnouncer from '../accessibility/AccessibilityAnnouncer';
import PredictiveMindHero from './sections/PredictiveMindHero';
import ValueProposition from './sections/ValueProposition';
import HowItWorks from './sections/HowItWorks';
import FinalCTA from './sections/FinalCTA';

interface ImprovedLandingPageProps {
  onShowAuth: (isSignUp: boolean) => void;
}

const ImprovedLandingPage: React.FC<ImprovedLandingPageProps> = ({ onShowAuth }) => {
  const prefersReducedMotion = useReducedMotion();
  const timing = prefersReducedMotion ? reducedMotionTiming : appleTiming;
  const [isPageReady, setIsPageReady] = useState(false);
  const [navClass, setNavClass] = useState('nav-transparent');
  const scrollListener = useRef<(() => void) | null>(null);
  const lastScrollY = useRef(0);
  const lastUpdateTime = useRef(0);
  
  // Completely disable scroll listener until page is stable
  const updateNavStyle = useCallback(() => {
    if (!isPageReady) return;
    
    const now = performance.now();
    const currentScrollY = window.scrollY;
    
    // Aggressive throttling: 60fps max + minimum change threshold
    if (now - lastUpdateTime.current < 32 || Math.abs(currentScrollY - lastScrollY.current) < 3) {
      return;
    }
    
    lastUpdateTime.current = now;
    lastScrollY.current = currentScrollY;
    
    const newClass = currentScrollY > 80 ? 'nav-solid' : 'nav-transparent';
    
    // Only update if class actually changed
    setNavClass(prevClass => prevClass !== newClass ? newClass : prevClass);
  }, [isPageReady]);

  // Completely disable all dynamic updates until page is fully loaded and stable
  useEffect(() => {
    let isDestroyed = false;
    
    const enableInteractivity = () => {
      if (isDestroyed) return;
      
      setTimeout(() => {
        if (!isDestroyed) {
          setIsPageReady(true);
          
          // Set up vanilla scroll listener with heavy throttling
          scrollListener.current = () => updateNavStyle();
          window.addEventListener('scroll', scrollListener.current, { passive: true });
          updateNavStyle(); // Initial call
        }
      }, 500); // Significant delay to prevent micro-refreshes
    };
    
    // Wait for complete page load
    if (document.readyState === 'complete') {
      enableInteractivity();
    } else {
      window.addEventListener('load', enableInteractivity, { once: true });
    }
    
    return () => {
      isDestroyed = true;
      if (scrollListener.current) {
        window.removeEventListener('scroll', scrollListener.current);
      }
    };
  }, [updateNavStyle]);

  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-background text-foreground">
        <AccessibilityAnnouncer message="Welcome to Bipolar Guardian - AI-powered episode prediction and prevention" />
        
        {/* Enhanced Navigation with CSS-based glassmorphism */}
        <motion.nav 
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClass}`}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="border-b border-white/20 bg-white/5">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <motion.div 
                className="font-display font-semibold text-xl text-foreground"
                whileHover={prefersReducedMotion ? {} : { 
                  scale: 1.05,
                  transition: timing.fast 
                }}
                whileTap={prefersReducedMotion ? {} : { 
                  scale: 0.95,
                  transition: timing.instant 
                }}
              >
                <a 
                  href="#" 
                  aria-label="Bipolar Guardian - Go to homepage"
                  className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  Bipolar Guardian
                </a>
              </motion.div>
              
              <div className="flex gap-2" role="group" aria-label="Authentication actions">
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { 
                    scale: 1.02,
                    transition: timing.fast 
                  }}
                  whileTap={prefersReducedMotion ? {} : { 
                    scale: 0.98,
                    transition: timing.instant 
                  }}
                >
                  <Button
                    variant="tertiary"
                    size="default"
                    onClick={() => onShowAuth(false)}
                    className="font-medium"
                    aria-label="Sign in to your account"
                  >
                    Sign In
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { 
                    scale: 1.02,
                    transition: timing.fast 
                  }}
                  whileTap={prefersReducedMotion ? {} : { 
                    scale: 0.98,
                    transition: timing.instant 
                  }}
                >
                  <Button
                    size="default"
                    onClick={() => onShowAuth(true)}
                    className="font-medium shadow-sm hover:shadow-md transition-all duration-250"
                    aria-label="Create new account and get started"
                  >
                    Get Started
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <main>
          {/* Animated Hero Section */}
          <PredictiveMindHero onShowAuth={onShowAuth} />

          {/* Value Proposition */}
          <ValueProposition />

          {/* How It Works */}
          <HowItWorks />

          {/* Final CTA */}
          <FinalCTA onShowAuth={onShowAuth} />
        </main>

        {/* Footer */}
        <footer 
          className="py-12 px-6 border-t border-border bg-muted/20"
          role="contentinfo"
          aria-label="Site footer"
        >
          <div className="max-w-6xl mx-auto text-center">
            <motion.div 
              className="font-display font-semibold text-xl text-foreground mb-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={timing.normal}
              viewport={{ once: true }}
            >
              Bipolar Guardian
            </motion.div>
            <motion.p 
              className="text-base text-muted-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ ...timing.normal, delay: 0.1 }}
              viewport={{ once: true }}
            >
              AI-powered bipolar episode prediction and prevention
            </motion.p>
            <motion.nav 
              className="flex justify-center items-center gap-8 text-sm font-medium text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ ...timing.normal, delay: 0.2 }}
              viewport={{ once: true }}
              aria-label="Footer links"
            >
              {["Privacy Policy", "Terms of Service", "Contact"].map((link, index) => (
                <motion.a 
                  key={link}
                  href="#" 
                  className="hover:text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  whileHover={prefersReducedMotion ? {} : { 
                    y: -1,
                    transition: timing.fast 
                  }}
                  aria-label={`View ${link}`}
                >
                  {link}
                </motion.a>
              ))}
            </motion.nav>
          </div>
        </footer>
      </div>
    </AccessibilityProvider>
  );
};

export default ImprovedLandingPage;
