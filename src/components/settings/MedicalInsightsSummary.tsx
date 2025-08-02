
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle, Clock, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MedicalInsights {
  conditions?: string[];
  medications_summary?: string[];
  interaction_warnings?: string[];
  red_flags?: string[];
  risk_factors?: string[];
  therapeutic_notes?: string[];
  last_updated?: string;
}

interface MedicalInsightsSummaryProps {
  insights: MedicalInsights;
  generatedAt?: string;
  areInsightsStale: boolean;
  onViewDetails: () => void;
}

const MedicalInsightsSummary = ({
  insights,
  generatedAt,
  areInsightsStale,
  onViewDetails
}: MedicalInsightsSummaryProps) => {
  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="font-medium">Medical Insights Available</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={areInsightsStale ? "secondary" : "default"}>
            {areInsightsStale ? "Needs Update" : "Current"}
          </Badge>
        </div>
      </div>

      {generatedAt && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>
            last updated {formatDistanceToNow(new Date(generatedAt), { addSuffix: true })}
          </span>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          {insights.conditions && insights.conditions.length > 0 && (
            <div>
              <span className="font-medium">Conditions:</span>
              <div className="text-muted-foreground">
                {insights.conditions.slice(0, 2).join(', ')}
                {insights.conditions.length > 2 && '...'}
              </div>
            </div>
          )}
          {insights.medications_summary && insights.medications_summary.length > 0 && (
            <div>
              <span className="font-medium">Medications:</span>
              <div className="text-muted-foreground">
                {insights.medications_summary.length} tracked
              </div>
            </div>
          )}
        </div>
        
        {insights.interaction_warnings && insights.interaction_warnings.length > 0 && (
          <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-2 border-yellow-500">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                {insights.interaction_warnings.length} interaction warning(s) detected
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={onViewDetails}
          variant="outline"
          size="default"
          className="w-full mt-3"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Complete Medical Insights
        </Button>
      </div>
    </div>
  );
};

export default MedicalInsightsSummary;
