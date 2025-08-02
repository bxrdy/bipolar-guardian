import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { handleSecureError } from '../_shared/errorHandler.ts';
import { getSecureCORSHeaders } from '../_shared/cors.ts';
import { validateSecurity, createSecureResponse } from '../_shared/securityHeaders.ts';
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { validateRequestBody } from '../_shared/inputValidator.ts';

const THERAPEUTIC_RESPONSE_SCHEMA = {
  response: {
    type: 'string' as const,
    required: true,
    maxLength: 10000
  },
  userMessage: {
    type: 'string' as const,
    required: true,
    maxLength: 5000
  },
  conversationContext: {
    type: 'array' as const,
    required: false
  },
  evaluationMode: {
    type: 'string' as const,
    required: false,
    allowedValues: ['basic', 'standard', 'comprehensive']
  }
};

interface TherapeuticResponseResult {
  response: string;
  userMessage: string;
  evaluation: {
    therapeuticQuality: number;
    empathy: number;
    professionalism: number;
    safetyCompliance: number;
    contextualRelevance: number;
    overallScore: number;
  };
  analysis: {
    responseLength: number;
    sentimentPolarity: number;
    therapeuticElements: string[];
    supportiveLanguage: number;
    boundaryMaintenance: number;
    riskAssessment: number;
  };
  criteria: {
    empathyIndicators: number;
    professionalTone: number;
    therapeuticTechniques: number;
    safetyGuidelines: number;
    ethicalBoundaries: number;
    crisisHandling: number;
  };
  flags: {
    safetyViolations: string[];
    boundaryIssues: string[];
    professionalConcerns: string[];
    therapeuticGaps: string[];
  };
  recommendations: string[];
  confidenceScore: number;
  processingTime: number;
}

// Therapeutic quality indicators
const THERAPEUTIC_INDICATORS = {
  empathy: [
    'i understand', 'that sounds difficult', 'i hear you', 'i can see how',
    'that must be', 'i imagine', 'it seems like', 'i notice you',
    'thank you for sharing', 'i appreciate', 'that takes courage'
  ],
  validation: [
    'your feelings are valid', 'that makes sense', 'understandable reaction',
    'normal to feel', 'many people experience', 'not alone in this'
  ],
  support: [
    'i\'m here to help', 'we can work through', 'together we can',
    'support you', 'here for you', 'you don\'t have to'
  ],
  professional: [
    'healthcare provider', 'professional help', 'therapist', 'doctor',
    'psychiatrist', 'medical attention', 'emergency services'
  ],
  boundaries: [
    'i cannot diagnose', 'not a replacement', 'emergency situation',
    'seek immediate help', 'contact your doctor', 'professional guidance'
  ]
};

const SAFETY_KEYWORDS = {
  crisis: [
    'suicide', 'self-harm', 'hurt myself', 'end my life', 'kill myself',
    'better off dead', 'no point living', 'want to die'
  ],
  emergency: [
    'emergency', 'urgent', 'crisis', 'immediate help', '911', 'ambulance'
  ],
  harm: [
    'hurt someone', 'violent thoughts', 'dangerous', 'weapon', 'threat'
  ]
};

const INAPPROPRIATE_RESPONSES = [
  'you should take medication',
  'you have depression',
  'you are bipolar',
  'i diagnose you',
  'stop taking your medication',
  'don\'t see a doctor',
  'therapy is useless',
  'just think positive',
  'it\'s all in your head',
  'snap out of it'
];

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
        { operation: 'evaluate_therapeutic_response_security' },
        'evaluate-therapeutic-response',
        corsHeaders
      );
    }

    const rateLimitCheck = checkRateLimit(req, 'evaluate-therapeutic-response', 'HIGH', corsHeaders);
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
        'evaluate-therapeutic-response',
        corsHeaders
      );
    }

    const validation = await validateRequestBody(req.clone(), THERAPEUTIC_RESPONSE_SCHEMA);
    if (!validation.valid) {
      return handleSecureError(
        new Error(`Invalid request: ${validation.errors.join(', ')}`),
        { userId: user.id, operation: 'validate_response_input' },
        'evaluate-therapeutic-response',
        corsHeaders
      );
    }

    const { 
      response, 
      userMessage, 
      conversationContext = [], 
      evaluationMode = 'standard' 
    } = validation.sanitizedData!;

    const startTime = Date.now();

    // Evaluate therapeutic response
    const evaluationResult = await evaluateTherapeuticResponse(
      response,
      userMessage,
      conversationContext,
      evaluationMode,
      supabaseClient,
      user.id
    );

    const processingTime = Date.now() - startTime;
    evaluationResult.processingTime = processingTime;

    // Store evaluation results
    await storeTherapeuticEvaluation(supabaseClient, user.id, evaluationResult);

    return createSecureResponse(
      JSON.stringify({
        success: true,
        result: evaluationResult
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
      { userId: 'unknown', operation: 'evaluate_therapeutic_response_general' },
      'evaluate-therapeutic-response',
      corsHeaders
    );
  }
});

