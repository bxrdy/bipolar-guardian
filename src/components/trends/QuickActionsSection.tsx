
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Lightbulb, BookOpen } from 'lucide-react';
import { useAlertSnooze } from '@/hooks/useAlertSnooze';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface QuickActionsSectionProps {
  isOpen: boolean;
  onCopingTipsClick: () => void;
  onJournalClick: () => void;
}

const QuickActionsSection = ({ isOpen, onCopingTipsClick, onJournalClick }: QuickActionsSectionProps) => {
  const isMobile = useIsMobile();
  const { isAlertsSnoozed, snoozeUntil, isLoading: snoozeLoading, handleSnoozeToggle, formatSnoozeTime } = useAlertSnooze(isOpen);

  const handleSnoozeClick = async () => {
    await handleSnoozeToggle();
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3">
        <Button
          variant="outline"
          onClick={handleSnoozeClick}
          disabled={snoozeLoading}
          className={cn(
            "flex items-center justify-start space-x-3 h-auto py-4",
            isMobile && "min-h-[72px]"
          )}
        >
          {isAlertsSnoozed ? (
            <BellOff className="w-5 h-5 text-orange-500" />
          ) : (
            <Bell className="w-5 h-5 text-blue-500" />
          )}
          <div className="text-left">
            <div className="text-sm font-medium">
              {isAlertsSnoozed ? 'Resume Alerts' : 'Snooze Alerts'}
            </div>
            <div className="text-xs text-gray-500">
              {isAlertsSnoozed && snoozeUntil 
                ? `Until ${formatSnoozeTime(snoozeUntil)}`
                : 'Temporarily pause notifications'
              }
            </div>
          </div>
          {snoozeLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 ml-auto" />
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={onCopingTipsClick}
          className={cn(
            "flex items-center justify-start space-x-3 h-auto py-4",
            isMobile && "min-h-[72px]"
          )}
        >
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <div className="text-left">
            <div className="text-sm font-medium">Coping Tips</div>
            <div className="text-xs text-gray-500">
              Personalized based on your patterns
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={onJournalClick}
          className={cn(
            "flex items-center justify-start space-x-3 h-auto py-4",
            isMobile && "min-h-[72px]"
          )}
        >
          <BookOpen className="w-5 h-5 text-blue-500" />
          <div className="text-left">
            <div className="text-sm font-medium">Journal</div>
            <div className="text-xs text-gray-500">
              Record your thoughts and feelings
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default QuickActionsSection;
