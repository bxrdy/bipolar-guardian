import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { handleSecureError } from '../_shared/errorHandler.ts';
import { getSecureCORSHeaders } from '../_shared/cors.ts';
import { validateSecurity, createSecureResponse } from '../_shared/securityHeaders.ts';
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { validateRequestBody } from '../_shared/inputValidator.ts';

const SAFETY_VALIDATION_SCHEMA = {
  content: {
    type: 'string' as const,
    required: true,
    maxLength: 10000
  },
  contentType: {
    type: 'string' as const,
    required: true,
    allowedValues: ['ai_response', 'user_input', 'medical_document', 'system_message']
  },
  context: {
    type: 'object' as const,
    required: false
  },
  validationLevel: {
    type: 'string' as const,
    required: false,
    allowedValues: ['basic', 'standard', 'strict', 'emergency']
  }
};

interface SafetyValidationResult {
  content: string;
  contentType: string;
  validation: {
    overallSafety: number;
    crisisRisk: number;
    harmPrevention: number;
    professionalBoundaries: number;
    ethicalCompliance: number;
    privacyProtection: number;
  };
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    immediateAction: boolean;
    emergencyResponse: boolean;
    professionalReferral: boolean;
    monitoringRequired: boolean;
  };
  detectedIssues: {
    crisisIndicators: string[];
    harmRisks: string[];
    boundaryViolations: string[];
    ethicalConcerns: string[];
    privacyViolations: string[];
    medicalAdviceIssues: string[];
  };
  safetyMetrics: {
    toxicityScore: number;
    suicidalityRisk: number;
    violenceRisk: number;
    substanceAbuseRisk: number;
    selfHarmRisk: number;
    manipulationRisk: number;
  };
  complianceCheck: {
    hipaaCompliance: number;
    therapeuticStandards: number;
    emergencyProtocols: number;
    professionalEthics: number;
  };
  actionItems: string[];
  recommendations: string[];
  confidenceScore: number;
  processingTime: number;
}

// Crisis and safety keywords with severity levels
const CRISIS_KEYWORDS = {
  critical: [
    'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
    'no point living', 'planning to hurt', 'have a plan', 'tonight is the night'
  ],
  high: [
    'self harm', 'hurt myself', 'cut myself', 'overdose', 'jump off',
    'can\'t go on', 'hopeless', 'worthless', 'burden to everyone'
  ],
  medium: [
    'thoughts of death', 'wish i was dead', 'life isn\'t worth', 'give up',
    'no hope', 'can\'t take it', 'everything hurts', 'so depressed'
  ]
};

const HARM_INDICATORS = {
  violence: [
    'hurt someone', 'kill them', 'violent thoughts', 'want to hurt',
    'revenge', 'make them pay', 'weapon', 'attack', 'destroy'
  ],
  substance: [
    'overdose', 'too many pills', 'drinking heavily', 'getting high',
    'need drugs', 'addiction', 'can\'t stop using', 'substance abuse'
  ],
  selfHarm: [
    'cutting', 'burning myself', 'hitting myself', 'self injury',
    'punishing myself', 'deserve pain', 'physical pain helps'
  ]
};

const BOUNDARY_VIOLATIONS = {
  medicalAdvice: [
    'you should take', 'stop your medication', 'increase the dose',
    'i prescribe', 'medical diagnosis', 'you have bipolar', 'you need therapy'
  ],
  inappropriate: [
    'personal relationship', 'meet in person', 'give me your number',
    'romantic feelings', 'special connection', 'just between us'
  ],
  unprofessional: [
    'i\'m not qualified', 'just my opinion', 'don\'t tell anyone',
    'ignore your doctor', 'therapy is waste', 'medication is bad'
  ]
};

const PRIVACY_CONCERNS = [
  'share your information', 'tell others about', 'public record',
  'insurance company', 'your employer', 'family members know',
  'medical records', 'personal details', 'confidential information'
];