async function evaluateTherapeuticResponse(
  response: string,
  userMessage: string,
  conversationContext: any[],
  evaluationMode: string,
  supabaseClient: any,
  userId: string
): Promise<TherapeuticResponseResult> {
  
  const responseText = response.toLowerCase();
  const userText = userMessage.toLowerCase();
  
  // Analyze response structure and content
  const analysis = analyzeResponseContent(response, userMessage);
  
  // Evaluate therapeutic criteria
  const criteria = evaluateTherapeuticCriteria(responseText, userText, conversationContext);
  
  // Calculate evaluation scores
  const evaluation = calculateEvaluationScores(criteria, analysis);
  
  // Detect safety and professional flags
  const flags = detectResponseFlags(responseText, userText, analysis);
  
  // Generate recommendations
  const recommendations = generateTherapeuticRecommendations(evaluation, flags, criteria);
  
  // Calculate confidence score
  const confidenceScore = calculateConfidenceScore(evaluation, flags, analysis);
  
  return {
    response,
    userMessage,
    evaluation,
    analysis,
    criteria,
    flags,
    recommendations,
    confidenceScore,
    processingTime: 0
  };
}

function analyzeResponseContent(response: string, userMessage: string) {
  const responseText = response.toLowerCase();
  const userText = userMessage.toLowerCase();
  
  // Basic metrics
  const responseLength = response.length;
  const wordCount = response.split(/\s+/).length;
  
  // Sentiment analysis (simple)
  const sentimentPolarity = calculateSentimentPolarity(responseText);
  
  // Therapeutic elements detection
  const therapeuticElements = detectTherapeuticElements(responseText);
  
  // Supportive language analysis
  const supportiveLanguage = calculateSupportiveLanguage(responseText);
  
  // Boundary maintenance check
  const boundaryMaintenance = checkBoundaryMaintenance(responseText);
  
  // Risk assessment based on user message and response
  const riskAssessment = assessRiskHandling(userText, responseText);
  
  return {
    responseLength,
    sentimentPolarity,
    therapeuticElements,
    supportiveLanguage,
    boundaryMaintenance,
    riskAssessment
  };
}

function calculateSentimentPolarity(text: string): number {
  const positiveWords = [
    'help', 'support', 'understand', 'care', 'hope', 'better', 'improve',
    'strength', 'courage', 'positive', 'good', 'great', 'wonderful'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'hopeless', 'impossible', 'never', 'wrong',
    'hate', 'angry', 'frustrated', 'sad', 'depressed', 'anxious'
  ];
  
  const words = text.split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  if (totalSentimentWords === 0) return 0; // Neutral
  
  return ((positiveCount - negativeCount) / totalSentimentWords) * 100;
}

function detectTherapeuticElements(text: string): string[] {
  const elements: string[] = [];
  
  Object.entries(THERAPEUTIC_INDICATORS).forEach(([category, indicators]) => {
    indicators.forEach(indicator => {
      if (text.includes(indicator)) {
        elements.push(`${category}: ${indicator}`);
      }
    });
  });
  
  return elements;
}

function calculateSupportiveLanguage(text: string): number {
  const supportivePatterns = [
    /i understand/g,
    /that makes sense/g,
    /you're not alone/g,
    /i'm here/g,
    /we can work/g,
    /let's explore/g,
    /how are you feeling/g,
    /tell me more/g
  ];
  
  let supportiveCount = 0;
  supportivePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) supportiveCount += matches.length;
  });
  
  const wordCount = text.split(/\s+/).length;
  return Math.min(100, (supportiveCount / Math.max(1, wordCount / 10)) * 100);
}

