import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatModels, visionModels } from '@/components/settings/modelConfigurations';

// Types
export type ModelStatus = 'available' | 'rate-limited' | 'unavailable' | 'checking';

export interface ModelStatusInfo {
  status: ModelStatus;
  reason?: string;
}

interface ModelState {
  modelStatuses: Record<string, ModelStatusInfo>;
  isChecking: boolean;
  lastCheck: Date | null;
}

interface ModelSelection {
  chatModel: string;
  visionModel: string;
  isLoading: boolean;
  isUpdatingChat: boolean;
  isUpdatingVision: boolean;
}

/**
 * Unified AI models hook that manages model selection and status monitoring
 * Consolidates previous useModelSelection and useModelStatus hooks
 */
export const useAIModels = () => {
  const queryClient = useQueryClient();

  // Get all model IDs for status checking
  const allChatModelIds = useMemo(() => chatModels.map((m: { id: string }) => m.id), []);
  const allVisionModelIds = useMemo(() => visionModels.map((m: { id: string }) => m.id), []);
  const allModelIds = useMemo(() => [...allChatModelIds, ...allVisionModelIds], [allChatModelIds, allVisionModelIds]);

  // Status management state
  const [statusState, setStatusState] = useState<ModelState>({
    modelStatuses: {},
    isChecking: false,
    lastCheck: null
  });

  // Get user's current model selections with React Query
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['user-profile-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profile')
        .select('chat_model, vision_model')
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return {
          chat_model: 'deepseek/deepseek-r1:free',
          vision_model: 'google/gemini-2.0-flash-exp:free'
        };
      }
      
      console.log('User model preferences loaded:', data);
      return data;
    }
  });

  // Model status checking logic
  const checkModelStatus = useCallback(async () => {
    if (allModelIds.length === 0) return;
    
    setStatusState(prev => ({ ...prev, isChecking: true }));
    
    // Set all models to checking state
    const checkingStatuses = allModelIds.reduce((acc, model) => {
      acc[model] = { status: 'checking' as ModelStatus };
      return acc;
    }, {} as Record<string, ModelStatusInfo>);
    
    setStatusState(prev => ({ 
      ...prev, 
      modelStatuses: checkingStatuses 
    }));

    try {
      const { data, error } = await supabase.functions.invoke('check-model-status', {
        body: { models: allModelIds }
      });

      if (error) {
        console.error('Model status check failed:', error);
        // Set all to unavailable on error
        const unavailableStatuses = allModelIds.reduce((acc, model) => {
          acc[model] = { status: 'unavailable' as ModelStatus, reason: 'Status check failed' };
          return acc;
        }, {} as Record<string, ModelStatusInfo>);
        
        setStatusState(prev => ({
          ...prev,
          modelStatuses: unavailableStatuses,
          isChecking: false
        }));
      } else {
        setStatusState(prev => ({
          ...prev,
          modelStatuses: data.statuses || {},
          lastCheck: new Date(),
          isChecking: false
        }));
      }
    } catch (error) {
      console.error('Model status check error:', error);
      const unavailableStatuses = allModelIds.reduce((acc, model) => {
        acc[model] = { status: 'unavailable' as ModelStatus, reason: 'Network error' };
        return acc;
      }, {} as Record<string, ModelStatusInfo>);
      
      setStatusState(prev => ({
        ...prev,
        modelStatuses: unavailableStatuses,
        isChecking: false
      }));
    }
  }, [allModelIds]);

  // Initial status check
  useEffect(() => {
    if (allModelIds.length > 0) {
      checkModelStatus();
    }
  }, [checkModelStatus, allModelIds.length]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!statusState.isChecking && allModelIds.length > 0) {
        checkModelStatus();
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [checkModelStatus, statusState.isChecking, allModelIds]);

  // Update chat model mutation
  const updateChatModel = useMutation({
    mutationFn: async (modelId: string) => {
      console.log('Updating chat model to:', modelId);
      const { error } = await supabase
        .from('user_profile')
        .update({ chat_model: modelId })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);
      
      if (error) {
        console.error('Error updating chat model:', error);
        throw error;
      }
      
      return modelId;
    },
    onSuccess: (modelId) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile-models'] });
      toast.success('Chat model updated successfully');
      console.log('Chat model updated to:', modelId);
    },
    onError: (error) => {
      console.error('Error updating chat model:', error);
      toast.error('Failed to update chat model');
    }
  });

  // Update vision model mutation
  const updateVisionModel = useMutation({
    mutationFn: async (modelId: string) => {
      console.log('Updating vision model to:', modelId);
      const { error } = await supabase
        .from('user_profile')
        .update({ vision_model: modelId })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);
      
      if (error) {
        console.error('Error updating vision model:', error);
        throw error;
      }
      
      return modelId;
    },
    onSuccess: (modelId) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile-models'] });
      toast.success('Vision model updated successfully');
      console.log('Vision model updated to:', modelId);
    },
    onError: (error) => {
      console.error('Error updating vision model:', error);
      toast.error('Failed to update vision model');
    }
  });

  // Separate statuses for easy consumption
  const chatStatuses = Object.fromEntries(
    allChatModelIds.map(id => [id, statusState.modelStatuses[id] || { status: 'checking' as ModelStatus }])
  );
  
  const visionStatuses = Object.fromEntries(
    allVisionModelIds.map(id => [id, statusState.modelStatuses[id] || { status: 'checking' as ModelStatus }])
  );

  // Model selection data
  const selection: ModelSelection = {
    chatModel: userProfile?.chat_model || 'deepseek/deepseek-r1:free',
    visionModel: userProfile?.vision_model || 'google/gemini-2.0-flash-exp:free',
    isLoading,
    isUpdatingChat: updateChatModel.isPending,
    isUpdatingVision: updateVisionModel.isPending
  };

  return {
    // Model selection
    ...selection,
    updateChatModel: updateChatModel.mutate,
    updateVisionModel: updateVisionModel.mutate,
    
    // Status monitoring
    ...statusState,
    chatStatuses,
    visionStatuses,
    allStatuses: statusState.modelStatuses,
    refreshStatus: checkModelStatus,
    
    // Utility methods
    getModelStatus: (modelId: string) => statusState.modelStatuses[modelId] || { status: 'checking' as ModelStatus },
    isModelAvailable: (modelId: string) => statusState.modelStatuses[modelId]?.status === 'available',
    getAvailableChatModels: () => allChatModelIds.filter(id => statusState.modelStatuses[id]?.status === 'available'),
    getAvailableVisionModels: () => allVisionModelIds.filter(id => statusState.modelStatuses[id]?.status === 'available')
  };
};

