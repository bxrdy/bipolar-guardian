
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleTiming } from '@/lib/motion/timing-configs';

const SimpleComparison: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  const baseTransition = prefersReducedMotion ? { duration: 0.01 } : appleTiming.slower;

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Apple TV Style Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background backdrop-blur-sm" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Apple TV Style Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={baseTransition}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-display-small md:text-display-medium font-display font-semibold text-foreground mb-6">
            Beyond Traditional
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text-safari">
              Mood Tracking
            </span>
          </h2>
        </motion.div>

        {/* Apple TV Style Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ ...baseTransition, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -4 }}
          >
            <Card className="p-10 h-full bg-red-50/80 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/30 backdrop-blur-xl rounded-3xl shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300">
              <h3 className="text-headline-small font-semibold text-red-600 dark:text-red-400 mb-8">
                Traditional Apps
              </h3>
              <div className="space-y-6">
                {[
                  "Generic mood tracking only",
                  "React after episodes occur", 
                  "One-size-fits-all insights"
                ].map((item, index) => (
                  <motion.div 
                    key={item}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, ...appleTiming.normal }}
                    viewport={{ once: true }}
                  >
                    <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 shadow-elevation-1" />
                    <span className="text-body-medium text-muted-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ ...baseTransition, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -4 }}
          >
            <Card className="p-10 h-full bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/30 backdrop-blur-xl rounded-3xl shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300">
              <h3 className="text-headline-small font-semibold text-primary mb-8">
                Bipolar Guardian
              </h3>
              <div className="space-y-6">
                {[
                  "Predict episodes before they start",
                  "Proactive crisis prevention",
                  "Personalized to your unique patterns"
                ].map((item, index) => (
                  <motion.div 
                    key={item}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, ...appleTiming.normal }}
                    viewport={{ once: true }}
                  >
                    <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 shadow-elevation-1" />
                    <span className="text-body-medium text-foreground font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SimpleComparison;
