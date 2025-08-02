
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  id: string;
  user_id: string;
  document_id?: string;
  validation_type: string;
  accuracy_score: number;
  confidence_level: number;
  validation_details: any;
  created_at: string;
}

export function useValidationResults() {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Not authenticated');
          setIsLoading(false);
          return;
        }

        // For now, return empty results since we don't have the table yet
        // This prevents errors in the accuracy metrics components
        setResults([]);
        setError(null);
      } catch (err) {
        console.error('Error fetching validation results:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
      
      setIsLoading(false);
    }

    fetchResults();
  }, []);

  return { results, isLoading, error };
}
