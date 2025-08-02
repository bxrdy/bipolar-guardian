import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { handleSecureError } from '../_shared/errorHandler.ts';
import { getSecureCORSHeaders } from '../_shared/cors.ts';
import { validateSecurity, createSecureResponse } from '../_shared/securityHeaders.ts';
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { validateRequestBody } from '../_shared/inputValidator.ts';

const CHAT_CONTEXT_SCHEMA = {
  userId: {
    type: 'string' as const,
    required: true,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  contextWindow: {
    type: 'number' as const,
    required: false,
    min: 1,
    max: 30
  },
  includeHealthData: {
    type: 'boolean' as const,
    required: false
  }
};

interface ChatContextResult {
  userId: string;
  contextAnalysis: {
    completeness: number;
    relevance: number;
    freshness: number;
    diversity: number;
    overallScore: number;
  };
  contextData: {
    profileData: {
      available: boolean;
      completeness: number;
      lastUpdated: string | null;
    };
    healthMetrics: {
      moodEntries: number;
      medicationRecords: number;
      dailySummaries: number;
      daysOfData: number;
      dataGaps: number;
    };
    medicalInsights: {
      available: boolean;
      freshness: number;
      comprehensiveness: number;
      lastGenerated: string | null;
    };
    baselineData: {
      available: boolean;
      metricsCount: number;
      lastCalculated: string | null;
    };
  };
  qualityMetrics: {
    dataRichness: number;
    temporalCoverage: number;
    informationDensity: number;
    contextualRelevance: number;
  };
  issues: string[];
  recommendations: string[];
  processingTime: number;
}

serve(async (req) => {
  try {
    const corsHeaders = getSecureCORSHeaders(req);
    
    if (req.method === 'OPTIONS') {
      return createSecureResponse(null, { headers: corsHeaders });
    }

    const securityCheck = validateSecurity(req, {
      requireCSRF: false,
      requireOrigin: true,
      allowedMethods: ['POST']
    });
    
    if (!securityCheck.valid) {
      return handleSecureError(
        new Error(securityCheck.error || 'Security validation failed'),
        { operation: 'analyze_chat_context_security' },
        'analyze-chat-context',
        corsHeaders
      );
    }

    const rateLimitCheck = checkRateLimit(req, 'analyze-chat-context', 'MEDIUM', corsHeaders);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return handleSecureError(
        new Error('Unauthorized'), 
        { userId: 'anonymous', operation: 'authenticate' },
        'analyze-chat-context',
        corsHeaders
      );
    }

    const validation = await validateRequestBody(req.clone(), CHAT_CONTEXT_SCHEMA);
    if (!validation.valid) {
      return handleSecureError(
        new Error(`Invalid request: ${validation.errors.join(', ')}`),
        { userId: user.id, operation: 'validate_context_input' },
        'analyze-chat-context',
        corsHeaders
      );
    }

    const { 
      userId, 
      contextWindow = 14, 
      includeHealthData = true 
    } = validation.sanitizedData!;

    // Ensure user can only analyze their own context
    if (userId !== user.id) {
      return handleSecureError(
        new Error('Unauthorized access to user context'),
        { userId: user.id, operation: 'validate_user_access' },
        'analyze-chat-context',
        corsHeaders
      );
    }

    const startTime = Date.now();

    // Analyze chat context
    const contextResult = await analyzeChatContext(
      userId,
      contextWindow,
      includeHealthData,
      supabaseClient
    );

    const processingTime = Date.now() - startTime;
    contextResult.processingTime = processingTime;

    // Store analysis results
    await storeContextAnalysis(supabaseClient, userId, contextResult);

    return createSecureResponse(
      JSON.stringify({
        success: true,
        result: contextResult
      }),
      {
        headers: { 
          ...corsHeaders, 
          ...rateLimitCheck.headers,
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    return handleSecureError(
      error,
      { userId: 'unknown', operation: 'analyze_chat_context_general' },
      'analyze-chat-context',
      corsHeaders
    );
  }
});

async function analyzeChatContext(
  userId: string,
  contextWindow: number,
  includeHealthData: boolean,
  supabaseClient: any
): Promise<ChatContextResult> {
  
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - contextWindow * 24 * 60 * 60 * 1000);
  
  // Gather all context data
  const contextData = await gatherContextData(
    userId,
    startDate,
    endDate,
    includeHealthData,
    supabaseClient
  );
  
  // Analyze context completeness and quality
  const contextAnalysis = analyzeContextQuality(contextData, contextWindow);
  
  // Calculate quality metrics
  const qualityMetrics = calculateQualityMetrics(contextData, contextWindow);
  
  // Detect issues
  const issues = detectContextIssues(contextData, contextAnalysis);
  
  // Generate recommendations
  const recommendations = generateContextRecommendations(contextAnalysis, issues, contextData);
  
  return {
    userId,
    contextAnalysis,
    contextData,
    qualityMetrics,
    issues,
    recommendations,
    processingTime: 0
  };
}

async function gatherContextData(
  userId: string,
  startDate: Date,
  endDate: Date,
  includeHealthData: boolean,
  supabaseClient: any
) {
  const contextData = {
    profileData: {
      available: false,
      completeness: 0,
      lastUpdated: null
    },
    healthMetrics: {
      moodEntries: 0,
      medicationRecords: 0,
      dailySummaries: 0,
      daysOfData: 0,
      dataGaps: 0
    },
    medicalInsights: {
      available: false,
      freshness: 0,
      comprehensiveness: 0,
      lastGenerated: null
    },
    baselineData: {
      available: false,
      metricsCount: 0,
      lastCalculated: null
    }
  };

  try {
    // Get user profile data
    const { data: profile } = await supabaseClient
      .from('user_profile')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      contextData.profileData.available = true;
      contextData.profileData.completeness = calculateProfileCompleteness(profile);
      contextData.profileData.lastUpdated = profile.updated_at || profile.created_at;

      // Check for AI medical insights
      if (profile.ai_medical_summary) {
        contextData.medicalInsights.available = true;
        contextData.medicalInsights.lastGenerated = profile.ai_insights_generated_at;
        contextData.medicalInsights.comprehensiveness = calculateInsightsComprehensiveness(profile.ai_medical_summary);
        contextData.medicalInsights.freshness = calculateInsightsFreshness(profile.ai_insights_generated_at);
      }
    }

    if (includeHealthData) {
      // Get mood entries
      const { data: moodEntries } = await supabaseClient
        .from('mood_entries')
        .select('created_at, mood, energy, stress, anxiety')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      contextData.healthMetrics.moodEntries = moodEntries?.length || 0;

      // Get medication records
      const { data: medications } = await supabaseClient
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .is('end_date', null); // Active medications

      contextData.healthMetrics.medicationRecords = medications?.length || 0;

      // Get daily summaries
      const { data: dailySummaries } = await supabaseClient
        .from('daily_summary')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      contextData.healthMetrics.dailySummaries = dailySummaries?.length || 0;

      // Calculate days of data and gaps
      if (moodEntries && moodEntries.length > 0) {
        const uniqueDays = new Set(moodEntries.map(entry => 
          new Date(entry.created_at).toDateString()
        ));
        contextData.healthMetrics.daysOfData = uniqueDays.size;
        contextData.healthMetrics.dataGaps = Math.max(0, contextWindow - uniqueDays.size);
      }
    }

    // Get baseline data
    const { data: baseline } = await supabaseClient
      .from('baseline_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (baseline) {
      contextData.baselineData.available = true;
      contextData.baselineData.metricsCount = countBaselineMetrics(baseline);
      contextData.baselineData.lastCalculated = baseline.updated_at || baseline.created_at;
    }

  } catch (error) {
    console.error('Error gathering context data:', error);
  }

  return contextData;
}

function calculateProfileCompleteness(profile: any): number {
  const fields = ['first_name', 'email', 'timezone', 'date_of_birth'];
  const completedFields = fields.filter(field => profile[field] != null).length;
  return Math.round((completedFields / fields.length) * 100);
}

function calculateInsightsComprehensiveness(aiSummary: any): number {
  if (!aiSummary || typeof aiSummary !== 'object') return 0;

  const expectedFields = ['conditions', 'medications_summary', 'risk_factors', 'therapeutic_notes'];
  const completedFields = expectedFields.filter(field => 
    aiSummary[field] && Array.isArray(aiSummary[field]) && aiSummary[field].length > 0
  ).length;

  return Math.round((completedFields / expectedFields.length) * 100);
}

function calculateInsightsFreshness(lastGenerated: string | null): number {
  if (!lastGenerated) return 0;

  const now = new Date();
  const generated = new Date(lastGenerated);
  const daysSince = (now.getTime() - generated.getTime()) / (24 * 60 * 60 * 1000);

  // Freshness scoring: 100% for < 7 days, decreasing linearly
  if (daysSince < 7) return 100;
  if (daysSince < 14) return Math.max(0, 100 - (daysSince - 7) * 10);
  if (daysSince < 30) return Math.max(0, 50 - (daysSince - 14) * 2);
  return 0;
}

function countBaselineMetrics(baseline: any): number {
  if (!baseline) return 0;

  const metricFields = [
    'mood_mean', 'mood_std', 'energy_mean', 'energy_std',
    'stress_mean', 'stress_std', 'anxiety_mean', 'anxiety_std',
    'sleep_mean', 'sleep_std', 'steps_mean', 'steps_std'
  ];

  return metricFields.filter(field => baseline[field] != null).length;
}

function analyzeContextQuality(contextData: any, contextWindow: number) {
  // Completeness: How much of the expected context is available
  let completeness = 0;
  if (contextData.profileData.available) completeness += 25;
  if (contextData.healthMetrics.moodEntries > 0) completeness += 25;
  if (contextData.healthMetrics.medicationRecords > 0) completeness += 15;
  if (contextData.medicalInsights.available) completeness += 20;
  if (contextData.baselineData.available) completeness += 15;

  // Relevance: How relevant the context is for therapeutic conversations
  let relevance = 50; // Base relevance
  if (contextData.healthMetrics.moodEntries > contextWindow / 2) relevance += 20;
  if (contextData.medicalInsights.available) relevance += 15;
  if (contextData.baselineData.available) relevance += 15;

  // Freshness: How recent the context data is
  const freshness = calculateContextFreshness(contextData, contextWindow);

  // Diversity: How diverse the context data is
  const diversity = calculateContextDiversity(contextData);

  // Overall score
  const overallScore = (completeness + relevance + freshness + diversity) / 4;

  return {
    completeness: Math.min(100, completeness),
    relevance: Math.min(100, relevance),
    freshness,
    diversity,
    overallScore
  };
}

function calculateContextFreshness(contextData: any, contextWindow: number): number {
  const now = new Date();
  let freshness = 0;
  let totalWeight = 0;

  // Profile freshness (weight: 0.2)
  if (contextData.profileData.lastUpdated) {
    const daysSince = (now.getTime() - new Date(contextData.profileData.lastUpdated).getTime()) / (24 * 60 * 60 * 1000);
    freshness += Math.max(0, 100 - daysSince * 2) * 0.2;
    totalWeight += 0.2;
  }

  // Health data freshness (weight: 0.4)
  if (contextData.healthMetrics.daysOfData > 0) {
    const coverage = contextData.healthMetrics.daysOfData / contextWindow;
    freshness += Math.min(100, coverage * 100) * 0.4;
    totalWeight += 0.4;
  }

  // Medical insights freshness (weight: 0.3)
  if (contextData.medicalInsights.available) {
    freshness += contextData.medicalInsights.freshness * 0.3;
    totalWeight += 0.3;
  }

  // Baseline freshness (weight: 0.1)
  if (contextData.baselineData.lastCalculated) {
    const daysSince = (now.getTime() - new Date(contextData.baselineData.lastCalculated).getTime()) / (24 * 60 * 60 * 1000);
    freshness += Math.max(0, 100 - daysSince) * 0.1;
    totalWeight += 0.1;
  }

  return totalWeight > 0 ? freshness / totalWeight : 0;
}

function calculateContextDiversity(contextData: any): number {
  const dataTypes = [
    contextData.profileData.available,
    contextData.healthMetrics.moodEntries > 0,
    contextData.healthMetrics.medicationRecords > 0,
    contextData.healthMetrics.dailySummaries > 0,
    contextData.medicalInsights.available,
    contextData.baselineData.available
  ];

  const availableTypes = dataTypes.filter(available => available).length;
  return (availableTypes / dataTypes.length) * 100;
}

function calculateQualityMetrics(contextData: any, contextWindow: number) {
  // Data richness: How much data is available
  const dataPoints = 
    contextData.healthMetrics.moodEntries +
    contextData.healthMetrics.medicationRecords +
    contextData.healthMetrics.dailySummaries +
    contextData.baselineData.metricsCount;

  const dataRichness = Math.min(100, (dataPoints / (contextWindow * 2)) * 100);

  // Temporal coverage: How well the time window is covered
  const temporalCoverage = contextData.healthMetrics.daysOfData > 0 
    ? (contextData.healthMetrics.daysOfData / contextWindow) * 100
    : 0;

  // Information density: How much information per data point
  const informationDensity = contextData.profileData.completeness * 0.3 +
    (contextData.medicalInsights.available ? contextData.medicalInsights.comprehensiveness : 0) * 0.4 +
    (contextData.baselineData.available ? Math.min(100, contextData.baselineData.metricsCount * 10) : 0) * 0.3;

  // Contextual relevance: How relevant the data is for AI conversations
  let contextualRelevance = 60; // Base relevance
  if (contextData.medicalInsights.available) contextualRelevance += 20;
  if (contextData.healthMetrics.moodEntries > contextWindow / 2) contextualRelevance += 15;
  if (contextData.baselineData.available) contextualRelevance += 5;

  return {
    dataRichness: Math.min(100, dataRichness),
    temporalCoverage: Math.min(100, temporalCoverage),
    informationDensity: Math.min(100, informationDensity),
    contextualRelevance: Math.min(100, contextualRelevance)
  };
}

function detectContextIssues(contextData: any, contextAnalysis: any): string[] {
  const issues: string[] = [];

  if (!contextData.profileData.available) {
    issues.push('User profile data not available');
  }

  if (contextData.healthMetrics.moodEntries === 0) {
    issues.push('No mood entries available for context');
  }

  if (contextData.healthMetrics.dataGaps > 7) {
    issues.push(`Large data gaps detected: ${contextData.healthMetrics.dataGaps} days without data`);
  }

  if (!contextData.medicalInsights.available) {
    issues.push('Medical insights not generated - limited therapeutic context');
  }

  if (contextData.medicalInsights.available && contextData.medicalInsights.freshness < 50) {
    issues.push('Medical insights are outdated - may not reflect current status');
  }

  if (contextAnalysis.completeness < 60) {
    issues.push('Context completeness below recommended threshold');
  }

  if (contextAnalysis.freshness < 50) {
    issues.push('Context data is not fresh enough for optimal AI conversations');
  }

  if (contextData.healthMetrics.medicationRecords === 0) {
    issues.push('No current medication records available');
  }

  return issues;
}

function generateContextRecommendations(
  contextAnalysis: any,
  issues: string[],
  contextData: any
): string[] {
  const recommendations: string[] = [];

  if (contextAnalysis.completeness < 80) {
    recommendations.push('Improve context completeness by adding more health data');
  }

  if (contextData.healthMetrics.moodEntries < 7) {
    recommendations.push('Add more mood entries to improve AI conversation context');
  }

  if (!contextData.medicalInsights.available) {
    recommendations.push('Generate medical insights to enhance therapeutic conversations');
  }

  if (contextData.medicalInsights.available && contextData.medicalInsights.freshness < 70) {
    recommendations.push('Update medical insights to reflect current health status');
  }

  if (contextData.healthMetrics.dataGaps > 3) {
    recommendations.push('Fill data gaps by logging daily health metrics consistently');
  }

  if (!contextData.baselineData.available) {
    recommendations.push('Calculate personal baselines to improve context relevance');
  }

  if (contextAnalysis.freshness < 60) {
    recommendations.push('Update health data more frequently for better AI context');
  }

  if (issues.length > 5) {
    recommendations.push('Multiple context issues detected - comprehensive data review needed');
  }

  if (recommendations.length === 0) {
    recommendations.push('Chat context is well-structured and comprehensive');
  }

  return recommendations;
}

async function storeContextAnalysis(
  supabaseClient: any,
  userId: string,
  result: ChatContextResult
): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('validation_results')
      .insert({
        user_id: userId,
        validation_type: 'chat_context',
        accuracy_score: result.contextAnalysis.overallScore,
        confidence_score: result.qualityMetrics.contextualRelevance,
        processing_time: result.processingTime,
        metrics: {
          context_analysis: result.contextAnalysis,
          quality_metrics: result.qualityMetrics,
          context_data: result.contextData
        },
        issues: result.issues,
        recommendations: result.recommendations,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.log('Could not store context analysis:', error.message);
    }
  } catch (error) {
    console.log('Error storing context analysis:', error);
  }
}