
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, TrendingUp, Shield } from 'lucide-react';
import MoodModal from './mood/MoodModal';
import GuardianModal from './GuardianModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuickActionsProps {
  onViewTrends: () => void;
}

const QuickActions = ({ onViewTrends }: QuickActionsProps) => {
  const isMobile = useIsMobile();
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showGuardianModal, setShowGuardianModal] = useState(false);

  // Don't render on mobile since bottom navigation handles these actions
  if (isMobile) {
    return null;
  }

  const handleYourGuardian = () => {
    setShowGuardianModal(true);
  };

  return (
    <>
      <div className="space-y-4 w-full max-w-full">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        
        <div className="grid grid-cols-3 gap-4 max-w-full">
          <Button
            variant="outline"
            className="h-32 flex-col space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 min-h-[44px] p-4 group w-full"
            onClick={() => setShowMoodModal(true)}
          >
            <Heart className="w-7 h-7 text-primary" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Log Mood</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-32 flex-col space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 min-h-[44px] p-4 group w-full"
            onClick={onViewTrends}
          >
            <TrendingUp className="w-7 h-7 text-primary" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">View Trends</span>
          </Button>

          <Button
            variant="outline"
            className="h-32 flex-col space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 min-h-[44px] p-4 group w-full"
            onClick={handleYourGuardian}
          >
            <Shield className="w-7 h-7 text-accent" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Your Guardian</span>
          </Button>
        </div>
      </div>

      <MoodModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
      />

      <GuardianModal
        isOpen={showGuardianModal}
        onClose={() => setShowGuardianModal(false)}
      />
    </>
  );
};

export default QuickActions;
