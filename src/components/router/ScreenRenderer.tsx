
import React from 'react';
import Dashboard from '@/components/Dashboard';
import OnboardingStep1 from '@/components/OnboardingStep1';
import OnboardingStep2 from '@/components/OnboardingStep2';
import OnboardingStep3 from '@/components/OnboardingStep3';
import SettingsScreen from '@/components/SettingsScreen';
import DataStreamsScreen from '@/components/DataStreamsScreen';
import HealthDataScreen from '@/components/HealthDataScreen';
import MedicationsScreen from '@/components/MedicationsScreen';
import GuardianScreen from '@/components/GuardianScreen';

type Screen = 'login' | 'onboarding-step1' | 'onboarding-step2' | 'onboarding-step3' | 'dashboard' | 'data-streams' | 'health-data' | 'settings' | 'medications' | 'guardian';

interface UserData {
  firstName: string;
  email: string;
  biometricConsent: boolean;
}

interface DataStreamPreferences {
  collect_sleep: boolean;
  collect_activity: boolean;
  collect_screen: boolean;
  [key: string]: boolean;
}

interface ScreenRendererProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  userData: UserData;
  setUserData: (data: UserData | ((prev: UserData) => UserData)) => void;
  handleSignOut: () => Promise<void>;
  preferences: DataStreamPreferences;
  isSaving: boolean;
  updatePreference: (key: string, value: boolean) => void;
  showAddMedicationModal: boolean;
  setShowAddMedicationModal: (show: boolean) => void;
  showAddDocumentModal: boolean;
  setShowAddDocumentModal: (show: boolean) => void;
}

const ScreenRenderer = ({
  currentScreen,
  setCurrentScreen,
  userData,
  setUserData,
  handleSignOut,
  preferences,
  isSaving,
  updatePreference,
  showAddMedicationModal,
  setShowAddMedicationModal,
  showAddDocumentModal,
  setShowAddDocumentModal
}: ScreenRendererProps) => {
  switch (currentScreen) {
    case 'onboarding-step1':
      return (
        <OnboardingStep1 
          onNext={(data) => {
            setUserData(prev => ({ ...prev, firstName: data.firstName }));
            setCurrentScreen('onboarding-step2');
          }} 
        />
      );
    case 'onboarding-step2':
      return (
        <OnboardingStep2 
          onNext={(data) => {
            setUserData(prev => ({ ...prev, email: data.email }));
            setCurrentScreen('onboarding-step3');
          }}
          userData={userData}
        />
      );
    case 'onboarding-step3':
      return (
        <OnboardingStep3 
          onNext={(data) => {
            setUserData(prev => ({ ...prev, biometricConsent: data.biometricConsent }));
            setCurrentScreen('dashboard');
          }}
          onSkip={() => setCurrentScreen('dashboard')}
        />
      );
    case 'data-streams':
      return (
        <DataStreamsScreen
          preferences={preferences}
          isSaving={isSaving}
          onUpdatePreference={updatePreference}
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    case 'health-data':
      return (
        <HealthDataScreen
          onBack={() => setCurrentScreen('dashboard')}
          showAddMedicationModal={showAddMedicationModal}
          onCloseAddMedicationModal={() => setShowAddMedicationModal(false)}
          onOpenAddMedicationModal={() => setShowAddMedicationModal(true)}
          showAddDocumentModal={showAddDocumentModal}
          onCloseAddDocumentModal={() => setShowAddDocumentModal(false)}
          onOpenAddDocumentModal={() => setShowAddDocumentModal(true)}
        />
      );
    case 'medications':
      return (
        <MedicationsScreen
          onBack={() => setCurrentScreen('health-data')}
          showAddModal={showAddMedicationModal}
          onCloseAddModal={() => setShowAddMedicationModal(false)}
          onOpenAddModal={() => setShowAddMedicationModal(true)}
        />
      );
    case 'guardian':
      return (
        <GuardianScreen
          onBack={() => setCurrentScreen('dashboard')}
        />
      );
    case 'settings':
      return <SettingsScreen onBack={() => setCurrentScreen('dashboard')} />;
    case 'dashboard':
    default:
      return (
        <Dashboard 
          userData={userData}
          onSignOut={handleSignOut}
          onNavigate={setCurrentScreen}
        />
      );
  }
};

export default ScreenRenderer;
