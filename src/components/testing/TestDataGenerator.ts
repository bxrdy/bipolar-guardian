/**
 * Test Data Generator for Medical Documents
 * 
 * This module provides functions to generate realistic test data for medical documents
 * using the predefined templates and inserting them directly into the database.
 */

import { supabase } from '@/integrations/supabase/client';
import { MedicalDocumentTemplate, MEDICAL_DOCUMENT_TEMPLATES, getTemplateById } from './MedicalDocumentTemplates';

export interface GeneratedDocument {
  id: string;
  templateId: string;
  content: string;
  fileName: string;
  docType: string;
  parameters: Record<string, string | number | boolean>;
  aiInsightTriggers: string[];
  extractedText: string; // Added for UI compatibility
  created: string; // Added for UI compatibility
}

export interface DocumentGenerationOptions {
  templateId: string;
  parameters?: Record<string, string | number | boolean>;
  customFileName?: string;
  generateRealistic?: boolean;
}

export interface BatchGenerationOptions {
  templates: string[];
  count?: number;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  patientVariation?: boolean;
}

/**
 * Generates realistic parameter values for a document template
 */
export const generateRealisticParameters = (template: MedicalDocumentTemplate): Record<string, string | number | boolean> => {
  const parameters: Record<string, string | number | boolean> = {};
  
  // Common realistic names and values
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Karen'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
  const doctorNames = ['Sarah Johnson', 'Michael Chen', 'Lisa Williams', 'Robert Martinez', 'Jennifer Lee', 'David Thompson'];
  
  template.parameters.forEach(param => {
    switch (param.type) {
      case 'string':
        if (param.name.includes('patientName')) {
          parameters[param.name] = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        } else if (param.name.includes('doctorName') || param.name.includes('providerName') || param.name.includes('attendingPhysician')) {
          parameters[param.name] = doctorNames[Math.floor(Math.random() * doctorNames.length)];
        } else if (param.name.includes('npiNumber')) {
          parameters[param.name] = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        } else if (param.name.includes('insuranceId')) {
          parameters[param.name] = `INS${Math.floor(100000000 + Math.random() * 900000000)}`;
        } else if (param.name.includes('groupNumber')) {
          parameters[param.name] = `GRP${Math.floor(100 + Math.random() * 900)}`;
        } else if (param.name.includes('Phone')) {
          parameters[param.name] = `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
        } else {
          parameters[param.name] = param.defaultValue || generateRandomString(param.name);
        }
        break;
        
      case 'number':
        if (param.name.includes('lithiumLevel')) {
          parameters[param.name] = (0.4 + Math.random() * 1.6).toFixed(1);
        } else if (param.name.includes('creatinine')) {
          parameters[param.name] = (0.6 + Math.random() * 0.8).toFixed(1);
        } else if (param.name.includes('bun')) {
          parameters[param.name] = Math.floor(7 + Math.random() * 15).toString();
        } else if (param.name.includes('tsh')) {
          parameters[param.name] = (0.4 + Math.random() * 4.0).toFixed(1);
        } else if (param.name.includes('quantity')) {
          parameters[param.name] = [30, 60, 90][Math.floor(Math.random() * 3)];
        } else if (param.name.includes('refills')) {
          parameters[param.name] = Math.floor(Math.random() * 6);
        } else if (param.name.includes('lengthOfStay')) {
          parameters[param.name] = Math.floor(1 + Math.random() * 14);
        } else if (param.name.includes('daysSupply')) {
          parameters[param.name] = [30, 60, 90][Math.floor(Math.random() * 3)];
        } else {
          parameters[param.name] = param.defaultValue || Math.floor(Math.random() * 100);
        }
        break;
        
      case 'date':
        if (param.name.includes('birth')) {
          const birthYear = 1950 + Math.floor(Math.random() * 50);
          const birthMonth = 1 + Math.floor(Math.random() * 12);
          const birthDay = 1 + Math.floor(Math.random() * 28);
          parameters[param.name] = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
        } else if (param.name.includes('admission')) {
          const admissionDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
          parameters[param.name] = admissionDate.toISOString().split('T')[0];
        } else if (param.name.includes('discharge')) {
          const dischargeDate = new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
          parameters[param.name] = dischargeDate.toISOString().split('T')[0];
        } else if (param.name.includes('next') || param.name.includes('followUp')) {
          const futureDate = new Date(Date.now() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000);
          parameters[param.name] = futureDate.toISOString().split('T')[0];
        } else if (param.name.includes('collection')) {
          const collectionDate = new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
          parameters[param.name] = collectionDate.toISOString().split('T')[0];
        } else {
          const randomDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
          parameters[param.name] = randomDate.toISOString().split('T')[0];
        }
        break;
        
      case 'select':
        if (param.options) {
          parameters[param.name] = param.options[Math.floor(Math.random() * param.options.length)];
        } else {
          parameters[param.name] = param.defaultValue;
        }
        break;
        
      case 'boolean':
        parameters[param.name] = Math.random() > 0.5;
        break;
        
      default:
        parameters[param.name] = param.defaultValue;
    }
  });
  
  return parameters;
};

/**
 * Generates a random string based on parameter name context
 */
const generateRandomString = (paramName: string): string => {
  if (paramName.includes('instruction') || paramName.includes('note')) {
    const instructions = [
      'Continue monitoring symptoms and report any changes',
      'Follow up if symptoms worsen or new concerns arise',
      'Maintain regular medication schedule and healthy lifestyle',
      'Contact provider if experiencing side effects',
      'Schedule regular check-ups as recommended'
    ];
    return instructions[Math.floor(Math.random() * instructions.length)];
  }
  
  if (paramName.includes('history') || paramName.includes('course')) {
    const histories = [
      'Patient reports stable mood with current treatment regimen',
      'Gradual improvement noted over the past few weeks',
      'Some challenges with medication adherence reported',
      'Patient engaged in treatment and showing progress',
      'Symptoms well-controlled with current approach'
    ];
    return histories[Math.floor(Math.random() * histories.length)];
  }
  
  return 'Generated test data';
};

/**
 * Replaces template placeholders with actual values
 */
export const processTemplate = (template: MedicalDocumentTemplate, parameters: Record<string, string | number | boolean>): string => {
  let processedContent = template.contentTemplate;
  
  // Replace all placeholders with actual values
  Object.entries(parameters).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value?.toString() || '');
  });
  
  return processedContent;
};

/**
 * Generates a single medical document
 */
export const generateSingleDocument = (options: DocumentGenerationOptions): GeneratedDocument => {
  const template = getTemplateById(options.templateId);
  
  if (!template) {
    throw new Error(`Template with ID ${options.templateId} not found`);
  }
  
  const parameters = options.generateRealistic 
    ? generateRealisticParameters(template)
    : { ...template.parameters.reduce((acc, param) => ({ ...acc, [param.name]: param.defaultValue }), {}), ...options.parameters };
  
  const content = processTemplate(template, parameters);
  
  const fileName = options.customFileName || `${template.name.replace(/\s+/g, '_')}_${Date.now()}.txt`;
  
  return {
    id: crypto.randomUUID(),
    templateId: options.templateId,
    content,
    fileName,
    docType: template.docType,
    parameters,
    aiInsightTriggers: template.aiInsightTriggers,
    extractedText: content, // Set extractedText to the same as content
    created: new Date().toISOString() // Add created timestamp
  };
};

/**
 * Generates multiple documents with variations
 */
export const generateBatchDocuments = (options: BatchGenerationOptions): GeneratedDocument[] => {
  const documents: GeneratedDocument[] = [];
  const count = options.count || 1;
  
  options.templates.forEach(templateId => {
    for (let i = 0; i < count; i++) {
      const doc = generateSingleDocument({
        templateId,
        generateRealistic: true
      });
      
      // Apply date range if specified
      if (options.dateRange) {
        const startDate = new Date(options.dateRange.startDate);
        const endDate = new Date(options.dateRange.endDate);
        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        
        // Update date parameters in the document
        doc.parameters = {
          ...doc.parameters,
          prescriptionDate: randomDate.toISOString().split('T')[0],
          visitDate: randomDate.toISOString().split('T')[0],
          sessionDate: randomDate.toISOString().split('T')[0],
          reportDate: randomDate.toISOString().split('T')[0]
        };
        
        // Regenerate content with updated parameters
        const template = getTemplateById(templateId);
        if (template) {
          doc.content = processTemplate(template, doc.parameters);
        }
      }
      
      documents.push(doc);
    }
  });
  
  return documents;
};

/**
 * Inserts generated documents into the database
 */
export const insertDocumentsToDatabase = async (documents: GeneratedDocument[]): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Prepare documents for database insertion
  const dbDocuments = documents.map(doc => ({
    user_id: user.id,
    file_path: `generated/${doc.id}`, // Use a generated path since we're not storing actual files
    doc_type: `text/plain`, // Set as plain text since we're generating text content
    extracted_text: doc.content
  }));
  
  // Insert documents into the medical_docs table
  const { error } = await supabase
    .from('medical_docs')
    .insert(dbDocuments);
  
  if (error) {
    throw new Error(`Failed to insert documents: ${error.message}`);
  }
};

/**
 * Generates and inserts test documents in one operation
 */
export const generateAndInsertDocuments = async (options: DocumentGenerationOptions | BatchGenerationOptions): Promise<GeneratedDocument[]> => {
  let documents: GeneratedDocument[];
  
  if ('templateId' in options) {
    // Single document generation
    documents = [generateSingleDocument(options)];
  } else {
    // Batch generation
    documents = generateBatchDocuments(options);
  }
  
  await insertDocumentsToDatabase(documents);
  
  return documents;
};

/**
 * Generates a complete test dataset with various document types
 */
export const generateCompleteTestDataset = async (): Promise<GeneratedDocument[]> => {
  const templateIds = MEDICAL_DOCUMENT_TEMPLATES.map(template => template.id);
  
  const documents = await generateAndInsertDocuments({
    templates: templateIds,
    count: 2, // Generate 2 documents per template
    dateRange: {
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
      endDate: new Date().toISOString().split('T')[0] // Today
    },
    patientVariation: true
  });
  
  return documents;
};

/**
 * Generates documents that would trigger specific AI insights
 */
export const generateInsightTriggerDocuments = async (insightType: 'medication_change' | 'abnormal_lab' | 'crisis_event' | 'treatment_progress'): Promise<GeneratedDocument[]> => {
  const documents: GeneratedDocument[] = [];
  
  switch (insightType) {
    case 'medication_change': {
      // Generate prescription with new medication
      const prescriptionDocs = await generateAndInsertDocuments({
        templateId: 'prescription-bipolar',
        parameters: {
          medication1: 'Aripiprazole',
          dosage1: '15mg',
          frequency1: 'Once daily',
          medication2: 'Lamotrigine',
          dosage2: '100mg',
          frequency2: 'Twice daily',
          additionalInstructions: 'New medication regimen due to side effects with previous treatment'
        },
        generateRealistic: true
      });
      documents.push(...prescriptionDocs);
      break;
    }
      
    case 'abnormal_lab': {
      // Generate lab result with abnormal values
      const labDocs = await generateAndInsertDocuments({
        templateId: 'lab-result-lithium',
        parameters: {
          lithiumLevel: '1.6',
          lithiumStatus: 'High',
          creatinine: '1.4',
          labNotes: 'Elevated lithium level noted. Recommend dose adjustment and repeat labs in 1 week.'
        },
        generateRealistic: true
      });
      documents.push(...labDocs);
      break;
    }
      
    case 'crisis_event': {
      // Generate discharge summary from psychiatric hospitalization
      const dischargeDocs = await generateAndInsertDocuments({
        templateId: 'discharge-summary',
        parameters: {
          reasonForAdmission: 'Acute manic episode with psychotic features following medication non-compliance',
          dischargeDiagnosis: 'Bipolar I Disorder, most recent episode manic with psychotic features',
          lengthOfStay: 7,
          dischargeInstructions: 'Strict medication compliance essential. Daily monitoring by family. Crisis hotline numbers provided.'
        },
        generateRealistic: true
      });
      documents.push(...dischargeDocs);
      break;
    }
      
    case 'treatment_progress': {
      // Generate positive progress note
      const therapyDocs = await generateAndInsertDocuments({
        templateId: 'therapy-session-note',
        parameters: {
          sessionFocus: 'Review of treatment progress and goal achievement',
          presentingConcerns: 'Patient reports significant improvement in mood stability and daily functioning',
          patientResponse: 'Excellent engagement and insight. Demonstrates mastery of coping skills.',
          goalProgress: 'All treatment goals met. Patient ready for reduced session frequency.'
        },
        generateRealistic: true
      });
      documents.push(...therapyDocs);
      break;
    }
  }
  
  return documents;
};

/**
 * Clears all generated test documents for the current user
 */
export const clearGeneratedDocuments = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Delete documents with generated file_path pattern
  const { error } = await supabase
    .from('medical_docs')
    .delete()
    .eq('user_id', user.id)
    .like('file_path', 'generated/%');
  
  if (error) {
    throw new Error(`Failed to clear documents: ${error.message}`);
  }
};
