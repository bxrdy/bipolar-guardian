
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { BookOpen, Heart, Bell, BellOff } from 'lucide-react';
import { useAlertSnooze } from '@/hooks/useAlertSnooze';
import MoodModal from './mood/MoodModal';
import CopingTipsModal from './CopingTipsModal';
import QuickActionButton from './QuickActionButton';

interface QuickActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickActionsSheet = ({ isOpen, onClose }: QuickActionsSheetProps) => {
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [journalMode, setJournalMode] = useState(false);
  const [showCopingTips, setShowCopingTips] = useState(false);
  
  const {
    isAlertsSnoozed,
    snoozeUntil,
    isLoading,
    handleSnoozeToggle,
    formatSnoozeTime
  } = useAlertSnooze(isOpen);

  const handleSnoozeAction = async () => {
    const success = await handleSnoozeToggle();
    if (success) {
      onClose();
    }
  };

  const handleJournalFeelings = () => {
    setJournalMode(true);
    setShowMoodModal(true);
  };

  const handleViewCopingTips = () => {
    setShowCopingTips(true);
  };

  const handleMoodModalClose = () => {
    setShowMoodModal(false);
    setJournalMode(false);
  };

  const actions = [
    {
      id: 'snooze',
      title: isAlertsSnoozed ? 'Resume alerts' : 'Snooze alerts',
      subtitle: isAlertsSnoozed && snoozeUntil 
        ? `Snoozed until ${formatSnoozeTime(snoozeUntil)}`
        : 'Pause notifications for 24 hours',
      icon: isAlertsSnoozed ? Bell : BellOff,
      color: 'blue' as const,
      onClick: handleSnoozeAction,
      loading: isLoading
    },
    {
      id: 'journal',
      title: 'Journal my feelings',
      subtitle: 'Record your thoughts and emotions',
      icon: BookOpen,
      color: 'green' as const,
      onClick: handleJournalFeelings,
      loading: false
    },
    {
      id: 'tips',
      title: 'View coping tips',
      subtitle: 'Evidence-based wellness suggestions',
      icon: Heart,
      color: 'purple' as const,
      onClick: handleViewCopingTips,
      loading: false
    }
  ];

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] bg-white">
          <DrawerHeader className="text-center pb-6">
            <DrawerTitle className="text-2xl font-bold text-gray-900">Quick Actions</DrawerTitle>
            <p className="text-gray-500 mt-2">Choose an action to help manage your wellbeing</p>
          </DrawerHeader>
          
          <div className="px-6 pb-8 space-y-4">
            {actions.map((action) => (
              <QuickActionButton
                key={action.id}
                {...action}
              />
            ))}
          </div>
          
          <div className="px-6 pb-6">
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 py-3 rounded-xl"
            >
              Close
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <MoodModal
        isOpen={showMoodModal}
        onClose={handleMoodModalClose}
        journalMode={journalMode}
      />

      <CopingTipsModal
        isOpen={showCopingTips}
        onClose={() => setShowCopingTips(false)}
      />
    </>
  );
};

export default QuickActionsSheet;
