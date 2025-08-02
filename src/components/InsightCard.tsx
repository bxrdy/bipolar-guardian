
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogBody, MobileDialogFooter } from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  isOpen: boolean;
  onClose: () => void;
  riskLevel: 'amber' | 'red';
  metricDeltas: Array<{
    type: 'sleep' | 'steps' | 'screen' | 'mood';
    direction: 'up' | 'down';
    value: string;
    unit: string;
  }>;
  explanation: string;
}

const InsightCard = ({ isOpen, onClose, riskLevel, metricDeltas, explanation }: InsightCardProps) => {
  const isMobile = useIsMobile();

  const getRiskConfig = () => {
    if (riskLevel === 'red') {
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-500',
        title: 'High Risk Alert',
        description: 'Significant changes detected in your patterns'
      };
    } else {
      return {
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        iconColor: 'text-amber-500',
        title: 'Elevated Risk Notice',
        description: 'Some concerning changes in your patterns'
      };
    }
  };

  const config = getRiskConfig();

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'sleep':
        return '🛌';
      case 'steps':
        return '👟';
      case 'screen':
        return '📱';
      case 'mood':
        return '😔';
      default:
        return '📊';
    }
  };

  const getMetricName = (type: string) => {
    switch (type) {
      case 'sleep':
        return 'Sleep';
      case 'steps':
        return 'Steps';
      case 'screen':
        return 'Screen usage';
      case 'mood':
        return 'Mood';
      default:
        return type;
    }
  };

  // Filter to only show concerning metrics (those that indicate risk)
  const concerningMetrics = metricDeltas.filter(delta => {
    // Sleep down is concerning
    if (delta.type === 'sleep' && delta.direction === 'down') return true;
    // Steps down is concerning
    if (delta.type === 'steps' && delta.direction === 'down') return true;
    // Screen up is concerning
    if (delta.type === 'screen' && delta.direction === 'up') return true;
    // Mood down is concerning
    if (delta.type === 'mood' && delta.direction === 'down') return true;
    // Stress/anxiety up is concerning (these come as mood type with specific units)
    if (delta.type === 'mood' && delta.direction === 'up' && (delta.unit.includes('stress') || delta.unit.includes('anxiety'))) return true;
    
    return false;
  });

  return (
    <MobileDialog open={isOpen} onOpenChange={onClose}>
      <MobileDialogContent className="max-w-md">
        <MobileDialogHeader>
          <MobileDialogTitle className="flex items-center space-x-3">
            <AlertTriangle className={`w-6 h-6 ${config.iconColor} transition-colors duration-300`} />
            <span className="text-lg font-semibold">{config.title}</span>
          </MobileDialogTitle>
        </MobileDialogHeader>
        
        <MobileDialogBody>
          <div className={cn("rounded-xl p-5 border-2 transition-all duration-300", config.bgColor, config.borderColor)}>
            <p className="text-sm text-gray-700 mb-5 font-medium">
              {config.description}
            </p>
            
            {concerningMetrics && concerningMetrics.length > 0 && (
              <div className="mb-5">
                <h4 className="font-semibold text-sm text-gray-800 mb-4">Changes detected:</h4>
                <div className="space-y-3">
                  {concerningMetrics.map((delta, index) => (
                    <div key={index} className={cn(
                      "flex items-center space-x-4 text-sm bg-white/70 rounded-lg p-4 transition-all duration-200 hover:bg-white/90 hover:shadow-sm",
                      isMobile && "min-h-[52px]"
                    )}>
                      <span className="text-lg transition-transform duration-200 hover:scale-110">{getMetricIcon(delta.type)}</span>
                      {delta.direction === 'down' ? (
                        <TrendingDown className="w-5 h-5 text-blue-500 flex-shrink-0 transition-colors duration-200" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-red-500 flex-shrink-0 transition-colors duration-200" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 mb-1">{getMetricName(delta.type)}</div>
                        <div className="text-gray-600 text-xs">
                          {delta.value} {delta.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {explanation && (
              <div className="text-sm text-gray-600 leading-relaxed">
                {explanation}
              </div>
            )}
          </div>
        </MobileDialogBody>
        
        <MobileDialogFooter>
          <Button 
            onClick={onClose}
            className={cn(
              "font-medium transition-all duration-200 hover:shadow-md hover:scale-105",
              isMobile ? "w-full min-h-[48px] rounded-lg" : "px-6 py-2 rounded-lg"
            )}
          >
            Got it
          </Button>
        </MobileDialogFooter>
      </MobileDialogContent>
    </MobileDialog>
  );
};

export default InsightCard;
