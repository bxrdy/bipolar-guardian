
import { Button } from "@/components/ui/button";

interface DataGenerationActionsProps {
  isLoading: boolean;
  onGenerateSensorData: (metricType: string, value: number) => void;
  onGenerateHistoricalData: () => void;
  onGenerate30DaysData: () => void;
  onGenerateOutlierData: () => void;
}

const DataGenerationActions = ({
  isLoading,
  onGenerateSensorData,
  onGenerateHistoricalData,
  onGenerate30DaysData,
  onGenerateOutlierData
}: DataGenerationActionsProps) => {
  return (
    <div className="space-y-3">
      {/* Basic Test Data */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-600">Basic Test Data</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onGenerateSensorData('sleep_hours', 8)}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            8h Sleep
          </Button>
          
          <Button
            onClick={() => onGenerateSensorData('steps', 8500)}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            8500 Steps
          </Button>
          
          <Button
            onClick={() => onGenerateSensorData('unlocks', 45)}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            45 Unlocks
          </Button>
          
          <Button
            onClick={() => onGenerateSensorData('activity_level', 0.75)}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            0.75 Activity
          </Button>
        </div>
      </div>

      {/* Historical Data */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-600">Historical Data</h4>
        <Button
          onClick={onGenerateHistoricalData}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Generate 10 Additional Days
        </Button>
      </div>

      {/* Realistic 30-Day Data */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-600">Complete Dataset</h4>
        <Button
          onClick={onGenerate30DaysData}
          disabled={isLoading}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          Generate 30 Days Realistic Data
        </Button>
      </div>

      {/* Outlier Data */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-600">Risk Testing</h4>
        <Button
          onClick={onGenerateOutlierData}
          disabled={isLoading}
          variant="destructive"
          size="sm"
          className="w-full"
        >
          Generate Outlier Day (Low Sleep)
        </Button>
      </div>
    </div>
  );
};

export default DataGenerationActions;