function checkBoundaryMaintenance(text: string): number {
  let boundaryScore = 100; // Start with perfect score
  
  // Check for inappropriate medical advice
  const medicalAdvicePatterns = [
    /you should take/,
    /i recommend medication/,
    /stop taking/,
    /increase your dose/,
    /you have [a-z]+ disorder/,
    /i diagnose/
  ];
  
  medicalAdvicePatterns.forEach(pattern => {
    if (pattern.test(text)) {
      boundaryScore -= 30;
    }
  });
  
  // Check for appropriate boundary statements
  const boundaryIndicators = THERAPEUTIC_INDICATORS.boundaries;
  let boundaryMaintained = false;
  
  boundaryIndicators.forEach(indicator => {
    if (text.includes(indicator)) {
      boundaryMaintained = true;
    }
  });
  
  // If discussing medical topics without boundaries, reduce score
  const medicalTopics = ['medication', 'diagnosis', 'treatment', 'therapy'];
  const discussesMedical = medicalTopics.some(topic => text.includes(topic));
  
  if (discussesMedical && !boundaryMaintained) {
    boundaryScore -= 20;
  }
  
  return Math.max(0, boundaryScore);
}

function assessRiskHandling(userText: string, responseText: string): number {
  let riskScore = 100;
  
  // Check if user message contains crisis indicators
  const userInCrisis = SAFETY_KEYWORDS.crisis.some(keyword => userText.includes(keyword));
  const userInEmergency = SAFETY_KEYWORDS.emergency.some(keyword => userText.includes(keyword));
  
  if (userInCrisis || userInEmergency) {
    // Response should contain appropriate crisis handling
    const hasEmergencyResponse = SAFETY_KEYWORDS.emergency.some(keyword => responseText.includes(keyword));
    const hasProfessionalReferral = THERAPEUTIC_INDICATORS.professional.some(phrase => responseText.includes(phrase));
    
    if (!hasEmergencyResponse && !hasProfessionalReferral) {
      riskScore -= 50; // Major reduction for inadequate crisis response
    }
    
    // Should not minimize crisis
    const minimizingPhrases = ['just think positive', 'it\'s not that bad', 'calm down'];
    if (minimizingPhrases.some(phrase => responseText.includes(phrase))) {
      riskScore -= 30;
    }
  }
  
  return Math.max(0, riskScore);
}

function evaluateTherapeuticCriteria(responseText: string, userText: string, context: any[]) {
  // Empathy indicators
  const empathyIndicators = THERAPEUTIC_INDICATORS.empathy
    .filter(indicator => responseText.includes(indicator)).length;
  const empathyScore = Math.min(100, (empathyIndicators / 3) * 100);
  
  // Professional tone
  const professionalElements = THERAPEUTIC_INDICATORS.professional.length;
  const professionalFound = THERAPEUTIC_INDICATORS.professional
    .filter(element => responseText.includes(element)).length;
  const professionalTone = professionalFound > 0 ? 100 : 80; // Base professional score
  
  // Therapeutic techniques
  const validationFound = THERAPEUTIC_INDICATORS.validation
    .filter(phrase => responseText.includes(phrase)).length;
  const supportFound = THERAPEUTIC_INDICATORS.support
    .filter(phrase => responseText.includes(phrase)).length;
  const therapeuticTechniques = Math.min(100, ((validationFound + supportFound) / 4) * 100);
  
  // Safety guidelines adherence
  const safetyViolations = INAPPROPRIATE_RESPONSES
    .filter(inappropriate => responseText.includes(inappropriate)).length;
  const safetyGuidelines = Math.max(0, 100 - (safetyViolations * 25));
  
  // Ethical boundaries
  const ethicalBoundaries = checkBoundaryMaintenance(responseText);
  
  // Crisis handling
  const crisisHandling = assessRiskHandling(userText, responseText);
  
  return {
    empathyIndicators: empathyScore,
    professionalTone,
    therapeuticTechniques,
    safetyGuidelines,
    ethicalBoundaries,
    crisisHandling
  };
}

function calculateEvaluationScores(criteria: any, analysis: any) {
  // Therapeutic quality (weighted average of key criteria)
  const therapeuticQuality = (
    criteria.empathyIndicators * 0.3 +
    criteria.therapeuticTechniques * 0.4 +
    criteria.professionalTone * 0.3
  );
  
  // Empathy score
  const empathy = criteria.empathyIndicators;
  
  // Professionalism score
  const professionalism = (criteria.professionalTone + criteria.ethicalBoundaries) / 2;
  
  // Safety compliance
  const safetyCompliance = (criteria.safetyGuidelines + criteria.crisisHandling) / 2;
  
  // Contextual relevance (based on response appropriateness)
  const contextualRelevance = Math.min(100, 
    80 + // Base relevance
    (analysis.supportiveLanguage * 0.2) +
    (analysis.sentimentPolarity > 0 ? 10 : 0) // Bonus for positive tone
  );
  
  // Overall score
  const overallScore = (
    therapeuticQuality * 0.3 +
    empathy * 0.2 +
    professionalism * 0.2 +
    safetyCompliance * 0.2 +
    contextualRelevance * 0.1
  );
  
  return {
    therapeuticQuality,
    empathy,
    professionalism,
    safetyCompliance,
    contextualRelevance,
    overallScore
  };
}

