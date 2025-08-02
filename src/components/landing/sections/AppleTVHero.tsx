
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleTiming } from '@/lib/motion/timing-configs';

interface AppleTVHeroProps {
  onShowAuth: (isSignUp: boolean) => void;
}

const AppleTVHero: React.FC<AppleTVHeroProps> = ({ onShowAuth }) => {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll-based animations
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 800], [0, 400]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const textY = useTransform(scrollY, [0, 600], [0, -200]);

  const heroVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const baseTransition = prefersReducedMotion ? { duration: 0.01 } : appleTiming.slower;

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Apple TV Style Background with Parallax */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90"
        style={{ y: mounted ? backgroundY : 0 }}
      />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={prefersReducedMotion ? {} : {
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: appleTiming.normal.ease,
            }}
          />
        ))}
      </div>
      
      <motion.div
        className="max-w-4xl mx-auto text-center relative z-10"
        style={{ 
          scale: mounted ? heroScale : 1,
          opacity: mounted ? heroOpacity : 1,
          y: mounted ? textY : 0
        }}
        variants={heroVariants}
        initial="initial"
        animate="animate"
        transition={baseTransition}
      >
        {/* Apple TV Style Typography */}
        <motion.h1 
          className="text-display-large md:text-[80px] font-display font-semibold text-foreground leading-tight mb-6"
          transition={{ ...baseTransition, delay: 0.1 }}
        >
          Prevent Episodes
          <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text-safari">
            Before They Happen
          </span>
        </motion.h1>

        {/* Enhanced Subtitle */}
        <motion.p 
          className="text-headline-small md:text-headline-medium text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8"
          transition={{ ...baseTransition, delay: 0.2 }}
        >
          Advanced AI models learn your unique patterns and warn you days before a bipolar episode begins—giving you time to take control.
        </motion.p>

        {/* Features with Improved Animation */}
        <motion.div 
          className="flex flex-wrap justify-center gap-8 mb-12 text-body-large text-muted-foreground"
          transition={{ ...baseTransition, delay: 0.3 }}
        >
          {[
            { text: "Episode Prediction", color: "bg-primary" },
            { text: "Personal Baselines", color: "bg-accent" },
            { text: "Medical Grade Security", color: "bg-primary" }
          ].map((feature, index) => (
            <motion.div 
              key={feature.text}
              className="flex items-center gap-3"
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              transition={appleTiming.fast}
            >
              <div className={`w-3 h-3 ${feature.color} rounded-full shadow-elevation-1`} />
              <span>{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Centered CTA Button with Apple TV Styling */}
        <motion.div 
          className="flex justify-center mb-16"
          transition={{ ...baseTransition, delay: 0.4 }}
        >
          <Button
            size="lg"
            onClick={() => onShowAuth(true)}
            className="text-body-large px-16 py-8 h-auto bg-primary hover:bg-primary/90 shadow-elevation-2 hover:shadow-elevation-3 rounded-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-xl border border-primary/20"
          >
            Start Your Protection
          </Button>
        </motion.div>

        {/* Enhanced Trust Indicators */}
        <motion.div 
          className="flex flex-wrap justify-center gap-12 text-label-medium text-muted-foreground"
          transition={{ ...baseTransition, delay: 0.5 }}
        >
          {[
            { text: "HIPAA Compliant", color: "bg-green-500" },
            { text: "End-to-End Encrypted", color: "bg-blue-500" },
            { text: "Data Never Sold", color: "bg-purple-500" }
          ].map((indicator, index) => (
            <motion.div 
              key={indicator.text}
              className="flex items-center gap-3 p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/30"
              whileHover={prefersReducedMotion ? {} : { y: -2 }}
              transition={appleTiming.fast}
            >
              <div className={`w-2 h-2 ${indicator.color} rounded-full shadow-elevation-1`} />
              <span>{indicator.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AppleTVHero;
