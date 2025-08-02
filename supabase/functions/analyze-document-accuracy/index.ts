import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { handleSecureError } from '../_shared/errorHandler.ts';
import { getSecureCORSHeaders } from '../_shared/cors.ts';
import { validateSecurity, createSecureResponse } from '../_shared/securityHeaders.ts';
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { validateRequestBody } from '../_shared/inputValidator.ts';

const DOCUMENT_ACCURACY_SCHEMA = {
  documentId: {
    type: 'string' as const,
    required: true,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  groundTruthText: {
    type: 'string' as const,
    required: false,
    maxLength: 50000
  }
};

interface DocumentAccuracyResult {
  documentId: string;
  fileName: string;
  accuracy: {
    textExtraction: number;
    ocrQuality: number;
    completeness: number;
    wordAccuracy: number;
    characterAccuracy: number;
  };
  metrics: {
    totalWords: number;
    correctWords: number;
    totalCharacters: number;
    correctCharacters: number;
    missingWords: number;
    extraWords: number;
    substitutionErrors: number;
    insertionErrors: number;
    deletionErrors: number;
  };
  confidenceScore: number;
  processingTime: number;
  recommendations: string[];
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
        { operation: 'analyze_document_accuracy_security' },
        'analyze-document-accuracy',
        corsHeaders
      );
    }

    const rateLimitCheck = checkRateLimit(req, 'analyze-document-accuracy', 'HIGH', corsHeaders);
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
        'analyze-document-accuracy',
        corsHeaders
      );
    }

    const validation = await validateRequestBody(req.clone(), DOCUMENT_ACCURACY_SCHEMA);
    if (!validation.valid) {
      return handleSecureError(
        new Error(`Invalid request: ${validation.errors.join(', ')}`),
        { userId: user.id, operation: 'validate_accuracy_input' },
        'analyze-document-accuracy',
        corsHeaders
      );
    }

    const { documentId, groundTruthText } = validation.sanitizedData!;
    const startTime = Date.now();

    // Fetch document from database
    const { data: document, error: docError } = await supabaseClient
      .from('medical_docs')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return handleSecureError(
        new Error('Document not found'),
        { userId: user.id, operation: 'fetch_document', documentId },
        'analyze-document-accuracy',
        corsHeaders
      );
    }

    // Analyze document accuracy
    const accuracyResult = await analyzeDocumentAccuracy(
      document,
      groundTruthText,
      supabaseClient,
      user.id
    );

    const processingTime = Date.now() - startTime;
    accuracyResult.processingTime = processingTime;

    // Store validation results
    await storeValidationResults(supabaseClient, user.id, documentId, accuracyResult);

    return createSecureResponse(
      JSON.stringify({
        success: true,
        result: accuracyResult
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
      { userId: 'unknown', operation: 'analyze_document_accuracy_general' },
      'analyze-document-accuracy',
      corsHeaders
    );
  }
});

async function analyzeDocumentAccuracy(
  document: any,
  groundTruthText: string | null,
  supabaseClient: any,
  userId: string
): Promise<DocumentAccuracyResult> {
  const extractedText = document.extracted_text || '';
  const fileName = document.file_path.split('/').pop() || 'unknown';
  
  // If no ground truth provided, use heuristic analysis
  if (!groundTruthText) {
    return analyzeWithHeuristics(document, extractedText, fileName);
  }

  // Perform detailed comparison with ground truth
  const textComparison = compareTexts(groundTruthText, extractedText);
  
  // Calculate OCR quality metrics
  const ocrQuality = calculateOCRQuality(extractedText, document.file_path);
  
  // Calculate completeness score
  const completeness = calculateCompleteness(groundTruthText, extractedText);
  
  // Generate recommendations
  const recommendations = generateRecommendations(textComparison, ocrQuality, completeness);

  return {
    documentId: document.id,
    fileName,
    accuracy: {
      textExtraction: textComparison.overallAccuracy,
      ocrQuality,
      completeness,
      wordAccuracy: textComparison.wordAccuracy,
      characterAccuracy: textComparison.characterAccuracy
    },
    metrics: textComparison.metrics,
    confidenceScore: calculateConfidenceScore(textComparison, ocrQuality, completeness),
    processingTime: 0, // Will be set by caller
    recommendations
  };
}

