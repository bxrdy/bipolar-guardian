interface TestDocument {
  id: string;
  name: string;
  type: string;
  expectedContent: string[];
  medicalTerms: string[];
  expectedInsights: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  testDocuments: TestDocument[];
  validationCriteria: {
    textExtractionAccuracy: number;
    medicalTermPreservation: number;
    insightRelevance: number;
    processingTime: number;
  };
  expectedResults: {
    minimumAccuracy: number;
    maximumProcessingTime: number;
    requiredInsightTypes: string[];
  };
}

interface ValidationResult {
  scenarioId: string;
  documentId: string;
  passed: boolean;
  accuracy: number;
  processingTime: number;
  extractedContent: string[];
  generatedInsights: string[];
  issues: string[];
  recommendations: string[];
}

export const testDocuments: TestDocument[] = [
  {
    id: 'prescription_pdf_1',
    name: 'Standard Prescription - Lithium',
    type: 'application/pdf',
    expectedContent: [
      'Patient Name: John Smith',
      'Medication: Lithium Carbonate',
      'Dosage: 300mg twice daily',
      'Prescriber: Dr. Sarah Johnson',
      'Date: 2024-01-15'
    ],
    medicalTerms: [
      'lithium carbonate',
      'bipolar disorder',
      'mood stabilizer',
      '300mg',
      'twice daily'
    ],
    expectedInsights: [
      'mood stabilizer medication',
      'bipolar disorder treatment',
      'dosage monitoring required',
      'lithium level testing needed'
    ],
    difficulty: 'easy',
    description: 'Clean, standard prescription document with clear formatting'
  },
  {
    id: 'lab_results_pdf_1',
    name: 'Lab Results - Lithium Levels',
    type: 'application/pdf',
    expectedContent: [
      'Patient: John Smith',
      'Test: Lithium Level',
      'Result: 0.8 mEq/L',
      'Reference Range: 0.6-1.2 mEq/L',
      'Status: Normal'
    ],
    medicalTerms: [
      'lithium level',
      'mEq/L',
      'therapeutic range',
      'serum lithium',
      'toxicity monitoring'
    ],
    expectedInsights: [
      'lithium level within therapeutic range',
      'medication compliance indicated',
      'continue current dosage',
      'regular monitoring recommended'
    ],
    difficulty: 'medium',
    description: 'Laboratory results with numerical values and medical units'
  },
  {
    id: 'therapy_notes_pdf_1',
    name: 'Therapy Session Notes',
    type: 'application/pdf',
    expectedContent: [
      'Patient reported improved mood stability',
      'Sleep pattern normalized',
      'No manic episodes in past month',
      'Medication adherence good',
      'Continue current treatment plan'
    ],
    medicalTerms: [
      'mood stability',
      'manic episodes',
      'medication adherence',
      'treatment plan',
      'bipolar disorder'
    ],
    expectedInsights: [
      'treatment progress positive',
      'medication effectiveness confirmed',
      'mood stabilization achieved',
      'continue current therapy approach'
    ],
    difficulty: 'hard',
    description: 'Unstructured therapy notes with subjective content'
  },
  {
    id: 'medication_list_image_1',
    name: 'Handwritten Medication List',
    type: 'image/jpeg',
    expectedContent: [
      'Lithium 300mg 2x daily',
      'Quetiapine 100mg at bedtime',
      'Lamotrigine 200mg daily',
      'Started: Jan 2024'
    ],
    medicalTerms: [
      'lithium',
      'quetiapine',
      'lamotrigine',
      'mood stabilizer',
      'antipsychotic'
    ],
    expectedInsights: [
      'combination therapy for bipolar disorder',
      'mood stabilizer regimen',
      'sleep aid component',
      'comprehensive treatment approach'
    ],
    difficulty: 'hard',
    description: 'Handwritten document requiring OCR with medical terminology'
  },
  {
    id: 'discharge_summary_pdf_1',
    name: 'Hospital Discharge Summary',
    type: 'application/pdf',
    expectedContent: [
      'Diagnosis: Bipolar I Disorder, manic episode',
      'Treatment: Mood stabilizer adjustment',
      'Discharge medications updated',
      'Follow-up in 2 weeks',
      'Patient stable at discharge'
    ],
    medicalTerms: [
      'bipolar I disorder',
      'manic episode',
      'mood stabilizer',
      'discharge medications',
      'psychiatric hospitalization'
    ],
    expectedInsights: [
      'recent manic episode treatment',
      'medication adjustments made',
      'hospitalization indicates severity',
      'close follow-up required'
    ],
    difficulty: 'medium',
    description: 'Structured medical document with formal terminology'
  },
  {
    id: 'mood_diary_scan_1',
    name: 'Patient Mood Diary Scan',
    type: 'image/png',
    expectedContent: [
      'Day 1: Mood 7/10, Energy 8/10',
      'Day 2: Mood 6/10, Energy 6/10',
      'Day 3: Mood 8/10, Energy 9/10',
      'Notes: Feeling more stable'
    ],
    medicalTerms: [
      'mood rating',
      'energy level',
      'mood tracking',
      'bipolar monitoring',
      'daily assessment'
    ],
    expectedInsights: [
      'mood tracking shows stability',
      'energy levels correlate with mood',
      'patient self-monitoring active',
      'positive treatment response'
    ],
    difficulty: 'hard',
    description: 'Patient-generated content with informal structure'
  }
];

