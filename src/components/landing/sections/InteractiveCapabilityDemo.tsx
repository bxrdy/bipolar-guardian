
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const InteractiveCapabilityDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState(0);

  const capabilities = [
    {
      icon: Brain,
      title: "Episode Prediction AI",
      color: "hsl(280 100% 70%)",
      demo: {
        type: "prediction",
        data: [
          { 
            label: "Sleep Deviation", 
            value: "3.2h below normal",
            risk: "High",
            color: "hsl(25 100% 60%)",
            description: "Critical sleep pattern disruption detected"
          },
          { 
            label: "Activity Spike", 
            value: "2.1x normal activity",
            risk: "Manic Episode Likely",
            color: "hsl(0 100% 60%)",
            description: "Hyperactivity indicates possible manic phase"
          },
          { 
            label: "Mood Instability", 
            value: "Rapid cycling detected",
            risk: "Critical",
            color: "hsl(0 100% 50%)",
            description: "Extreme mood swings requiring immediate attention"
          },
          { 
            label: "Medication Gap", 
            value: "2 doses missed",
            risk: "Moderate",
            color: "hsl(45 100% 60%)",
            description: "Medication adherence affecting stability"
          }
        ],
        probability: "87% chance of manic episode within 72 hours"
      }
    },
    {
      icon: Target,
      title: "Personal Baseline",
      color: "hsl(214 100% 60%)",
      demo: {
        type: "baseline",
        comparison: [
          { metric: "Sleep Hours", normal: 8.2, current: 5.3, deviation: -35, status: "critical" },
          { metric: "Daily Steps", normal: 7500, current: 12400, deviation: +65, status: "warning" },
          { metric: "Mood Score", normal: 7, current: 9, deviation: +28, status: "elevated" },
          { metric: "Heart Rate Variability", normal: 45, current: 62, deviation: +38, status: "concerning" }
        ]
      }
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      color: "hsl(120 60% 50%)",
      demo: {
        type: "monitoring",
        metrics: [
          { name: "Sleep Quality", value: 68, trend: "down", status: "declining", color: "hsl(25 100% 60%)" },
          { name: "Activity Consistency", value: 89, trend: "stable", status: "normal", color: "hsl(120 60% 50%)" },
          { name: "Mood Stability", value: 42, trend: "down", status: "unstable", color: "hsl(0 100% 60%)" },
          { name: "Social Engagement", value: 78, trend: "up", status: "improving", color: "hsl(214 100% 60%)" }
        ]
      }
    }
  ];

  return (
    <section className="py-32 px-6 bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Experience the
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text-safari">
              AI in Action
            </span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Capability Tabs */}
          <div className="space-y-4">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              const isActive = activeDemo === index;
              
              return (
                <motion.button
                  key={index}
                  className={`w-full p-6 rounded-2xl text-left transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? 'bg-card/90 shadow-2xl scale-105 border-2'
                      : 'bg-card/50 border border-border hover:bg-card/70'
                  }`}
                  style={isActive ? { borderColor: capability.color } : {}}
                  onClick={() => setActiveDemo(index)}
                  whileHover={{ scale: isActive ? 1.05 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Active border glow */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-20"
                      style={{ 
                        background: `linear-gradient(90deg, ${capability.color}, transparent)`
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${capability.color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: capability.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {capability.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {index === 0 && "See how our AI predicts episodes before they occur"}
                        {index === 1 && "Understand your unique bipolar patterns"}
                        {index === 2 && "Monitor your health metrics in real-time"}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Interactive Demo Area */}
          <div className="relative h-96 rounded-3xl bg-card/90 backdrop-blur-xl border border-border p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDemo}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="h-full"
              >
                {/* Prediction Demo */}
                {capabilities[activeDemo].demo.type === 'prediction' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-foreground mb-6">
                      Episode Risk Analysis
                    </h3>
                    
                    {/* Risk Probability */}
                    <div className="mb-6 p-4 rounded-xl bg-destructive/20 border border-destructive/30">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <span className="font-bold text-destructive">High Risk Alert</span>
                      </div>
                      <p className="text-foreground font-medium">{capabilities[activeDemo].demo.probability}</p>
                    </div>

                    {capabilities[activeDemo].demo.data?.map((item, i) => (
                      <motion.div 
                        key={i} 
                        className="p-4 rounded-xl bg-muted/50 border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-foreground font-medium">{item.label}</span>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <span 
                            className="px-3 py-1 rounded-full text-sm font-bold text-white"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.risk}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-foreground">{item.value}</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Baseline Demo */}
                {capabilities[activeDemo].demo.type === 'baseline' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-foreground mb-6">
                      Your vs Normal Baseline
                    </h3>
                    {capabilities[activeDemo].demo.comparison?.map((item, i) => (
                      <motion.div 
                        key={i} 
                        className="p-4 rounded-xl bg-muted/50 border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-foreground">{item.metric}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold px-2 py-1 rounded ${
                              item.status === 'critical' ? 'bg-destructive/20 text-destructive' :
                              item.status === 'warning' ? 'bg-orange-500/20 text-orange-500' :
                              item.status === 'elevated' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-primary/20 text-primary'
                            }`}>
                              {item.deviation > 0 ? '+' : ''}{item.deviation}%
                            </span>
                            {item.deviation > 20 ? <TrendingUp className="w-4 h-4 text-destructive" /> :
                             item.deviation < -20 ? <TrendingUp className="w-4 h-4 text-destructive rotate-180" /> :
                             <CheckCircle className="w-4 h-4 text-green-500" />}
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Normal: {item.normal}</span>
                          <span>Current: {item.current}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Monitoring Demo */}
                {capabilities[activeDemo].demo.type === 'monitoring' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-foreground mb-6">
                      Live Health Metrics
                    </h3>
                    {capabilities[activeDemo].demo.metrics?.map((metric, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                      >
                        <div>
                          <span className="font-medium text-foreground">{metric.name}</span>
                          <div className="text-2xl font-bold text-foreground">{metric.value}%</div>
                          <span className="text-sm text-muted-foreground">{metric.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: metric.color }}
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: metric.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.value}%` }}
                              transition={{ delay: 0.5, duration: 1 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/40 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveCapabilityDemo;
