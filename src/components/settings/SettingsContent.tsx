
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PrivacySecuritySection from "./PrivacySecuritySection";
import SettingsFooter from "./SettingsFooter";
import AISettingsSection from "./AISettingsSection";
import { useIsMobile } from '@/hooks/use-mobile';

interface DataStreamPreferences {
  collect_sleep: boolean;
  collect_activity: boolean;
  collect_screen: boolean;
}

interface SettingsContentProps {
  preferences: DataStreamPreferences;
  isSaving: boolean;
  isBiometricSupported: boolean;
  isBiometricEnabled: boolean;
  isExporting: boolean;
  onUpdatePreference: (key: keyof DataStreamPreferences, value: boolean) => void;
  onBiometricToggle: (enabled: boolean) => void;
  onViewPrivacyPolicy: () => void;
  onViewTermsOfService: () => void;
  onExportData: () => void;
  onDeleteAccount: () => void;
  onNavigateToMedications?: () => void;
  onNavigateToDocuments?: () => void;
}

const SettingsContent = ({
  preferences,
  isSaving,
  isBiometricSupported,
  isBiometricEnabled,
  isExporting,
  onUpdatePreference,
  onBiometricToggle,
  onViewPrivacyPolicy,
  onViewTermsOfService,
  onExportData,
  onDeleteAccount,
  onNavigateToMedications,
  onNavigateToDocuments
}: SettingsContentProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();


  return (
    <ScrollArea className="h-full">
      <div className={`px-6 space-y-8 max-w-2xl mx-auto ${isMobile ? 'py-6 pb-24' : 'py-8 pb-20'}`}>
        

        {/* AI Settings Section */}
        <AISettingsSection />

        {/* Privacy & Security Section */}
        <PrivacySecuritySection
          isBiometricSupported={isBiometricSupported}
          isBiometricEnabled={isBiometricEnabled}
          isExporting={isExporting}
          onBiometricToggle={onBiometricToggle}
          onViewPrivacyPolicy={onViewPrivacyPolicy}
          onViewTermsOfService={onViewTermsOfService}
          onExportData={onExportData}
        />

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-200 shadow-sm">
          <h3 className="text-lg font-semibold text-red-900 mb-4">
            Danger Zone
          </h3>
          
          <div className="flex items-center justify-between p-4 bg-red-100 rounded-lg border border-red-300">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">Permanently delete your account and all data</p>
            </div>
            <Button
              onClick={onDeleteAccount}
              variant="destructive"
              size="sm"
            >
              Delete Account
            </Button>
          </div>
        </div>

        {/* Information Footer */}
        <SettingsFooter />
      </div>
    </ScrollArea>
  );
};

export default SettingsContent;
