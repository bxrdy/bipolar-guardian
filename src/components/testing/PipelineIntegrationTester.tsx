import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, AlertCircle, Play, Trash2, Eye, EyeOff } from 'lucide-react';
import { usePipelineValidation } from '@/hooks/usePipelineValidation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PipelineIntegrationTesterProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const PipelineIntegrationTester: React.FC<PipelineIntegrationTesterProps> = ({ 
  isLoading, 
  setIsLoading 
}) => {
  const { 
    isValidating, 
    results, 
    currentStep,
    validatePipelineIntegration, 
    clearResults 
  } = usePipelineValidation();

  const [expandedResults, setExpandedResults] = useState<string[]>([]);

  const toggleResultExpansion = (step: string) => {
    setExpandedResults(prev => 
      prev.includes(step) 
        ? prev.filter(s => s !== step)
        : [...prev, step]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Running</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatData = (data: any) => {
    if (!data) return 'No data';
    
    if (typeof data === 'string') {
      return data.length > 100 ? data.substring(0, 100) + '...' : data;
    }
    
    if (Array.isArray(data)) {
      return `Array with ${data.length} items`;
    }
    
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    
    return String(data);
  };

  const overallStatus = results.length > 0 ? (
    results.every(r => r.status === 'success') ? 'success' :
    results.some(r => r.status === 'error') ? 'error' :
    'pending'
  ) : 'idle';

  const handleStartValidation = async () => {
    setIsLoading(true);
    await validatePipelineIntegration();
    setIsLoading(false);
  };

  const validationSteps = [
    'validate-test-data',
    'validate-ai-context', 
    'generate-insights',
    'validate-insights',
    'validate-sanitization',
    'test-guardian-chat',
    'validate-context-quality'
  ];

  const stepDescriptions = {
    'validate-test-data': 'Check for test medical documents',
    'validate-ai-context': 'Verify AI context feature is enabled',
    'generate-insights': 'Trigger personal insights generation',
    'validate-insights': 'Validate generated insights structure',
    'validate-sanitization': 'Verify privacy sanitization',
    'test-guardian-chat': 'Test Guardian Chat context injection',
    'validate-context-quality': 'Validate context injection quality'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Pipeline Integration Tester
          {overallStatus !== 'idle' && getStatusBadge(overallStatus)}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Validate dummy document integration with existing pipeline and Guardian Chat enhancement
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleStartValidation}
            disabled={isLoading || isValidating}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isValidating ? 'Validating...' : 'Start Validation'}
          </Button>
          
          <Button
            variant="outline"
            onClick={clearResults}
            disabled={isLoading || isValidating || results.length === 0}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Results
          </Button>
        </div>

        {/* Current Step Indicator */}
        {currentStep && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm font-medium text-blue-800">
                Currently running: {stepDescriptions[currentStep as keyof typeof stepDescriptions]}
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <h4 className="font-medium">Validation Results</h4>
            
            {validationSteps.map((step) => {
              const result = results.find(r => r.step === step);
              const isExpanded = expandedResults.includes(step);
              
              return (
                <div key={step} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result ? getStatusIcon(result.status) : <AlertCircle className="w-4 h-4 text-gray-400" />}
                      <span className="font-medium text-sm">
                        {stepDescriptions[step as keyof typeof stepDescriptions]}
                      </span>
                      {result && getStatusBadge(result.status)}
                    </div>
                    
                    {result && result.data && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleResultExpansion(step)}
                        className="h-6 w-6 p-0"
                      >
                        {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    )}
                  </div>
                  
                  {result && (
                    <div className="text-sm text-muted-foreground">
                      {result.message}
                    </div>
                  )}
                  
                  {result && result.data && (
                    <Collapsible open={isExpanded}>
                      <CollapsibleContent>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono overflow-x-auto">
                          <pre>{formatData(result.data)}</pre>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  
                  {result && result.timestamp && (
                    <div className="text-xs text-gray-400">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">How it works:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Validates that test medical documents exist</li>
            <li>• Triggers existing generate-personal-insights edge function</li>
            <li>• Validates AI medical insights are generated correctly</li>
            <li>• Tests Guardian Chat context injection with enhanced medical data</li>
            <li>• Verifies privacy sanitization works with test documents</li>
            <li>• Validates context injection quality and accuracy</li>
          </ul>
        </div>

        {/* Critical Requirements */}
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="font-medium text-sm mb-2 text-amber-800">Critical Requirements:</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Uses existing edge functions without modifications</li>
            <li>• Preserves existing Guardian Chat functionality</li>
            <li>• Maintains all existing privacy and security measures</li>
            <li>• Validates existing error handling and reporting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineIntegrationTester;