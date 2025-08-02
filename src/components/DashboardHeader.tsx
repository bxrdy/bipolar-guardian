
import { LoadingSkeleton } from './ui/loading-skeleton';
import { FadeTransition } from './ui/fade-transition';
import { SidebarTrigger } from './ui/sidebar';
import RiskLevelBadge from './RiskLevelBadge';
import { useIsMobile } from '@/hooks/use-mobile';

interface DailySummaryData {
  riskLevel: 'green' | 'amber' | 'red' | null;
  baselineReady: boolean;
  daysCollected: number;
  todayHasData?: boolean;
}

interface DashboardHeaderProps {
  currentDate: string;
  isLoading: boolean;
  dailySummaryData: DailySummaryData | undefined;
  onRiskBadgeTap?: () => void;
}

const DashboardHeader = ({ 
  currentDate, 
  isLoading, 
  dailySummaryData, 
  onRiskBadgeTap
}: DashboardHeaderProps) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className={`bg-white border-b border-gray-200 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'} w-full max-w-full overflow-x-hidden safe-left safe-right ${isMobile ? 'h-[65px]' : 'h-[73px]'} flex items-center`}>
        <LoadingSkeleton variant="header" />
      </div>
    );
  }

  return (
    <FadeTransition isVisible={true}>
      <div className={`bg-white border-b border-gray-200 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'} transition-all duration-300 w-full max-w-full overflow-x-hidden safe-left safe-right ${isMobile ? 'h-[65px]' : 'h-[73px]'} flex items-center`}>
        <div className="flex items-center justify-between min-w-0 w-full">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Only show SidebarTrigger on desktop */}
            {!isMobile && <SidebarTrigger className="flex-shrink-0" />}
            <div className="transition-all duration-300 min-w-0 flex-1">
              <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 truncate`}>Today</h1>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 truncate`}>{currentDate}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Risk Level Badge */}
            <FadeTransition isVisible={!isLoading && !!dailySummaryData} duration="normal">
              {!isLoading && dailySummaryData && (
                <RiskLevelBadge
                  riskLevel={dailySummaryData.riskLevel}
                  baselineReady={dailySummaryData.baselineReady}
                  daysCollected={dailySummaryData.daysCollected}
                  todayHasData={dailySummaryData.todayHasData}
                  onTap={onRiskBadgeTap}
                />
              )}
            </FadeTransition>
          </div>
        </div>
      </div>
    </FadeTransition>
  );
};

export default DashboardHeader;
