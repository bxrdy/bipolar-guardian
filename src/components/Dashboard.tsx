import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Database, Heart, Settings, LogOut } from 'lucide-react';
import DataStreamSettings from './DataStreamSettings';
import InsightCard from './InsightCard';
import DashboardHeader from './DashboardHeader';
import SmartWelcomeSection from './SmartWelcomeSection';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import SettingsScreen from './SettingsScreen';
import TrendsModal from './TrendsModal';
import GuardianModal from './GuardianModal';
import BottomNavigation from './BottomNavigation';
import MobileSidebarMenu from './navigation/MobileSidebarMenu';
import { useDailySummary } from '@/hooks/useDailySummary';
import { useRiskAnalysis, MetricDelta } from '@/hooks/useHealthAnalytics';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardProps {
  userData: {
    firstName: string;
    email: string;
    biometricConsent: boolean;
  };
  onSignOut: () => void;
  onNavigate?: (screen: string) => void;
}

const Dashboard = ({ userData, onSignOut, onNavigate }: DashboardProps) => {
  const isMobile = useIsMobile();
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [showTrendsModal, setShowTrendsModal] = useState(false);
  const [showGuardianModal, setShowGuardianModal] = useState(false);
  const [insightRiskLevel, setInsightRiskLevel] = useState<'amber' | 'red'>('amber');
  const [realMetricDeltas, setRealMetricDeltas] = useState<MetricDelta[]>([]);
  const [realExplanation, setRealExplanation] = useState('');
  
  const { data: dailySummaryData, isLoading, refetch } = useDailySummary();
  const { fetchRealMetricDeltas } = useRiskAnalysis();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Check for notification tap parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const notificationTap = urlParams.get('notification');
    const riskLevel = urlParams.get('risk_level');
    
    if (notificationTap === 'risk' && (riskLevel === 'amber' || riskLevel === 'red')) {
      setInsightRiskLevel(riskLevel);
      setShowInsightModal(true);
      
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('notification');
      url.searchParams.delete('risk_level');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const handleSignOut = async () => {
    console.log('Dashboard handleSignOut called');
    await supabase.auth.signOut();
    // The auth state change will handle navigation
  };

  const handleRiskBadgeTap = async () => {
    console.log('Risk badge tapped, current risk level:', dailySummaryData?.riskLevel);
    console.log('Full daily summary data:', dailySummaryData);
    
    // Refetch the latest data first
    refetch();
    
    // Only show the modal if there's actually a risk level of amber or red
    if (dailySummaryData?.riskLevel === 'amber' || dailySummaryData?.riskLevel === 'red') {
      console.log('Fetching real metric deltas for risk level:', dailySummaryData.riskLevel);
      const realData = await fetchRealMetricDeltas(dailySummaryData.riskLevel);
      console.log('Real metric deltas result:', realData);
      setRealMetricDeltas(realData.deltas);
      setRealExplanation(realData.explanation);
      setInsightRiskLevel(dailySummaryData.riskLevel);
      setShowInsightModal(true);
    } else {
      // For green/null risk levels, show a helpful message
      if (dailySummaryData?.todayHasData) {
        toast.success('No concerning trends detected today - your patterns look healthy!');
      } else {
        toast.info('No data available for risk analysis today');
      }
    }
  };

  const handleViewTrends = () => {
    console.log('View Trends clicked - opening trends modal');
    setShowTrendsModal(true);
  };

  const handleYourGuardian = () => {
    console.log('Your Guardian clicked - opening Guardian modal');
    setShowGuardianModal(true);
  };

  const handleGoHome = () => {
    setShowSettings(false);
    setShowMobileSidebar(false);
  };

  const handleShowMenu = () => {
    console.log('Dashboard showMenu called');
    setShowMobileSidebar(true);
  };

  const handleNavigateFromMenu = (screen: string) => {
    setShowMobileSidebar(false);
    if (onNavigate) {
      onNavigate(screen);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <DashboardHeader
        currentDate={currentDate}
        isLoading={isLoading}
        dailySummaryData={dailySummaryData}
        onRiskBadgeTap={handleRiskBadgeTap}
      />

      {/* Content Container with optimized mobile spacing */}
      <div className={`w-full max-w-7xl mx-auto px-4 md:px-6 ${isMobile ? 'pb-24' : 'pb-8'} safe-left safe-right`}>
        
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 bg-white">
            <SettingsScreen onBack={() => setShowSettings(false)} />
          </div>
        )}

        {/* Mobile Sidebar - No extra wrapper needed */}
        {isMobile && showMobileSidebar && (
          <MobileSidebarMenu 
            onClose={() => {
              console.log('Closing mobile sidebar');
              setShowMobileSidebar(false);
            }}
            onShowSettings={() => {
              setShowMobileSidebar(false);
              setShowSettings(true);
            }}
            onSignOut={() => {
              console.log('Mobile sidebar onSignOut called');
              setShowMobileSidebar(false);
              onSignOut();
            }}
            onNavigateToDataStreams={() => handleNavigateFromMenu('data-streams')}
            onNavigateToHealthData={() => handleNavigateFromMenu('health-data')}
            onNavigateToDashboard={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Risk Alert Modal (InsightCard) */}
        <InsightCard
          isOpen={showInsightModal}
          onClose={() => setShowInsightModal(false)}
          riskLevel={insightRiskLevel}
          metricDeltas={realMetricDeltas}
          explanation={realExplanation}
        />

        {/* General Trends Modal */}
        <TrendsModal
          isOpen={showTrendsModal}
          onClose={() => setShowTrendsModal(false)}
        />

        {/* Guardian Modal */}
        <GuardianModal
          isOpen={showGuardianModal}
          onClose={() => setShowGuardianModal(false)}
        />

        {/* Main Content with optimized spacing */}
        <div className={`space-y-6 w-full ${isMobile ? 'pt-2' : 'pt-4'}`}>
          {/* Smart Welcome Message */}
          <SmartWelcomeSection firstName={userData.firstName} />

          {/* Quick Actions */}
          <QuickActions onViewTrends={handleViewTrends} />

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <BottomNavigation
          onViewTrends={handleViewTrends}
          onShowMenu={handleShowMenu}
          onShowSettings={() => setShowSettings(true)}
          onGoHome={handleGoHome}
          onYourGuardian={handleYourGuardian}
          currentScreen="dashboard"
        />
      )}
    </div>
  );
};

export default Dashboard;
