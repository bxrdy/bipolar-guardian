
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Activity, Shield } from "lucide-react";
import { LoadingSkeleton } from "./ui/loading-skeleton";
import { FadeTransition } from "./ui/fade-transition";

interface WeeklySummaryCardsProps {
  todayStats: {
    steps: number;
    sleepHours: number;
    riskLevel: 'green' | 'amber' | 'red' | null;
    baseline?: {
      sleepMean: number;
      stepsMean: number;
    } | null;
  } | null;
  weeklyStats: {
    avgSleep: number;
    totalSteps: number;
    avgSteps: number;
    riskPattern: {
      green: number;
      amber: number;
      red: number;
      null: number;
    };
    daysWithData: number;
    baseline?: {
      sleepMean: number;
      stepsMean: number;
    } | null;
  } | null;
}

const WeeklySummaryCards = ({ todayStats, weeklyStats }: WeeklySummaryCardsProps) => {
  if (!todayStats && !weeklyStats) {
    return (
      <div className="mb-6">
        <LoadingSkeleton variant="summary" />
      </div>
    );
  }

  const getSleepStatus = () => {
    if (!todayStats?.baseline?.sleepMean || todayStats.sleepHours === 0) return 'neutral';
    const diff = todayStats.sleepHours - todayStats.baseline.sleepMean;
    if (Math.abs(diff) < 0.5) return 'neutral';
    return diff > 0 ? 'positive' : 'negative';
  };

  const getStepsStatus = () => {
    if (!todayStats?.baseline?.stepsMean || todayStats.steps === 0) return 'neutral';
    const diff = todayStats.steps - todayStats.baseline.stepsMean;
    const percentDiff = Math.abs(diff / todayStats.baseline.stepsMean);
    if (percentDiff < 0.1) return 'neutral';
    return diff > 0 ? 'positive' : 'negative';
  };

  const getRiskStatus = () => {
    if (todayStats?.riskLevel) {
      switch (todayStats.riskLevel) {
        case 'red': return 'high';
        case 'amber': return 'medium';
        case 'green': return 'low';
        default: return 'neutral';
      }
    }
    return 'neutral';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'positive': return 'bg-green-100 text-green-800 hover:bg-green-50 hover:text-green-900';
      case 'negative': return 'bg-red-100 text-red-800 hover:bg-red-50 hover:text-red-900';
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-50 hover:text-red-900';
      case 'medium': return 'bg-amber-100 text-amber-800 hover:bg-amber-50 hover:text-amber-900';
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-50 hover:text-green-900';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-50 hover:text-gray-800';
    }
  };

  return (
    <FadeTransition isVisible={true}>
      <div className="w-full mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-full">
          {/* Sleep Card */}
          <FadeTransition isVisible={true} duration="fast">
            <Card variant="interactive" className="min-h-[140px] w-full group border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-xl">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">Sleep</span>
                  </div>
                  <Badge className={`${getStatusColor(getSleepStatus())} transition-colors duration-200 whitespace-nowrap text-xs flex-shrink-0 ml-2`}>
                    {getSleepStatus() === 'positive' ? 'Above avg' : 
                     getSleepStatus() === 'negative' ? 'Below avg' : 'Normal'}
                  </Badge>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-1">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {todayStats?.sleepHours ? `${todayStats.sleepHours.toFixed(1)}h` : 'No data'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>{todayStats?.sleepHours ? 'Today' : 'No sleep data for today'}</div>
                    {weeklyStats?.avgSleep && (
                      <div className="text-xs">
                        Weekly avg: {weeklyStats.avgSleep.toFixed(1)}h
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeTransition>

          {/* Steps Card */}
          <FadeTransition isVisible={true} duration="normal">
            <Card variant="interactive" className="min-h-[140px] w-full group border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-xl">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">Steps</span>
                  </div>
                  <Badge className={`${getStatusColor(getStepsStatus())} transition-colors duration-200 whitespace-nowrap text-xs flex-shrink-0 ml-2`}>
                    {getStepsStatus() === 'positive' ? 'Above avg' : 
                     getStepsStatus() === 'negative' ? 'Below avg' : 'Normal'}
                  </Badge>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-1">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {todayStats?.steps ? todayStats.steps.toLocaleString() : 'No data'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>{todayStats?.steps ? 'Today' : 'No step data for today'}</div>
                    {weeklyStats?.avgSteps && (
                      <div className="text-xs">
                        Weekly avg: {Math.round(weeklyStats.avgSteps).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeTransition>

          {/* Risk Pattern Card */}
          <FadeTransition isVisible={true} duration="slow">
            <Card variant="interactive" className="min-h-[140px] w-full group border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-xl">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">Risk Level</span>
                  </div>
                  <Badge className={`${getStatusColor(getRiskStatus())} transition-colors duration-200 whitespace-nowrap text-xs flex-shrink-0 ml-2`}>
                    {getRiskStatus() === 'high' ? 'High risk' : 
                     getRiskStatus() === 'medium' ? 'Caution' : 
                     getRiskStatus() === 'low' ? 'Low risk' : 'No data'}
                  </Badge>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-1">
                  <div className="text-2xl font-bold leading-tight">
                    {todayStats?.riskLevel ? (
                      <span className="capitalize" style={{ 
                        color: todayStats.riskLevel === 'red' ? '#ef4444' : 
                               todayStats.riskLevel === 'amber' ? '#f59e0b' : '#10b981' 
                      }}>
                        {todayStats.riskLevel}
                      </span>
                    ) : 'No data'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>{todayStats?.riskLevel ? 'Today' : 'No risk data for today'}</div>
                    {weeklyStats && weeklyStats.daysWithData > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs flex-shrink-0">Last {weeklyStats.daysWithData} days:</span>
                        <div className="flex space-x-1">
                          {weeklyStats.riskPattern.green > 0 && <span className="text-green-600 text-xs">●{weeklyStats.riskPattern.green}</span>}
                          {weeklyStats.riskPattern.amber > 0 && <span className="text-amber-600 text-xs">●{weeklyStats.riskPattern.amber}</span>}
                          {weeklyStats.riskPattern.red > 0 && <span className="text-red-600 text-xs">●{weeklyStats.riskPattern.red}</span>}
                          {weeklyStats.riskPattern.null > 0 && <span className="text-gray-400 text-xs">●{weeklyStats.riskPattern.null}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeTransition>
        </div>
      </div>
    </FadeTransition>
  );
};

export default WeeklySummaryCards;