export const testScenarios: TestScenario[] = [
  {
    id: 'basic_extraction_accuracy',
    name: 'Basic Text Extraction Accuracy',
    description: 'Tests fundamental text extraction capabilities on clear, well-formatted documents',
    testDocuments: [
      testDocuments[0], // Standard prescription
      testDocuments[4]  // Discharge summary
    ],
    validationCriteria: {
      textExtractionAccuracy: 90,
      medicalTermPreservation: 95,
      insightRelevance: 80,
      processingTime: 5000
    },
    expectedResults: {
      minimumAccuracy: 85,
      maximumProcessingTime: 8000,
      requiredInsightTypes: ['medication_info', 'treatment_plan']
    }
  },
  {
    id: 'medical_terminology_recognition',
    name: 'Medical Terminology Recognition',
    description: 'Validates accurate recognition and preservation of medical terms',
    testDocuments: [
      testDocuments[1], // Lab results
      testDocuments[2], // Therapy notes
      testDocuments[4]  // Discharge summary
    ],
    validationCriteria: {
      textExtractionAccuracy: 85,
      medicalTermPreservation: 90,
      insightRelevance: 85,
      processingTime: 6000
    },
    expectedResults: {
      minimumAccuracy: 80,
      maximumProcessingTime: 10000,
      requiredInsightTypes: ['medical_terms', 'clinical_context']
    }
  },
  {
    id: 'complex_document_processing',
    name: 'Complex Document Processing',
    description: 'Tests processing of challenging documents including handwritten and scanned content',
    testDocuments: [
      testDocuments[3], // Handwritten medication list
      testDocuments[5]  // Mood diary scan
    ],
    validationCriteria: {
      textExtractionAccuracy: 70,
      medicalTermPreservation: 75,
      insightRelevance: 70,
      processingTime: 10000
    },
    expectedResults: {
      minimumAccuracy: 65,
      maximumProcessingTime: 15000,
      requiredInsightTypes: ['medication_list', 'patient_tracking']
    }
  },
  {
    id: 'insight_generation_quality',
    name: 'Medical Insight Generation Quality',
    description: 'Evaluates the quality and relevance of generated medical insights',
    testDocuments: [
      testDocuments[1], // Lab results
      testDocuments[2], // Therapy notes
      testDocuments[4]  // Discharge summary
    ],
    validationCriteria: {
      textExtractionAccuracy: 80,
      medicalTermPreservation: 85,
      insightRelevance: 90,
      processingTime: 8000
    },
    expectedResults: {
      minimumAccuracy: 75,
      maximumProcessingTime: 12000,
      requiredInsightTypes: ['treatment_insights', 'progress_assessment', 'clinical_recommendations']
    }
  },
  {
    id: 'comprehensive_pipeline_test',
    name: 'Comprehensive Processing Pipeline',
    description: 'End-to-end test of the complete document processing pipeline',
    testDocuments: testDocuments, // All test documents
    validationCriteria: {
      textExtractionAccuracy: 80,
      medicalTermPreservation: 85,
      insightRelevance: 80,
      processingTime: 8000
    },
    expectedResults: {
      minimumAccuracy: 75,
      maximumProcessingTime: 15000,
      requiredInsightTypes: ['comprehensive_analysis', 'treatment_overview', 'progress_tracking']
    }
  }
];

export class DocumentProcessingTestRunner {
  private results: ValidationResult[] = [];
  private onProgress?: (progress: number, currentTest: string) => void;

  constructor(onProgress?: (progress: number, currentTest: string) => void) {
    this.onProgress = onProgress;
  }

