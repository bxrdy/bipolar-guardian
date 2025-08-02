
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Play, CheckCircle } from 'lucide-react';
import { toast } from "sonner";

interface QuickStartSectionProps {
  onGenerateRealisticData: () => void;
  onGenerateOutlierData: () => void;
  isLoading: boolean;
}

const QuickStartSection = ({ onGenerateRealisticData, onGenerateOutlierData, isLoading }: QuickStartSectionProps) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps = [
    {
      id: 'realistic-data',
      title: 'Generate 30 Days of Realistic Data',
      description: 'Creates a complete dataset with normal patterns',
      action: () => {
        onGenerateRealisticData();
        setCompletedSteps(prev => new Set([...prev, 'realistic-data']));
      }
    },
    {
      id: 'outlier-data',
      title: 'Test with Outlier Data',
      description: 'Generates concerning data patterns to test risk detection',
      action: () => {
        onGenerateOutlierData();
        setCompletedSteps(prev => new Set([...prev, 'outlier-data']));
      }
    }
  ];

  const allStepsCompleted = steps.every(step => completedSteps.has(step.id));

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Rocket className="w-5 h-5" />
          Quick Start
          {allStepsCompleted && (
            <Badge variant="default" className="bg-green-100 text-green-700">
              Complete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-blue-600 mb-4">
          Get started quickly with these recommended actions:
        </p>
        
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
              {completedSteps.has(step.id) ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                index + 1
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{step.title}</h4>
              <p className="text-xs text-gray-600">{step.description}</p>
            </div>
            <Button
              onClick={step.action}
              disabled={isLoading || completedSteps.has(step.id)}
              size="sm"
              variant={completedSteps.has(step.id) ? "outline" : "default"}
            >
              {completedSteps.has(step.id) ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Done
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Run
                </>
              )}
            </Button>
          </div>
        ))}

        {allStepsCompleted && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              🎉 Great! You've completed the quick start setup. Your app now has realistic data and you've tested the risk detection system.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickStartSection;
