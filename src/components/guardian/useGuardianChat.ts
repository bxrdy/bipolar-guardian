
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Message } from './types';

interface PerformanceMetrics {
  responseTime: number;
  contextDataSize: number;
  modelUsed: string;
  fallbackOccurred: boolean;
  accuracy?: number;
  timestamp: Date;
}

interface ChatValidation {
  contextComplete: boolean;
  responseRelevant: boolean;
  therapeuticAppropriate: boolean;
  safetyChecked: boolean;
  issues: string[];
}

export const useGuardianChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your Guardian - your personal AI therapist specialized in bipolar disorder support. I have access to all your health data, mood patterns, and daily summaries to provide you with personalized guidance. How are you feeling today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [validationResults, setValidationResults] = useState<ChatValidation[]>([]);

  const sendMessage = async (messageContent: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('guardian-chat', {
        body: { 
          message: userMessage.content,
          conversationHistory: messages.slice(-10) // Last 10 messages for context
        }
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        console.error('Guardian chat error:', error);
        
        // Record error metrics
        const errorMetrics: PerformanceMetrics = {
          responseTime,
          contextDataSize: 0,
          modelUsed: 'error',
          fallbackOccurred: false,
          timestamp: new Date()
        };
        setPerformanceMetrics(prev => [...prev.slice(-9), errorMetrics]);
        
        // Show helpful error message based on the error
        let errorMessage = "I'm having trouble connecting right now. ";
        if (error.message?.includes('API key') || error.message?.includes('OpenRouter')) {
          errorMessage += "It looks like the OpenRouter API key isn't configured yet. Please ask your administrator to set it up.";
        } else {
          errorMessage += "Please try again in a moment.";
        }
        
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorResponse]);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Record performance metrics
      const metrics: PerformanceMetrics = {
        responseTime,
        contextDataSize: data.contextDataSize || 0,
        modelUsed: data.modelUsed || 'unknown',
        fallbackOccurred: !!data.fallback,
        timestamp: new Date()
      };
      setPerformanceMetrics(prev => [...prev.slice(-9), metrics]);

      // Validate response quality
      const validation = await validateChatResponse(
        messageContent,
        data.response,
        data.contextData
      );
      setValidationResults(prev => [...prev.slice(-9), validation]);

      // Show toast notifications for model fallbacks
      if (data.fallback && data.fallbackReason) {
        if (data.fallbackReason === 'rate-limited') {
          toast.info('Your preferred AI model is temporarily rate-limited. Using backup model.', {
            duration: 4000,
          });
        } else if (data.fallbackReason === 'unavailable') {
          toast.warning('Your preferred AI model is currently unavailable. Using backup model.', {
            duration: 4000,
          });
        }
      }

      // Show validation warnings if needed
      if (validation.issues.length > 0) {
        console.warn('Chat validation issues:', validation.issues);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      toast.error('Failed to send message');

      // Record error metrics
      const errorMetrics: PerformanceMetrics = {
        responseTime: Date.now() - startTime,
        contextDataSize: 0,
        modelUsed: 'error',
        fallbackOccurred: false,
        timestamp: new Date()
      };
      setPerformanceMetrics(prev => [...prev.slice(-9), errorMetrics]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateChatResponse = useCallback(async (
    userMessage: string,
    assistantResponse: string,
    contextData?: any
  ): Promise<ChatValidation> => {
    const issues: string[] = [];

    // Check context completeness
    const contextComplete = contextData && 
      contextData.moodEntries && 
      contextData.healthData && 
      contextData.medications;

    if (!contextComplete) {
      issues.push('Incomplete context data provided to AI model');
    }

    // Check response relevance (basic keyword matching)
    const responseRelevant = checkResponseRelevance(userMessage, assistantResponse);
    if (!responseRelevant) {
      issues.push('Response may not be relevant to user message');
    }

    // Check therapeutic appropriateness
    const therapeuticAppropriate = checkTherapeuticContent(assistantResponse);
    if (!therapeuticAppropriate) {
      issues.push('Response lacks appropriate therapeutic tone or content');
    }

    // Check safety concerns
    const safetyChecked = checkSafetyContent(assistantResponse);
    if (!safetyChecked) {
      issues.push('Response may contain safety concerns');
    }

    return {
      contextComplete,
      responseRelevant,
      therapeuticAppropriate,
      safetyChecked,
      issues
    };
  }, []);

  const checkResponseRelevance = (userMessage: string, response: string): boolean => {
    // Simple relevance check based on shared keywords
    const userWords = userMessage.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const responseWords = response.toLowerCase().split(/\s+/);
    
    if (userWords.length === 0) return true; // Empty message edge case
    
    const sharedWords = userWords.filter(word => responseWords.includes(word));
    const relevanceScore = sharedWords.length / userWords.length;
    
    return relevanceScore > 0.1 || response.length > 100; // Either some keyword overlap or substantial response
  };

  const checkTherapeuticContent = (response: string): boolean => {
    const therapeuticIndicators = [
      'understand', 'feel', 'support', 'help', 'concern', 'care',
      'recommend', 'suggest', 'consider', 'important', 'healthy',
      'well-being', 'mood', 'mental health', 'therapy', 'treatment'
    ];

    const lowerResponse = response.toLowerCase();
    const indicatorCount = therapeuticIndicators.filter(indicator => 
      lowerResponse.includes(indicator)
    ).length;

    return indicatorCount >= 2 || response.length < 50; // Either therapeutic language or very short response
  };

  const checkSafetyContent = (response: string): boolean => {
    const safetyRedFlags = [
      'should stop taking medication',
      'don\'t need medication',
      'medication is harmful',
      'replace professional help',
      'instead of seeing doctor'
    ];

    const lowerResponse = response.toLowerCase();
    const hasRedFlags = safetyRedFlags.some(flag => lowerResponse.includes(flag));

    return !hasRedFlags;
  };

  const getPerformanceMetrics = useCallback(() => {
    if (performanceMetrics.length === 0) return null;

    const avgResponseTime = performanceMetrics.reduce((sum, m) => sum + m.responseTime, 0) / performanceMetrics.length;
    const avgContextSize = performanceMetrics.reduce((sum, m) => sum + m.contextDataSize, 0) / performanceMetrics.length;
    const fallbackRate = performanceMetrics.filter(m => m.fallbackOccurred).length / performanceMetrics.length;
    const modelUsage = performanceMetrics.reduce((acc, m) => {
      acc[m.modelUsed] = (acc[m.modelUsed] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      averageResponseTime: avgResponseTime,
      averageContextSize: avgContextSize,
      fallbackRate: fallbackRate * 100,
      modelUsage,
      totalInteractions: performanceMetrics.length
    };
  }, [performanceMetrics]);

  const getValidationSummary = useCallback(() => {
    if (validationResults.length === 0) return null;

    const totalValidations = validationResults.length;
    const contextCompleteRate = validationResults.filter(v => v.contextComplete).length / totalValidations;
    const responseRelevantRate = validationResults.filter(v => v.responseRelevant).length / totalValidations;
    const therapeuticAppropriateRate = validationResults.filter(v => v.therapeuticAppropriate).length / totalValidations;
    const safetyCheckedRate = validationResults.filter(v => v.safetyChecked).length / totalValidations;

    const allIssues = validationResults.flatMap(v => v.issues);
    const issueFrequency = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalValidations,
      contextCompleteRate: contextCompleteRate * 100,
      responseRelevantRate: responseRelevantRate * 100,
      therapeuticAppropriateRate: therapeuticAppropriateRate * 100,
      safetyCheckedRate: safetyCheckedRate * 100,
      commonIssues: Object.entries(issueFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([issue, count]) => ({ issue, count }))
    };
  }, [validationResults]);

  return {
    messages,
    isLoading,
    sendMessage,
    performanceMetrics,
    validationResults,
    getPerformanceMetrics,
    getValidationSummary
  };
};
