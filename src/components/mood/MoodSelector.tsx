
import { useState } from 'react';
import { MOOD_LABELS } from '@/types/mood';

interface MoodSelectorProps {
  selectedMood: number;
  onMoodChange: (mood: number) => void;
}

const MoodSelector = ({ selectedMood, onMoodChange }: MoodSelectorProps) => {
  const [hoveredMood, setHoveredMood] = useState<number | null>(null);

  const displayMood = hoveredMood || selectedMood;
  const currentMoodData = MOOD_LABELS.find(mood => mood.value === displayMood);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-2">
          {currentMoodData?.emoji || '😶'}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          {currentMoodData?.label || 'Select your mood'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          How are you feeling right now?
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Terrible</span>
          <span>Amazing</span>
        </div>
        
        <div className="flex justify-between items-center gap-2">
          {MOOD_LABELS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => onMoodChange(mood.value)}
              onMouseEnter={() => setHoveredMood(mood.value)}
              onMouseLeave={() => setHoveredMood(null)}
              className={`
                flex-1 h-8 rounded-lg border-2 transition-all duration-200
                ${selectedMood === mood.value 
                  ? 'border-gray-900 scale-110' 
                  : 'border-gray-200 hover:border-gray-400'
                }
                ${hoveredMood === mood.value ? 'scale-105' : ''}
              `}
              style={{ backgroundColor: mood.color }}
            >
              <span className="sr-only">{mood.label}</span>
            </button>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
};

export default MoodSelector;