const ETHICAL_RED_FLAGS = [
  'lie to your doctor', 'hide this from', 'secret between us',
  'don\'t trust professionals', 'only i understand', 'special case',
  'rules don\'t apply', 'exception for you', 'bend the guidelines'
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
        { operation: 'safety_validation_security' },
        'safety-validation',
        corsHeaders
      );
    }

    const rateLimitCheck = checkRateLimit(req, 'safety-validation', 'CRITICAL', corsHeaders);
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
        'safety-validation',
        corsHeaders
      );
    }

    const validation = await validateRequestBody(req.clone(), SAFETY_VALIDATION_SCHEMA);
    if (!validation.valid) {
      return handleSecureError(
        new Error(`Invalid request: ${validation.errors.join(', ')}`),
        { userId: user.id, operation: 'validate_safety_input' },
        'safety-validation',
        corsHeaders
      );
    }

    const { 
      content, 
      contentType, 
      context = {}, 
      validationLevel = 'standard' 
    } = validation.sanitizedData!;

    const startTime = Date.now();

    // Perform safety validation
    const safetyResult = await performSafetyValidation(
      content,
      contentType,
      context,
      validationLevel,
      supabaseClient,
      user.id
    );

    const processingTime = Date.now() - startTime;
    safetyResult.processingTime = processingTime;

    // Store safety validation results
    await storeSafetyValidation(supabaseClient, user.id, safetyResult);

    // Check if immediate action is required
    if (safetyResult.riskAssessment.immediateAction) {
      // Log critical safety event
      await logCriticalSafetyEvent(supabaseClient, user.id, safetyResult);
    }

    return createSecureResponse(
      JSON.stringify({
        success: true,
        result: safetyResult
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
      { userId: 'unknown', operation: 'safety_validation_general' },
      'safety-validation',
      corsHeaders
    );
  }
});

async function performSafetyValidation(
  content: string,
  contentType: string,
  context: any,
  validationLevel: string,
  supabaseClient: any,
  userId: string
): Promise<SafetyValidationResult> {
  
  const contentLower = content.toLowerCase();
  
  // Detect safety issues
  const detectedIssues = detectSafetyIssues(contentLower, contentType);
  
  // Assess risk level
  const riskAssessment = assessRiskLevel(detectedIssues, contentType, validationLevel);
  
  // Calculate safety metrics
  const safetyMetrics = calculateSafetyMetrics(contentLower, detectedIssues);
  
  // Validate compliance
  const complianceCheck = validateCompliance(contentLower, contentType, detectedIssues);
  
  // Calculate validation scores
  const validation = calculateValidationScores(safetyMetrics, complianceCheck, riskAssessment);
  
  // Generate action items and recommendations
  const actionItems = generateActionItems(riskAssessment, detectedIssues, validationLevel);
  const recommendations = generateSafetyRecommendations(validation, detectedIssues, riskAssessment);
  
  // Calculate confidence score
  const confidenceScore = calculateSafetyConfidenceScore(validation, safetyMetrics, detectedIssues);
  
  return {
    content,
    contentType,
    validation,
    riskAssessment,
    detectedIssues,
    safetyMetrics,
    complianceCheck,
    actionItems,
    recommendations,
    confidenceScore,
    processingTime: 0
  };
}

function detectSafetyIssues(content: string, contentType: string) {
  const issues = {
    crisisIndicators: [] as string[],
    harmRisks: [] as string[],
    boundaryViolations: [] as string[],
    ethicalConcerns: [] as string[],
    privacyViolations: [] as string[],
    medicalAdviceIssues: [] as string[]
  };

  // Crisis indicators
  Object.entries(CRISIS_KEYWORDS).forEach(([severity, keywords]) => {
    keywords.forEach(keyword => {
      if (content.includes(keyword)) {
        issues.crisisIndicators.push(`${severity}: ${keyword}`);
      }
    });
  });

  // Harm risks
  Object.entries(HARM_INDICATORS).forEach(([type, indicators]) => {
    indicators.forEach(indicator => {
      if (content.includes(indicator)) {
        issues.harmRisks.push(`${type}: ${indicator}`);
      }
    });
  });

  // Boundary violations
  Object.entries(BOUNDARY_VIOLATIONS).forEach(([type, violations]) => {
    violations.forEach(violation => {
      if (content.includes(violation)) {
        issues.boundaryViolations.push(`${type}: ${violation}`);
      }
    });
  });

  // Ethical concerns
  ETHICAL_RED_FLAGS.forEach(flag => {
    if (content.includes(flag)) {
      issues.ethicalConcerns.push(flag);
    }
  });

  // Privacy violations
  PRIVACY_CONCERNS.forEach(concern => {
    if (content.includes(concern)) {
      issues.privacyViolations.push(concern);
    }
  });

  // Medical advice issues (for AI responses)
  if (contentType === 'ai_response') {
    BOUNDARY_VIOLATIONS.medicalAdvice.forEach(advice => {
      if (content.includes(advice)) {
        issues.medicalAdviceIssues.push(advice);
      }
    });
  }

  return issues;
}

