
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Medication {
  id: string;
  med_name: string;
  dosage: string;
  schedule: string;
  start_date: string;
  end_date?: string;
}

export const useNotificationScheduler = () => {
  const { toast } = useToast();

  // Mock notification scheduling for now
  // In a real app, this would integrate with native notifications
  const scheduleNotifications = async (medication: Medication) => {
    try {
      const times = medication.schedule.split(',').map(t => t.trim());
      
      console.log(`Scheduling notifications for ${medication.med_name} at times:`, times);
      
      // Here you would schedule local notifications
      // For now, we'll just log and show a toast
      toast({
        title: "Notifications Scheduled",
        description: `Reminders set for ${medication.med_name} at ${times.join(', ')}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      return false;
    }
  };

  const cancelNotifications = async (medicationId: string) => {
    try {
      console.log(`Canceling notifications for medication ${medicationId}`);
      
      // Here you would cancel existing notifications
      // For now, we'll just log
      
      return true;
    } catch (error) {
      console.error('Error canceling notifications:', error);
      return false;
    }
  };

  const markMedicationTaken = async (medicationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('med_intake_logs')
        .insert({
          user_id: user.id,
          med_id: medicationId,
          taken_at: new Date().toISOString(),
          was_missed: false
        });

      if (error) throw error;

      toast({
        title: "Dose Recorded",
        description: "Your medication has been marked as taken.",
      });

      return true;
    } catch (error) {
      console.error('Error recording medication intake:', error);
      toast({
        title: "Error",
        description: "Failed to record medication intake.",
        variant: "destructive"
      });
      return false;
    }
  };

  const markMedicationMissed = async (medicationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('med_intake_logs')
        .insert({
          user_id: user.id,
          med_id: medicationId,
          taken_at: new Date().toISOString(),
          was_missed: true
        });

      if (error) throw error;

      console.log('Medication marked as missed');
      return true;
    } catch (error) {
      console.error('Error recording missed medication:', error);
      return false;
    }
  };

  return {
    scheduleNotifications,
    cancelNotifications,
    markMedicationTaken,
    markMedicationMissed
  };
};
