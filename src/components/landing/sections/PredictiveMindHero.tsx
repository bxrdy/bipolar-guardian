
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Brain, Zap, Shield, Activity } from 'lucide-react';

interface PredictiveMindHeroProps {
  onShowAuth: (isSignUp: boolean) => void;
}

const PredictiveMindHero: React.FC<PredictiveMindHeroProps> = ({ onShowAuth }) => {
  const [dataPoints, setDataPoints] = useState(0);
  const [warningDays, setWarningDays] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isPageFullyLoaded, setIsPageFullyLoaded] = useState(false);
  const brainControls = useAnimation();
  const animationStarted = useRef(false);

  // Optimized counter animations using requestAnimationFrame
  const animateCounters = useCallback(() => {
    let startTime: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const duration = 2000; // 2 seconds total
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setDataPoints(Math.floor(15 * easeOut));
      setWarningDays(Math.floor(7 * easeOut));
      setAccuracy(Math.floor(94 * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, []);

  // Reduced particles for better performance
  const particles = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 0.5 + 0.5, // Smaller particles (0.5-1px)
      delay: i * 0.15 + 1.0, // Delayed start for smoother initial load
    }))
  , []);

  useEffect(() => {
    let isDestroyed = false;
    
    // COMPLETELY disable all animations until page is fully loaded and settled
    const initializeAnimations = () => {
      if (isDestroyed || animationStarted.current) return;
      
      setTimeout(() => {
        if (!isDestroyed) {
          setIsPageFullyLoaded(true);
          animationStarted.current = true;
          
          // Start counter animations after significant delay
          setTimeout(() => {
            if (!isDestroyed) {
              animateCounters();
            }
          }, 800);

          // Start brain animation even later
          setTimeout(() => {
            if (!isDestroyed) {
              brainControls.start({
                transform: [
                  "translateZ(0) scale(1) rotate(0deg)",
                  "translateZ(0) scale(1.02) rotate(1deg)",
                  "translateZ(0) scale(1.02) rotate(-1deg)",
                  "translateZ(0) scale(1) rotate(0deg)"
                ],
                opacity: [0.8, 1, 0.8, 0.8],
                transition: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              });
            }
          }, 1500);
        }
      }, 1000); // Major delay to prevent micro-refreshes
    };
    
    // Wait for complete document load + settling time
    if (document.readyState === 'complete') {
      initializeAnimations();
    } else {
      window.addEventListener('load', initializeAnimations, { once: true });
    }

    return () => {
      isDestroyed = true;
    };
  }, [animateCounters, brainControls]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5 pt-32 pb-16">
      {/* Enhanced Background Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              transform: 'translateZ(0)', // Force GPU acceleration
            }}
            animate={{
              transform: [
                `translateY(0px) scale(1) translateZ(0)`,
                `translateY(-10px) scale(1.2) translateZ(0)`,
                `translateY(0px) scale(1) translateZ(0)`
              ],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Enhanced Neural Network Background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 800 600">
          {[...Array(6)].map((_, i) => (
            <motion.circle
              key={i}
              cx={`${20 + (i * 15)}%`}
              cy={`${40 + (i % 2) * 20}%`}
              r="1.5"
              fill="hsl(var(--primary))"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: i * 0.8 + 4.0 // Even longer delay to prevent initial load stuttering
              }}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Main Headline - Increased size and padding */}
        <motion.h1
          className="text-display-hero mb-6 px-4 text-foreground"
          initial={{ opacity: 0, transform: "translateY(30px) translateZ(0)" }}
          animate={{ opacity: 1, transform: "translateY(0px) translateZ(0)" }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-display-hero-light">Prevent</span>
          <br />
          <span 
            className="relative text-display-hero-emphasis"
            style={{
              background: 'linear-gradient(to right, hsl(220, 12%, 12%), hsl(214, 100%, 50%), hsl(214, 100%, 50%))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: '#007AFF',
            }}
          >
            Bipolar Episodes
            <motion.div
              className="absolute -inset-2 bg-primary/20 rounded-lg"
              initial={{ transform: "scale(0) translateZ(0)" }}
              animate={{ transform: "scale(1) translateZ(0)" }}
              transition={{ delay: 1.2, duration: 0.6 }}
            />
          </span>
          <br />
          <span className="text-display-hero-light">Before They Happen</span>
        </motion.h1>

        {/* Subtitle - Optimized */}
        <motion.p
          className="text-base md:text-lg text-muted-foreground mb-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, transform: "translateY(20px) translateZ(0)" }}
          animate={{ opacity: 1, transform: "translateY(0px) translateZ(0)" }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          The first AI system designed specifically for bipolar disorder.
        </motion.p>

        {/* Interactive Statistics - Properly sized to prevent cutoff */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Health Metrics Counter */}
          <motion.div
            className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-xl border border-primary/30 min-h-[140px] flex flex-col justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Activity className="w-6 h-6 text-primary mx-auto mb-3 flex-shrink-0" />
            <div className="text-2xl font-bold text-foreground mb-2 leading-tight">{dataPoints}+</div>
            <div className="text-sm text-muted-foreground leading-tight">Health Metrics</div>
          </motion.div>

          {/* Warning Days Counter */}
          <motion.div
            className="relative p-4 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur-xl border border-accent/30 min-h-[140px] flex flex-col justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Zap className="w-6 h-6 text-accent mx-auto mb-3 flex-shrink-0" />
            <div className="text-2xl font-bold text-foreground mb-2 leading-tight">{warningDays}</div>
            <div className="text-sm text-muted-foreground leading-tight">Days Early Warning</div>
            <motion.div
              className="absolute inset-0 border-2 border-accent/20 rounded-2xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          {/* Accuracy Counter */}
          <motion.div
            className="relative p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 backdrop-blur-xl border border-green-500/30 min-h-[140px] flex flex-col justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Shield className="w-6 h-6 text-green-500 mx-auto mb-3 flex-shrink-0" />
            <div className="text-2xl font-bold text-foreground mb-2 leading-tight">{accuracy}%</div>
            <div className="text-sm text-muted-foreground leading-tight">Prediction Accuracy</div>
          </motion.div>
        </div>

        {/* Enhanced Interactive Brain Visualization */}
        <motion.div
          className="relative w-24 h-24 mx-auto mb-4"
          animate={brainControls}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full opacity-30 blur-xl"
          />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Brain className="w-12 h-12 text-primary" />
          </div>
          
          {/* Enhanced Data Flow Lines */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-6 bg-gradient-to-t from-primary to-transparent"
              style={{
                left: `${50 + Math.cos(i * 90 * Math.PI / 180) * 60}%`,
                top: `${50 + Math.sin(i * 90 * Math.PI / 180) * 60}%`,
                transform: `rotate(${i * 90}deg)`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <Button
            size="default"
            onClick={() => onShowAuth(true)}
            className="font-medium bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transform hover:scale-105 transition-all duration-300"
          >
            Start Your Protection
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="flex justify-center items-center gap-6 text-xs font-medium text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.6 }}
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
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 + index * 0.1, duration: 0.4 }}
              role="listitem"
            >
              <div 
                className="w-1.5 h-1.5 bg-green-500 rounded-full" 
                aria-hidden="true"
              />
              <span className="whitespace-nowrap">{item}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default React.memo(PredictiveMindHero);
