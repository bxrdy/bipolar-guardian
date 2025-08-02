
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleTiming, reducedMotionTiming } from '@/lib/motion/timing-configs';
import { heroTitle, heroSubtitle, heroButtons, staggerContainer } from '@/lib/motion/variants';

interface HeroContentProps {
  onShowAuth: (isSignUp: boolean) => void;
}

const HeroContent: React.FC<HeroContentProps> = ({ onShowAuth }) => {
  const prefersReducedMotion = useReducedMotion();
  const timing = prefersReducedMotion ? reducedMotionTiming : appleTiming;

  return (
    <section 
      className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-br from-background via-background to-primary/5"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Main Headline with Enhanced Typography */}
          <motion.div
            variants={heroTitle}
            transition={timing.slower}
            className="mb-8"
          >
            <h1 
              id="hero-heading"
              className="font-display font-light leading-[0.95] mb-6 text-foreground"
              style={{ 
                fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                letterSpacing: '-0.025em'
              }}
            >
              <span className="block">Prevent</span>
              <span 
                className="block font-normal text-foreground"
                style={{ color: '#007AFF' }}
              >
                Bipolar Episodes
              </span>
              <span className="block">Before They Happen</span>
            </h1>
          </motion.div>

          {/* Subtitle with Refined Typography */}
          <motion.p
            variants={heroSubtitle}
            transition={{ ...timing.slow, delay: 0.2 }}
            className="font-normal text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed"
            style={{
              fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
              lineHeight: '1.6'
            }}
          >
            The first AI system designed specifically for bipolar disorder. Get warned 3-7 days 
            before episodes with personalized insights that learn your unique patterns.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={heroButtons}
            transition={{ ...timing.normal, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
            role="group"
            aria-label="Get started with Bipolar Guardian"
          >
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={timing.fast}
            >
              <Button
                size="lg"
                onClick={() => onShowAuth(true)}
                className="font-medium shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-250 text-base px-8 py-6 h-auto"
                aria-describedby="cta-description"
              >
                Start Your Protection
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={timing.fast}
            >
              <Button
                variant="secondary"
                size="lg"
                className="font-medium text-base px-8 py-6 h-auto"
                aria-label="Learn how Bipolar Guardian works"
              >
                See How It Works
              </Button>
            </motion.div>
          </motion.div>

          <div id="cta-description" className="sr-only">
            Sign up to start using AI-powered bipolar episode prediction and prevention
          </div>

          {/* Trust Indicators with Enhanced Typography */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...timing.slow, delay: 0.6 }}
            className="flex justify-center items-center gap-8 text-muted-foreground"
            style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              letterSpacing: '0.01em'
            }}
            role="list"
            aria-label="Security and compliance features"
          >
            {[
              "HIPAA Compliant",
              "End-to-End Encrypted", 
              "Medical Grade Security"
            ].map((item, index) => (
              <motion.div
                key={item}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...timing.normal, delay: 0.7 + index * 0.1 }}
                role="listitem"
              >
                <div 
                  className="w-2 h-2 bg-green-500 rounded-full" 
                  aria-hidden="true"
                />
                <span>{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroContent;
