import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from 'lucide-react';
import DeleteAccountModal from "./DeleteAccountModal";
import PrivacyPolicyContent from "./PrivacyPolicyContent";
import TermsOfServiceContent from "./TermsOfServiceContent";
import SettingsHeader from "./settings/SettingsHeader";
import SettingsContent from "./settings/SettingsContent";
import MedicationsScreen from "./MedicationsScreen";
import DocumentsScreen from "./DocumentsScreen";
import { useSettings } from "@/hooks/useSettings";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const {
    viewMode,
    preferences,
    isLoading,
    isSaving,
    isExporting,
    showDeleteConfirm,
    isDeleting,
    showAddMedicationModal,
    showAddDocumentModal,
    updatePreference,
    isBiometricSupported,
    isBiometricEnabled,
    handleExportData,
    handleDeleteAccount,
    handleBiometricToggle,
    handleViewPrivacyPolicy,
    handleViewTermsOfService,
    handleBackToSettings,
    handleAddMedication,
    handleAddDocument,
    handleNavigateToMedications,
    handleNavigateToDocuments,
    setShowDeleteConfirm,
    setShowAddMedicationModal,
    setShowAddDocumentModal
  } = useSettings();

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <SettingsHeader
          viewMode={viewMode}
          onBack={onBack}
          onBackToSettings={handleBackToSettings}
          onAddMedication={viewMode === 'medications' ? handleAddMedication : undefined}
          onAddDocument={viewMode === 'documents' ? handleAddDocument : undefined}
          medicationsCount={0}
          documentsCount={0}
        />

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'privacy-policy' ? (
            <ScrollArea className="h-full">
              <PrivacyPolicyContent />
            </ScrollArea>
          ) : viewMode === 'terms-of-service' ? (
            <ScrollArea className="h-full">
              <TermsOfServiceContent />
            </ScrollArea>
          ) : viewMode === 'medications' ? (
            <MedicationsScreen 
              onBack={handleBackToSettings}
              showAddModal={showAddMedicationModal}
              onCloseAddModal={() => setShowAddMedicationModal(false)}
              onOpenAddModal={() => setShowAddMedicationModal(true)}
            />
          ) : viewMode === 'documents' ? (
            <DocumentsScreen 
              onBack={handleBackToSettings}
              showAddModal={showAddDocumentModal}
              onCloseAddModal={() => setShowAddDocumentModal(false)}
              onOpenAddModal={() => setShowAddDocumentModal(true)}
            />
          ) : (
            <SettingsContent
              preferences={preferences}
              isSaving={isSaving}
              isBiometricSupported={isBiometricSupported}
              isBiometricEnabled={isBiometricEnabled}
              isExporting={isExporting}
              onUpdatePreference={updatePreference}
              onBiometricToggle={handleBiometricToggle}
              onViewPrivacyPolicy={handleViewPrivacyPolicy}
              onViewTermsOfService={handleViewTermsOfService}
              onExportData={handleExportData}
              onDeleteAccount={() => setShowDeleteConfirm(true)}
              onNavigateToMedications={handleNavigateToMedications}
              onNavigateToDocuments={handleNavigateToDocuments}
            />
          )}
        </div>

        {/* Delete Account Confirmation Modal */}
        <DeleteAccountModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteAccount}
          isDeleting={isDeleting}
        />
      </div>
    </TooltipProvider>
  );
};

export default SettingsScreen;