function detectResponseFlags(responseText: string, userText: string, analysis: any) {
  const flags = {
    safetyViolations: [] as string[],
    boundaryIssues: [] as string[],
    professionalConcerns: [] as string[],
    therapeuticGaps: [] as string[]
  };
  
  // Safety violations
  INAPPROPRIATE_RESPONSES.forEach(inappropriate => {
    if (responseText.includes(inappropriate)) {
      flags.safetyViolations.push(`Inappropriate response: "${inappropriate}"`);
    }
  });
  
  // Check for crisis without proper handling
  const userInCrisis = SAFETY_KEYWORDS.crisis.some(keyword => userText.includes(keyword));
  if (userInCrisis && analysis.riskAssessment < 80) {
    flags.safetyViolations.push('Inadequate crisis response detected');
  }
  
  // Boundary issues
  if (analysis.boundaryMaintenance < 70) {
    flags.boundaryIssues.push('Professional boundaries may be compromised');
  }
  
  const medicalAdvicePattern = /(you should take|i recommend|stop taking|increase dose)/;
  if (medicalAdvicePattern.test(responseText)) {
    flags.boundaryIssues.push('Potential medical advice without proper qualification');
  }
  
  // Professional concerns
  if (analysis.supportiveLanguage < 50) {
    flags.professionalConcerns.push('Limited supportive language detected');
  }
  
  if (analysis.sentimentPolarity < -20) {
    flags.professionalConcerns.push('Overly negative tone in response');
  }
  
  // Therapeutic gaps
  if (analysis.therapeuticElements.length === 0) {
    flags.therapeuticGaps.push('No therapeutic elements detected in response');
  }
  
  if (responseText.length < 50) {
    flags.therapeuticGaps.push('Response may be too brief for therapeutic value');
  }
  
  return flags;
}

function generateTherapeuticRecommendations(evaluation: any, flags: any, criteria: any): string[] {
  const recommendations: string[] = [];
  
  if (evaluation.empathy < 70) {
    recommendations.push('Increase empathetic language and validation statements');
  }
  
  if (evaluation.therapeuticQuality < 75) {
    recommendations.push('Incorporate more therapeutic techniques and supportive responses');
  }
  
  if (evaluation.safetyCompliance < 90) {
    recommendations.push('Review safety guidelines and crisis response protocols');
  }
  
  if (flags.boundaryIssues.length > 0) {
    recommendations.push('Strengthen professional boundary maintenance');
  }
  
  if (flags.safetyViolations.length > 0) {
    recommendations.push('Address safety violations immediately');
  }
  
  if (criteria.crisisHandling < 80) {
    recommendations.push('Improve crisis detection and emergency response procedures');
  }
  
  if (evaluation.professionalism < 80) {
    recommendations.push('Enhance professional language and appropriate referrals');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Therapeutic response quality meets professional standards');
  }
  
  return recommendations;
}

function calculateConfidenceScore(evaluation: any, flags: any, analysis: any): number {
  let confidence = evaluation.overallScore;
  
  // Reduce confidence for flags
  confidence -= flags.safetyViolations.length * 15;
  confidence -= flags.boundaryIssues.length * 10;
  confidence -= flags.professionalConcerns.length * 5;
  confidence -= flags.therapeuticGaps.length * 8;
  
  // Adjust for response quality indicators
  if (analysis.therapeuticElements.length > 3) confidence += 5;
  if (analysis.supportiveLanguage > 80) confidence += 5;
  if (analysis.boundaryMaintenance > 90) confidence += 5;
  
  return Math.max(0, Math.min(100, confidence));
}

async function storeTherapeuticEvaluation(
  supabaseClient: any,
  userId: string,
  result: TherapeuticResponseResult
): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('validation_results')
      .insert({
        user_id: userId,
        validation_type: 'therapeutic_response',
        accuracy_score: result.evaluation.overallScore,
        confidence_score: result.confidenceScore,
        processing_time: result.processingTime,
        metrics: {
          evaluation: result.evaluation,
          analysis: result.analysis,
          criteria: result.criteria,
          flags: result.flags
        },
        issues: [
          ...result.flags.safetyViolations,
          ...result.flags.boundaryIssues,
          ...result.flags.professionalConcerns,
          ...result.flags.therapeuticGaps
        ],
        recommendations: result.recommendations,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.log('Could not store therapeutic evaluation:', error.message);
    }
  } catch (error) {
    console.log('Error storing therapeutic evaluation:', error);
  }
}