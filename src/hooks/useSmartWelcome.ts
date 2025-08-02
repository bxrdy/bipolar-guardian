
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDailySummary } from './useDailySummary';
import { useRecentActivity } from './useRecentActivity';
import { useMoodAnalytics } from './useMoodAnalytics';

interface WelcomeMessage {
  greeting: string;
  question: string;
  statusColor: string;
  actionPrompt?: string;
  icon: string;
}

export const useSmartWelcome = (firstName: string) => {
  const [welcomeMessage, setWelcomeMessage] = useState<WelcomeMessage | null>(null);
  const { data: dailySummary } = useDailySummary();
  const { data: activityData } = useRecentActivity();
  const { analytics: moodAnalytics, recentEntries } = useMoodAnalytics();

  useEffect(() => {
    generateSmartWelcome();
  }, [dailySummary, activityData, moodAnalytics, recentEntries, firstName]);

  const generateSmartWelcome = async () => {
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Analyze user's current state
    const riskLevel = dailySummary?.riskLevel;
    const todayStats = activityData?.todayStats;
    const weeklyStats = activityData?.weeklyStats;
    const recentMood = recentEntries && recentEntries.length > 0 ? recentEntries[0] : null;
    const baselineReady = dailySummary?.baselineReady;

    let message: WelcomeMessage;

    // Risk-based messaging with improved colors for light backgrounds
    if (riskLevel === 'red') {
      message = {
        greeting: `${timeOfDay === 'morning' ? 'Good morning' : 'Hey there'}, ${firstName}! 🚨`,
        question: "I noticed some changes in your patterns lately. How are you feeling right now?",
        statusColor: "from-red-300 to-red-400",
        icon: ""
      };
    } else if (riskLevel === 'amber') {
      message = {
        greeting: `Good ${timeOfDay}, ${firstName}! ⚡`,
        question: "Your patterns show some variation recently. What's been on your mind?",
        statusColor: "from-amber-300 to-orange-400",
        icon: ""
      };
    } 
    // Sleep-focused messaging
    else if (todayStats?.baseline?.sleepMean && todayStats.sleepHours) {
      const sleepDiff = todayStats.sleepHours - todayStats.baseline.sleepMean;
      if (sleepDiff < -1) {
        message = {
          greeting: `Good ${timeOfDay}, ${firstName}! 😴`,
          question: "You got less sleep than usual last night. How's your energy feeling today?",
          statusColor: "from-indigo-300 to-blue-400",
          icon: ""
        };
      } else if (sleepDiff > 1) {
        message = {
          greeting: `Good ${timeOfDay}, ${firstName}! ✨`,
          question: "You got great sleep last night! What's helping you rest so well?",
          statusColor: "from-emerald-300 to-green-400",
          icon: ""
        };
      } else {
        message = getActivityBasedMessage(timeOfDay, firstName, todayStats, weeklyStats);
      }
    }
    // Activity-focused messaging
    else if (todayStats?.baseline?.stepsMean && todayStats.steps) {
      message = getActivityBasedMessage(timeOfDay, firstName, todayStats, weeklyStats);
    }
    // Mood-focused messaging
    else if (recentMood) {
      const daysSinceLastMood = Math.floor((Date.now() - new Date(recentMood.timestamp).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastMood > 2) {
        message = {
          greeting: `Hey ${firstName}! 💭`,
          question: "It's been a few days since your last check-in. How has your week been treating you?",
          statusColor: "from-purple-300 to-violet-400",
          icon: ""
        };
      } else if (recentMood.stress > 3 || recentMood.anxiety > 3) {
        message = {
          greeting: `Hi ${firstName}! 🌱`,
          question: "I see you've been experiencing some stress. What's one small thing that might help today?",
          statusColor: "from-orange-300 to-red-400",
          icon: ""
        };
      } else {
        message = getGeneralWellnessMessage(timeOfDay, firstName, dayOfWeek);
      }
    }
    // New user or no baseline
    else if (!baselineReady) {
      message = {
        greeting: `Welcome, ${firstName}! 🚀`,
        question: `How are you feeling this ${dayOfWeek} ${timeOfDay}? I'm here to learn your patterns.`,
        statusColor: "from-slate-300 to-slate-400",
        icon: ""
      };
    }
    // Default fallback
    else {
      message = getGeneralWellnessMessage(timeOfDay, firstName, dayOfWeek);
    }

    setWelcomeMessage(message);
  };

  const getActivityBasedMessage = (timeOfDay: string, firstName: string, todayStats: any, weeklyStats: any): WelcomeMessage => {
    if (!todayStats?.baseline?.stepsMean) {
      return getGeneralWellnessMessage(timeOfDay, firstName, new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    }

    const stepsDiff = todayStats.steps - todayStats.baseline.stepsMean;
    
    if (stepsDiff < -2000) {
      return {
        greeting: `Good ${timeOfDay}, ${firstName}! 🛋️`,
        question: "You've been less active than usual lately. What's been keeping you busy?",
        statusColor: "from-sky-300 to-cyan-400",
        icon: ""
      };
    } else if (stepsDiff > 3000) {
      return {
        greeting: `Hey there, active ${firstName}! 🏃‍♂️`,
        question: "You've been really active lately! What's been motivating you to move more?",
        statusColor: "from-green-300 to-emerald-400",
        icon: ""
      };
    } else {
      return getGeneralWellnessMessage(timeOfDay, firstName, new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    }
  };

  const getGeneralWellnessMessage = (timeOfDay: string, firstName: string, dayOfWeek: string): WelcomeMessage => {
    const generalMessages = [
      {
        greeting: `Good ${timeOfDay}, ${firstName}! 🌟`,
        question: `How would you like to approach this ${dayOfWeek}?`,
        icon: ""
      },
      {
        greeting: `Hey ${firstName}! ✨`,
        question: "What's one thing you're looking forward to today?",
        icon: ""
      },
      {
        greeting: `Hello, ${firstName}! 🎯`,
        question: "How are you feeling in this moment?",
        icon: ""
      }
    ];

    const randomMessage = generalMessages[Math.floor(Math.random() * generalMessages.length)];
    
    return {
      ...randomMessage,
      statusColor: "from-blue-300 to-indigo-400"
    };
  };

  return welcomeMessage;
};
