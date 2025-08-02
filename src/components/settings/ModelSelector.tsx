
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";
import ModelStatusBadge from './ModelStatusBadge';
import { ModelStatusInfo } from '@/hooks/useAIModels';

interface Model {
  id: string;
  name: string;
  description: string;
  badge: string;
}

interface ModelSelectorProps {
  models: Model[];
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
  placeholder: string;
  modelStatuses?: Record<string, ModelStatusInfo>;
}

const ModelSelector = ({ models, value, onValueChange, disabled, placeholder, modelStatuses }: ModelSelectorProps) => {
  const handleValueChange = (newValue: string) => {
    const modelStatus = modelStatuses?.[newValue];
    
    // Show warning for rate-limited or unavailable models
    if (modelStatus?.status === 'rate-limited') {
      console.warn(`Selected model ${newValue} is currently rate-limited: ${modelStatus.reason}`);
    } else if (modelStatus?.status === 'unavailable') {
      console.warn(`Selected model ${newValue} is currently unavailable: ${modelStatus.reason}`);
    }
    
    onValueChange(newValue);
  };

  const selectedModel = models.find(m => m.id === value);
  const selectedModelStatus = modelStatuses?.[value];

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="h-14 sm:h-16 px-3 sm:px-4 bg-white border-gray-300 text-left transition-colors hover:border-gray-400 focus:border-gray-500">
        <div className="flex items-center justify-between w-full min-w-0 gap-2 sm:gap-3">
          <div className="flex flex-col items-start min-w-0 flex-1">
            {selectedModel ? (
              <>
                <span className="font-medium text-xs sm:text-sm text-gray-900 truncate leading-tight w-full">
                  {selectedModel.name}
                </span>
                <span className="text-xs text-gray-600 truncate leading-tight w-full">
                  {selectedModel.description}
                </span>
              </>
            ) : (
              <span className="text-gray-500 text-xs sm:text-sm">{placeholder}</span>
            )}
          </div>
          {selectedModelStatus && (
            <div className="flex-shrink-0">
              <ModelStatusBadge 
                status={selectedModelStatus.status} 
                reason={selectedModelStatus.reason}
                size="sm"
                showText={false}
              />
            </div>
          )}
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-xl z-[200] w-[var(--radix-select-trigger-width)] min-w-[320px] sm:min-w-[360px] max-w-[90vw]">
        {models.map((model) => {
          const statusInfo = modelStatuses?.[model.id];
          const isUnavailable = statusInfo?.status === 'unavailable';
          
          return (
            <SelectItem 
              key={model.id} 
              value={model.id} 
              disabled={isUnavailable}
              className={`relative py-3 pl-10 pr-20 hover:bg-gray-50 focus:bg-gray-100 cursor-pointer transition-colors duration-150 data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900 ${
                isUnavailable ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <SelectPrimitive.ItemText>
                <div className="flex flex-col space-y-1 min-w-0 pr-2">
                  <span className="font-semibold text-sm text-gray-900 truncate leading-tight">
                    {model.name}
                  </span>
                  <p className="text-xs text-gray-600 leading-tight line-clamp-2 font-normal">
                    {model.description}
                  </p>
                </div>
              </SelectPrimitive.ItemText>
              {statusInfo && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
                  <ModelStatusBadge 
                    status={statusInfo.status} 
                    reason={statusInfo.reason}
                    size="sm"
                    showText={true}
                  />
                </div>
              )}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default ModelSelector;
