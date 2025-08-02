
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ModelSelector from "./ModelSelector";
import { chatModels, visionModels } from './modelConfigurations';
import { useAIModels } from '@/hooks/useAIModels';

const AIModelSelection = () => {
  const { 
    chatStatuses, 
    visionStatuses,
    chatModel, 
    visionModel, 
    updateChatModel, 
    updateVisionModel,
    isUpdatingChat,
    isUpdatingVision,
    isLoading
  } = useAIModels();

  const handleChatModelChange = (modelId: string) => {
    console.log('Chat model selection changed to:', modelId);
    updateChatModel(modelId);
  };

  const handleVisionModelChange = (modelId: string) => {
    console.log('Vision model selection changed to:', modelId);
    updateVisionModel(modelId);
  };

  return (
    <>
      {/* Chat Model Selection */}
      <div>
        <Label className="text-base font-medium">Chat Model</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Choose your preferred AI model for conversations
        </p>
        <ModelSelector
          models={chatModels}
          value={chatModel}
          onValueChange={handleChatModelChange}
          disabled={isLoading || isUpdatingChat}
          placeholder="Select a chat model"
          modelStatuses={chatStatuses}
        />
      </div>

      <Separator />

      {/* Vision Model Selection */}
      <div>
        <Label className="text-base font-medium">Document Analysis Model</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Choose the AI model for analyzing uploaded medical documents
        </p>
        <ModelSelector
          models={visionModels}
          value={visionModel}
          onValueChange={handleVisionModelChange}
          disabled={isLoading || isUpdatingVision}
          placeholder="Select a vision model"
          modelStatuses={visionStatuses}
        />
      </div>

      <Separator />
    </>
  );
};

export default AIModelSelection;
