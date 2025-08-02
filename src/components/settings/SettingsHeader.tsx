
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

interface SettingsHeaderProps {
  viewMode: 'settings' | 'privacy-policy' | 'terms-of-service' | 'medications' | 'documents';
  onBack: () => void;
  onBackToSettings: () => void;
  onAddMedication?: () => void;
  onAddDocument?: () => void;
  medicationsCount?: number;
  documentsCount?: number;
}

const SettingsHeader = ({ 
  viewMode, 
  onBack, 
  onBackToSettings, 
  onAddMedication, 
  onAddDocument,
  medicationsCount = 0,
  documentsCount = 0 
}: SettingsHeaderProps) => {
  const isMobile = useIsMobile();

  const getTitle = () => {
    switch (viewMode) {
      case 'privacy-policy':
        return 'Privacy Policy';
      case 'terms-of-service':
        return 'Terms of Service';
      case 'medications':
        return 'Medications';
      case 'documents':
        return 'My Documents';
      default:
        return 'Settings';
    }
  };

  // Show Add button when there are existing items or we're in the respective view
  const showAddMedicationButton = viewMode === 'medications' && onAddMedication && medicationsCount > 0;
  const showAddDocumentButton = viewMode === 'documents' && onAddDocument && documentsCount > 0;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 h-[73px] flex items-center">
      <div className="flex items-center justify-between min-w-0 w-full">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            onClick={viewMode === 'settings' ? onBack : onBackToSettings}
            className="p-2 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="transition-all duration-300 min-w-0 flex-1">
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 truncate`}>
              {getTitle()}
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0">
          {showAddMedicationButton && (
            <Button
              onClick={onAddMedication}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          )}
          {showAddDocumentButton && (
            <Button
              onClick={onAddDocument}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsHeader;
