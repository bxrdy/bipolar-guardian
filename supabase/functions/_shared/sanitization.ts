// Data Sanitization Utilities for Medical Data Protection
// Removes PII while preserving therapeutic context

interface SanitizationOptions {
  maskNames?: boolean;
  maskMedications?: boolean;
  maskDates?: boolean;
  maskContactInfo?: boolean;
  preserveTherapeuticContext?: boolean;
}

interface UserData {
  first_name?: string;
  [key: string]: unknown;
}

interface MedicalData {
  medications?: Array<{
    med_name?: string;
    name?: string;
    [key: string]: unknown;
  }>;
  medications_summary?: string[];
  [key: string]: unknown;
}

interface MedicalInsights {
  conditions?: string[];
  medications_summary?: string[];
  therapeutic_notes?: string[];
  risk_factors?: string[];
  interaction_warnings?: string[];
  [key: string]: unknown;
}

interface HealthMetrics {
  avgMood?: number;
  avgEnergy?: number;
  avgStress?: number;
  avgSleep?: number;
  [key: string]: unknown;
}

interface AIData {
  profile?: UserData;
  medications?: MedicalData['medications'];
  medicalInsights?: MedicalInsights;
  [key: string]: unknown;
}

// Common PII patterns
const PII_PATTERNS = {
  // SSN patterns
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
  
  // Phone numbers
  phone: /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Street addresses (basic pattern)
  address: /\b\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct)\b/gi,
  
  // Dates in various formats
  dates: /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/g,
  
  // Credit card numbers
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  
  // Driver's license patterns (basic)
  driversLicense: /\b[A-Z]{1,2}\d{6,8}\b/g,
  
  // Medical record numbers
  medicalRecord: /\bMR[N]?\s*:?\s*\d{6,10}\b/gi,
  
  // DOB patterns
  dob: /\bDOB\s*:?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/gi,
};

// Common medication name mappings for anonymization
const MEDICATION_CATEGORIES = {
  // Mood stabilizers
  'lithium': 'mood_stabilizer',
  'valproate': 'mood_stabilizer', 
  'lamotrigine': 'mood_stabilizer',
  'carbamazepine': 'mood_stabilizer',
  
  // Antipsychotics
  'olanzapine': 'antipsychotic',
  'quetiapine': 'antipsychotic',
  'risperidone': 'antipsychotic',
  'aripiprazole': 'antipsychotic',
  'haloperidol': 'antipsychotic',
  
  // Antidepressants
  'sertraline': 'antidepressant',
  'fluoxetine': 'antidepressant',
  'citalopram': 'antidepressant',
  'escitalopram': 'antidepressant',
  'paroxetine': 'antidepressant',
  'venlafaxine': 'antidepressant',
  
  // Benzodiazepines
  'lorazepam': 'anxiolytic',
  'clonazepam': 'anxiolytic',
  'alprazolam': 'anxiolytic',
  'diazepam': 'anxiolytic',
};

/**
 * Sanitizes user personal data
 */
export function sanitizeUserData(userData: UserData | null, options: SanitizationOptions = {}): UserData | null {
  const { 
    maskNames = true,
    preserveTherapeuticContext = true 
  } = options;

  if (!userData) return userData;

  const sanitized = { ...userData };

  // Sanitize first name while preserving therapeutic context
  if (sanitized.first_name && maskNames) {
    if (preserveTherapeuticContext) {
      // Keep first initial for personalization
      sanitized.first_name = sanitized.first_name.charAt(0) + '.';
    } else {
      sanitized.first_name = 'User';
    }
  }

  return sanitized;
}

/**
 * Sanitizes medical data including medications and conditions
 */
export function sanitizeMedicalData(medicalData: MedicalData | null, options: SanitizationOptions = {}): MedicalData | null {
  const { 
    maskMedications = true,
    preserveTherapeuticContext = true 
  } = options;

  if (!medicalData) return medicalData;

  const sanitized = { ...medicalData };

  // Sanitize medications array
  if (sanitized.medications && Array.isArray(sanitized.medications)) {
    sanitized.medications = sanitized.medications.map((med: MedicalData['medications'][0]) => {
      const sanitizedMed = { ...med };
      
      if (maskMedications && preserveTherapeuticContext) {
        // Replace specific medication names with categories
        const medName = med.med_name?.toLowerCase() || med.name?.toLowerCase();
        if (medName) {
          const category = Object.entries(MEDICATION_CATEGORIES).find(([drug]) => 
            medName.includes(drug)
          )?.[1];
          
          if (category) {
            sanitizedMed.med_name = category;
            sanitizedMed.name = category;
          } else {
            // Generic categorization for unknown meds
            sanitizedMed.med_name = 'psychiatric_medication';
            sanitizedMed.name = 'psychiatric_medication';
          }
        }
      }
      
      return sanitizedMed;
    });
  }

  // Sanitize medications_summary if it exists
  if (sanitized.medications_summary && Array.isArray(sanitized.medications_summary)) {
    sanitized.medications_summary = sanitized.medications_summary.map((medSummary: string) => {
      let sanitizedSummary = medSummary;
      
      if (maskMedications && preserveTherapeuticContext) {
        Object.entries(MEDICATION_CATEGORIES).forEach(([drug, category]) => {
          const regex = new RegExp(drug, 'gi');
          sanitizedSummary = sanitizedSummary.replace(regex, category);
        });
      }
      
      return sanitizedSummary;
    });
  }

  return sanitized;
}

