
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface AIContextToggleProps {
  isEnabled: boolean;
  isLoading: boolean;
  onToggle: (enabled: boolean) => void;
}

const AIContextToggle = ({ isEnabled, isLoading, onToggle }: AIContextToggleProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label className="text-base font-medium">AI Medical Context</Label>
        <p className="text-sm text-muted-foreground">
          Allow AI to analyze your medical documents and medications for personalized therapeutic guidance
        </p>
      </div>
      <Switch
        checked={isEnabled}
        onCheckedChange={onToggle}
        disabled={isLoading}
      />
    </div>
  );
};

export default AIContextToggle;
