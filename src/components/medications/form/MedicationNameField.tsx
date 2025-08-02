
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MedicationNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const MedicationNameField = ({ value, onChange }: MedicationNameFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="med_name" className="text-sm font-medium text-gray-700">
        Medication Name
      </Label>
      <Input
        id="med_name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Lithium, Sertraline"
        required
        className="h-12"
      />
    </div>
  );
};

export default MedicationNameField;
