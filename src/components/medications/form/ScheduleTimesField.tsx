
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from 'lucide-react';

interface ScheduleTimesFieldProps {
  times: string[];
  onTimesChange: (times: string[]) => void;
}

const ScheduleTimesField = ({ times, onTimesChange }: ScheduleTimesFieldProps) => {
  const addTimeSlot = () => {
    onTimesChange([...times, '']);
  };

  const removeTimeSlot = (index: number) => {
    if (times.length > 1) {
      onTimesChange(times.filter((_, i) => i !== index));
    }
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    onTimesChange(newTimes);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">Schedule Times</Label>
      <div className="space-y-3">
        {times.map((time, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Input
              type="time"
              value={time}
              onChange={(e) => updateTime(index, e.target.value)}
              className="flex-1 h-12"
              required
            />
            {times.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTimeSlot(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-12 w-12 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTimeSlot}
          className="w-full h-12 text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Time
        </Button>
      </div>
    </div>
  );
};

export default ScheduleTimesField;
