
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Shield, Zap } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleTiming, reducedMotionTiming } from '@/lib/motion/timing-configs';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/variants';
import FloatingContent from '../effects/FloatingContent';

const ValueProposition: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const timing = prefersReducedMotion ? reducedMotionTiming : appleTiming;

  const features = [
    {
      icon: Brain,
      title: "AI Learning",
      description: "Advanced machine learning algorithms analyze your daily patterns, sleep, activity, and mood to understand your unique bipolar signature.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Early Warnings",
      description: "Get personalized alerts 3-7 days before potential episodes, giving you time to take preventive action with your healthcare team.",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Crisis Prevention",
      description: "Proactive intervention tools and coping strategies deploy automatically when elevated risk is detected, helping you stay stable.",
      gradient: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <section 
      className="py-24 px-6 bg-gradient-to-b from-background to-muted/20"
      aria-labelledby="value-prop-heading"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          transition={timing.slow}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 
            id="value-prop-heading"
            className="text-3xl md:text-4xl font-light mb-6 text-foreground"
          >
            Your Personal Mental Health Guardian
          </h2>
          <p 
            className="text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Three powerful capabilities working together to keep you protected and in control
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-8"
          role="list"
          aria-label="Key features and capabilities"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                transition={{ ...timing.normal, delay: index * 0.1 }}
                className="h-full"
                role="listitem"
              >
                <FloatingContent index={index} className="h-full">
                  <motion.div
                    whileHover={prefersReducedMotion ? {} : { 
                      y: -4,
                      transition: timing.fast 
                    }}
                    className="h-full"
                  >
                    <Card 
                      className="h-full bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 min-h-[320px] flex flex-col"
                      role="article"
                      aria-labelledby={`feature-${index}-title`}
                    >
                      <CardContent className="p-8 text-center flex-1 flex flex-col justify-between">
                        <div>
                          <motion.div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mx-auto mb-6 shadow-sm`}
                            whileHover={prefersReducedMotion ? {} : { 
                              scale: 1.05,
                              transition: timing.fast 
                            }}
                            aria-hidden="true"
                          >
                            <Icon className="w-full h-full text-white" />
                          </motion.div>
                          <h3 
                            id={`feature-${index}-title`}
                            className="text-xl font-semibold mb-4 text-foreground"
                          >
                            {feature.title}
                          </h3>
                        </div>
                        <p 
                          className="text-base text-muted-foreground leading-relaxed"
                        >
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </FloatingContent>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProposition;
