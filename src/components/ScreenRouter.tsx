
import React from 'react';
import Dashboard from './Dashboard';
import MedicationsScreen from './MedicationsScreen';
import HealthDataScreen from './HealthDataScreen';
import DocumentsScreen from './DocumentsScreen';
import DataStreamsScreen from './DataStreamsScreen';
import SettingsScreen from './SettingsScreen';
import GuardianScreen from './GuardianScreen';
import Support from '@/pages/Support';
import { TrustedCircleScreen } from './TrustedCircleScreen';
import TestingPanel from './TestingPanel';

interface UserData {
  firstName: string;
  email: string;
  biometricConsent: boolean;
}

interface ScreenRouterProps {
  currentScreen: string;
  userData?: UserData;
  onSignOut?: () => void;
  onNavigate?: (screen: string) => void;
}

const ScreenRouter: React.FC<ScreenRouterProps> = ({ 
  currentScreen,
  userData,
  onSignOut,
  onNavigate
}) => {
  const handleBack = () => {
    if (onNavigate) {
      onNavigate('dashboard');
    }
  };

  // Default values for required props
  const defaultUserData = userData || { firstName: '', email: '', biometricConsent: false };
  const defaultOnSignOut = onSignOut || (() => {});

  switch (currentScreen) {
    case 'dashboard':
      return (
        <Dashboard 
          userData={defaultUserData}
          onSignOut={defaultOnSignOut}
          onNavigate={onNavigate}
        />
      );
    case 'medications':
      return (
        <MedicationsScreen 
          onBack={handleBack}
          showAddModal={false}
          onCloseAddModal={() => {}}
          onOpenAddModal={() => {}}
        />
      );
    case 'health-data':
    case 'health':
      return (
        <HealthDataScreen 
          onBack={handleBack}
          showAddMedicationModal={false}
          onCloseAddMedicationModal={() => {}}
          onOpenAddMedicationModal={() => {}}
          showAddDocumentModal={false}
          onCloseAddDocumentModal={() => {}}
          onOpenAddDocumentModal={() => {}}
        />
      );
    case 'documents':
      return (
        <DocumentsScreen 
          onBack={handleBack}
          showAddModal={false}
          onCloseAddModal={() => {}}
          onOpenAddModal={() => {}}
        />
      );
    case 'data-streams':
      return (
        <DataStreamsScreen
          preferences={{ collect_sleep: true, collect_activity: true, collect_screen: true }}
          isSaving={false}
          onUpdatePreference={() => {}}
          onBack={handleBack}
        />
      );
    case 'settings':
      return <SettingsScreen onBack={handleBack} />;
    case 'guardian':
      return <GuardianScreen onBack={handleBack} />;
    case 'support':
      return <Support />;
    case 'trusted-circle':
      return <TrustedCircleScreen />;
    case 'testing':
      return <TestingPanel />;
    default:
      return (
        <Dashboard 
          userData={defaultUserData}
          onSignOut={defaultOnSignOut}
          onNavigate={onNavigate}
        />
      );
  }
};

export default ScreenRouter;
