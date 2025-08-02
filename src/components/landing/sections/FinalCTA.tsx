
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FinalCTAProps {
  onShowAuth: (isSignUp: boolean) => void;
}

const FinalCTA: React.FC<FinalCTAProps> = ({ onShowAuth }) => {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/90 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-light mb-6 text-foreground">
                Ready to Take Control?
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join thousands of people using AI-powered insights to prevent bipolar episodes 
                before they happen. Your mental health deserves proactive protection.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Button
                  size="default"
                  onClick={() => onShowAuth(true)}
                  className="font-medium"
                >
                  Start Your Protection Today
                </Button>
                <Button
                  variant="tertiary"
                  size="default"
                  onClick={() => onShowAuth(false)}
                  className="font-medium"
                >
                  Sign In
                </Button>
              </div>
              
              <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
                <span>✓ Free 30-day trial</span>
                <span>✓ Cancel anytime</span>
                <span>✓ HIPAA compliant</span>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FinalCTA;
