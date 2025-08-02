
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useAIInsights = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  // Get feature flag status
  const { data: featureFlags, isLoading: flagsLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('ai_context_enabled')
        .single();
      
      if (error && error.code !== 'PGRST116') { // Not found error is ok for new users
        console.error('Error fetching feature flags:', error);
        return { ai_context_enabled: false };
      }
      
      const result = data || { ai_context_enabled: false };
      console.log('Feature flags loaded:', result);
      return result;
    }
  });

  // Get user's medical insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['ai-medical-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profile')
        .select('ai_medical_summary, ai_insights_generated_at')
        .single();
      
      if (error) {
        console.error('Error fetching medical insights:', error);
        return null;
      }
      
      console.log('Medical insights loaded:', data);
      return data;
    },
    enabled: true // Always fetch insights, not just when AI context is enabled
  });

  // Toggle AI context feature - Fixed to properly handle both enable and disable
  const toggleAIContext = useMutation({
    mutationFn: async (enabled: boolean) => {
      console.log('Toggling AI context to:', enabled);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, check if a feature flags record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('feature_flags')
        .select('id, ai_context_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing feature flags:', checkError);
        throw checkError;
      }

      let result;
      if (existingRecord) {
        // Record exists, update it
        console.log('Updating existing feature flag record');
        const { error: updateError } = await supabase
          .from('feature_flags')
          .update({ ai_context_enabled: enabled })
          .eq('user_id', user.id);
        
        if (updateError) {
          console.error('Error updating feature flags:', updateError);
          throw updateError;
        }
        result = enabled;
      } else {
        // Record doesn't exist, create it
        console.log('Creating new feature flag record');
        const { error: insertError } = await supabase
          .from('feature_flags')
          .insert({ 
            user_id: user.id,
            ai_context_enabled: enabled 
          });
        
        if (insertError) {
          console.error('Error inserting feature flags:', insertError);
          throw insertError;
        }
        result = enabled;
      }
      
      console.log('Successfully toggled AI context to:', result);
      return result;
    },
    onSuccess: (enabled) => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success(
        enabled 
          ? 'AI medical context enabled' 
          : 'AI medical context disabled'
      );
    },
    onError: (error) => {
      console.error('Error toggling AI context:', error);
      toast.error('Failed to update AI context setting');
    }
  });

  // Generate personal insights
  const generateInsights = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-personal-insights');
      
      if (error) {
        throw error;
      }
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to generate insights');
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-medical-insights'] });
      toast.success('Medical insights generated successfully');
      console.log('Generated insights:', data.insights);
    },
    onError: (error: any) => {
      console.error('Error generating insights:', error);
      
      if (error.message?.includes('not enabled')) {
        toast.error('Please enable AI medical context first');
      } else if (error.message?.includes('No medical data')) {
        toast.info('Add medical documents or medications to generate insights');
      } else {
        toast.error('Failed to generate medical insights');
      }
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const currentState = {
    isAIContextEnabled: featureFlags?.ai_context_enabled || false,
    medicalInsights: insights?.ai_medical_summary,
    insightsGeneratedAt: insights?.ai_insights_generated_at
  };
  
  console.log('Current hook state:', currentState);

  return {
    // Feature flag status
    isAIContextEnabled: featureFlags?.ai_context_enabled || false,
    isFeatureFlagsLoading: flagsLoading,
    
    // Medical insights
    medicalInsights: insights?.ai_medical_summary,
    insightsGeneratedAt: insights?.ai_insights_generated_at,
    isInsightsLoading: insightsLoading,
    
    // Actions - Fixed toggle to accept parameter properly
    toggleAIContext: (enabled: boolean) => {
      console.log('Toggle function called with:', enabled);
      toggleAIContext.mutate(enabled);
    },
    isTogglingAIContext: toggleAIContext.isPending,
    
    generateInsights: generateInsights.mutate,
    isGeneratingInsights: isGenerating || generateInsights.isPending,
    
    // Helper to check if insights are stale (older than 30 days)
    areInsightsStale: insights?.ai_insights_generated_at 
      ? new Date(insights.ai_insights_generated_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : true
  };
};
