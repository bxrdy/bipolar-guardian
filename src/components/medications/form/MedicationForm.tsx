
import { useState, forwardRef, useImperativeHandle } from 'react';
import { format } from 'date-fns';
import MedicationNameField from './MedicationNameField';
import DosageField from './DosageField';
import ScheduleTimesField from './ScheduleTimesField';
import StartDateField from './StartDateField';

interface MedicationFormData {
  med_name: string;
  dosage: string;
  schedule: string;
  start_date: string;
}

interface MedicationFormProps {
  onSubmit: (data: MedicationFormData) => void;
  onReset: () => void;
}

export interface MedicationFormRef {
  submit: () => void;
  isValid: () => boolean;
}

const MedicationForm = forwardRef<MedicationFormRef, MedicationFormProps>(
  ({ onSubmit, onReset }, ref) => {
    const [medName, setMedName] = useState('');
    const [dosage, setDosage] = useState('');
    const [startDate, setStartDate] = useState<Date>();
    const [times, setTimes] = useState<string[]>(['']);

    const isFormValid = medName.trim() && dosage.trim() && startDate && !times.some(t => !t.trim());

    const handleSubmit = () => {
      if (!isFormValid) return;

      const schedule = times.filter(t => t.trim()).join(', ');
      
      onSubmit({
        med_name: medName.trim(),
        dosage: dosage.trim(),
        schedule,
        start_date: format(startDate!, 'yyyy-MM-dd')
      });

      // Reset form
      setMedName('');
      setDosage('');
      setStartDate(undefined);
      setTimes(['']);
      onReset();
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      isValid: () => isFormValid
    }));

    return (
      <div className="space-y-6">
        <MedicationNameField value={medName} onChange={setMedName} />
        <DosageField value={dosage} onChange={setDosage} />
        <ScheduleTimesField times={times} onTimesChange={setTimes} />
        <StartDateField value={startDate} onChange={setStartDate} />
      </div>
    );
  }
);

MedicationForm.displayName = 'MedicationForm';

export default MedicationForm;
