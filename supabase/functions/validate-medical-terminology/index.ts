import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { handleSecureError } from '../_shared/errorHandler.ts';
import { getSecureCORSHeaders } from '../_shared/cors.ts';
import { validateSecurity, createSecureResponse } from '../_shared/securityHeaders.ts';
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { validateRequestBody } from '../_shared/inputValidator.ts';

const MEDICAL_TERMINOLOGY_SCHEMA = {
  text: {
    type: 'string' as const,
    required: true,
    maxLength: 50000
  },
  documentId: {
    type: 'string' as const,
    required: false,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  validationLevel: {
    type: 'string' as const,
    required: false,
    allowedValues: ['basic', 'standard', 'comprehensive']
  }
};

interface MedicalTerminologyResult {
  documentId?: string;
  validation: {
    medicalTermRecognition: number;
    terminologyPreservation: number;
    contextualAccuracy: number;
    overallScore: number;
  };
  analysis: {
    totalTermsDetected: number;
    validMedicalTerms: number;
    invalidTerms: number;
    ambiguousTerms: number;
    missingCriticalTerms: number;
    contextualErrors: number;
  };
  categorization: {
    conditions: string[];
    medications: string[];
    procedures: string[];
    anatomy: string[];
    symptoms: string[];
    measurements: string[];
    abbreviations: string[];
    specialties: string[];
  };
  qualityMetrics: {
    precision: number;
    recall: number;
    f1Score: number;
    confidenceScore: number;
  };
  issues: string[];
  recommendations: string[];
  processingTime: number;
}

// Comprehensive medical terminology dictionary
const MEDICAL_TERMS = {
  conditions: [
    'diabetes', 'hypertension', 'asthma', 'copd', 'pneumonia', 'bronchitis',
    'myocardial infarction', 'stroke', 'seizure', 'epilepsy', 'migraine',
    'depression', 'anxiety', 'bipolar', 'schizophrenia', 'dementia',
    'arthritis', 'osteoporosis', 'fracture', 'laceration', 'contusion',
    'hypertensive', 'hypotensive', 'tachycardia', 'bradycardia', 'arrhythmia',
    'angina', 'ischemia', 'embolism', 'thrombosis', 'hemorrhage',
    'infection', 'sepsis', 'pneumothorax', 'edema', 'dyspnea'
  ],
  medications: [
    'metformin', 'insulin', 'lisinopril', 'amlodipine', 'atorvastatin',
    'aspirin', 'ibuprofen', 'acetaminophen', 'prednisone', 'albuterol',
    'warfarin', 'heparin', 'furosemide', 'omeprazole', 'sertraline',
    'fluoxetine', 'lorazepam', 'morphine', 'oxycodone', 'fentanyl',
    'levothyroxine', 'synthroid', 'lipitor', 'plavix', 'nexium',
    'ventolin', 'advair', 'symbicort', 'spiriva', 'combivent'
  ],
  procedures: [
    'endoscopy', 'colonoscopy', 'biopsy', 'surgery', 'intubation',
    'catheterization', 'angioplasty', 'stent', 'pacemaker', 'defibrillator',
    'dialysis', 'chemotherapy', 'radiation', 'transplant', 'bypass',
    'laparoscopy', 'arthroscopy', 'ultrasound', 'mri', 'ct scan',
    'x-ray', 'ekg', 'ecg', 'eeg', 'emg', 'echocardiogram'
  ],
  anatomy: [
    'heart', 'lung', 'liver', 'kidney', 'brain', 'stomach', 'intestine',
    'pancreas', 'spleen', 'gallbladder', 'esophagus', 'trachea',
    'bronchus', 'alveoli', 'ventricle', 'atrium', 'aorta', 'vena cava',
    'artery', 'vein', 'capillary', 'lymph', 'bone', 'muscle', 'tendon',
    'ligament', 'cartilage', 'joint', 'vertebra', 'femur', 'tibia'
  ],
  symptoms: [
    'pain', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'fatigue',
    'weakness', 'dizziness', 'headache', 'fever', 'chills', 'sweating',
    'cough', 'shortness of breath', 'chest pain', 'abdominal pain',
    'back pain', 'joint pain', 'muscle pain', 'numbness', 'tingling',
    'swelling', 'rash', 'itching', 'bleeding', 'bruising', 'palpitations'
  ],
  measurements: [
    'blood pressure', 'heart rate', 'temperature', 'weight', 'height',
    'glucose', 'cholesterol', 'triglycerides', 'hemoglobin', 'hematocrit',
    'white blood cells', 'platelets', 'creatinine', 'bun', 'sodium',
    'potassium', 'chloride', 'co2', 'oxygen saturation', 'peak flow'
  ],
  abbreviations: [
    'bp', 'hr', 'rr', 'temp', 'wbc', 'rbc', 'hgb', 'hct', 'plt',
    'bun', 'cr', 'na', 'k', 'cl', 'co2', 'o2sat', 'ekg', 'ecg',
    'mri', 'ct', 'cxr', 'ua', 'cbc', 'bmp', 'cmp', 'pt', 'ptt', 'inr'
  ],
  specialties: [
    'cardiology', 'pulmonology', 'neurology', 'psychiatry', 'oncology',
    'endocrinology', 'gastroenterology', 'nephrology', 'rheumatology',
    'dermatology', 'ophthalmology', 'otolaryngology', 'orthopedics',
    'urology', 'gynecology', 'pediatrics', 'geriatrics', 'emergency'
  ]
};

const MEDICAL_ABBREVIATIONS = {
  'bp': 'blood pressure',
  'hr': 'heart rate',
  'rr': 'respiratory rate',
  'temp': 'temperature',
  'wbc': 'white blood cells',
  'rbc': 'red blood cells',
  'hgb': 'hemoglobin',
  'hct': 'hematocrit',
  'plt': 'platelets',
  'bun': 'blood urea nitrogen',
  'cr': 'creatinine',
  'na': 'sodium',
  'k': 'potassium',
  'cl': 'chloride',
  'co2': 'carbon dioxide',
  'o2sat': 'oxygen saturation',
  'ekg': 'electrocardiogram',
  'ecg': 'electrocardiogram',
  'mri': 'magnetic resonance imaging',
  'ct': 'computed tomography',
  'cxr': 'chest x-ray',
  'ua': 'urinalysis',
  'cbc': 'complete blood count',
  'bmp': 'basic metabolic panel',
  'cmp': 'comprehensive metabolic panel',
  'pt': 'prothrombin time',
  'ptt': 'partial thromboplastin time',
  'inr': 'international normalized ratio'
};

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
        { operation: 'validate_medical_terminology_security' },
        'validate-medical-terminology',
        corsHeaders
      );
    }

    const rateLimitCheck = checkRateLimit(req, 'validate-medical-terminology', 'HIGH', corsHeaders);
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
        'validate-medical-terminology',
        corsHeaders
      );
    }

    const validation = await validateRequestBody(req.clone(), MEDICAL_TERMINOLOGY_SCHEMA);
    if (!validation.valid) {
      return handleSecureError(
        new Error(`Invalid request: ${validation.errors.join(', ')}`),
        { userId: user.id, operation: 'validate_terminology_input' },
        'validate-medical-terminology',
        corsHeaders
      );
    }

    const { text, documentId, validationLevel = 'standard' } = validation.sanitizedData!;
    const startTime = Date.now();

    // Validate medical terminology
    const terminologyResult = await validateMedicalTerminology(
      text,
      documentId,
      validationLevel,
      supabaseClient,
      user.id
    );

    const processingTime = Date.now() - startTime;
    terminologyResult.processingTime = processingTime;

    // Store validation results
    await storeTerminologyValidation(supabaseClient, user.id, documentId, terminologyResult);

    return createSecureResponse(
      JSON.stringify({
        success: true,
        result: terminologyResult
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
      { userId: 'unknown', operation: 'validate_medical_terminology_general' },
      'validate-medical-terminology',
      corsHeaders
    );
  }
});