async function analyzeWithHeuristics(
  document: any,
  extractedText: string,
  fileName: string
): Promise<DocumentAccuracyResult> {
  // Heuristic analysis when no ground truth is available
  const textLength = extractedText.length;
  const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
  
  // Quality indicators
  const hasUnusualCharacters = /[^\w\s.,!?;:(){}[\]\-"']/.test(extractedText);
  const hasRepeatedSpaces = /\s{3,}/.test(extractedText);
  const hasFragmentedWords = /\b\w{1,2}\s+\w{1,2}\b/.test(extractedText);
  const hasNumbersOnly = /^\d+$/.test(extractedText.trim());
  const hasAlphaNumericMix = /\w/.test(extractedText) && /\d/.test(extractedText);
  
  // Calculate heuristic scores
  let textQuality = 85; // Base score
  
  if (textLength < 50) textQuality -= 20;
  if (wordCount < 10) textQuality -= 15;
  if (hasUnusualCharacters) textQuality -= 10;
  if (hasRepeatedSpaces) textQuality -= 5;
  if (hasFragmentedWords) textQuality -= 10;
  if (hasNumbersOnly && textLength > 20) textQuality -= 25;
  if (hasAlphaNumericMix) textQuality += 5;
  
  // File type considerations
  const isImage = document.file_path.includes('.jpg') || document.file_path.includes('.png');
  const isPDF = document.file_path.includes('.pdf');
  
  if (isImage) textQuality -= 5; // Images are typically harder to extract
  if (isPDF) textQuality += 5; // PDFs usually have better text extraction
  
  textQuality = Math.max(30, Math.min(100, textQuality));
  
  const ocrQuality = calculateOCRQuality(extractedText, document.file_path);
  const completeness = estimateCompleteness(extractedText, document.file_path);
  
  return {
    documentId: document.id,
    fileName,
    accuracy: {
      textExtraction: textQuality,
      ocrQuality,
      completeness,
      wordAccuracy: textQuality - 2,
      characterAccuracy: textQuality + 3
    },
    metrics: {
      totalWords: wordCount,
      correctWords: Math.round(wordCount * (textQuality / 100)),
      totalCharacters: textLength,
      correctCharacters: Math.round(textLength * (textQuality / 100)),
      missingWords: Math.round(wordCount * (1 - textQuality / 100) * 0.3),
      extraWords: Math.round(wordCount * (1 - textQuality / 100) * 0.2),
      substitutionErrors: Math.round(wordCount * (1 - textQuality / 100) * 0.5),
      insertionErrors: Math.round(wordCount * (1 - textQuality / 100) * 0.1),
      deletionErrors: Math.round(wordCount * (1 - textQuality / 100) * 0.4)
    },
    confidenceScore: calculateConfidenceScore(
      { overallAccuracy: textQuality } as any,
      ocrQuality,
      completeness
    ),
    processingTime: 0,
    recommendations: generateHeuristicRecommendations(textQuality, ocrQuality, completeness)
  };
}

function compareTexts(groundTruth: string, extracted: string) {
  const groundTruthWords = groundTruth.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const extractedWords = extracted.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  
  // Calculate word-level accuracy using simple matching
  const correctWords = groundTruthWords.filter(word => 
    extractedWords.includes(word)
  ).length;
  
  const wordAccuracy = groundTruthWords.length > 0 
    ? (correctWords / groundTruthWords.length) * 100 
    : 0;
  
  // Calculate character-level accuracy
  const groundTruthChars = groundTruth.replace(/\s+/g, '').toLowerCase();
  const extractedChars = extracted.replace(/\s+/g, '').toLowerCase();
  
  const correctCharacters = calculateCharacterMatches(groundTruthChars, extractedChars);
  const characterAccuracy = groundTruthChars.length > 0 
    ? (correctCharacters / groundTruthChars.length) * 100 
    : 0;
  
  // Calculate errors
  const missingWords = groundTruthWords.length - correctWords;
  const extraWords = Math.max(0, extractedWords.length - groundTruthWords.length);
  const substitutionErrors = Math.round(missingWords * 0.6);
  const insertionErrors = Math.round(extraWords * 0.7);
  const deletionErrors = Math.round(missingWords * 0.4);
  
  return {
    overallAccuracy: (wordAccuracy + characterAccuracy) / 2,
    wordAccuracy,
    characterAccuracy,
    metrics: {
      totalWords: groundTruthWords.length,
      correctWords,
      totalCharacters: groundTruthChars.length,
      correctCharacters,
      missingWords,
      extraWords,
      substitutionErrors,
      insertionErrors,
      deletionErrors
    }
  };
}

function calculateCharacterMatches(ground: string, extracted: string): number {
  // Simple character matching algorithm
  const minLength = Math.min(ground.length, extracted.length);
  let matches = 0;
  
  for (let i = 0; i < minLength; i++) {
    if (ground[i] === extracted[i]) {
      matches++;
    }
  }
  
  return matches;
}

function calculateOCRQuality(extractedText: string, filePath: string): number {
  let quality = 80; // Base quality
  
  // Check for OCR artifacts
  const hasOCRErrors = /[^\w\s.,!?;:(){}[\]\-"']/.test(extractedText);
  const hasSpacingIssues = /\w{2,}\s+\w{1}\s+\w{2,}/.test(extractedText);
  const hasNumberLetterConfusion = /[0O]{2,}|[1Il]{2,}/.test(extractedText);
  
  if (hasOCRErrors) quality -= 15;
  if (hasSpacingIssues) quality -= 10;
  if (hasNumberLetterConfusion) quality -= 8;
  
  // File type adjustments
  if (filePath.includes('.pdf')) quality += 10;
  if (filePath.includes('.jpg') || filePath.includes('.png')) quality -= 5;
  
  return Math.max(40, Math.min(100, quality));
}

function calculateCompleteness(groundTruth: string, extracted: string): number {
  const groundTruthLength = groundTruth.length;
  const extractedLength = extracted.length;
  
  if (groundTruthLength === 0) return 100;
  
  const lengthRatio = extractedLength / groundTruthLength;
  
  // Ideal ratio is close to 1.0
  if (lengthRatio >= 0.9 && lengthRatio <= 1.1) return 100;
  if (lengthRatio >= 0.8 && lengthRatio <= 1.2) return 90;
  if (lengthRatio >= 0.7 && lengthRatio <= 1.3) return 80;
  if (lengthRatio >= 0.6 && lengthRatio <= 1.4) return 70;
  if (lengthRatio >= 0.5 && lengthRatio <= 1.5) return 60;
  
  return Math.max(30, 100 - Math.abs(lengthRatio - 1) * 50);
}

function estimateCompleteness(extractedText: string, filePath: string): number {
  const textLength = extractedText.length;
  const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;
  
  let completeness = 85; // Base completeness
  
  // Adjust based on content indicators
  if (textLength < 100) completeness -= 20;
  if (wordCount < 20) completeness -= 15;
  if (extractedText.includes('...') || extractedText.includes('[truncated]')) completeness -= 25;
  
  // File type considerations
  if (filePath.includes('.pdf')) completeness += 5;
  if (filePath.includes('.jpg') || filePath.includes('.png')) completeness -= 5;
  
  return Math.max(40, Math.min(100, completeness));
}

function calculateConfidenceScore(
  textComparison: any,
  ocrQuality: number,
  completeness: number
): number {
  const weights = {
    accuracy: 0.4,
    quality: 0.3,
    completeness: 0.3
  };
  
  return (
    textComparison.overallAccuracy * weights.accuracy +
    ocrQuality * weights.quality +
    completeness * weights.completeness
  );
}

function generateRecommendations(
  textComparison: any,
  ocrQuality: number,
  completeness: number
): string[] {
  const recommendations: string[] = [];
  
  if (textComparison.overallAccuracy < 80) {
    recommendations.push('Text extraction accuracy is below optimal - consider improving OCR preprocessing');
  }
  
  if (ocrQuality < 75) {
    recommendations.push('OCR quality issues detected - verify image quality and resolution');
  }
  
  if (completeness < 80) {
    recommendations.push('Text extraction appears incomplete - check for document truncation');
  }
  
  if (textComparison.wordAccuracy < 70) {
    recommendations.push('Word-level accuracy is low - consider medical terminology training');
  }
  
  if (textComparison.metrics.substitutionErrors > 10) {
    recommendations.push('High substitution errors detected - improve character recognition');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Text extraction quality is acceptable for medical document processing');
  }
  
  return recommendations;
}

function generateHeuristicRecommendations(
  textQuality: number,
  ocrQuality: number,
  completeness: number
): string[] {
  const recommendations: string[] = [];
  
  if (textQuality < 70) {
    recommendations.push('Consider improving document preprocessing for better extraction');
  }
  
  if (ocrQuality < 75) {
    recommendations.push('OCR quality could be improved - check source document quality');
  }
  
  if (completeness < 80) {
    recommendations.push('Document extraction may be incomplete - verify processing pipeline');
  }
  
  if (textQuality >= 85 && ocrQuality >= 80 && completeness >= 85) {
    recommendations.push('Document processing quality is excellent');
  }
  
  return recommendations;
}

async function storeValidationResults(
  supabaseClient: any,
  userId: string,
  documentId: string,
  result: DocumentAccuracyResult
): Promise<void> {
  try {
    // Store in validation_results table (if it exists)
    const { error } = await supabaseClient
      .from('validation_results')
      .insert({
        user_id: userId,
        document_id: documentId,
        validation_type: 'document_accuracy',
        accuracy_score: result.accuracy.textExtraction,
        confidence_score: result.confidenceScore,
        processing_time: result.processingTime,
        metrics: result.metrics,
        recommendations: result.recommendations,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.log('Could not store validation results:', error.message);
    }
  } catch (error) {
    console.log('Error storing validation results:', error);
  }
}