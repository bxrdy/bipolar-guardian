
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Fingerprint, Shield, X } from 'lucide-react';

interface OnboardingStep3Props {
  onNext: (data: { biometricConsent: boolean }) => void;
  onSkip: () => void;
}

const OnboardingStep3 = ({ onNext, onSkip }: OnboardingStep3Props) => {
  const [consent, setConsent] = useState<boolean | null>(null);

  const handleAllow = () => {
    setConsent(true);
    onNext({ biometricConsent: true });
  };

  const handleDeny = () => {
    setConsent(false);
    onNext({ biometricConsent: false });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12">
      <div className="max-w-md mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg">
            <Fingerprint className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Secure Your Data
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Enable biometric authentication to keep your personal mood data private and secure
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-gray-200">
            <Shield className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Enhanced Security</h3>
              <p className="text-sm text-gray-600">Your sensitive mood data stays protected with biometric locks</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-gray-200">
            <ArrowRight className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Quick Access</h3>
              <p className="text-sm text-gray-600">Unlock the app instantly with your fingerprint or face</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleAllow}
            className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg transition-all duration-200"
          >
            <Fingerprint className="w-5 h-5 mr-2" />
            Enable Biometric Login
          </Button>
          
          <Button
            onClick={handleDeny}
            variant="outline"
            className="w-full h-14 text-lg rounded-xl border-2 hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5 mr-2" />
            Not Now
          </Button>
        </div>

        {/* Skip option */}
        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            Skip this step
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="w-8 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep3;
