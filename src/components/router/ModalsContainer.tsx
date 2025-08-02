
import React from 'react';
import TrendsModal from '@/components/TrendsModal';
import GuardianModal from '@/components/GuardianModal';
import MobileSidebarMenu from '@/components/navigation/MobileSidebarMenu';
import { useIsMobile } from '@/hooks/use-mobile';

interface ModalsContainerProps {
  showTrendsModal: boolean;
  onCloseTrendsModal: () => void;
  showGuardianModal: boolean;
  onCloseGuardianModal: () => void;
  showMobileSidebar: boolean;
  onCloseMobileSidebar: () => void;
  onShowSettings: () => void;
  onSignOut: () => Promise<void>;
  onNavigateToDataStreams: () => void;
  onNavigateToHealthData: () => void;
  onNavigateToDashboard: () => void;
  isMobile: boolean;
}

const ModalsContainer = ({
  showTrendsModal,
  onCloseTrendsModal,
  showGuardianModal,
  onCloseGuardianModal,
  showMobileSidebar,
  onCloseMobileSidebar,
  onShowSettings,
  onSignOut,
  onNavigateToDataStreams,
  onNavigateToHealthData,
  onNavigateToDashboard,
  isMobile
}: ModalsContainerProps) => {
  return (
    <>
      {/* Trends Modal */}
      <TrendsModal
        isOpen={showTrendsModal}
        onClose={onCloseTrendsModal}
      />

      {/* Guardian Modal - Only show on desktop */}
      {!isMobile && (
        <GuardianModal
          isOpen={showGuardianModal}
          onClose={onCloseGuardianModal}
        />
      )}

      {/* Mobile Sidebar Overlay - Fixed positioning and visibility */}
      {isMobile && showMobileSidebar && (
        <div className="fixed inset-0 z-50 bg-white">
          <MobileSidebarMenu 
            onClose={onCloseMobileSidebar}
            onShowSettings={onShowSettings}
            onSignOut={onSignOut}
            onNavigateToDataStreams={onNavigateToDataStreams}
            onNavigateToHealthData={onNavigateToHealthData}
            onNavigateToDashboard={onNavigateToDashboard}
          />
        </div>
      )}
    </>
  );
};

export default ModalsContainer;
