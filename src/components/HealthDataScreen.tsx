
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import HealthDataSection from "@/components/settings/HealthDataSection";
import MedicationsScreen from "./MedicationsScreen";
import DocumentsScreen from "./DocumentsScreen";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

type HealthDataView = 'overview' | 'medications' | 'documents';

interface HealthDataScreenProps {
  onNavigateToMedications?: () => void;
  onNavigateToDocuments?: () => void;
  onBack?: () => void;
  showAddMedicationModal: boolean;
  onCloseAddMedicationModal: () => void;
  onOpenAddMedicationModal: () => void;
  showAddDocumentModal: boolean;
  onCloseAddDocumentModal: () => void;
  onOpenAddDocumentModal: () => void;
}

const HealthDataScreen = ({ 
  onBack,
  showAddMedicationModal,
  onCloseAddMedicationModal,
  onOpenAddMedicationModal,
  showAddDocumentModal,
  onCloseAddDocumentModal,
  onOpenAddDocumentModal
}: HealthDataScreenProps) => {
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<HealthDataView>('overview');

  const handleNavigateToMedications = () => {
    setCurrentView('medications');
  };

  const handleNavigateToDocuments = () => {
    setCurrentView('documents');
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
  };

  if (currentView === 'medications') {
    return (
      <MedicationsScreen 
        onBack={handleBackToOverview}
        showAddModal={showAddMedicationModal}
        onCloseAddModal={onCloseAddMedicationModal}
        onOpenAddModal={onOpenAddMedicationModal}
      />
    );
  }

  if (currentView === 'documents') {
    return (
      <DocumentsScreen 
        onBack={handleBackToOverview}
        showAddModal={showAddDocumentModal}
        onCloseAddModal={onCloseAddDocumentModal}
        onOpenAddModal={onOpenAddDocumentModal}
      />
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex flex-col overflow-hidden">
      {/* Header - Only show on mobile or when onBack is provided */}
      {(isMobile || onBack) && (
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 h-[73px] flex items-center">
          <div className="flex items-center justify-between min-w-0 w-full">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {onBack && (
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="p-2 flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className="transition-all duration-300 min-w-0 flex-1">
                <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 truncate`}>Health Data</h1>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className={`px-6 space-y-8 max-w-2xl mx-auto ${isMobile ? 'py-6 pb-24' : 'py-8'}`}>
            <HealthDataSection
              onNavigateToMedications={handleNavigateToMedications}
              onNavigateToDocuments={handleNavigateToDocuments}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default HealthDataScreen;
