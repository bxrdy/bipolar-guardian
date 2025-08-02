import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { sanitizeForAI, sanitizeHealthMetrics } from '../_shared/sanitization.ts';
import { handleSecureError, ErrorType, logDetailedError } from '../_shared/errorHandler.ts';
import { getSecureCORSHeaders } from '../_shared/cors.ts';
import { validateSecurity, createSecureResponse } from '../_shared/securityHeaders.ts';
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { validateRequestBody, CHAT_MESSAGE_SCHEMA } from '../_shared/inputValidator.ts';

serve(async (req) => {
  try {
    // Generate secure CORS headers
    const corsHeaders = getSecureCORSHeaders(req);
    
    if (req.method === 'OPTIONS') {
      return createSecureResponse(null, { headers: corsHeaders });
    }

    // Validate security (JWT auth + origin validation, no CSRF needed)
    const securityCheck = validateSecurity(req, {
      requireCSRF: false,
      requireOrigin: true,
      allowedMethods: ['POST']
    });
    
    console.log('Guardian chat security validation:', { 
      valid: securityCheck.valid, 
      error: securityCheck.error,
      origin: req.headers.get('origin'),
      referer: req.headers.get('referer')
    });
    
    if (!securityCheck.valid) {
      return handleSecureError(
        new Error(securityCheck.error || 'Security validation failed'),
        { operation: 'guardian_chat_security' },
        'guardian-chat',
        corsHeaders
      );
    }

    // Apply rate limiting (CRITICAL level for AI interactions)
    const rateLimitCheck = checkRateLimit(req, 'guardian-chat', 'CRITICAL', corsHeaders);
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
        'guardian-chat',
        corsHeaders
      );
    }

    // Validate and sanitize request body
    const validation = await validateRequestBody(req.clone(), CHAT_MESSAGE_SCHEMA);
    if (!validation.valid) {
      return handleSecureError(
        new Error(`Invalid request: ${validation.errors.join(', ')}`),
        { userId: user.id, operation: 'validate_chat_input' },
        'guardian-chat',
        corsHeaders
      );
    }

    const { message, conversationHistory } = validation.sanitizedData!;
    console.log('Guardian chat request for user:', user.id);

    // Gather comprehensive user context
    const rawUserContext = await gatherUserContext(supabaseClient, user.id);
    
    // Sanitize user context for AI consumption
    const sanitizationEnabled = Deno.env.get('ENABLE_PII_SANITIZATION') !== 'false';
    const userContext = sanitizationEnabled ? sanitizeForAI(rawUserContext) : rawUserContext;
    
    // Get user's preferred AI model
    const { data: profile } = await supabaseClient
      .from('user_profile')
      .select('chat_model')
      .eq('id', user.id)
      .single();

    const preferredModel = profile?.chat_model || 'deepseek/deepseek-r1:free';
    
    // Try primary model first, then fallbacks
    const models = [
      preferredModel,
      'anthropic/claude-3.5-sonnet:beta',
      'google/gemini-2.0-flash-exp:free',
      'deepseek/deepseek-r1:free'
    ].filter((model, index, arr) => arr.indexOf(model) === index); // Remove duplicates

    let response;
    let usedModel = preferredModel;
    let fallback = false;
    let fallbackReason = null;

    for (const model of models) {
      try {
        console.log(`Attempting to use model: ${model}`);
        response = await callOpenRouterAPI(model, message, conversationHistory, userContext);
        usedModel = model;
        break;
      } catch (error) {
        console.log(`Model ${model} failed:`, error.message);
        
        if (model === preferredModel) {
          fallback = true;
          if (error.message.includes('rate') || error.message.includes('limit')) {
            fallbackReason = 'rate-limited';
          } else {
            fallbackReason = 'unavailable';
          }
        }
        
        if (model === models[models.length - 1]) {
          return handleSecureError(
            new Error('AI service unavailable'),
            { userId: user.id, operation: 'ai_chat' },
            'guardian-chat',
            corsHeaders
          );
        }
      }
    }

    console.log(`Successfully used model: ${usedModel}`);

    return createSecureResponse(
      JSON.stringify({ 
        response,
        model: usedModel,
        fallback,
        fallbackReason
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
      { userId: 'unknown', operation: 'guardian_chat_general' },
      'guardian-chat',
      corsHeaders
    );
  }
});