function assessRiskLevel(
  detectedIssues: any,
  contentType: string,
  validationLevel: string
) {
  let riskScore = 0;
  let immediateAction = false;
  let emergencyResponse = false;
  let professionalReferral = false;
  let monitoringRequired = false;

  // Crisis indicators scoring
  detectedIssues.crisisIndicators.forEach((indicator: string) => {
    if (indicator.includes('critical:')) {
      riskScore += 40;
      immediateAction = true;
      emergencyResponse = true;
    } else if (indicator.includes('high:')) {
      riskScore += 25;
      professionalReferral = true;
      monitoringRequired = true;
    } else if (indicator.includes('medium:')) {
      riskScore += 15;
      monitoringRequired = true;
    }
  });

  // Harm risks scoring
  detectedIssues.harmRisks.forEach((risk: string) => {
    if (risk.includes('violence:')) {
      riskScore += 30;
      immediateAction = true;
    } else if (risk.includes('substance:')) {
      riskScore += 20;
      professionalReferral = true;
    } else if (risk.includes('selfHarm:')) {
      riskScore += 25;
      professionalReferral = true;
    }
  });

  // Boundary and ethical violations
  if (detectedIssues.boundaryViolations.length > 0) {
    riskScore += detectedIssues.boundaryViolations.length * 10;
    professionalReferral = true;
  }

  if (detectedIssues.ethicalConcerns.length > 0) {
    riskScore += detectedIssues.ethicalConcerns.length * 15;
    immediateAction = true;
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore >= 40 || emergencyResponse) {
    riskLevel = 'critical';
  } else if (riskScore >= 25 || immediateAction) {
    riskLevel = 'high';
  } else if (riskScore >= 15 || professionalReferral) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Adjust for validation level
  if (validationLevel === 'strict' || validationLevel === 'emergency') {
    if (riskScore >= 10) {
      monitoringRequired = true;
    }
    if (riskScore >= 20) {
      professionalReferral = true;
    }
  }

  return {
    riskLevel,
    immediateAction,
    emergencyResponse,
    professionalReferral,
    monitoringRequired
  };
}

function calculateSafetyMetrics(content: string, detectedIssues: any) {
  // Toxicity score based on harmful language
  const toxicWords = ['hate', 'stupid', 'worthless', 'useless', 'pathetic', 'loser'];
  const toxicCount = toxicWords.filter(word => content.includes(word)).length;
  const toxicityScore = Math.min(100, toxicCount * 20);

  // Suicidality risk
  const suicidalIndicators = detectedIssues.crisisIndicators.filter((i: string) => 
    i.includes('suicide') || i.includes('kill myself') || i.includes('end my life')
  ).length;
  const suicidalityRisk = Math.min(100, suicidalIndicators * 40);

  // Violence risk
  const violenceIndicators = detectedIssues.harmRisks.filter((r: string) => 
    r.includes('violence:')
  ).length;
  const violenceRisk = Math.min(100, violenceIndicators * 35);

  // Substance abuse risk
  const substanceIndicators = detectedIssues.harmRisks.filter((r: string) => 
    r.includes('substance:')
  ).length;
  const substanceAbuseRisk = Math.min(100, substanceIndicators * 30);

  // Self-harm risk
  const selfHarmIndicators = detectedIssues.harmRisks.filter((r: string) => 
    r.includes('selfHarm:')
  ).length;
  const selfHarmRisk = Math.min(100, selfHarmIndicators * 35);

  // Manipulation risk (based on boundary violations and ethical concerns)
  const manipulationIndicators = detectedIssues.ethicalConcerns.length + 
    detectedIssues.boundaryViolations.filter((v: string) => 
      v.includes('inappropriate:')
    ).length;
  const manipulationRisk = Math.min(100, manipulationIndicators * 25);

  return {
    toxicityScore,
    suicidalityRisk,
    violenceRisk,
    substanceAbuseRisk,
    selfHarmRisk,
    manipulationRisk
  };
}

