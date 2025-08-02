
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, RefreshCw } from "lucide-react";

interface MedicalInsights {
  conditions?: string[];
  medications_summary?: string[];
  interaction_warnings?: string[];
  red_flags?: string[];
  risk_factors?: string[];
  therapeutic_notes?: string[];
  last_updated?: string;
}

interface InsightGenerationSectionProps {
  insights: MedicalInsights | null;
  onGenerateInsights: () => void;
  isGenerating: boolean;
}

const InsightGenerationSection = ({
  insights,
  onGenerateInsights,
  isGenerating
}: InsightGenerationSectionProps) => {
  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="font-medium">Generate New Insights</span>
        </div>
        {!insights && (
          <Badge variant="outline">No Insights Yet</Badge>
        )}
      </div>

      <Button
        onClick={onGenerateInsights}
        disabled={isGenerating}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            Analyzing Medical Data...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            {insights ? 'Refresh Medical Insights' : 'Generate Medical Insights'}
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground">
        <p>• Your medical data is processed securely and used only for personalized therapeutic guidance</p>
        <p>• Insights are stored locally and not shared with third parties</p>
        <p>• You can disable this feature or delete insights at any time</p>
      </div>
    </div>
  );
};

export default InsightGenerationSection;
