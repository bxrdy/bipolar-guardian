
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import MedicationForm, { MedicationFormRef } from './form/MedicationForm';

interface AddMedicationScreenProps {
  onBack: () => void;
  onSubmit: (data: {
    med_name: string;
    dosage: string;
    schedule: string;
    start_date: string;
  }) => void;
}

const AddMedicationScreen = ({ onBack, onSubmit }: AddMedicationScreenProps) => {
  const formRef = useRef<MedicationFormRef>(null);

  const handleFormSubmit = (data: {
    med_name: string;
    dosage: string;
    schedule: string;
    start_date: string;
  }) => {
    onSubmit(data);
    onBack();
  };

  const handleAddMedicationClick = () => {
    if (formRef.current && formRef.current.isValid()) {
      formRef.current.submit();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mr-4 p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Add Medication</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
            <MedicationForm ref={formRef} onSubmit={handleFormSubmit} onReset={() => {}} />
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 space-y-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack} 
          className="w-full h-12 text-sm font-medium"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleAddMedicationClick}
          className="bg-purple-600 hover:bg-purple-700 w-full h-12 text-sm font-medium"
        >
          Add Medication
        </Button>
      </div>
    </div>
  );
};

export default AddMedicationScreen;