function validateCompliance(content: string, contentType: string, detectedIssues: any) {
  // HIPAA compliance (privacy protection)
  const privacyViolations = detectedIssues.privacyViolations.length;
  const hipaaCompliance = Math.max(0, 100 - (privacyViolations * 30));

  // Therapeutic standards
  const boundaryViolations = detectedIssues.boundaryViolations.length;
  const medicalAdviceIssues = detectedIssues.medicalAdviceIssues.length;
  const therapeuticStandards = Math.max(0, 100 - (boundaryViolations + medicalAdviceIssues) * 20);

  // Emergency protocols (crisis response appropriateness)
  const crisisIndicators = detectedIssues.crisisIndicators.filter((i: string) => 
    i.includes('critical:') || i.includes('high:')
  ).length;
  const hasAppropriateResponse = content.includes('emergency') || 
    content.includes('professional help') || 
    content.includes('contact doctor');
  
  let emergencyProtocols = 100;
  if (crisisIndicators > 0 && !hasAppropriateResponse && contentType === 'ai_response') {
    emergencyProtocols = Math.max(0, 100 - (crisisIndicators * 40));
  }

  // Professional ethics
  const ethicalViolations = detectedIssues.ethicalConcerns.length;
  const professionalEthics = Math.max(0, 100 - (ethicalViolations * 25));

  return {
    hipaaCompliance,
    therapeuticStandards,
    emergencyProtocols,
    professionalEthics
  };
}

function calculateValidationScores(
  safetyMetrics: any,
  complianceCheck: any,
  riskAssessment: any
) {
  // Crisis risk (inverse of suicidality and self-harm risks)
  const crisisRisk = Math.max(0, 100 - safetyMetrics.suicidalityRisk - safetyMetrics.selfHarmRisk);

  // Harm prevention (inverse of violence and substance risks)
  const harmPrevention = Math.max(0, 100 - safetyMetrics.violenceRisk - safetyMetrics.substanceAbuseRisk);

  // Professional boundaries (from compliance check)
  const professionalBoundaries = complianceCheck.therapeuticStandards;

  // Ethical compliance (from compliance check)
  const ethicalCompliance = complianceCheck.professionalEthics;

  // Privacy protection (from compliance check)
  const privacyProtection = complianceCheck.hipaaCompliance;

  // Overall safety score
  const overallSafety = (
    crisisRisk * 0.25 +
    harmPrevention * 0.25 +
    professionalBoundaries * 0.2 +
    ethicalCompliance * 0.15 +
    privacyProtection * 0.15
  );

  // Adjust for risk level
  const riskAdjustment = {
    'low': 0,
    'medium': -10,
    'high': -25,
    'critical': -50
  };

  const adjustedOverallSafety = Math.max(0, overallSafety + riskAdjustment[riskAssessment.riskLevel]);

  return {
    overallSafety: adjustedOverallSafety,
    crisisRisk,
    harmPrevention,
    professionalBoundaries,
    ethicalCompliance,
    privacyProtection
  };
}

function generateActionItems(
  riskAssessment: any,
  detectedIssues: any,
  validationLevel: string
): string[] {
  const actionItems: string[] = [];

  if (riskAssessment.emergencyResponse) {
    actionItems.push('URGENT: Contact emergency services immediately');
    actionItems.push('Initiate crisis intervention protocols');
  }

  if (riskAssessment.immediateAction) {
    actionItems.push('Flag content for immediate review');
    actionItems.push('Alert mental health professionals');
  }

  if (riskAssessment.professionalReferral) {
    actionItems.push('Refer to qualified mental health professional');
    actionItems.push('Provide emergency contact information');
  }

  if (riskAssessment.monitoringRequired) {
    actionItems.push('Increase monitoring frequency');
    actionItems.push('Schedule follow-up safety check');
  }

  if (detectedIssues.boundaryViolations.length > 0) {
    actionItems.push('Review and reinforce professional boundaries');
  }

  if (detectedIssues.ethicalConcerns.length > 0) {
    actionItems.push('Conduct ethical compliance review');
  }

  if (detectedIssues.privacyViolations.length > 0) {
    actionItems.push('Address privacy protection concerns');
  }

  return actionItems;
}

