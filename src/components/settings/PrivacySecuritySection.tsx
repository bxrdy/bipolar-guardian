
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import SecurityDashboard from "@/components/security/SecurityDashboard";
import SecurityStatusWidget from "@/components/security/SecurityStatusWidget";

interface PrivacySecuritySectionProps {
  isBiometricSupported: boolean;
  isBiometricEnabled: boolean;
  isExporting: boolean;
  onBiometricToggle: (enabled: boolean) => void;
  onViewPrivacyPolicy: () => void;
  onViewTermsOfService: () => void;
  onExportData: () => void;
}

const PrivacySecuritySection = ({
  isBiometricSupported,
  isBiometricEnabled,
  isExporting,
  onBiometricToggle,
  onViewPrivacyPolicy,
  onViewTermsOfService,
  onExportData
}: PrivacySecuritySectionProps) => {
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-gray-900">Privacy & Security</CardTitle>
        <CardDescription>
          Manage your data privacy preferences and security settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Status Overview - temporarily hidden
        <SecurityStatusWidget 
          onOpenDashboard={() => setShowSecurityDashboard(true)}
          compact={false}
        />
        */}

        {/* Biometric Unlock Toggle */}
        {isBiometricSupported && (
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600">👆</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Biometric Unlock</h3>
                <p className="text-sm text-gray-600">Use Face ID or fingerprint to unlock</p>
              </div>
            </div>
            <button
              onClick={() => onBiometricToggle(!isBiometricEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isBiometricEnabled ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isBiometricEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        <div className="space-y-4">
          {/* Security Audit Dashboard - temporarily hidden
          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={() => setShowSecurityDashboard(true)}
          >
            <span className="mr-3">🛡️</span>
            <div className="text-left flex-1">
              <div className="font-medium">Security Audit Dashboard</div>
              <div className="text-xs text-gray-500">Monitor authentication events and security status</div>
            </div>
          </Button>
          */}

          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={onViewPrivacyPolicy}
          >
            <span className="mr-3">👁️</span>
            <div className="text-left flex-1">
              <div className="font-medium">Privacy Policy</div>
              <div className="text-xs text-gray-500">Learn how we protect your data</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={onViewTermsOfService}
          >
            <span className="mr-3">📄</span>
            <div className="text-left flex-1">
              <div className="font-medium">Terms of Service</div>
              <div className="text-xs text-gray-500">Review our terms and conditions</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={onExportData}
            disabled={isExporting}
          >
            <span className="mr-3">💾</span>
            <div className="text-left flex-1">
              <div className="font-medium">
                {isExporting ? 'Exporting...' : 'Download My Data'}
              </div>
              <div className="text-xs text-gray-500">Export all your collected data</div>
            </div>
          </Button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-medium text-gray-900 mb-2">Data Retention</h4>
          <p className="text-sm text-gray-600">
            Your data is stored securely and only used for mood analysis. You can request deletion at any time.
          </p>
        </div>
      </CardContent>
      
      {/* Security Dashboard Modal */}
      <SecurityDashboard 
        isOpen={showSecurityDashboard}
        onOpenChange={setShowSecurityDashboard}
      />
    </Card>
  );
};

export default PrivacySecuritySection;