// Individual hooks for backwards compatibility
export const useModelSelection = () => {
  const { 
    chatModel, 
    visionModel, 
    isLoading, 
    updateChatModel, 
    updateVisionModel, 
    isUpdatingChat, 
    isUpdatingVision 
  } = useAIModels();
  
  return {
    chatModel,
    visionModel,
    isLoading,
    updateChatModel,
    updateVisionModel,
    isUpdatingChat,
    isUpdatingVision
  };
};

export const useModelStatus = (models: string[]) => {
  const { 
    modelStatuses, 
    isChecking, 
    lastCheck, 
    refreshStatus 
  } = useAIModels();
  
  // Filter statuses to only requested models
  const filteredStatuses = Object.fromEntries(
    models.map(model => [model, modelStatuses[model] || { status: 'checking' as ModelStatus }])
  );
  
  return {
    modelStatuses: filteredStatuses,
    isChecking,
    lastCheck,
    refreshStatus
  };
};

export const useUnifiedModelStatus = () => {
  const { 
    chatStatuses, 
    visionStatuses, 
    allStatuses, 
    isChecking, 
    refreshStatus, 
    lastCheck 
  } = useAIModels();
  
  return {
    chatStatuses,
    visionStatuses,
    allStatuses,
    isChecking,
    refreshStatus,
    lastCheck
  };
};

// Export types
export type { ModelSelection, ModelState };