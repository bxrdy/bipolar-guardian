
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Brain, Activity, AlertTriangle, Heart, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { appleTiming } from '@/lib/motion/timing-configs';

const capabilities = [
  {
    icon: Brain,
    title: "Episode Prediction",
    description: "AI analyzes your patterns to predict episodes days in advance",
    color: "from-blue-500 to-purple-600"
  },
  {
    icon: Heart,
    title: "Personal Baseline",
    description: "Learn your unique patterns for sleep, activity, and mood cycles",
    color: "from-pink-500 to-red-500"
  },
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description: "Track vital signs and behaviors that matter for your mental health",
    color: "from-green-500 to-teal-600"
  },
  {
    icon: AlertTriangle,
    title: "Crisis Prevention",
    description: "Get early warnings and personalized coping strategies before crisis hits",
    color: "from-orange-500 to-red-600"
  },
  {
    icon: Shield,
    title: "Medical Integration",
    description: "Seamlessly share insights with your healthcare providers",
    color: "from-indigo-500 to-blue-600"
  },
  {
    icon: Lock,
    title: "Data Security",
    description: "Hospital-grade encryption keeps your sensitive health data protected",
    color: "from-gray-600 to-gray-800"
  }
];

const CapabilityCardsGrid: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 60,
      scale: 0.8
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: appleTiming.slower
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: appleTiming.fast
    }
  };

  return (
    <section ref={containerRef} className="py-32 px-6 relative overflow-hidden">
      {/* Parallax Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/10 rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 20}%`,
              y: useTransform(scrollYProgress, [0, 1], [0, -100 * (i % 3 + 1)]),
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Apple TV Style Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={appleTiming.slower}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-display-small md:text-display-medium font-display font-semibold text-foreground mb-6">
            Your Personal Health
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text-safari">
              Guardian System
            </span>
          </h2>
          <p className="text-headline-small text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Six core capabilities working together to keep you ahead of bipolar episodes
          </p>
        </motion.div>

        {/* Apple TV Style Cards Grid with Scroll Animations */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
        >
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            const yOffset = useTransform(
              scrollYProgress, 
              [0, 1], 
              [0, -50 * (index % 2 === 0 ? 1 : -1)]
            );
            
            return (
              <motion.div 
                key={capability.title} 
                variants={cardVariants}
                whileHover="hover"
                style={{ y: prefersReducedMotion ? 0 : yOffset }}
              >
                <Card 
                  variant="elevated"
                  className="p-8 h-full bg-card/80 backdrop-blur-xl border border-border/50 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-500 group cursor-pointer rounded-2xl"
                >
                  {/* Apple TV Style Icon */}
                  <div className="mb-8">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${capability.color} p-5 shadow-elevation-2 group-hover:shadow-elevation-3 group-hover:scale-110 transition-all duration-300`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                  </div>

                  {/* Content with Apple TV Typography */}
                  <h3 className="text-title-large font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {capability.title}
                  </h3>
                  
                  <p className="text-body-medium text-muted-foreground leading-relaxed mb-6">
                    {capability.description}
                  </p>

                  {/* Apple TV Style Accent */}
                  <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CapabilityCardsGrid;
