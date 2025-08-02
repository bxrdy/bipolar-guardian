
import { Slider } from "@/components/ui/slider";

interface AdditionalMetricsProps {
  energy: number;
  stress: number;
  anxiety: number;
  onEnergyChange: (value: number) => void;
  onStressChange: (value: number) => void;
  onAnxietyChange: (value: number) => void;
}

const AdditionalMetrics = ({
  energy,
  stress,
  anxiety,
  onEnergyChange,
  onStressChange,
  onAnxietyChange
}: AdditionalMetricsProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Additional Details
      </h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700">
              Energy Level
            </label>
            <span className="text-sm text-gray-500">
              {energy === 1 ? 'Very Low' : 
               energy === 2 ? 'Low' : 
               energy === 3 ? 'Moderate' : 
               energy === 4 ? 'High' : 'Very High'}
            </span>
          </div>
          <Slider
            value={[energy]}
            onValueChange={(value) => onEnergyChange(value[0])}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Very Low</span>
            <span>Very High</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700">
              Stress Level
            </label>
            <span className="text-sm text-gray-500">
              {stress === 1 ? 'Very Low' : 
               stress === 2 ? 'Low' : 
               stress === 3 ? 'Moderate' : 
               stress === 4 ? 'High' : 'Very High'}
            </span>
          </div>
          <Slider
            value={[stress]}
            onValueChange={(value) => onStressChange(value[0])}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Very Low</span>
            <span>Very High</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700">
              Anxiety Level
            </label>
            <span className="text-sm text-gray-500">
              {anxiety === 1 ? 'Very Low' : 
               anxiety === 2 ? 'Low' : 
               anxiety === 3 ? 'Moderate' : 
               anxiety === 4 ? 'High' : 'Very High'}
            </span>
          </div>
          <Slider
            value={[anxiety]}
            onValueChange={(value) => onAnxietyChange(value[0])}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Very Low</span>
            <span>Very High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalMetrics;
