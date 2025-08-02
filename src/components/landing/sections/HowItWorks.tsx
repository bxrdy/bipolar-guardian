
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Brain, Shield } from 'lucide-react';
import FloatingContent from '../effects/FloatingContent';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Smartphone,
      step: "01",
      title: "Connect Your Data",
      description: "Securely link your health data, mood tracking, and daily patterns. Our HIPAA-compliant system protects your privacy while learning from your information.",
      color: "text-blue-600"
    },
    {
      icon: Brain,
      step: "02", 
      title: "AI Learns Your Patterns",
      description: "Advanced algorithms analyze your unique bipolar signature over 2-4 weeks, identifying subtle patterns that predict episodes before they occur.",
      color: "text-purple-600"
    },
    {
      icon: Shield,
      step: "03",
      title: "Get Protected",
      description: "Receive personalized early warnings and proactive intervention tools. Your care team can act before episodes escalate, keeping you stable and in control.",
      color: "text-green-600"
    }
  ];

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-light mb-6 text-foreground">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Three simple steps to transform your bipolar management from reactive to proactive
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <FloatingContent key={step.step} index={index} className="w-full">
                <Card className="h-full bg-white/90 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6 text-center h-full flex flex-col">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${step.color}`} />
                      </div>
                      <span className="text-lg font-semibold text-gray-400">{step.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </FloatingContent>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
