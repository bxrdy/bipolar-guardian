
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleTiming } from '@/lib/motion/timing-configs';

interface StreamlinedCTAProps {
  onShowAuth: (isSignUp: boolean) => void;
}

const StreamlinedCTA: React.FC<StreamlinedCTAProps> = ({ onShowAuth }) => {
  const prefersReducedMotion = useReducedMotion();

  const baseTransition = prefersReducedMotion ? { duration: 0.01 } : appleTiming.slower;

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Apple TV Style Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${5 + i * 8}%`,
              top: `${10 + (i % 4) * 20}%`,
            }}
            animate={prefersReducedMotion ? {} : {
              y: [-30, 30, -30],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6 + i * 0.3,
              repeat: Infinity,
              ease: appleTiming.normal.ease,
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto text-center relative">
        <motion.div
          className="space-y-12"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={baseTransition}
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Apple TV Style Headline */}
          <h2 className="text-display-small md:text-display-medium font-display font-semibold text-foreground leading-tight">
            Ready to Prevent
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text-safari">
              Your Next Episode?
            </span>
          </h2>
          
          <p className="text-headline-small text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Join thousands using AI-powered insights to take control of their mental health before episodes begin.
          </p>
          
          {/* Apple TV Style CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={appleTiming.fast}
            >
              <Button
                size="lg"
                onClick={() => onShowAuth(true)}
                className="text-body-large px-16 py-8 h-auto bg-primary hover:bg-primary/90 shadow-elevation-3 hover:shadow-elevation-4 rounded-2xl backdrop-blur-xl border border-primary/20 font-semibold"
              >
                Start Your Protection
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={appleTiming.fast}
            >
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onShowAuth(false)}
                className="text-body-large px-16 py-8 h-auto rounded-2xl backdrop-blur-xl border border-border/30"
              >
                Sign In
              </Button>
            </motion.div>
          </div>

          {/* Apple TV Style Trust Bar */}
          <motion.div 
            className="flex flex-wrap justify-center gap-8 pt-12 text-label-medium text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ ...baseTransition, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {[
              "Trusted by healthcare professionals",
              "99.9% uptime guarantee", 
              "24/7 crisis support available"
            ].map((item, index) => (
              <motion.div
                key={item}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30"
                whileHover={prefersReducedMotion ? {} : { y: -1 }}
                transition={appleTiming.fast}
              >
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span>{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default StreamlinedCTA;
