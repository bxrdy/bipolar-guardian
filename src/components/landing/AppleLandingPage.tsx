
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Activity, Zap, Brain } from 'lucide-react';
import HealthJourneyTimeline from './HealthJourneyTimeline';

interface AppleLandingPageProps {
  onShowAuth: (isSignUp: boolean) => void;
}

const AppleLandingPage: React.FC<AppleLandingPageProps> = ({ onShowAuth }) => {
  const [scrollY, setScrollY] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const newScrollY = window.scrollY;
      setScrollY(newScrollY);
      
      // Calculate current phase based on scroll position
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = Math.min(newScrollY / Math.max(maxScroll, 1), 1);
      
      if (scrollProgress <= 0.2) setCurrentPhase(1);
      else if (scrollProgress <= 0.4) setCurrentPhase(2);
      else if (scrollProgress <= 0.6) setCurrentPhase(3);
      else if (scrollProgress <= 0.8) setCurrentPhase(4);
      else setCurrentPhase(5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollProgress = scrollY / Math.max(window.innerHeight * 4, 1);

  const phases = [
    {
      id: 1,
      icon: Heart,
      title: "Start Each Day with Clarity",
      subtitle: "Morning Wellness",
      description: "See patterns before they become episodes",
    },
    {
      id: 2,
      icon: Activity,
      title: "Watch Your Patterns Emerge",
      subtitle: "Day-Long Insights",
      description: "Every activity, mood, and medication tracked seamlessly",
    },
    {
      id: 3,
      icon: Brain,
      title: "AI That Truly Understands You",
      subtitle: "20+ Models Working",
      description: "Trained on thousands of bipolar journeys for personalized insights",
    },
    {
      id: 4,
      icon: Shield,
      title: "Your Personal Early Warning System",
      subtitle: "Stay Ahead of Episodes",
      description: "Medical-grade predictions help you take control before crisis",
    },
  ];

  return (
    <div className="relative min-h-[500vh] bg-gradient-to-b from-background via-apple-gray-50 to-background dark:from-background dark:via-apple-gray-900 dark:to-background">
      {/* Fixed Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="text-title-large font-semibold text-foreground"
            whileHover={{ scale: 1.02 }}
          >
            Bipolar Guardian
          </motion.div>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="default"
              onClick={() => onShowAuth(false)}
              className="backdrop-blur-md"
            >
              Sign In
            </Button>
            <Button
              variant="default"
              size="default"
              onClick={() => onShowAuth(true)}
              className="backdrop-blur-md shadow-elevation-2"
            >
              Create Account
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Fixed Health Journey Timeline */}
      <div className="fixed inset-0 z-10">
        <HealthJourneyTimeline scrollProgress={scrollProgress} phase={currentPhase} />
      </div>

      {/* Scroll Content Sections */}
      <div className="relative z-20">
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          const isActive = currentPhase === phase.id;
          
          return (
            <section
              key={phase.id}
              className="h-screen flex items-center justify-center relative"
            >
              <div className="max-w-4xl mx-auto px-6 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{
                    opacity: isActive ? 1 : 0.4,
                    y: isActive ? 0 : 20,
                    scale: isActive ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Phase Icon */}
                  <motion.div
                    className="flex justify-center mb-8"
                    animate={{
                      scale: isActive ? [1, 1.1, 1] : 1,
                      rotate: isActive ? [0, 5, -5, 0] : 0,
                    }}
                    transition={{
                      duration: isActive ? 2 : 0,
                      repeat: isActive ? Infinity : 0,
                    }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </motion.div>

                  {/* Main Title */}
                  <motion.h1
                    className="text-display-small md:text-display-medium font-display text-foreground leading-tight"
                    animate={{
                      opacity: isActive ? 1 : 0.6,
                    }}
                  >
                    {phase.title}
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    className="text-headline-small text-muted-foreground font-medium"
                    animate={{
                      opacity: isActive ? 0.8 : 0.4,
                    }}
                  >
                    {phase.subtitle}
                  </motion.p>

                  {/* Description */}
                  <motion.p
                    className="text-body-large text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                    animate={{
                      opacity: isActive ? 0.7 : 0.3,
                    }}
                  >
                    {phase.description}
                  </motion.p>

                  {/* Special phase content */}
                  {phase.id === 3 && isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 max-w-3xl mx-auto"
                    >
                      {[
                        'Pattern Recognition', 
                        'Risk Analysis', 
                        'Early Warnings',
                        'Baseline Learning',
                        'Mood Tracking',
                        'Sleep Analysis', 
                        'Medication Sync',
                        'Crisis Prevention'
                      ].map((tech) => (
                        <motion.div
                          key={tech}
                          className="px-3 py-2 bg-primary/10 text-primary rounded-xl text-label-small font-medium text-center"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * (tech.length % 4) }}
                        >
                          {tech}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {phase.id === 4 && isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-wrap justify-center gap-4 mt-8"
                    >
                      {[
                        'End-to-End Encrypted',
                        'HIPAA-Ready Architecture', 
                        'Your Data Never Sold',
                        'Medical-Grade Security'
                      ].map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl"
                        >
                          <Shield className="w-4 h-4 text-primary" />
                          <span className="text-label-medium font-medium">{feature}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </section>
          );
        })}

        {/* Final CTA Section */}
        <section className="h-screen flex items-center justify-center relative bg-gradient-to-t from-primary/5 to-transparent">
          <motion.div
            className="max-w-2xl mx-auto px-6 text-center space-y-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{
              opacity: currentPhase === 4 ? 1 : 0,
              y: currentPhase === 4 ? 0 : 40,
            }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="text-headline-large font-display text-foreground">
              Ready to Take Control of Your Mental Health?
            </h2>
            
            <p className="text-body-large text-muted-foreground">
              Join thousands of people using AI-powered insights to prevent bipolar episodes before they happen
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                variant="default"
                size="lg"
                onClick={() => onShowAuth(true)}
                className="text-body-large shadow-elevation-3"
              >
                Start Your Journey
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onShowAuth(false)}
                className="text-body-large"
              >
                Sign In
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-12 text-label-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Medical Grade</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Never Sold</span>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollY > 100 ? 1 : 0 }}
      >
        <div className="flex flex-col gap-2">
          {phases.map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full border border-primary/30"
              animate={{
                backgroundColor: currentPhase === index + 1 ? 'hsl(var(--primary))' : 'transparent',
                scale: currentPhase === index + 1 ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AppleLandingPage;
