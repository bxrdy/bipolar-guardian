
/**
 * Hook for Test Document Generation
 * 
 * This hook provides a React interface for generating test medical documents
 * with loading states, error handling, and integration with the existing UI.
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  generateSingleDocument, 
  generateBatchDocuments, 
  insertDocumentsToDatabase,
  generateCompleteTestDataset,
  generateInsightTriggerDocuments,
  clearGeneratedDocuments,
  GeneratedDocument,
  DocumentGenerationOptions,
  BatchGenerationOptions
} from '@/components/testing/TestDataGenerator';
import { 
  MEDICAL_DOCUMENT_TEMPLATES, 
  getAllTemplateNames, 
  getTemplateById 
} from '@/components/testing/MedicalDocumentTemplates';

interface UseTestDocumentGenerationReturn {
  // State
  isGenerating: boolean;
  generatedDocuments: GeneratedDocument[];
  availableTemplates: Array<{ id: string; name: string; description: string }>;
  
  // Single document generation
  generateSingle: (options: DocumentGenerationOptions) => Promise<GeneratedDocument | null>;
  
  // Batch document generation
  generateBatch: (options: BatchGenerationOptions) => Promise<GeneratedDocument[]>;
  
  // Complete test dataset
  generateCompleteDataset: () => Promise<GeneratedDocument[]>;
  
  // Generate documents that trigger specific AI insights
  generateInsightTriggers: (insightType: 'medication_change' | 'abnormal_lab' | 'crisis_event' | 'treatment_progress') => Promise<GeneratedDocument[]>;
  
  // NEW: Generate test documents method
  generateTestDocuments: () => Promise<GeneratedDocument[]>;
  
  // Utility functions
  previewDocument: (options: DocumentGenerationOptions) => GeneratedDocument | null;
  clearAllGenerated: () => Promise<void>;
  
  // Template management
  getTemplateDetails: (templateId: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  getTemplatesByType: (docType: string) => any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  
  // Reset state
  resetState: () => void;
}

export const useTestDocumentGeneration = (): UseTestDocumentGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const { toast } = useToast();

  const availableTemplates = getAllTemplateNames();

  const generateSingle = useCallback(async (options: DocumentGenerationOptions): Promise<GeneratedDocument | null> => {
    setIsGenerating(true);
    
    try {
      const document = generateSingleDocument(options);
      await insertDocumentsToDatabase([document]);
      
      setGeneratedDocuments(prev => [...prev, document]);
      
      toast({
        title: "Document Generated",
        description: `Successfully generated "${document.fileName}"`,
      });
      
      return document;
    } catch (error) {
      console.error('Error generating single document:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate document",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const generateBatch = useCallback(async (options: BatchGenerationOptions): Promise<GeneratedDocument[]> => {
    setIsGenerating(true);
    
    try {
      const documents = generateBatchDocuments(options);
      await insertDocumentsToDatabase(documents);
      
      setGeneratedDocuments(prev => [...prev, ...documents]);
      
      toast({
        title: "Batch Generation Complete",
        description: `Successfully generated ${documents.length} documents`,
      });
      
      return documents;
    } catch (error) {
      console.error('Error generating batch documents:', error);
      toast({
        title: "Batch Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate documents",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const generateCompleteDataset = useCallback(async (): Promise<GeneratedDocument[]> => {
    setIsGenerating(true);
    
    try {
      const documents = await generateCompleteTestDataset();
      setGeneratedDocuments(prev => [...prev, ...documents]);
      
      toast({
        title: "Complete Dataset Generated",
        description: `Successfully generated ${documents.length} test documents across all templates`,
      });
      
      return documents;
    } catch (error) {
      console.error('Error generating complete dataset:', error);
      toast({
        title: "Dataset Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate complete dataset",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const generateInsightTriggers = useCallback(async (insightType: 'medication_change' | 'abnormal_lab' | 'crisis_event' | 'treatment_progress'): Promise<GeneratedDocument[]> => {
    setIsGenerating(true);
    
    try {
      const documents = await generateInsightTriggerDocuments(insightType);
      setGeneratedDocuments(prev => [...prev, ...documents]);
      
      const insightTypeNames = {
        'medication_change': 'Medication Change',
        'abnormal_lab': 'Abnormal Lab Results',
        'crisis_event': 'Crisis Event',
        'treatment_progress': 'Treatment Progress'
      };
      
      toast({
        title: "Insight Trigger Documents Generated",
        description: `Generated documents that should trigger ${insightTypeNames[insightType]} insights`,
      });
      
      return documents;
    } catch (error) {
      console.error('Error generating insight trigger documents:', error);
      toast({
        title: "Insight Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate insight trigger documents",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  // NEW: Generate test documents method - delegates to generateCompleteDataset
  const generateTestDocuments = useCallback(async (): Promise<GeneratedDocument[]> => {
    return await generateCompleteDataset();
  }, [generateCompleteDataset]);

  const previewDocument = useCallback((options: DocumentGenerationOptions): GeneratedDocument | null => {
    try {
      return generateSingleDocument(options);
    } catch (error) {
      console.error('Error previewing document:', error);
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Failed to preview document",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const clearAllGenerated = useCallback(async (): Promise<void> => {
    setIsGenerating(true);
    
    try {
      await clearGeneratedDocuments();
      setGeneratedDocuments([]);
      
      toast({
        title: "Documents Cleared",
        description: "All generated test documents have been removed",
      });
    } catch (error) {
      console.error('Error clearing documents:', error);
      toast({
        title: "Clear Failed",
        description: error instanceof Error ? error.message : "Failed to clear documents",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const getTemplateDetails = useCallback((templateId: string) => {
    return getTemplateById(templateId);
  }, []);

  const getTemplatesByType = useCallback((docType: string) => {
    return MEDICAL_DOCUMENT_TEMPLATES.filter(template => template.docType === docType);
  }, []);

  const resetState = useCallback(() => {
    setGeneratedDocuments([]);
    setIsGenerating(false);
  }, []);

  return {
    // State
    isGenerating,
    generatedDocuments,
    availableTemplates,
    
    // Generation functions
    generateSingle,
    generateBatch,
    generateCompleteDataset,
    generateInsightTriggers,
    generateTestDocuments, // NEW method added
    
    // Utility functions
    previewDocument,
    clearAllGenerated,
    
    // Template management
    getTemplateDetails,
    getTemplatesByType,
    
    // Reset
    resetState
  };
};

/**
 * Hook for quick document generation shortcuts
 */
