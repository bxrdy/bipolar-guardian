
import { useState } from 'react';
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogBody, MobileDialogFooter } from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TrendingUp } from 'lucide-react';
import { useDailySummary } from '@/hooks/useDailySummary';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import CopingTipsModal from './CopingTipsModal';
import MoodModal from './mood/MoodModal';
import WeeklyTrendsSection from './trends/WeeklyTrendsSection';
import QuickActionsSection from './trends/QuickActionsSection';

interface TrendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrendsModal = ({ isOpen, onClose }: TrendsModalProps) => {
  const isMobile = useIsMobile();
  const { data: dailySummaryData } = useDailySummary();
  
  const [showCopingTipsModal, setShowCopingTipsModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);

  const handleCopingTipsModalClose = () => {
    setShowCopingTipsModal(false);
  };

  const handleJournalModalClose = () => {
    setShowJournalModal(false);
  };

  return (
    <>
      <MobileDialog open={isOpen} onOpenChange={onClose}>
        <MobileDialogContent className={cn(
          // Responsive sizing based on screen size
          isMobile 
            ? "max-w-md" // Keep mobile at max-w-md
            : "w-[90vw] max-w-4xl sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw]" // Responsive desktop/tablet sizing
        )}>
          <MobileDialogHeader>
            <MobileDialogTitle className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-semibold">Your Trends</span>
            </MobileDialogTitle>
            <Separator className="mt-4" />
          </MobileDialogHeader>
          
          <MobileDialogBody>
            <div className="space-y-6">
              {/* Weekly Trends */}
              <WeeklyTrendsSection isOpen={isOpen} />

              {/* Quick Actions */}
              <QuickActionsSection 
                isOpen={isOpen}
                onCopingTipsClick={() => setShowCopingTipsModal(true)}
                onJournalClick={() => setShowJournalModal(true)}
              />

              {/* Baseline Status */}
              {!dailySummaryData?.baselineReady && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-sm text-amber-900 mb-2">Building Your Baseline</h4>
                  <p className="text-xs text-amber-700">
                    We're still learning your patterns. More accurate trend analysis will be available after a few days of data collection.
                  </p>
                </div>
              )}
            </div>
          </MobileDialogBody>
            
          <MobileDialogFooter>
            <div className="flex justify-end">
              <Button 
                onClick={onClose}
                className={cn(
                  "font-medium transition-all duration-200",
                  isMobile ? "w-full min-h-[48px] rounded-lg" : "px-6 py-2 rounded-lg"
                )}
              >
                Close
              </Button>
            </div>
          </MobileDialogFooter>
        </MobileDialogContent>
      </MobileDialog>

      {/* Coping Tips Modal */}
      <CopingTipsModal
        isOpen={showCopingTipsModal}
        onClose={handleCopingTipsModalClose}
      />

      {/* Journal Modal */}
      <MoodModal
        isOpen={showJournalModal}
        onClose={handleJournalModalClose}
        journalMode={true}
      />
    </>
  );
};

export default TrendsModal;