  async runTestScenario(scenarioId: string): Promise<ValidationResult[]> {
    const scenario = testScenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Test scenario '${scenarioId}' not found`);
    }

    const results: ValidationResult[] = [];
    const totalDocuments = scenario.testDocuments.length;

    for (let i = 0; i < scenario.testDocuments.length; i++) {
      const document = scenario.testDocuments[i];
      
      if (this.onProgress) {
        this.onProgress(
          (i / totalDocuments) * 100,
          `Testing: ${document.name}`
        );
      }

      const result = await this.testDocument(document, scenario);
      results.push(result);

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.results = [...this.results, ...results];
    return results;
  }

  async runAllScenarios(): Promise<ValidationResult[]> {
    const allResults: ValidationResult[] = [];
    
    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      
      if (this.onProgress) {
        this.onProgress(
          (i / testScenarios.length) * 100,
          `Running scenario: ${scenario.name}`
        );
      }

      const scenarioResults = await this.runTestScenario(scenario.id);
      allResults.push(...scenarioResults);
    }

    return allResults;
  }

  private async testDocument(document: TestDocument, scenario: TestScenario): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      // Simulate document processing
      const { extractedContent, generatedInsights } = await this.simulateDocumentProcessing(document);
      
      const processingTime = Date.now() - startTime;
      
      // Validate results
      const validation = this.validateResults(
        document,
        scenario,
        extractedContent,
        generatedInsights,
        processingTime
      );

      return {
        scenarioId: scenario.id,
        documentId: document.id,
        passed: validation.passed,
        accuracy: validation.accuracy,
        processingTime,
        extractedContent,
        generatedInsights,
        issues: validation.issues,
        recommendations: validation.recommendations
      };

    } catch (error) {
      return {
        scenarioId: scenario.id,
        documentId: document.id,
        passed: false,
        accuracy: 0,
        processingTime: Date.now() - startTime,
        extractedContent: [],
        generatedInsights: [],
        issues: [`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Debug document processing pipeline', 'Check error handling']
      };
    }
  }

  private async simulateDocumentProcessing(document: TestDocument): Promise<{
    extractedContent: string[];
    generatedInsights: string[];
  }> {
    // Simulate processing time based on document difficulty
    const processingDelay = {
      'easy': 1000,
      'medium': 2000,
      'hard': 3500
    }[document.difficulty];

    await new Promise(resolve => setTimeout(resolve, processingDelay));

    // Simulate text extraction with varying accuracy
    const extractionAccuracy = this.getSimulatedAccuracy(document.difficulty);
    const extractedContent = this.simulateTextExtraction(document, extractionAccuracy);
    
    // Simulate insight generation
    const insightAccuracy = Math.max(0.6, extractionAccuracy - 0.1); // Insights depend on extraction quality
    const generatedInsights = this.simulateInsightGeneration(document, insightAccuracy);

    return { extractedContent, generatedInsights };
  }

  private getSimulatedAccuracy(difficulty: string): number {
    const baseAccuracies = {
      'easy': 0.92,
      'medium': 0.83,
      'hard': 0.72
    };

    const base = baseAccuracies[difficulty];
    const variance = Math.random() * 0.15 - 0.075; // ±7.5%
    return Math.max(0.5, Math.min(1.0, base + variance));
  }

  private simulateTextExtraction(document: TestDocument, accuracy: number): string[] {
    const extracted: string[] = [];
    
    for (const expectedContent of document.expectedContent) {
      if (Math.random() < accuracy) {
        // Simulate potential OCR errors for lower accuracy
        const content = accuracy > 0.8 
          ? expectedContent 
          : this.introduceTextErrors(expectedContent);
        extracted.push(content);
      }
    }

    // Add some medical terms that were preserved
    for (const term of document.medicalTerms) {
      if (Math.random() < accuracy * 0.9) { // Slightly lower preservation rate
        extracted.push(`Medical term: ${term}`);
      }
    }

    return extracted;
  }

  private simulateInsightGeneration(document: TestDocument, accuracy: number): string[] {
    const insights: string[] = [];
    
    for (const expectedInsight of document.expectedInsights) {
      if (Math.random() < accuracy) {
        insights.push(expectedInsight);
      }
    }

    // Add some contextual insights based on document type
    if (accuracy > 0.7) {
      if (document.type === 'application/pdf') {
        insights.push('Document structure well preserved');
      } else {
        insights.push('Image processing completed successfully');
      }
    }

    return insights;
  }

  private introduceTextErrors(text: string): string {
    // Simulate common OCR errors
    const errors = [
      { from: 'o', to: '0' },
      { from: 'l', to: '1' },
      { from: 'S', to: '5' },
      { from: 'mg', to: 'rng' },
      { from: ' ', to: '' }
    ];

    let errorText = text;
    if (Math.random() < 0.3) { // 30% chance of error
      const error = errors[Math.floor(Math.random() * errors.length)];
      errorText = text.replace(error.from, error.to);
    }

    return errorText;
  }

  private validateResults(
    document: TestDocument,
    scenario: TestScenario,
    extractedContent: string[],
    generatedInsights: string[],
    processingTime: number
  ): {
    passed: boolean;
    accuracy: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Calculate text extraction accuracy
    const expectedCount = document.expectedContent.length;
    const extractedCount = extractedContent.filter(content => 
      document.expectedContent.some(expected => 
        content.toLowerCase().includes(expected.toLowerCase().substring(0, 10))
      )
    ).length;
    const textExtractionAccuracy = expectedCount > 0 ? (extractedCount / expectedCount) * 100 : 0;

    // Calculate medical term preservation
    const expectedTerms = document.medicalTerms.length;
    const preservedTerms = extractedContent.filter(content =>
      document.medicalTerms.some(term =>
        content.toLowerCase().includes(term.toLowerCase())
      )
    ).length;
    const medicalTermPreservation = expectedTerms > 0 ? (preservedTerms / expectedTerms) * 100 : 0;

    // Calculate insight relevance
    const expectedInsights = document.expectedInsights.length;
    const relevantInsights = generatedInsights.filter(insight =>
      document.expectedInsights.some(expected =>
        insight.toLowerCase().includes(expected.toLowerCase().substring(0, 8))
      )
    ).length;
    const insightRelevance = expectedInsights > 0 ? (relevantInsights / expectedInsights) * 100 : 0;

    // Overall accuracy (weighted average)
    const accuracy = (
      textExtractionAccuracy * 0.4 +
      medicalTermPreservation * 0.35 +
      insightRelevance * 0.25
    );

    // Validate against criteria
    if (textExtractionAccuracy < scenario.validationCriteria.textExtractionAccuracy) {
      issues.push(`Low text extraction accuracy: ${textExtractionAccuracy.toFixed(1)}%`);
      recommendations.push('Improve OCR preprocessing and text extraction algorithms');
    }

    if (medicalTermPreservation < scenario.validationCriteria.medicalTermPreservation) {
      issues.push(`Poor medical term preservation: ${medicalTermPreservation.toFixed(1)}%`);
      recommendations.push('Enhance medical terminology dictionary and recognition');
    }

    if (insightRelevance < scenario.validationCriteria.insightRelevance) {
      issues.push(`Low insight relevance: ${insightRelevance.toFixed(1)}%`);
      recommendations.push('Improve medical context understanding and insight generation');
    }

    if (processingTime > scenario.validationCriteria.processingTime) {
      issues.push(`Processing time too high: ${processingTime}ms`);
      recommendations.push('Optimize processing pipeline for better performance');
    }

    const passed = accuracy >= scenario.expectedResults.minimumAccuracy &&
                   processingTime <= scenario.expectedResults.maximumProcessingTime;

    return {
      passed,
      accuracy,
      issues,
      recommendations
    };
  }

  getResults(): ValidationResult[] {
    return this.results;
  }

  generateSummaryReport(): {
    totalTests: number;
    passedTests: number;
    averageAccuracy: number;
    averageProcessingTime: number;
    commonIssues: string[];
    topRecommendations: string[];
  } {
    if (this.results.length === 0) {
      return {
        totalTests: 0,
        passedTests: 0,
        averageAccuracy: 0,
        averageProcessingTime: 0,
        commonIssues: [],
        topRecommendations: []
      };
    }

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const averageAccuracy = this.results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests;
    const averageProcessingTime = this.results.reduce((sum, r) => sum + r.processingTime, 0) / totalTests;

    // Aggregate common issues
    const allIssues = this.results.flatMap(r => r.issues);
    const issueCount = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const commonIssues = Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);

    // Aggregate top recommendations
    const allRecommendations = this.results.flatMap(r => r.recommendations);
    const recommendationCount = allRecommendations.reduce((acc, rec) => {
      acc[rec] = (acc[rec] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topRecommendations = Object.entries(recommendationCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([rec]) => rec);

    return {
      totalTests,
      passedTests,
      averageAccuracy,
      averageProcessingTime,
      commonIssues,
      topRecommendations
    };
  }
}

export default DocumentProcessingTestRunner;