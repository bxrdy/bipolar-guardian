
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Clock, Brain, Shield, AlertTriangle, CheckCircle, Pill } from 'lucide-react';
import TimelineCard from './sections/TimelineCard';

interface HealthJourneyTimelineProps {
  scrollProgress: number;
  phase: number;
}

const HealthJourneyTimeline: React.FC<HealthJourneyTimelineProps> = ({ scrollProgress, phase }) => {
  const timelineData = [
    {
      day: 'Day 1',
      status: 'stable',
      icon: CheckCircle,
      color: 'hsl(120 60% 50%)',
      title: 'Normal Baseline',
      details: ['8.2 hours sleep', '7,500 steps', 'Mood: Stable (7/10)', 'Medication taken'],
      riskLevel: 'Green'
    },
    {
      day: 'Day 3',
      status: 'slight-change',
      icon: Activity,
      color: 'hsl(214 100% 60%)',
      title: 'Pattern Shift Detected',
      details: ['7.1 hours sleep', '9,200 steps', 'Mood: Elevated (8/10)', 'Increased activity'],
      riskLevel: 'Green'
    },
    {
      day: 'Day 5',
      status: 'monitor',
      icon: Clock,
      color: 'hsl(45 100% 60%)',
      title: 'Sleep Disruption',
      details: ['5.3 hours sleep', '12,400 steps', 'Mood: High energy (9/10)', 'Late bedtime'],
      riskLevel: 'Yellow'
    },
    {
      day: 'Day 7',
      status: 'warning',
      icon: AlertTriangle,
      color: 'hsl(25 100% 60%)',
      title: 'AI Alert Triggered',
      details: ['3.8 hours sleep', '15,600 steps', 'Mood: Manic signs', 'Pattern deviation'],
      riskLevel: 'Orange'
    },
    {
      day: 'Day 8',
      status: 'intervention',
      icon: Brain,
      color: 'hsl(280 100% 70%)',
      title: 'Early Intervention',
      details: ['Therapist contacted', 'Medication adjusted', 'Support system activated', 'Crisis prevented'],
      riskLevel: 'Prevented'
    },
    {
      day: 'Day 12',
      status: 'recovery',
      icon: Shield,
      color: 'hsl(120 60% 50%)',
      title: 'Stable Again',
      details: ['7.8 hours sleep', '6,800 steps', 'Mood: Balanced (7/10)', 'Episode avoided'],
      riskLevel: 'Green'
    }
  ];

  return (
    <div className="w-full py-12">
      {/* Mobile Timeline (Vertical Stack) */}
      <div className="block lg:hidden max-w-2xl mx-auto px-4">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-accent/50 to-primary/30" />
          
          <div className="space-y-12">
            {timelineData.map((point, index) => {
              const isVisible = scrollProgress > 0.2 + (index * 0.1);
              return (
                <TimelineCard
                  key={point.day}
                  point={point}
                  index={index}
                  isVisible={isVisible}
                  position="mobile"
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop Timeline (Horizontal) */}
      <div className="hidden lg:block max-w-7xl mx-auto px-8">
        <div className="relative h-96">
          {/* Timeline Background Path */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid meet">
            <motion.path
              d="M100 200 Q300 150 500 180 Q700 210 900 160 Q1000 140 1100 170"
              fill="none"
              stroke="hsl(var(--primary) / 0.4)"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: scrollProgress > 0.3 ? 1 : 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            
            {/* Risk level gradient overlay */}
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'hsl(120 60% 50%)', stopOpacity: 0.1 }} />
                <stop offset="30%" style={{ stopColor: 'hsl(45 100% 60%)', stopOpacity: 0.1 }} />
                <stop offset="60%" style={{ stopColor: 'hsl(25 100% 60%)', stopOpacity: 0.1 }} />
                <stop offset="80%" style={{ stopColor: 'hsl(280 100% 70%)', stopOpacity: 0.1 }} />
                <stop offset="100%" style={{ stopColor: 'hsl(120 60% 50%)', stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#riskGradient)" />
          </svg>

          {/* Timeline Points and Cards */}
          <div className="relative h-full">
            {timelineData.map((point, index) => {
              const isVisible = scrollProgress > 0.2 + (index * 0.1);
              
              // Calculate positions along the timeline
              const xPositions = [8.3, 25, 41.7, 58.3, 75, 91.7]; // Percentages
              const yPositions = [50, 37.5, 45, 40, 35, 42.5]; // Percentages for curve
              
              const xPos = xPositions[index];
              const yPos = yPositions[index];
              
              return (
                <div
                  key={point.day}
                  className="absolute"
                  style={{
                    left: `${xPos}%`,
                    top: `${yPos}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <TimelineCard
                    point={point}
                    index={index}
                    isVisible={isVisible}
                    position={index % 2 === 0 ? 'top' : 'bottom'}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {scrollProgress > 0.8 && (
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Episode Successfully Prevented Through Early Detection</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HealthJourneyTimeline;
