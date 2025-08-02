
import { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import AddMedicationModal from './medications/AddMedicationModal';
import AddMedicationScreen from './medications/AddMedicationScreen';
import EditMedicationModal from './medications/EditMedicationModal';
import { useMedications } from '@/hooks/useMedications';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';
import { useIsMobile } from '@/hooks/use-mobile';

interface MedicationsScreenProps {
  onBack: () => void;
  showAddModal: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

interface Medication {
  id: string;
  med_name: string;
  dosage: string;
  schedule: string;
  start_date: string;
  end_date?: string;
}

const MedicationsScreen = ({ onBack, showAddModal, onCloseAddModal, onOpenAddModal }: MedicationsScreenProps) => {
  const isMobile = useIsMobile();
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [showAddScreen, setShowAddScreen] = useState(false);
  const { toast } = useToast();
  
  const { medications, isLoading, refetch } = useMedications();
  const { scheduleNotifications, cancelNotifications } = useNotificationScheduler();

  // Handle modal state changes for mobile/desktop difference
  useEffect(() => {
    if (isMobile && showAddModal) {
      setShowAddScreen(true);
      onCloseAddModal();
    }
  }, [showAddModal, isMobile, onCloseAddModal]);

  const handleAddMedication = async (medData: {
    med_name: string;
    dosage: string;
    schedule: string;
    start_date: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medications')
        .insert({
          ...medData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Schedule notifications for this medication
      await scheduleNotifications(data);

      toast({
        title: "Medication Added",
        description: `${medData.med_name} has been added to your medication list.`,
      });

      refetch();
    } catch (error) {
      console.error('Error adding medication:', error);
      toast({
        title: "Error",
        description: "Failed to add medication. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditMedication = async (medData: {
    med_name: string;
    dosage: string;
    schedule: string;
    start_date: string;
  }) => {
    if (!editingMed) return;

    try {
      const { error } = await supabase
        .from('medications')
        .update(medData)
        .eq('id', editingMed.id);

      if (error) throw error;

      // Cancel old notifications and schedule new ones
      await cancelNotifications(editingMed.id);
      const updatedMed = { ...editingMed, ...medData };
      await scheduleNotifications(updatedMed);

      toast({
        title: "Medication Updated",
        description: `${medData.med_name} has been updated.`,
      });

      refetch();
      setEditingMed(null);
    } catch (error) {
      console.error('Error updating medication:', error);
      toast({
        title: "Error",
        description: "Failed to update medication. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMedication = async (medication: Medication) => {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medication.id);

      if (error) throw error;

      // Cancel notifications for this medication
      await cancelNotifications(medication.id);

      toast({
        title: "Medication Deleted",
        description: `${medication.med_name} has been removed from your medication list.`,
      });

      refetch();
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        title: "Error",
        description: "Failed to delete medication. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatSchedule = (schedule: string) => {
    try {
      const times = schedule.split(',').map(t => t.trim());
      return times.join(', ');
    } catch {
      return schedule;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Show full-screen add medication screen on mobile
  if (isMobile && showAddScreen) {
    return (
      <AddMedicationScreen 
        onBack={() => setShowAddScreen(false)}
        onSubmit={handleAddMedication}
      />
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-4 p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Medications</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className={`px-6 py-6 space-y-4 max-w-2xl mx-auto ${isMobile ? 'pb-24' : ''}`}>
            {medications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No medications yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by adding your first medication to track your doses and get reminders.
                </p>
                <Button
                  onClick={isMobile ? () => setShowAddScreen(true) : onOpenAddModal}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Medication
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {medications.map((medication) => (
                  <div
                    key={medication.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {medication.med_name}
                          </h3>
                          <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                            {medication.dosage}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Schedule:</span> {formatSchedule(medication.schedule)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Started:</span> {new Date(medication.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMed(medication)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMedication(medication)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Add Medication Button - Fixed at bottom on mobile */}
      {isMobile && medications.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 mb-20">
          <Button
            onClick={() => setShowAddScreen(true)}
            className="bg-purple-600 hover:bg-purple-700 w-full h-12"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>
      )}

      {/* Modals - Only show on desktop */}
      {!isMobile && (
        <AddMedicationModal
          isOpen={showAddModal}
          onClose={onCloseAddModal}
          onSubmit={handleAddMedication}
        />
      )}

      {editingMed && (
        <EditMedicationModal
          isOpen={!!editingMed}
          onClose={() => setEditingMed(null)}
          onSubmit={handleEditMedication}
          medication={editingMed}
        />
      )}
    </div>
  );
};

export default MedicationsScreen;