interface UserProfile {
  first_name?: string;
  ai_medical_summary?: {
    conditions?: string[];
    medications_summary?: string[];
    risk_factors?: string[];
    therapeutic_notes?: string[];
    interaction_warnings?: string[];
  };
  ai_insights_generated_at?: string;
}

interface MoodEntry {
  mood: number;
  energy: number;
  stress: number;
  anxiety: number;
  created_at: string;
  notes?: string;
}

interface Medication {
  med_name: string;
  dosage: string;
  schedule: string;
  start_date: string;
}

interface DailySummary {
  date: string;
  sleep_hours?: number;
  steps?: number;
  risk_level?: string;
}

interface UserContext {
  profile: UserProfile | null;
  recentMoods: MoodEntry[];
  medications: Medication[];
  medicalInsights: UserProfile['ai_medical_summary'] | null;
  recentSummaries: DailySummary[];
  hasBaseline: boolean;
  weeklyPatterns?: Record<string, unknown>;
  riskFactors?: Record<string, unknown>[];
  supportSystem?: Record<string, unknown>;
  emergencyContacts?: Record<string, unknown>[];
  lastActivity?: string;
}

async function gatherUserContext(supabaseClient: Record<string, unknown>, userId: string): Promise<UserContext> {
  console.log('Gathering comprehensive user context...');
  
  const context: UserContext = {
    profile: null,
    recentMoods: [],
    medications: [],
    medicalInsights: null,
    recentSummaries: [],
    hasBaseline: false
  };

  try {
    // Get user profile with AI insights
    const { data: profile } = await supabaseClient
      .from('user_profile')
      .select('first_name, ai_medical_summary, ai_insights_generated_at')
      .eq('id', userId)
      .single();
    
    context.profile = profile;

    // Check if we have recent AI medical insights (within last 30 days)
    if (profile?.ai_medical_summary && profile?.ai_insights_generated_at) {
      const insightsDate = new Date(profile.ai_insights_generated_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      if (insightsDate > thirtyDaysAgo) {
        context.medicalInsights = profile.ai_medical_summary;
        console.log('Using cached medical insights');
      }
    }

    // Get recent mood entries (last 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const { data: moods } = await supabaseClient
      .from('mood_entries')
      .select('mood, energy, stress, anxiety, created_at, notes')
      .eq('user_id', userId)
      .gte('created_at', fourteenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);
    
    context.recentMoods = moods || [];

    // Get current medications
    const { data: medications } = await supabaseClient
      .from('medications')
      .select('med_name, dosage, schedule, start_date')
      .eq('user_id', userId)
      .is('end_date', null);
    
    context.medications = medications || [];

    // Get recent daily summaries (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: summaries } = await supabaseClient
      .from('daily_summary')
      .select('date, sleep_hours, steps, risk_level')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });
    
    context.recentSummaries = summaries || [];

    // Check if baseline is ready
    const { data: baseline } = await supabaseClient
      .from('baseline_metrics')
      .select('sleep_mean, steps_mean')
      .eq('user_id', userId)
      .single();
    
    context.hasBaseline = !!(baseline?.sleep_mean || baseline?.steps_mean);

    console.log('Context gathered successfully');
    return context;

  } catch (error) {
    console.error('Error gathering user context:', error);
    return context;
  }
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

