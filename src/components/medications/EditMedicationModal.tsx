
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface Medication {
  id: string;
  med_name: string;
  dosage: string;
  schedule: string;
  start_date: string;
  end_date?: string;
}

interface EditMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    med_name: string;
    dosage: string;
    schedule: string;
    start_date: string;
  }) => void;
  medication: Medication;
}

const EditMedicationModal = ({ isOpen, onClose, onSubmit, medication }: EditMedicationModalProps) => {
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [times, setTimes] = useState<string[]>(['']);

  // Initialize form with medication data
  useEffect(() => {
    if (medication) {
      setMedName(medication.med_name);
      setDosage(medication.dosage);
      setStartDate(new Date(medication.start_date));
      
      // Parse schedule times
      const scheduleTimes = medication.schedule.split(',').map(t => t.trim());
      setTimes(scheduleTimes.length > 0 ? scheduleTimes : ['']);
    }
  }, [medication]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medName.trim() || !dosage.trim() || !startDate || times.some(t => !t.trim())) {
      return;
    }

    const schedule = times.filter(t => t.trim()).join(', ');
    
    onSubmit({
      med_name: medName.trim(),
      dosage: dosage.trim(),
      schedule,
      start_date: format(startDate, 'yyyy-MM-dd')
    });
  };

  const addTimeSlot = () => {
    setTimes([...times, '']);
  };

  const removeTimeSlot = (index: number) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
    }
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Medication</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="med_name">Medication Name</Label>
            <Input
              id="med_name"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="e.g., Lithium, Sertraline"
              required
            />
          </div>

          <div>
            <Label htmlFor="dosage">Dosage</Label>
            <Input
              id="dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 300 mg, 50 mg"
              required
            />
          </div>

          <div>
            <Label>Schedule Times</Label>
            <div className="space-y-2">
              {times.map((time, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(index, e.target.value)}
                    className="flex-1"
                    required
                  />
                  {times.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTimeSlot}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Time
              </Button>
            </div>
          </div>

          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!medName.trim() || !dosage.trim() || !startDate || times.some(t => !t.trim())}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMedicationModal;
