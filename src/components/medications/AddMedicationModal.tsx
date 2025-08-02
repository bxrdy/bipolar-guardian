
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
  MobileDialogBody,
  MobileDialogFooter,
} from "@/components/ui/mobile-dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import MedicationForm, { MedicationFormRef } from './form/MedicationForm';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    med_name: string;
    dosage: string;
    schedule: string;
    start_date: string;
  }) => void;
}

const AddMedicationModal = ({ isOpen, onClose, onSubmit }: AddMedicationModalProps) => {
  const formRef = useRef<MedicationFormRef>(null);
  const isMobile = useIsMobile();

  const handleFormSubmit = (data: {
    med_name: string;
    dosage: string;
    schedule: string;
    start_date: string;
  }) => {
    onSubmit(data);
    onClose();
  };

  const handleAddMedicationClick = () => {
    if (formRef.current && formRef.current.isValid()) {
      formRef.current.submit();
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <MobileDialog open={isOpen} onOpenChange={handleClose}>
      <MobileDialogContent className={cn(isMobile ? "w-[calc(100vw-2rem)]" : "max-w-2xl w-full")}>
        <MobileDialogHeader className="pb-6">
          <MobileDialogTitle className="text-xl font-semibold">Add Medication</MobileDialogTitle>
        </MobileDialogHeader>
        
        <MobileDialogBody className="px-6 py-2">
          <MedicationForm ref={formRef} onSubmit={handleFormSubmit} onReset={() => {}} />
        </MobileDialogBody>

        <MobileDialogFooter className="pt-6 space-y-3 sm:space-y-0 sm:space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            className="w-full sm:w-auto h-12 text-sm font-medium"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddMedicationClick}
            className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto h-12 text-sm font-medium"
          >
            Add Medication
          </Button>
        </MobileDialogFooter>
      </MobileDialogContent>
    </MobileDialog>
  );
};

export default AddMedicationModal;