async function callOpenRouterAPI(model: string, message: string, conversationHistory: ConversationMessage[], userContext: UserContext) {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!openRouterApiKey) {
    throw new Error('AI service configuration missing');
  }

  // Build comprehensive system prompt with medical insights
  const baseTherapeuticPrompt = Deno.env.get('THERAPEUTIC_SYSTEM_PROMPT') || 
    `You are a helpful AI assistant providing mental health support. Always encourage users to consult with healthcare professionals.`;
  
  let systemPrompt = baseTherapeuticPrompt + "\n\nUSER CONTEXT:";

  if (userContext.profile?.first_name) {
    systemPrompt += `\n- User's name: ${userContext.profile.first_name}`;
  }

  // Include AI-generated medical insights if available
  if (userContext.medicalInsights) {
    systemPrompt += `\n\nMEDICAL INSIGHTS:`;
    const insights = userContext.medicalInsights;
    
    if (insights.conditions?.length > 0) {
      systemPrompt += `\n- Known conditions: ${insights.conditions.join(', ')}`;
    }
    
    if (insights.medications_summary?.length > 0) {
      systemPrompt += `\n- Current medications: ${insights.medications_summary.join(', ')}`;
    }
    
    if (insights.risk_factors?.length > 0) {
      systemPrompt += `\n- Risk factors: ${insights.risk_factors.join(', ')}`;
    }
    
    if (insights.therapeutic_notes?.length > 0) {
      systemPrompt += `\n- Therapeutic notes: ${insights.therapeutic_notes.join('; ')}`;
    }
    
    if (insights.interaction_warnings?.length > 0) {
      systemPrompt += `\n- ⚠️ Medication concerns: ${insights.interaction_warnings.join('; ')}`;
    }
  } else {
    // Fallback to basic medication info if no AI insights
    if (userContext.medications?.length > 0) {
      systemPrompt += `\n- Current medications: ${userContext.medications.map((med: Medication) => `${med.med_name} (${med.dosage})`).join(', ')}`;
    }
  }

  // Recent mood patterns (sanitized)
  if (userContext.recentMoods?.length > 0) {
    const avgMood = userContext.recentMoods.reduce((sum: number, entry: MoodEntry) => sum + entry.mood, 0) / userContext.recentMoods.length;
    const avgEnergy = userContext.recentMoods.reduce((sum: number, entry: MoodEntry) => sum + entry.energy, 0) / userContext.recentMoods.length;
    const avgStress = userContext.recentMoods.reduce((sum: number, entry: MoodEntry) => sum + entry.stress, 0) / userContext.recentMoods.length;
    
    // Sanitize health metrics to remove precise identifying patterns
    const sanitizedMetrics = sanitizeHealthMetrics({
      avgMood,
      avgEnergy, 
      avgStress
    });
    
    systemPrompt += `\n\nRECENT MOOD PATTERNS (last 14 days):
- Average mood: ${sanitizedMetrics.avgMood}/10
- Average energy: ${sanitizedMetrics.avgEnergy}/10  
- Average stress: ${sanitizedMetrics.avgStress}/10
- Total mood entries: ${userContext.recentMoods.length}`;
  }

  // Recent health summary (sanitized)
  if (userContext.recentSummaries?.length > 0) {
    const avgSleep = userContext.recentSummaries
      .filter((s: DailySummary) => s.sleep_hours)
      .reduce((sum: number, s: DailySummary) => sum + parseFloat(s.sleep_hours!.toString()), 0) / 
      userContext.recentSummaries.filter((s: DailySummary) => s.sleep_hours).length;
    
    if (avgSleep) {
      // Sanitize sleep metrics
      const sanitizedSleep = sanitizeHealthMetrics({ avgSleep });
      
      systemPrompt += `\n\nRECENT HEALTH METRICS (last 7 days):
- Average sleep: ${sanitizedSleep.avgSleep} hours/night`;
    }
    
    const riskLevels = userContext.recentSummaries.map((s: DailySummary) => s.risk_level).filter(Boolean);
    if (riskLevels.length > 0) {
      const highRiskDays = riskLevels.filter((r: string | undefined) => r === 'red' || r === 'amber').length;
      if (highRiskDays > 0) {
        systemPrompt += `\n- ⚠️ ${highRiskDays} elevated risk days recently`;
      }
    }
  }

  const therapeuticClosing = Deno.env.get('THERAPEUTIC_CLOSING_PROMPT') || 
    `\n\nProvide helpful, supportive responses based on this context. Be professional and encourage seeking professional help when appropriate.`;
  
  systemPrompt += therapeuticClosing;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-8), // Last 8 messages for context
    { role: 'user', content: message }
  ];

  console.log(`Calling OpenRouter API with model: ${model}`);
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://kzfrnenyoquubjyojbvn.supabase.co',
      'X-Title': 'Bipolar Guardian - AI Therapist'
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    logDetailedError(
      new Error(`API request failed: ${response.status}`),
      { operation: 'openrouter_api', model },
      'guardian-chat'
    );
    throw new Error(`AI model ${model} temporarily unavailable`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid API response format');
  }

  return data.choices[0].message.content;
}
