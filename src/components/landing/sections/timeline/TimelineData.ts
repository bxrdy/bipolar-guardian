
import { Activity, AlertTriangle, Shield, Heart, Clock, Brain } from 'lucide-react';

export const timelineSteps = [
  {
    day: 1,
    title: "Normal Baseline",
    icon: Heart,
    color: "hsl(120 60% 50%)",
    keyMetric: { label: "Sleep", value: "8.2h" },
    description: "All systems normal",
    details: ["8.2 hours sleep", "7,500 steps", "Mood: Stable (7/10)"],
    status: "stable"
  },
  {
    day: 3,
    title: "Pattern Shift",
    icon: Activity,
    color: "hsl(214 100% 60%)",
    keyMetric: { label: "Activity", value: "↑23%" },
    description: "Increased activity detected",
    details: ["7.1 hours sleep", "9,200 steps", "Mood: Elevated (8/10)"],
    status: "monitoring"
  },
  {
    day: 5,
    title: "Sleep Disruption",
    icon: Clock,
    color: "hsl(45 100% 60%)",
    keyMetric: { label: "Sleep", value: "5.3h" },
    description: "Sleep pattern changing",
    details: ["5.3 hours sleep", "12,400 steps", "Mood: High energy (9/10)"],
    status: "caution"
  },
  {
    day: 7,
    title: "AI Alert",
    icon: AlertTriangle,
    color: "hsl(25 100% 60%)",
    keyMetric: { label: "Risk", value: "High" },
    description: "Multiple patterns converging",
    details: ["3.8 hours sleep", "15,600 steps", "Mood: Manic signs"],
    status: "warning"
  },
  {
    day: 8,
    title: "Intervention",
    icon: Brain,
    color: "hsl(280 100% 70%)",
    keyMetric: { label: "Action", value: "Taken" },
    description: "Care team contacted",
    details: ["Therapist contacted", "Medication adjusted", "Support activated"],
    status: "intervention"
  },
  {
    day: 12,
    title: "Crisis Averted",
    icon: Shield,
    color: "hsl(120 60% 50%)",
    keyMetric: { label: "Status", value: "Stable" },
    description: "Back to healthy patterns",
    details: ["7.8 hours sleep", "6,800 steps", "Mood: Balanced (7/10)"],
    status: "recovered"
  }
];
