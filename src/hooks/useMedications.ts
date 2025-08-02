
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Medication {
  id: string;
  med_name: string;
  dosage: string;
  schedule: string;
  start_date: string;
  end_date?: string;
  created_at: string;
}

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMedications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMedications([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching medications:', error);
        toast({
          title: "Error",
          description: "Failed to load medications",
          variant: "destructive"
        });
        return;
      }

      setMedications(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const refetch = () => {
    setIsLoading(true);
    fetchMedications();
  };

  return {
    medications,
    isLoading,
    refetch,
    fetchMedications
  };
};