async function validateMedicalTerminology(
  text: string,
  documentId: string | undefined,
  validationLevel: string,
  supabaseClient: any,
  userId: string
): Promise<MedicalTerminologyResult> {
  
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/).filter(word => word.length > 0);
  
  // Extract medical terms by category
  const categorization = categorizeMedicalTerms(normalizedText);
  
  // Count total detected terms
  const totalTermsDetected = Object.values(categorization).reduce((sum, arr) => sum + arr.length, 0);
  
  // Validate terms
  const validationResults = validateDetectedTerms(categorization, normalizedText);
  
  // Calculate metrics
  const metrics = calculateTerminologyMetrics(
    validationResults,
    totalTermsDetected,
    words.length
  );
  
  // Detect issues
  const issues = detectTerminologyIssues(validationResults, normalizedText);
  
  // Generate recommendations
  const recommendations = generateTerminologyRecommendations(metrics, issues, validationLevel);
  
  return {
    documentId,
    validation: {
      medicalTermRecognition: metrics.recognition,
      terminologyPreservation: metrics.preservation,
      contextualAccuracy: metrics.contextual,
      overallScore: metrics.overall
    },
    analysis: {
      totalTermsDetected,
      validMedicalTerms: validationResults.validTerms,
      invalidTerms: validationResults.invalidTerms,
      ambiguousTerms: validationResults.ambiguousTerms,
      missingCriticalTerms: validationResults.missingCritical,
      contextualErrors: validationResults.contextualErrors
    },
    categorization,
    qualityMetrics: {
      precision: metrics.precision,
      recall: metrics.recall,
      f1Score: metrics.f1Score,
      confidenceScore: metrics.confidence
    },
    issues,
    recommendations,
    processingTime: 0
  };
}

