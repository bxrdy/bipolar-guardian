
import ModelStatusBadge from './ModelStatusBadge';
import { ModelStatusInfo } from '@/hooks/useAIModels';

interface ModelInfoProps {
  name: string;
  description: string;
  badge: string;
  statusInfo?: ModelStatusInfo;
  isMobile?: boolean;
}

const ModelInfo = ({ name, description, statusInfo, isMobile = false }: ModelInfoProps) => {
  return (
    <div className="flex items-start justify-between w-full min-w-0 gap-3">
      <div className="flex flex-col space-y-1 min-w-0 flex-1">
        <span className={`font-semibold text-gray-900 ${isMobile ? "text-xs" : "text-sm"} truncate leading-tight`}>
          {name}
        </span>
        <p className={`${isMobile ? "text-xs" : "text-xs"} text-gray-600 leading-tight line-clamp-2 font-normal break-words w-full`}>
          {description}
        </p>
      </div>
      {/* Status badge always on the right */}
      {statusInfo && (
        <div className="flex-shrink-0">
          <ModelStatusBadge 
            status={statusInfo.status} 
            reason={statusInfo.reason}
            size="sm"
            showText={true}
          />
        </div>
      )}
    </div>
  );
};

export default ModelInfo;
