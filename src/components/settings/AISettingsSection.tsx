
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAIInsights } from "@/hooks/useAIInsights";
import { useState } from 'react';
import AIModelSelection from './AIModelSelection';
import AIContextToggle from './AIContextToggle';
import MedicalInsightsCard from './MedicalInsightsCard';
import AIContextDescription from './AIContextDescription';
import MedicalInsightsModal from './MedicalInsightsModal';

// Define the medical insights type
interface MedicalInsights {
  conditions?: string[];
  medications_summary?: string[];
  interaction_warnings?: string[];
  red_flags?: string[];
  risk_factors?: string[];
  therapeutic_notes?: string[];
  last_updated?: string;
}

const AISettingsSection = () => {
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  
  const {
    isAIContextEnabled,
    isFeatureFlagsLoading,
    medicalInsights,
    insightsGeneratedAt,
    areInsightsStale,
    toggleAIContext,
    isTogglingAIContext,
    generateInsights,
    isGeneratingInsights
  } = useAIInsights();

  // Parse medical insights safely
  const parsedInsights = medicalInsights ? medicalInsights as MedicalInsights : null;

  const handleToggleAIContext = (enabled: boolean) => {
    console.log('Switch toggled to:', enabled);
    toggleAIContext(enabled);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-gray-900">AI Guardian Settings</CardTitle>
          <CardDescription>
            Configure your AI assistant and personalized medical context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AIModelSelection />

          {/* AI Medical Context - Always show the toggle */}
          <div className="space-y-4">
            <AIContextToggle
              isEnabled={isAIContextEnabled}
              isLoading={isTogglingAIContext || isFeatureFlagsLoading}
              onToggle={handleToggleAIContext}
            />

            {/* Show insights card if AI context is enabled OR if insights already exist */}
            {(isAIContextEnabled || parsedInsights) && (
              <MedicalInsightsCard
                insights={parsedInsights}
                generatedAt={insightsGeneratedAt}
                areInsightsStale={areInsightsStale}
                onViewDetails={() => setShowInsightsModal(true)}
                onGenerateInsights={() => generateInsights()}
                isGenerating={isGeneratingInsights}
                isAIContextEnabled={isAIContextEnabled}
              />
            )}

            {/* Show description only when AI context is disabled and no insights exist */}
            {!isAIContextEnabled && !parsedInsights && <AIContextDescription />}
          </div>
        </CardContent>
      </Card>

      {/* Medical Insights Modal */}
      <MedicalInsightsModal
        isOpen={showInsightsModal}
        onClose={() => setShowInsightsModal(false)}
        insights={parsedInsights}
        generatedAt={insightsGeneratedAt}
      />
    </div>
  );
};

export default AISettingsSection;
