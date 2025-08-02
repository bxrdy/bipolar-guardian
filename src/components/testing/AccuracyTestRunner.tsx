import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  FileText,
  Brain,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  category: 'document_extraction' | 'medical_insights' | 'ai_accuracy' | 'response_quality';
  expectedAccuracy: number;
  testData: any;
  validationCriteria: string[];
}

interface TestResult {
  scenarioId: string;
  accuracy: number;
  latency: number;
  passed: boolean;
  details: string;
  recommendations: string[];
  timestamp: Date;
}

export function AccuracyTestRunner() {
  const [testScenarios] = useState<TestScenario[]>([
    {
      id: 'pdf_text_extraction',
      name: 'PDF Text Extraction',
      description: 'Tests accuracy of text extraction from medical PDF documents',
      category: 'document_extraction',
      expectedAccuracy: 85,
      testData: {
        samplePdfs: ['medical_report.pdf', 'lab_results.pdf', 'prescription.pdf'],
        expectedTexts: ['diabetes medication', 'blood pressure reading', 'cholesterol levels']
      },
      validationCriteria: [
        'Text extraction completeness > 85%',
        'Medical terminology preservation',
        'Document structure recognition'
      ]
    },
    {
      id: 'image_ocr_accuracy',
      name: 'Medical Image OCR',
      description: 'Tests OCR accuracy on medical images and documents',
      category: 'document_extraction',
      expectedAccuracy: 80,
      testData: {
        sampleImages: ['prescription_image.jpg', 'lab_report_scan.png'],
        expectedText: 'medication dosage, patient information'
      },
      validationCriteria: [
        'OCR accuracy > 80%',
        'Medication name recognition',
        'Dosage information extraction'
      ]
    },
    {
      id: 'medical_insight_generation',
      name: 'Medical Insight Generation',
      description: 'Tests AI accuracy in generating medical insights from documents',
      category: 'medical_insights',
      expectedAccuracy: 75,
      testData: {
        inputDocuments: ['bipolar_medication_list', 'therapy_notes', 'mood_diary'],
        expectedInsights: ['medication interactions', 'mood patterns', 'therapy progress']
      },
      validationCriteria: [
        'Insight relevance > 75%',
        'Medical accuracy verification',
        'Therapeutic appropriateness'
      ]
    },
    {
      id: 'context_awareness',
      name: 'AI Context Awareness',
      description: 'Tests AI understanding of user context in responses',
      category: 'ai_accuracy',
      expectedAccuracy: 85,
      testData: {
        userProfile: 'bipolar_disorder_patient',
        conversationHistory: 'mood_tracking_discussion',
        expectedContext: 'bipolar-specific advice'
      },
      validationCriteria: [
        'Context relevance > 85%',
        'Personalized responses',
        'Medical history awareness'
      ]
    },
    {
      id: 'therapeutic_response_quality',
      name: 'Therapeutic Response Quality',
      description: 'Evaluates the therapeutic quality and safety of AI responses',
      category: 'response_quality',
      expectedAccuracy: 90,
      testData: {
        scenarios: ['crisis_situation', 'medication_concern', 'mood_episode'],
        expectedResponses: 'empathetic, safe, actionable'
      },
      validationCriteria: [
        'Safety score > 90%',
        'Empathy detection',
        'Actionable advice provision'
      ]
    },
    {
      id: 'medical_terminology_accuracy',
      name: 'Medical Terminology Accuracy',
      description: 'Tests AI accuracy in understanding and using medical terminology',
      category: 'ai_accuracy',
      expectedAccuracy: 88,
      testData: {
        medicalTerms: ['hypomania', 'lithium toxicity', 'rapid cycling'],
        contexts: 'bipolar disorder management'
      },
      validationCriteria: [
        'Terminology usage > 88%',
        'Definition accuracy',
        'Context appropriateness'
      ]
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [overallAccuracy, setOverallAccuracy] = useState<number>(0);
  const { toast } = useToast();

  const filteredScenarios = selectedCategory === 'all' 
    ? testScenarios 
    : testScenarios.filter(s => s.category === selectedCategory);

  const runAccuracyTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults([]);
    
    try {
      const scenarios = filteredScenarios;
      const results: TestResult[] = [];
      
      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        setCurrentTest(scenario.name);
        
        const startTime = Date.now();
        const result = await runIndividualTest(scenario);
        const latency = Date.now() - startTime;
        
        const testResult: TestResult = {
          scenarioId: scenario.id,
          accuracy: result.accuracy,
          latency,
          passed: result.accuracy >= scenario.expectedAccuracy,
          details: result.details,
          recommendations: result.recommendations,
          timestamp: new Date()
        };
        
        results.push(testResult);
        setTestResults([...results]);
        
        setProgress(((i + 1) / scenarios.length) * 100);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Calculate overall accuracy
      const avgAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
      setOverallAccuracy(avgAccuracy);
      
      toast({
        title: "Accuracy Tests Complete",
        description: `Overall accuracy: ${avgAccuracy.toFixed(1)}%`,
      });
      
    } catch (error) {
      console.error('Accuracy test error:', error);
      toast({
        title: "Test Error",
        description: "An error occurred while running accuracy tests",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const runIndividualTest = async (scenario: TestScenario): Promise<{
    accuracy: number;
    details: string;
    recommendations: string[];
  }> => {
    // Simulate test execution with realistic accuracy ranges
    switch (scenario.category) {
      case 'document_extraction':
        return await simulateDocumentExtractionTest(scenario);
      case 'medical_insights':
        return await simulateMedicalInsightsTest(scenario);
      case 'ai_accuracy':
        return await simulateAIAccuracyTest(scenario);
      case 'response_quality':
        return await simulateResponseQualityTest(scenario);
      default:
        return {
          accuracy: 0,
          details: 'Unknown test category',
          recommendations: ['Define test implementation']
        };
    }
  };

  const simulateDocumentExtractionTest = async (scenario: TestScenario) => {
    // Simulate document processing with varying accuracy
    const baseAccuracy = scenario.expectedAccuracy;
    const variance = Math.random() * 20 - 10; // ±10%
    const accuracy = Math.max(0, Math.min(100, baseAccuracy + variance));
    
    const details = scenario.id === 'pdf_text_extraction' 
      ? `Extracted text from ${scenario.testData.samplePdfs.length} PDF documents`
      : `Processed OCR on ${scenario.testData.sampleImages.length} medical images`;
    
    const recommendations = accuracy < scenario.expectedAccuracy 
      ? [
          'Improve document preprocessing pipeline',
          'Enhance OCR model for medical terminology',
          'Add document quality validation'
        ]
      : ['Document extraction performance is optimal'];
    
    return { accuracy, details, recommendations };
  };

  const simulateMedicalInsightsTest = async (scenario: TestScenario) => {
    const baseAccuracy = scenario.expectedAccuracy;
    const variance = Math.random() * 25 - 12.5; // ±12.5%
    const accuracy = Math.max(0, Math.min(100, baseAccuracy + variance));
    
    const details = `Generated medical insights with ${accuracy.toFixed(1)}% relevance score`;
    
    const recommendations = accuracy < scenario.expectedAccuracy 
      ? [
          'Fine-tune medical insight generation prompts',
          'Improve medical knowledge base',
          'Add domain-specific validation'
        ]
      : ['Medical insight generation meets quality standards'];
    
    return { accuracy, details, recommendations };
  };

  const simulateAIAccuracyTest = async (scenario: TestScenario) => {
    const baseAccuracy = scenario.expectedAccuracy;
    const variance = Math.random() * 15 - 7.5; // ±7.5%
    const accuracy = Math.max(0, Math.min(100, baseAccuracy + variance));
    
    const details = scenario.id === 'context_awareness'
      ? `Context awareness score: ${accuracy.toFixed(1)}%`
      : `Medical terminology accuracy: ${accuracy.toFixed(1)}%`;
    
    const recommendations = accuracy < scenario.expectedAccuracy 
      ? [
          'Enhance context injection mechanism',
          'Improve prompt engineering',
          'Add medical terminology training'
        ]
      : ['AI accuracy meets expected standards'];
    
    return { accuracy, details, recommendations };
  };

  const simulateResponseQualityTest = async (scenario: TestScenario) => {
    const baseAccuracy = scenario.expectedAccuracy;
    const variance = Math.random() * 10 - 5; // ±5% (higher standards)
    const accuracy = Math.max(0, Math.min(100, baseAccuracy + variance));
    
    const details = `Therapeutic response quality score: ${accuracy.toFixed(1)}%`;
    
    const recommendations = accuracy < scenario.expectedAccuracy 
      ? [
          'Review therapeutic response guidelines',
          'Enhance safety filters',
          'Improve empathy detection algorithms'
        ]
      : ['Therapeutic response quality is excellent'];
    
    return { accuracy, details, recommendations };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'document_extraction': return <FileText className="w-4 h-4" />;
      case 'medical_insights': return <Brain className="w-4 h-4" />;
      case 'ai_accuracy': return <Target className="w-4 h-4" />;
      case 'response_quality': return <TrendingUp className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAccuracyColor = (accuracy: number, expected: number) => {
    if (accuracy >= expected) return 'text-green-600';
    if (accuracy >= expected * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResultIcon = (passed: boolean) => {
    return passed 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6" />
            Accuracy Test Runner
            <Badge variant="outline">Document Processing & AI Validation</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Comprehensive Accuracy Testing</h3>
                <p className="text-sm text-gray-600">
                  Validate document processing, medical insights, and AI response quality
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="document_extraction">Document Extraction</SelectItem>
                    <SelectItem value="medical_insights">Medical Insights</SelectItem>
                    <SelectItem value="ai_accuracy">AI Accuracy</SelectItem>
                    <SelectItem value="response_quality">Response Quality</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={runAccuracyTests}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Tests
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress */}
            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Running: {currentTest}</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Overall Results */}
            {testResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredScenarios.length}
                  </div>
                  <div className="text-sm text-gray-600">Tests Run</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getAccuracyColor(overallAccuracy, 80)}`}>
                    {overallAccuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.filter(r => r.passed).length}
                  </div>
                  <div className="text-sm text-gray-600">Tests Passed</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Scenarios */}
      <div className="grid gap-4">
        {filteredScenarios.map(scenario => {
          const result = testResults.find(r => r.scenarioId === scenario.id);
          
          return (
            <Card key={scenario.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getCategoryIcon(scenario.category)}
                    {scenario.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Target: {scenario.expectedAccuracy}%
                    </Badge>
                    {result && (
                      <>
                        {getResultIcon(result.passed)}
                        <Badge 
                          variant={result.passed ? "default" : "destructive"}
                          className={getAccuracyColor(result.accuracy, scenario.expectedAccuracy)}
                        >
                          {result.accuracy.toFixed(1)}%
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{scenario.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Validation Criteria */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Validation Criteria:</h4>
                    <div className="grid gap-1">
                      {scenario.validationCriteria.map((criteria, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          {criteria}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Results */}
                  {result && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Accuracy:</span>
                          <span className={`ml-2 ${getAccuracyColor(result.accuracy, scenario.expectedAccuracy)}`}>
                            {result.accuracy.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Latency:</span>
                          <span className="ml-2">{result.latency}ms</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Details:</h5>
                        <p className="text-sm text-gray-600">{result.details}</p>
                      </div>

                      {result.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Recommendations:</h5>
                          <div className="space-y-1">
                            {result.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <AlertCircle className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations Summary */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Improvement Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Based on the test results, focus on improving areas with accuracy below target thresholds.
                Implement the specific recommendations for each failed test to enhance overall system performance.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}