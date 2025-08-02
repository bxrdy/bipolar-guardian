
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, FileText, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTestDocumentGeneration } from '@/hooks/useTestDocumentGeneration';
import { toast } from 'sonner';
import { GeneratedDocument } from './TestDataGenerator';

interface MedicalDocumentGenerationSectionProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const MedicalDocumentGenerationSection = ({ isLoading, setIsLoading }: MedicalDocumentGenerationSectionProps) => {
  const [progress, setProgress] = useState(0);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateTestDocuments } = useTestDocumentGeneration();

  const handleGenerateDocuments = async () => {
    try {
      setIsLoading(true);
      setIsGenerating(true);
      setProgress(0);
      setGeneratedDocs([]);

      toast.info('Starting medical document generation...');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const documents = await generateTestDocuments();
      
      clearInterval(progressInterval);
      setProgress(100);
      setGeneratedDocs(documents);

      toast.success(`Successfully generated ${documents.length} medical documents`);
    } catch (error: any) {
      console.error('Document generation error:', error);
      toast.error(`Failed to generate documents: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const resetGeneration = () => {
    setProgress(0);
    setGeneratedDocs([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Medical Document Generation
          <Badge variant="outline">AI Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generation Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateDocuments}
            disabled={isLoading || isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate Test Documents
              </>
            )}
          </Button>
          {generatedDocs.length > 0 && (
            <Button 
              variant="outline" 
              onClick={resetGeneration}
              disabled={isGenerating}
            >
              Reset
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generation Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Results Summary */}
        {generatedDocs.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Generation Complete</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {generatedDocs.length}
                    </div>
                    <div className="text-sm text-gray-600">Documents Created</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {generatedDocs.filter(doc => doc.content).length}
                    </div>
                    <div className="text-sm text-gray-600">With Extracted Text</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Set(generatedDocs.map(doc => doc.docType)).size}
                    </div>
                    <div className="text-sm text-gray-600">Document Types</div>
                  </CardContent>
                </Card>
              </div>

              {/* Document List */}
              <div className="space-y-2">
                <h4 className="font-medium">Generated Documents:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {generatedDocs.map((doc, index) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{doc.fileName}</div>
                          <div className="text-sm text-gray-600">{doc.docType}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.content ? "default" : "secondary"}>
                          {doc.content ? "Text Extracted" : "No Text"}
                        </Badge>
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This tool generates realistic test medical documents with extracted text for pipeline validation. 
            Generated documents are stored in your database for testing purposes.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default MedicalDocumentGenerationSection;
