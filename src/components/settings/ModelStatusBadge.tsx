
import { Circle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ModelStatus } from '@/hooks/useAIModels';

interface ModelStatusBadgeProps {
  status: ModelStatus;
  reason?: string;
  size?: 'sm' | 'md';
  showText?: boolean;
}

const ModelStatusBadge = ({ status, reason, size = 'sm', showText = true }: ModelStatusBadgeProps) => {
  const iconSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  
  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          text: 'Available'
        };
      case 'rate-limited':
        return {
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          text: 'Rate Limited'
        };
      case 'unavailable':
        return {
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          text: 'Unavailable'
        };
      case 'checking':
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-600',
          text: 'Checking...'
        };
      default:
        return {
          color: 'text-gray-300',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-500',
          text: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();

  if (status === 'checking') {
    return (
      <Badge 
        variant="outline" 
        className={`inline-flex items-center gap-1.5 px-2 py-1 ${config.bgColor} ${config.borderColor} ${config.textColor} text-xs font-medium`}
        title={reason || config.text}
      >
        <RefreshCw className={`${iconSize} animate-spin`} />
        {showText && <span>{config.text}</span>}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`inline-flex items-center gap-1.5 px-2 py-1 ${config.bgColor} ${config.borderColor} ${config.textColor} text-xs font-medium`}
      title={reason || config.text}
    >
      <Circle className={`${iconSize} ${config.color} fill-current`} />
      {showText && <span>{config.text}</span>}
    </Badge>
  );
};

export default ModelStatusBadge;