function categorizeMedicalTerms(text: string): {
  conditions: string[];
  medications: string[];
  procedures: string[];
  anatomy: string[];
  symptoms: string[];
  measurements: string[];
  abbreviations: string[];
  specialties: string[];
} {
  const categorization = {
    conditions: [],
    medications: [],
    procedures: [],
    anatomy: [],
    symptoms: [],
    measurements: [],
    abbreviations: [],
    specialties: []
  };

  // Search for terms in each category
  Object.entries(MEDICAL_TERMS).forEach(([category, terms]) => {
    terms.forEach(term => {
      if (text.includes(term.toLowerCase())) {
        categorization[category as keyof typeof categorization].push(term);
      }
    });
  });

  // Handle abbreviations with context
  Object.entries(MEDICAL_ABBREVIATIONS).forEach(([abbrev, fullForm]) => {
    if (text.includes(abbrev.toLowerCase())) {
      categorization.abbreviations.push(abbrev);
    }
  });

  return categorization;
}

function validateDetectedTerms(categorization: any, text: string) {
  let validTerms = 0;
  let invalidTerms = 0;
  let ambiguousTerms = 0;
  let contextualErrors = 0;
  let missingCritical = 0;

  // Count valid terms
  Object.values(categorization).forEach((terms: string[]) => {
    validTerms += terms.length;
  });

  // Detect potential invalid terms (common OCR errors)
  const ocrErrors = [
    'medicatiom', 'patiemt', 'diagmosis', 'treatmemt', 'symtoms',
    'medicai', 'hospitai', 'surgicai', 'clinicai', 'normai'
  ];
  
  ocrErrors.forEach(errorTerm => {
    if (text.includes(errorTerm)) {
      invalidTerms++;
    }
  });

  // Detect ambiguous terms (words that could be medical or non-medical)
  const ambiguousWords = ['cold', 'hot', 'sharp', 'dull', 'heavy', 'light'];
  ambiguousWords.forEach(word => {
    if (text.includes(word)) {
      ambiguousTerms++;
    }
  });

  // Check for missing critical terms in medical contexts
  const hasMedicalContext = validTerms > 3;
  if (hasMedicalContext) {
    // If we have medical context but no date, dosage, or measurements
    if (!text.includes('mg') && !text.includes('ml') && !text.includes('dose')) {
      missingCritical++;
    }
    if (!text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)) { // No date pattern
      missingCritical++;
    }
  }

  // Detect contextual errors (medical terms used incorrectly)
  if (text.includes('blood pressure diabetes')) contextualErrors++;
  if (text.includes('heart kidney')) contextualErrors++;
  
  return {
    validTerms,
    invalidTerms,
    ambiguousTerms,
    contextualErrors,
    missingCritical
  };
}

