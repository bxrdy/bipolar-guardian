
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PipelineValidationState {
  isValidating: boolean;
  results: ValidationResult[];
  currentStep: string;
}

interface ValidationResult {
  step: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
  timestamp: Date;
}

interface MedicalDoc {
  id: string;
  doc_type: string;
  extracted_text: string;
  uploaded_at: string;
}

interface GeneratedInsights {
  conditions?: string[];
  medications_summary?: string[];
  risk_factors?: string[];
  therapeutic_notes?: string[];
  interaction_warnings?: string[];
  red_flags?: string[];
  last_updated: string;
}

export const usePipelineValidation = () => {
  const [state, setState] = useState<PipelineValidationState>({
    isValidating: false,
    results: [],
    currentStep: ''
  });

  const updateResult = (step: string, status: ValidationResult['status'], message: string, data?: any) => {
    setState(prev => ({
      ...prev,
      results: [
        ...prev.results.filter(r => r.step !== step),
        {
          step,
          status,
          message,
          data,
          timestamp: new Date()
        }
      ]
    }));
  };

  const setCurrentStep = (step: string) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const validatePipelineIntegration = async () => {
    try {
      setState(prev => ({ ...prev, isValidating: true, results: [] }));

      // Step 1: Validate test data existence
      setCurrentStep('validate-test-data');
      updateResult('validate-test-data', 'pending', 'Checking for test medical documents...');
      
      const { data: testDocs, error: docsError } = await supabase
        .from('medical_docs')
        .select('id, doc_type, extracted_text, uploaded_at')
        .not('extracted_text', 'is', null)
        .limit(5);

      if (docsError) {
        updateResult('validate-test-data', 'error', `Failed to fetch test documents: ${docsError.message}`);
        return;
      }

      if (!testDocs || testDocs.length === 0) {
        updateResult('validate-test-data', 'error', 'No test medical documents found. Please generate test data first.');
        return;
      }

      updateResult('validate-test-data', 'success', `Found ${testDocs.length} test medical documents`, testDocs.map(doc => ({
        id: doc.id,
        type: doc.doc_type,
        hasText: !!doc.extracted_text,
        textLength: doc.extracted_text?.length || 0,
        created: doc.uploaded_at
      })));

      // Step 2: Validate AI context is enabled
      setCurrentStep('validate-ai-context');
      updateResult('validate-ai-context', 'pending', 'Checking AI context feature flag...');

      const { data: featureFlags, error: flagError } = await supabase
        .from('feature_flags')
        .select('ai_context_enabled')
        .single();

      if (flagError && flagError.code !== 'PGRST116') {
        updateResult('validate-ai-context', 'error', `Failed to check feature flags: ${flagError.message}`);
        return;
      }

      if (!featureFlags?.ai_context_enabled) {
        updateResult('validate-ai-context', 'error', 'AI context feature is not enabled. Please enable it first.');
        return;
      }

      updateResult('validate-ai-context', 'success', 'AI context feature is enabled');

      // Step 3: Trigger personal insights generation
      setCurrentStep('generate-insights');
      updateResult('generate-insights', 'pending', 'Triggering personal insights generation...');

      const { data: insightsData, error: insightsError } = await supabase.functions.invoke('generate-personal-insights');

      if (insightsError) {
        updateResult('generate-insights', 'error', `Insights generation failed: ${insightsError.message}`);
        return;
      }

      if (!insightsData?.success) {
        updateResult('generate-insights', 'error', `Insights generation failed: ${insightsData?.message || 'Unknown error'}`);
        return;
      }

      updateResult('generate-insights', 'success', 'Personal insights generated successfully', insightsData.insights);

      // Step 4: Validate generated insights structure
      setCurrentStep('validate-insights');
      updateResult('validate-insights', 'pending', 'Validating generated insights structure...');

      const insights = insightsData.insights as GeneratedInsights;
      const requiredFields = ['conditions', 'medications_summary', 'risk_factors', 'therapeutic_notes'];
      const missingFields = requiredFields.filter(field => !insights[field as keyof GeneratedInsights]);

      if (missingFields.length > 0) {
        updateResult('validate-insights', 'error', `Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      updateResult('validate-insights', 'success', `Generated insights contain all required fields: ${requiredFields.join(', ')}`);

      // Step 5: Validate privacy sanitization
      setCurrentStep('validate-sanitization');
      updateResult('validate-sanitization', 'pending', 'Validating privacy sanitization...');

      const insightsString = JSON.stringify(insights);
      const piiPatterns = [
        /\b\d{3}-?\d{2}-?\d{4}\b/, // SSN
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
        /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/, // Phone
      ];

      const foundPII = piiPatterns.some(pattern => pattern.test(insightsString));
      
      if (foundPII) {
        updateResult('validate-sanitization', 'error', 'Generated insights contain potential PII - sanitization may not be working properly');
        return;
      }

      updateResult('validate-sanitization', 'success', 'No PII detected in generated insights - sanitization working correctly');

      // Step 6: Test Guardian Chat context injection
      setCurrentStep('test-guardian-chat');
      updateResult('test-guardian-chat', 'pending', 'Testing Guardian Chat context injection...');

      const testMessage = "What medical conditions do I have based on my medical documents?";
      const { data: chatData, error: chatError } = await supabase.functions.invoke('guardian-chat', {
        body: {
          message: testMessage,
          conversationHistory: []
        }
      });

      if (chatError) {
        updateResult('test-guardian-chat', 'error', `Guardian Chat test failed: ${chatError.message}`);
        return;
      }

      if (!chatData?.response) {
        updateResult('test-guardian-chat', 'error', 'Guardian Chat returned no response');
        return;
      }

      // Check if response contains medical context
      const response = chatData.response.toLowerCase();
      const hasConditions = insights.conditions?.some(condition => 
        response.includes(condition.toLowerCase())
      );
      
      const hasMedications = insights.medications_summary?.some(med => 
        response.includes(med.toLowerCase())
      );

      const hasTherapeuticNotes = insights.therapeutic_notes?.some(note =>
        response.includes(note.toLowerCase().substring(0, 10)) // Check first 10 chars of notes
      );

      const contextScore = [hasConditions, hasMedications, hasTherapeuticNotes].filter(Boolean).length;

      if (contextScore > 0) {
        updateResult('test-guardian-chat', 'success', `Guardian Chat successfully used medical context (${contextScore}/3 context types detected)`, {
          response: chatData.response.substring(0, 500) + (chatData.response.length > 500 ? '...' : ''),
          usedModel: chatData.model,
          contextScore,
          hasConditions,
          hasMedications,
          hasTherapeuticNotes
        });
      } else {
        updateResult('test-guardian-chat', 'error', 'Guardian Chat response may not have used medical context effectively', {
          response: chatData.response.substring(0, 200) + '...',
          usedModel: chatData.model
        });
      }

      // Step 7: Validate context injection quality
      setCurrentStep('validate-context-quality');
      updateResult('validate-context-quality', 'pending', 'Validating context injection quality...');

      // Check if Guardian Chat context includes the recent insights
      const contextQualityScore = calculateContextQualityScore(insights, chatData.response);
      
      if (contextQualityScore >= 0.7) {
        updateResult('validate-context-quality', 'success', `Context injection quality score: ${Math.round(contextQualityScore * 100)}%`);
      } else {
        updateResult('validate-context-quality', 'error', `Context injection quality below threshold: ${Math.round(contextQualityScore * 100)}%`);
      }

      toast.success('Pipeline validation completed successfully!');

    } catch (error: any) {
      console.error('Pipeline validation error:', error);
      updateResult('pipeline-error', 'error', `Pipeline validation failed: ${error.message}`);
      toast.error('Pipeline validation failed');
    } finally {
      setState(prev => ({ ...prev, isValidating: false, currentStep: '' }));
    }
  };

  const calculateContextQualityScore = (insights: GeneratedInsights, response: string): number => {
    let score = 0;
    let totalChecks = 0;

    // Check if conditions are referenced
    if (insights.conditions?.length > 0) {
      totalChecks++;
      const conditionsMentioned = insights.conditions.some(condition =>
        response.toLowerCase().includes(condition.toLowerCase())
      );
      if (conditionsMentioned) score++;
    }

    // Check if medications are referenced
    if (insights.medications_summary?.length > 0) {
      totalChecks++;
      const medicationsMentioned = insights.medications_summary.some(med =>
        response.toLowerCase().includes(med.toLowerCase())
      );
      if (medicationsMentioned) score++;
    }

    // Check if therapeutic notes are reflected
    if (insights.therapeutic_notes?.length > 0) {
      totalChecks++;
      const therapeuticContext = insights.therapeutic_notes.some(note =>
        response.toLowerCase().includes(note.toLowerCase().substring(0, 20))
      );
      if (therapeuticContext) score++;
    }

    return totalChecks > 0 ? score / totalChecks : 0;
  };

  const clearResults = () => {
    setState(prev => ({ ...prev, results: [] }));
  };

  return {
    ...state,
    validatePipelineIntegration,
    clearResults
  };
};
