
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Home, Plus, TrendingUp, Shield, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MoodModal from './mood/MoodModal';

type Screen = 'login' | 'onboarding-step1' | 'onboarding-step2' | 'onboarding-step3' | 'dashboard' | 'data-streams' | 'health-data' | 'settings' | 'medications' | 'guardian';

interface BottomNavigationProps {
  onViewTrends: () => void;
  onShowMenu: () => void;
  onShowSettings: () => void;
  onGoHome?: () => void;
  onYourGuardian?: () => void;
  currentScreen?: Screen;
}

type TabState = 'dashboard' | 'menu' | 'mood' | 'trends' | 'guardian';

const BottomNavigation = ({ 
  onViewTrends, 
  onShowMenu, 
  onShowSettings, 
  onGoHome,
  onYourGuardian,
  currentScreen = 'dashboard' 
}: BottomNavigationProps) => {
  const isMobile = useIsMobile();
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabState>(getActiveTabFromScreen(currentScreen));

  function getActiveTabFromScreen(screen: Screen): TabState {
    if (screen === 'settings') return 'menu';
    if (screen === 'dashboard') return 'dashboard';
    if (screen === 'guardian') return 'guardian';
    // For other screens like health-data, medications, data-streams, login, onboarding, don't highlight any specific tab
    return 'dashboard';
  }

  // Update activeTab when currentScreen changes
  useEffect(() => {
    setActiveTab(getActiveTabFromScreen(currentScreen));
  }, [currentScreen]);

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  const handleTabPress = (tab: TabState, action?: () => void) => {
    setActiveTab(tab);
    if (action) {
      action();
    }
  };

  const handleMoodModalClose = () => {
    setShowMoodModal(false);
    setActiveTab(getActiveTabFromScreen(currentScreen)); // Reset to current screen when modal closes
  };

  const handleTrendsPress = () => {
    handleTabPress('trends', onViewTrends);
    // Reset to current screen after a short delay to allow the modal to open
    setTimeout(() => setActiveTab(getActiveTabFromScreen(currentScreen)), 100);
  };

  const handleMenuPress = () => {
    console.log('Menu button pressed - opening mobile sidebar menu');
    handleTabPress('menu', onShowMenu);
    // Reset to current screen after a short delay to allow the menu to open
    setTimeout(() => setActiveTab(getActiveTabFromScreen(currentScreen)), 100);
  };

  const handleHomePress = () => {
    handleTabPress('dashboard');
    if (onGoHome) {
      onGoHome();
    }
  };

  const handleGuardianPress = () => {
    handleTabPress('guardian');
    if (onYourGuardian) {
      onYourGuardian();
    }
    // Don't reset the tab state since we're navigating to guardian screen
  };

  return (
    <>
      {/* iOS-style translucent tab bar with optimized spacing */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border px-2 py-2 pb-safe-bottom z-50 safe-left safe-right">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* Home Tab */}
          <button
            onClick={handleHomePress}
            className={`flex flex-col items-center justify-center px-2 py-2 min-w-0 flex-1 transition-all duration-250 ease-apple-ease ${
              activeTab === 'dashboard' 
                ? 'transform scale-110' 
                : 'active:scale-95'
            }`}
          >
            <div className={`relative flex items-center justify-center w-6 h-6 mb-1 transition-all duration-300 ease-gentle ${
              activeTab === 'dashboard' 
                ? 'text-primary' 
                : 'text-muted-foreground'
            }`}>
              <Home className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium transition-all duration-300 ease-gentle whitespace-nowrap ${
              activeTab === 'dashboard' 
                ? 'text-primary' 
                : 'text-muted-foreground'
            }`}>
              Home
            </span>
          </button>

          {/* Mood Tab */}
          <button
            onClick={() => handleTabPress('mood', () => setShowMoodModal(true))}
            className={`flex flex-col items-center justify-center px-2 py-2 min-w-0 flex-1 transition-all duration-250 ease-apple-ease ${
              activeTab === 'mood' 
                ? 'transform scale-110' 
                : 'active:scale-95'
            }`}
          >
            <div className={`relative flex items-center justify-center w-6 h-6 mb-1 transition-all duration-300 ease-gentle ${
              activeTab === 'mood' 
                ? 'text-primary' 
                : 'text-muted-foreground'
            }`}>
              <Plus className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium transition-all duration-300 ease-gentle whitespace-nowrap ${
              activeTab === 'mood' 
                ? 'text-primary' 
                : 'text-muted-foreground'
            }`}>
              Mood
            </span>
          </button>

          {/* Trends Tab */}
          <button
            onClick={handleTrendsPress}
            className={`flex flex-col items-center justify-center px-2 py-2 min-w-0 flex-1 transition-all duration-250 ease-apple-ease ${
              activeTab === 'trends' 
                ? 'transform scale-110' 
                : 'active:scale-95'
            }`}
          >
            <div className={`relative flex items-center justify-center w-6 h-6 mb-1 transition-all duration-300 ease-gentle ${
              activeTab === 'trends' 
                ? 'text-primary' 
                : 'text-muted-foreground'
            }`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium transition-all duration-300 ease-gentle whitespace-nowrap ${
              activeTab === 'trends' 
                ? 'text-primary' 
                : 'text-muted-foreground'
            }`}>
              Trends
            </span>
          </button>

          {/* Guardian Tab */}
          <button
            onClick={handleGuardianPress}
            className={`flex flex-col items-center justify-center px-2 py-2 min-w-0 flex-1 transition-all duration-250 ease-apple-ease ${
              activeTab === 'guardian' 
                ? 'transform scale-110' 
                : 'active:scale-95'
            }`}
          >
            <div className={`relative flex items-center justify-center w-6 h-6 mb-1 transition-all duration-300 ease-gentle ${
              activeTab === 'guardian' 
                ? 'text-primary' 
                : 'text-muted-foreground'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium transition-all duration-300 ease-gentle whitespace-nowrap ${
              activeTab === 'guardian' 
                ? 'text-primary' 
                : 'text-muted-foreground'
            }`}>
              Guardian
            </span>
          </button>

          {/* Menu Tab - With Sign Out Access */}
          <button
            onClick={handleMenuPress}
            className={`flex flex-col items-center justify-center px-2 py-2 min-w-0 flex-1 transition-all duration-250 ease-apple-ease ${
              activeTab === 'menu' 
                ? 'transform scale-110' 
                : 'active:scale-95'
            }`}
          >
            <div className={`relative flex items-center justify-center w-6 h-6 mb-1 transition-all duration-300 ease-gentle ${
              activeTab === 'menu' 
                ? 'text-primary' 
                : 'text-muted-foreground'
            }`}>
              <Menu className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium transition-all duration-300 ease-gentle whitespace-nowrap ${
              activeTab === 'menu' 
                ? 'text-primary' 
                : 'text-muted-foreground'
            }`}>
              Menu
            </span>
          </button>
        </div>
      </div>

      <MoodModal
        isOpen={showMoodModal}
        onClose={handleMoodModalClose}
      />
    </>
  );
};

export default BottomNavigation;