function calculateTerminologyMetrics(
  validationResults: any,
  totalTermsDetected: number,
  totalWords: number
) {
  const { validTerms, invalidTerms, ambiguousTerms, contextualErrors } = validationResults;
  
  // Recognition score (how well we detected medical terms)
  const recognition = totalTermsDetected > 0 
    ? Math.min(100, (validTerms / totalTermsDetected) * 100)
    : 0;
  
  // Preservation score (how well terms were preserved during extraction)
  const preservation = totalTermsDetected > 0
    ? Math.max(0, 100 - (invalidTerms / totalTermsDetected) * 100)
    : 100;
  
  // Contextual accuracy (how well terms are used in context)
  const contextual = totalTermsDetected > 0
    ? Math.max(0, 100 - (contextualErrors / totalTermsDetected) * 100)
    : 100;
  
  // Overall score
  const overall = (recognition + preservation + contextual) / 3;
  
  // Calculate precision and recall
  const truePositives = validTerms;
  const falsePositives = invalidTerms + ambiguousTerms;
  const falseNegatives = validationResults.missingCritical;
  
  const precision = truePositives + falsePositives > 0 
    ? truePositives / (truePositives + falsePositives) * 100
    : 0;
  
  const recall = truePositives + falseNegatives > 0
    ? truePositives / (truePositives + falseNegatives) * 100
    : 0;
  
  const f1Score = precision + recall > 0 
    ? 2 * (precision * recall) / (precision + recall)
    : 0;
  
  // Confidence score based on various factors
  const confidence = Math.min(100, 
    overall * 0.6 + 
    (totalTermsDetected / Math.max(1, totalWords) * 1000) * 0.2 + 
    (precision / 100) * 0.2 * 100
  );
  
  return {
    recognition,
    preservation,
    contextual,
    overall,
    precision,
    recall,
    f1Score,
    confidence
  };
}

function detectTerminologyIssues(validationResults: any, text: string): string[] {
  const issues: string[] = [];
  
  if (validationResults.invalidTerms > 0) {
    issues.push(`${validationResults.invalidTerms} invalid or corrupted medical terms detected`);
  }
  
  if (validationResults.ambiguousTerms > 5) {
    issues.push('High number of ambiguous terms that could be medical or non-medical');
  }
  
  if (validationResults.contextualErrors > 0) {
    issues.push('Medical terms appear to be used incorrectly in context');
  }
  
  if (validationResults.missingCritical > 0) {
    issues.push('Missing critical medical information (dates, dosages, measurements)');
  }
  
  // Check for common OCR issues
  if (text.includes('medicai') || text.includes('hospitai')) {
    issues.push('OCR errors detected in medical terminology');
  }
  
  // Check for formatting issues
  if (text.match(/\d+mg\w/) || text.match(/\d+ml\w/)) {
    issues.push('Medication dosage formatting issues detected');
  }
  
  return issues;
}

function generateTerminologyRecommendations(
  metrics: any,
  issues: string[],
  validationLevel: string
): string[] {
  const recommendations: string[] = [];
  
  if (metrics.recognition < 80) {
    recommendations.push('Improve medical term recognition - consider expanding medical dictionary');
  }
  
  if (metrics.preservation < 85) {
    recommendations.push('Enhance OCR accuracy for medical terminology preservation');
  }
  
  if (metrics.contextual < 75) {
    recommendations.push('Improve contextual understanding of medical terms');
  }
  
  if (metrics.precision < 70) {
    recommendations.push('Reduce false positive medical term detection');
  }
  
  if (metrics.recall < 70) {
    recommendations.push('Improve detection of medical terms - some may be missed');
  }
  
  if (issues.length > 3) {
    recommendations.push('Multiple terminology issues detected - comprehensive review needed');
  }
  
  if (validationLevel === 'comprehensive' && metrics.confidence < 90) {
    recommendations.push('Consider manual review for comprehensive validation level');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Medical terminology validation passed successfully');
  }
  
  return recommendations;
}

async function storeTerminologyValidation(
  supabaseClient: any,
  userId: string,
  documentId: string | undefined,
  result: MedicalTerminologyResult
): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('validation_results')
      .insert({
        user_id: userId,
        document_id: documentId,
        validation_type: 'medical_terminology',
        accuracy_score: result.validation.overallScore,
        confidence_score: result.qualityMetrics.confidenceScore,
        processing_time: result.processingTime,
        metrics: {
          analysis: result.analysis,
          quality: result.qualityMetrics,
          categorization: result.categorization
        },
        issues: result.issues,
        recommendations: result.recommendations,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.log('Could not store terminology validation:', error.message);
    }
  } catch (error) {
    console.log('Error storing terminology validation:', error);
  }
}