
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DosageFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const DosageField = ({ value, onChange }: DosageFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="dosage" className="text-sm font-medium text-gray-700">
        Dosage
      </Label>
      <Input
        id="dosage"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., 300 mg, 50 mg"
        required
        className="h-12"
      />
    </div>
  );
};

export default DosageField;