function generateSafetyRecommendations(
  validation: any,
  detectedIssues: any,
  riskAssessment: any
): string[] {
  const recommendations: string[] = [];

  if (validation.overallSafety < 70) {
    recommendations.push('Comprehensive safety review required');
  }

  if (validation.crisisRisk < 80) {
    recommendations.push('Enhance crisis detection and response protocols');
  }

  if (validation.harmPrevention < 75) {
    recommendations.push('Strengthen harm prevention measures');
  }

  if (validation.professionalBoundaries < 85) {
    recommendations.push('Improve professional boundary maintenance');
  }

  if (validation.ethicalCompliance < 90) {
    recommendations.push('Review ethical guidelines and compliance procedures');
  }

  if (validation.privacyProtection < 95) {
    recommendations.push('Enhance privacy protection measures');
  }

  if (riskAssessment.riskLevel === 'critical' || riskAssessment.riskLevel === 'high') {
    recommendations.push('Implement immediate safety interventions');
  }

  if (detectedIssues.crisisIndicators.length > 0) {
    recommendations.push('Provide crisis resources and emergency contacts');
  }

  if (recommendations.length === 0) {
    recommendations.push('Safety validation passed - continue current protocols');
  }

  return recommendations;
}

function calculateSafetyConfidenceScore(
  validation: any,
  safetyMetrics: any,
  detectedIssues: any
): number {
  let confidence = validation.overallSafety;

  // Reduce confidence for detected issues
  const totalIssues = Object.values(detectedIssues).reduce((sum: number, issues: any) => 
    sum + (Array.isArray(issues) ? issues.length : 0), 0
  );

  confidence -= totalIssues * 5;

  // Reduce confidence for high-risk metrics
  if (safetyMetrics.suicidalityRisk > 50) confidence -= 20;
  if (safetyMetrics.violenceRisk > 40) confidence -= 15;
  if (safetyMetrics.manipulationRisk > 30) confidence -= 10;

  // Adjust for validation completeness
  const validationAverage = (
    validation.crisisRisk +
    validation.harmPrevention +
    validation.professionalBoundaries +
    validation.ethicalCompliance +
    validation.privacyProtection
  ) / 5;

  confidence = (confidence + validationAverage) / 2;

  return Math.max(0, Math.min(100, confidence));
}

async function storeSafetyValidation(
  supabaseClient: any,
  userId: string,
  result: SafetyValidationResult
): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('validation_results')
      .insert({
        user_id: userId,
        validation_type: 'safety_validation',
        accuracy_score: result.validation.overallSafety,
        confidence_score: result.confidenceScore,
        processing_time: result.processingTime,
        metrics: {
          validation: result.validation,
          safety_metrics: result.safetyMetrics,
          compliance_check: result.complianceCheck,
          risk_assessment: result.riskAssessment
        },
        issues: [
          ...result.detectedIssues.crisisIndicators,
          ...result.detectedIssues.harmRisks,
          ...result.detectedIssues.boundaryViolations,
          ...result.detectedIssues.ethicalConcerns,
          ...result.detectedIssues.privacyViolations,
          ...result.detectedIssues.medicalAdviceIssues
        ],
        recommendations: result.recommendations,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.log('Could not store safety validation:', error.message);
    }
  } catch (error) {
    console.log('Error storing safety validation:', error);
  }
}

async function logCriticalSafetyEvent(
  supabaseClient: any,
  userId: string,
  result: SafetyValidationResult
): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('critical_safety_events')
      .insert({
        user_id: userId,
        event_type: 'safety_validation_critical',
        risk_level: result.riskAssessment.riskLevel,
        immediate_action: result.riskAssessment.immediateAction,
        emergency_response: result.riskAssessment.emergencyResponse,
        detected_issues: result.detectedIssues,
        action_items: result.actionItems,
        content_type: result.contentType,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.log('Could not log critical safety event:', error.message);
    }
  } catch (error) {
    console.log('Error logging critical safety event:', error);
  }
}