export const useQuickDocumentGeneration = () => {
  const { generateSingle, generateBatch, isGenerating } = useTestDocumentGeneration();
  
  const generatePrescription = useCallback(async () => {
    return await generateSingle({
      templateId: 'prescription-bipolar',
      generateRealistic: true
    });
  }, [generateSingle]);
  
  const generateLabResult = useCallback(async () => {
    return await generateSingle({
      templateId: 'lab-result-lithium',
      generateRealistic: true
    });
  }, [generateSingle]);
  
  const generateProgressNote = useCallback(async () => {
    return await generateSingle({
      templateId: 'psychiatry-progress-note',
      generateRealistic: true
    });
  }, [generateSingle]);
  
  const generateTherapyNote = useCallback(async () => {
    return await generateSingle({
      templateId: 'therapy-session-note',
      generateRealistic: true
    });
  }, [generateSingle]);
  
  const generateMedicalSet = useCallback(async () => {
    return await generateBatch({
      templates: ['prescription-bipolar', 'lab-result-lithium', 'psychiatry-progress-note'],
      count: 1
    });
  }, [generateBatch]);
  
  return {
    generatePrescription,
    generateLabResult,
    generateProgressNote,
    generateTherapyNote,
    generateMedicalSet,
    isGenerating
  };
};
