
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskLevelBadgeProps {
  riskLevel: 'green' | 'amber' | 'red' | null;
  baselineReady: boolean;
  daysCollected: number;
  todayHasData?: boolean;
  onTap?: () => void;
}

const RiskLevelBadge = ({ riskLevel, baselineReady, daysCollected, todayHasData, onTap }: RiskLevelBadgeProps) => {
  console.log('RiskLevelBadge props:', { riskLevel, baselineReady, daysCollected, todayHasData });

  if (!baselineReady) {
    const progressPercentage = Math.min((daysCollected / 14) * 100, 100);
    
    return (
      <div className="flex flex-col space-y-2 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-700">
            Calibrating... {daysCollected}/14 days
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    );
  }

  // If we have today's data and baseline is ready, but riskLevel is null,
  // it means analysis completed and found no concerning trends (which is good!)
  if (!riskLevel) {
    if (todayHasData) {
      return (
        <Badge variant="secondary" className="flex items-center space-x-1 bg-green-100 text-green-800 border-green-200">
          <Shield className="w-3 h-3" />
          <span>All Good</span>
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center space-x-1">
        <Shield className="w-3 h-3" />
        <span>No data for today</span>
      </Badge>
    );
  }

  const getRiskConfig = (level: 'green' | 'amber' | 'red') => {
    switch (level) {
      case 'green':
        return {
          label: 'Calm',
          icon: Shield,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
        };
      case 'amber':
        return {
          label: 'Caution',
          icon: ShieldAlert,
          className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
        };
      case 'red':
        return {
          label: 'High Risk',
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
        };
    }
  };

  const config = getRiskConfig(riskLevel);
  const Icon = config.icon;

  // Only make it clickable if there's an onTap handler and risk level is amber or red
  const isClickable = onTap && (riskLevel === 'amber' || riskLevel === 'red');

  return (
    <Badge 
      className={cn(
        "flex items-center space-x-1 font-medium", 
        config.className,
        isClickable && "cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
      )}
      onClick={isClickable ? onTap : undefined}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

export default RiskLevelBadge;
