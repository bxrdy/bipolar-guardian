
import MedicalInsightsSummary from './MedicalInsightsSummary';
import InsightGenerationSection from './InsightGenerationSection';

interface MedicalInsights {
  conditions?: string[];
  medications_summary?: string[];
  interaction_warnings?: string[];
  red_flags?: string[];
  risk_factors?: string[];
  therapeutic_notes?: string[];
  last_updated?: string;
}

interface MedicalInsightsCardProps {
  insights: MedicalInsights | null;
  generatedAt?: string;
  areInsightsStale: boolean;
  onViewDetails: () => void;
  onGenerateInsights: () => void;
  isGenerating: boolean;
  isAIContextEnabled: boolean;
}

const MedicalInsightsCard = ({
  insights,
  generatedAt,
  areInsightsStale,
  onViewDetails,
  onGenerateInsights,
  isGenerating,
  isAIContextEnabled
}: MedicalInsightsCardProps) => {
  return (
    <div className="space-y-4">
      {/* Medical Insights Display - Show if insights exist */}
      {insights && (
        <MedicalInsightsSummary
          insights={insights}
          generatedAt={generatedAt}
          areInsightsStale={areInsightsStale}
          onViewDetails={onViewDetails}
        />
      )}

      {/* AI Context Specific Section - Show if AI context is enabled */}
      {isAIContextEnabled && (
        <InsightGenerationSection
          insights={insights}
          onGenerateInsights={onGenerateInsights}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
};

export default MedicalInsightsCard;
