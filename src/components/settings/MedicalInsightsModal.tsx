
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, FileText, Pill, Shield, Target, NotebookPen, Clock } from "lucide-react";
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

interface MedicalInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  insights: MedicalInsights | null;
  generatedAt?: string;
}

const MedicalInsightsModal = ({ isOpen, onClose, insights, generatedAt }: MedicalInsightsModalProps) => {
  if (!insights) return null;

  const InsightSection = ({ 
    title, 
    items, 
    icon: Icon, 
    variant = "default" as "default" | "warning" | "info"
  }: {
    title: string;
    items?: string[];
    icon: any;
    variant?: "default" | "warning" | "info";
  }) => {
    if (!items || items.length === 0) return null;

    const bgColor = {
      default: "bg-muted/30",
      warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
      info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    }[variant];

    const iconColor = {
      default: "text-muted-foreground",
      warning: "text-yellow-600 dark:text-yellow-400",
      info: "text-blue-600 dark:text-blue-400"
    }[variant];

    return (
      <div className={`p-4 rounded-lg border ${bgColor}`}>
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <h3 className="font-medium">{title}</h3>
          <Badge variant="outline" className="ml-auto">
            {items.length}
          </Badge>
        </div>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-sm flex items-start gap-2">
              <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Medical Insights Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis of your medical data for personalized AI guidance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {generatedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>
                Generated {formatDistanceToNow(new Date(generatedAt), { addSuffix: true })}
              </span>
            </div>
          )}

          <InsightSection
            title="Medical Conditions"
            items={insights.conditions}
            icon={FileText}
            variant="info"
          />

          <InsightSection
            title="Current Medications"
            items={insights.medications_summary}
            icon={Pill}
            variant="default"
          />

          <InsightSection
            title="Interaction Warnings"
            items={insights.interaction_warnings}
            icon={AlertTriangle}
            variant="warning"
          />

          <InsightSection
            title="Risk Factors"
            items={insights.risk_factors}
            icon={Shield}
            variant="default"
          />

          <InsightSection
            title="Red Flags"
            items={insights.red_flags}
            icon={Target}
            variant="warning"
          />

          <InsightSection
            title="Therapeutic Notes"
            items={insights.therapeutic_notes}
            icon={NotebookPen}
            variant="info"
          />

          <Separator />

          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/20 rounded-lg">
            <p className="font-medium">Privacy & Security</p>
            <p>• All insights are generated locally and stored securely</p>
            <p>• Your medical data is never shared with third parties</p>
            <p>• You can delete these insights at any time in settings</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicalInsightsModal;
