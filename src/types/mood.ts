
export interface MoodEntry {
  id: string;
  userId: string;
  mood: number; // 1-10 scale
  moodLabel: string;
  energy: number; // 1-5 scale
  stress: number; // 1-5 scale
  anxiety: number; // 1-5 scale
  context?: {
    activities?: string[];
    location?: string;
    socialSituation?: string;
    notes?: string;
  };
  timestamp: string;
}

export interface MoodAnalytics {
  averageMood: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  energyPattern: number[];
  stressPattern: number[];
  commonActivities: string[];
  correlations?: {
    sleepMoodCorrelation?: number;
    activityMoodCorrelation?: number;
  };
}

export const MOOD_LABELS = [
  { value: 1, label: 'Terrible', emoji: '😢', color: '#EF4444' },
  { value: 2, label: 'Bad', emoji: '😞', color: '#F97316' },
  { value: 3, label: 'Poor', emoji: '😕', color: '#EAB308' },
  { value: 4, label: 'Below Average', emoji: '😐', color: '#84CC16' },
  { value: 5, label: 'Okay', emoji: '😶', color: '#22C55E' },
  { value: 6, label: 'Good', emoji: '🙂', color: '#10B981' },
  { value: 7, label: 'Pretty Good', emoji: '😊', color: '#06B6D4' },
  { value: 8, label: 'Great', emoji: '😄', color: '#3B82F6' },
  { value: 9, label: 'Excellent', emoji: '😁', color: '#8B5CF6' },
  { value: 10, label: 'Amazing', emoji: '🤩', color: '#A855F7' }
];

export const ACTIVITY_OPTIONS = [
  'Work', 'Exercise', 'Social time', 'Family time', 'Relaxing', 'Learning',
  'Hobbies', 'Chores', 'Commuting', 'Eating', 'Shopping', 'Entertainment'
];

export const LOCATION_OPTIONS = [
  'Home', 'Work', 'Gym', 'Outdoors', 'Restaurant', 'Social venue', 'Transport', 'Other'
];

export const SOCIAL_SITUATION_OPTIONS = [
  'Alone', 'With partner', 'With family', 'With friends', 'With colleagues', 'In a crowd'
];
