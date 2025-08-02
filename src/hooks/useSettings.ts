import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";

// Types
interface DataStreamPreferences {
  collect_sleep: boolean;
  collect_activity: boolean;
  collect_screen: boolean;
}

type ViewMode = 'settings' | 'privacy-policy' | 'terms-of-service' | 'medications' | 'documents';

interface SettingsState {
  viewMode: ViewMode;
  preferences: DataStreamPreferences;
  isLoading: boolean;
  isSaving: boolean;
  isExporting: boolean;
  showDeleteConfirm: boolean;
  isDeleting: boolean;
  showAddMedicationModal: boolean;
  showAddDocumentModal: boolean;
}

interface SettingsActions {
  setViewMode: (mode: ViewMode) => void;
  updatePreference: (key: keyof DataStreamPreferences, value: boolean) => Promise<void>;
  handleExportData: () => Promise<void>;
  handleDeleteAccount: () => Promise<void>;
  handleBiometricToggle: (enabled: boolean) => Promise<void>;
  handleViewPrivacyPolicy: () => void;
  handleViewTermsOfService: () => void;
  handleNavigateToMedications: () => void;
  handleNavigateToDocuments: () => void;
  handleBackToSettings: () => void;
  handleAddMedication: () => void;
  handleAddDocument: () => void;
  setShowDeleteConfirm: (show: boolean) => void;
  setShowAddMedicationModal: (show: boolean) => void;
  setShowAddDocumentModal: (show: boolean) => void;
}

interface BiometricInfo {
  isBiometricSupported: boolean;
  isBiometricEnabled: boolean;
}

/**
 * Unified settings hook that manages all settings-related state and actions
 * Consolidates previous useSettingsState and useSettingsActions
 */
export const useSettings = () => {
  const { toast } = useToast();
  const {
    isBiometricSupported,
    isBiometricEnabled,
    enableBiometric,
    disableBiometric,
  } = useBiometricAuth();

  // State management
  const [state, setState] = useState<SettingsState>({
    viewMode: 'settings',
    preferences: {
      collect_sleep: true,
      collect_activity: true,
      collect_screen: true
    },
    isLoading: true,
    isSaving: false,
    isExporting: false,
    showDeleteConfirm: false,
    isDeleting: false,
    showAddMedicationModal: false,
    showAddDocumentModal: false
  });

  // Helper to update state
  const updateState = (updates: Partial<SettingsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Data fetching
  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profile')
        .select('collect_sleep, collect_activity, collect_screen')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching preferences:', error);
        toast({
          title: "Error",
          description: "Failed to load data stream preferences",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        updateState({
          preferences: {
            collect_sleep: data.collect_sleep ?? true,
            collect_activity: data.collect_activity ?? true,
            collect_screen: data.collect_screen ?? true
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      updateState({ isLoading: false });
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchPreferences();
  }, []);

  // Actions
  const actions: SettingsActions = {
    setViewMode: (mode: ViewMode) => {
      updateState({ viewMode: mode });
    },

    updatePreference: async (key: keyof DataStreamPreferences, value: boolean) => {
      updateState({ isSaving: true });
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('user_profile')
          .update({ [key]: value })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating preference:', error);
          toast({
            title: "Error",
            description: "Failed to update data stream preference",
            variant: "destructive"
          });
          return;
        }

        updateState({
          preferences: { ...state.preferences, [key]: value }
        });
        
        const streamName = key.replace('collect_', '').replace('_', ' ');
        toast({
          title: "Settings Updated",
          description: `${streamName} data collection ${value ? 'enabled' : 'disabled'}`,
        });

        console.log(`Data collection ${value ? 'enabled' : 'disabled'} for ${streamName}`);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        updateState({ isSaving: false });
      }
    },

    handleExportData: async () => {
      updateState({ isExporting: true });
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Error",
            description: "You must be logged in to export data",
            variant: "destructive"
          });
          return;
        }

        const { data, error } = await supabase.functions.invoke('export-user-data', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          throw error;
        }

        // Create and download the file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Data Exported",
          description: "Your data has been downloaded successfully",
        });
      } catch (error) {
        console.error('Export error:', error);
        toast({
          title: "Export Failed",
          description: "Failed to export your data. Please try again.",
          variant: "destructive"
        });
      } finally {
        updateState({ isExporting: false });
      }
    },

    handleDeleteAccount: async () => {
      updateState({ isDeleting: true });
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Error",
            description: "You must be logged in to delete your account",
            variant: "destructive"
          });
          return;
        }

        const { error } = await supabase.functions.invoke('delete-user-account', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          throw error;
        }

        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted. A confirmation email has been sent.",
        });

        // Sign out the user
        await supabase.auth.signOut();
        
      } catch (error) {
        console.error('Delete account error:', error);
        toast({
          title: "Deletion Failed",
          description: "Failed to delete your account. Please contact support.",
          variant: "destructive"
        });
      } finally {
        updateState({ 
          isDeleting: false, 
          showDeleteConfirm: false 
        });
      }
    },

    handleBiometricToggle: async (enabled: boolean) => {
      if (enabled) {
        await enableBiometric();
      } else {
        disableBiometric();
      }
    },

    // Navigation actions
    handleViewPrivacyPolicy: () => actions.setViewMode('privacy-policy'),
    handleViewTermsOfService: () => actions.setViewMode('terms-of-service'),
    handleNavigateToMedications: () => actions.setViewMode('medications'),
    handleNavigateToDocuments: () => actions.setViewMode('documents'),
    handleBackToSettings: () => actions.setViewMode('settings'),

    // Modal actions
    handleAddMedication: () => updateState({ showAddMedicationModal: true }),
    handleAddDocument: () => updateState({ showAddDocumentModal: true }),
    setShowDeleteConfirm: (show: boolean) => updateState({ showDeleteConfirm: show }),
    setShowAddMedicationModal: (show: boolean) => updateState({ showAddMedicationModal: show }),
    setShowAddDocumentModal: (show: boolean) => updateState({ showAddDocumentModal: show })
  };

  // Biometric info
  const biometric: BiometricInfo = {
    isBiometricSupported,
    isBiometricEnabled
  };

  return {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Biometric info
    ...biometric,
    
    // Utilities
    fetchPreferences
  };
};

// Export individual pieces for backwards compatibility
export type { DataStreamPreferences };