/**
 * Sanitizes extracted text from medical documents
 */
export function sanitizeExtractedText(text: string, options: SanitizationOptions = {}): string {
  const { 
    maskContactInfo = true,
    maskDates = false, // Keep dates for medical context
    preserveTherapeuticContext = true 
  } = options;

  if (!text) return text;

  let sanitizedText = text;

  // Remove SSNs
  sanitizedText = sanitizedText.replace(PII_PATTERNS.ssn, '[SSN_REDACTED]');
  
  // Remove phone numbers
  if (maskContactInfo) {
    sanitizedText = sanitizedText.replace(PII_PATTERNS.phone, '[PHONE_REDACTED]');
  }
  
  // Remove email addresses
  if (maskContactInfo) {
    sanitizedText = sanitizedText.replace(PII_PATTERNS.email, '[EMAIL_REDACTED]');
  }
  
  // Remove street addresses
  if (maskContactInfo) {
    sanitizedText = sanitizedText.replace(PII_PATTERNS.address, '[ADDRESS_REDACTED]');
  }
  
  // Remove credit card numbers
  sanitizedText = sanitizedText.replace(PII_PATTERNS.creditCard, '[CARD_REDACTED]');
  
  // Remove driver's license numbers
  sanitizedText = sanitizedText.replace(PII_PATTERNS.driversLicense, '[LICENSE_REDACTED]');
  
  // Remove medical record numbers
  sanitizedText = sanitizedText.replace(PII_PATTERNS.medicalRecord, 'MRN: [REDACTED]');
  
  // Handle DOB specifically
  sanitizedText = sanitizedText.replace(PII_PATTERNS.dob, 'DOB: [REDACTED]');
  
  // Optionally mask other dates if requested
  if (maskDates) {
    sanitizedText = sanitizedText.replace(PII_PATTERNS.dates, '[DATE_REDACTED]');
  }

  return sanitizedText;
}

/**
 * Sanitizes medical insights while preserving therapeutic value
 */
export function sanitizeMedicalInsights(insights: MedicalInsights | null, options: SanitizationOptions = {}): MedicalInsights | null {
  if (!insights) return insights;

  const sanitized = { ...insights };

  // Sanitize conditions (keep medical relevance)
  if (sanitized.conditions && Array.isArray(sanitized.conditions)) {
    // Keep conditions as they are medically relevant and typically not PII
    // Could add specific filtering here if needed
  }

  // Sanitize medications_summary
  if (sanitized.medications_summary) {
    sanitized.medications_summary = sanitizeMedicalData(
      { medications_summary: sanitized.medications_summary }, 
      options
    ).medications_summary;
  }

  // Sanitize therapeutic notes for PII
  if (sanitized.therapeutic_notes && Array.isArray(sanitized.therapeutic_notes)) {
    sanitized.therapeutic_notes = sanitized.therapeutic_notes.map((note: string) => 
      sanitizeExtractedText(note, options)
    );
  }

  // Sanitize risk factors
  if (sanitized.risk_factors && Array.isArray(sanitized.risk_factors)) {
    sanitized.risk_factors = sanitized.risk_factors.map((factor: string) => 
      sanitizeExtractedText(factor, options)
    );
  }

  // Sanitize interaction warnings
  if (sanitized.interaction_warnings && Array.isArray(sanitized.interaction_warnings)) {
    sanitized.interaction_warnings = sanitized.interaction_warnings.map((warning: string) => 
      sanitizeExtractedText(warning, options)
    );
  }

  return sanitized;
}

/**
 * Aggregates health metrics to remove specific identifying patterns
 */
export function sanitizeHealthMetrics(metrics: HealthMetrics | null): HealthMetrics | null {
  if (!metrics) return metrics;

  const sanitized = { ...metrics };

  // Round mood averages to remove precise identifying patterns
  if (sanitized.avgMood !== undefined) {
    sanitized.avgMood = Math.round(sanitized.avgMood * 2) / 2; // Round to nearest 0.5
  }
  
  if (sanitized.avgEnergy !== undefined) {
    sanitized.avgEnergy = Math.round(sanitized.avgEnergy * 2) / 2;
  }
  
  if (sanitized.avgStress !== undefined) {
    sanitized.avgStress = Math.round(sanitized.avgStress * 2) / 2;
  }

  // Round sleep to nearest 0.5 hours
  if (sanitized.avgSleep !== undefined) {
    sanitized.avgSleep = Math.round(sanitized.avgSleep * 2) / 2;
  }

  return sanitized;
}

/**
 * Main sanitization function for AI prompts
 */
export function sanitizeForAI(data: AIData, options: SanitizationOptions = {}): AIData {
  const defaultOptions: SanitizationOptions = {
    maskNames: true,
    maskMedications: true,
    maskDates: false, // Keep dates for medical context
    maskContactInfo: true,
    preserveTherapeuticContext: true,
    ...options
  };

  // Apply appropriate sanitization based on data type
  if (data.profile) {
    data.profile = sanitizeUserData(data.profile, defaultOptions);
  }

  if (data.medications) {
    data = sanitizeMedicalData(data, defaultOptions);
  }

  if (data.medicalInsights) {
    data.medicalInsights = sanitizeMedicalInsights(data.medicalInsights, defaultOptions);
  }

  // Sanitize any extracted text
  if (data.extractedText) {
    data.extractedText = sanitizeExtractedText(data.extractedText, defaultOptions);
  }

  return data;
}