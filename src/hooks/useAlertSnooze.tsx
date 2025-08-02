
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAlertSnooze = (isOpen: boolean) => {
  const [isAlertsSnoozed, setIsAlertsSnoozed] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check snooze status when hook is used
  useEffect(() => {
    if (isOpen) {
      checkSnoozeStatus();
    }
  }, [isOpen]);

  const checkSnoozeStatus = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) return;

      const { data: alertSettings } = await supabase
        .from('alert_settings')
        .select('alert_snooze_until')
        .eq('user_id', user.id)
        .single();

      if (alertSettings?.alert_snooze_until) {
        const snoozeDate = new Date(alertSettings.alert_snooze_until);
        const now = new Date();
        
        if (snoozeDate > now) {
          setIsAlertsSnoozed(true);
          setSnoozeUntil(snoozeDate);
        } else {
          setIsAlertsSnoozed(false);
          setSnoozeUntil(null);
        }
      } else {
        setIsAlertsSnoozed(false);
        setSnoozeUntil(null);
      }
    } catch (error) {
      console.error('Error checking snooze status:', error);
    }
  };

  const handleSnoozeToggle = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error('Please log in to manage alerts');
        return false;
      }

      // Check if user already has alert settings
      const { data: existingSettings } = await supabase
        .from('alert_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (isAlertsSnoozed) {
        // Unsnooze - set to null
        if (existingSettings) {
          // Update existing record
          const { error } = await supabase
            .from('alert_settings')
            .update({
              alert_snooze_until: null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (error) {
            console.error('Error unsnoozing alerts:', error);
            toast.error('Failed to unsnooze alerts');
            return false;
          }
        }

        setIsAlertsSnoozed(false);
        setSnoozeUntil(null);
        toast.success('Alerts resumed');
        return true;
      } else {
        // Snooze for 24 hours
        const snoozeUntilDate = new Date();
        snoozeUntilDate.setHours(snoozeUntilDate.getHours() + 24);

        if (existingSettings) {
          // Update existing record
          const { error } = await supabase
            .from('alert_settings')
            .update({
              alert_snooze_until: snoozeUntilDate.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (error) {
            console.error('Error snoozing alerts:', error);
            toast.error('Failed to snooze alerts');
            return false;
          }
        } else {
          // Create new record
          const { error } = await supabase
            .from('alert_settings')
            .insert({
              user_id: user.id,
              alert_snooze_until: snoozeUntilDate.toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) {
            console.error('Error creating alert settings:', error);
            toast.error('Failed to snooze alerts');
            return false;
          }
        }

        setIsAlertsSnoozed(true);
        setSnoozeUntil(snoozeUntilDate);
        toast.success('Alerts snoozed for 24 hours');
        return true;
      }
    } catch (error) {
      console.error('Error managing alerts:', error);
      toast.error('Failed to update alert settings');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const formatSnoozeTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return {
    isAlertsSnoozed,
    snoozeUntil,
    isLoading,
    handleSnoozeToggle,
    formatSnoozeTime
  };
};
