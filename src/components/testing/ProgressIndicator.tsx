
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  isVisible: boolean;
}

const ProgressIndicator = ({ steps, isVisible }: ProgressIndicatorProps) => {
  if (!isVisible) return null;

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const getStepIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'running':
        return 'text-blue-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Processing...</span>
          <span className="text-sm text-gray-500">
            {completedSteps}/{totalSteps} steps
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3">
            {getStepIcon(step.status)}
            <div className="flex-1">
              <div className={`text-sm font-medium ${getStepColor(step.status)}`}>
                {step.label}
              </div>
              {step.message && (
                <div className="text-xs text-gray-600 mt-1">
                  {step.message}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
