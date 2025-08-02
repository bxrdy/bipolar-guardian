import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Zap, 
  Eye,
  RefreshCw
} from 'lucide-react';

interface DocumentPipelineMonitorProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration?: number;
  error?: string;
  details?: string;
}

interface DocumentProcessingJob {
  id: string;
  documentId: string;
  documentType: string;
  fileName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  steps: PipelineStep[];
  startTime: string;
  endTime?: string;
  extractedData?: any;
  error?: string;
}

const DocumentPipelineMonitor = ({ isLoading, setIsLoading }: DocumentPipelineMonitorProps) => {
  const [processingJobs, setProcessingJobs] = useState<DocumentProcessingJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<DocumentProcessingJob | null>(null);
  const [monitoringActive, setMonitoringActive] = useState(false);

  const defaultPipelineSteps: PipelineStep[] = [
    { id: '1', name: 'Document Upload', status: 'pending' },
    { id: '2', name: 'Format Detection', status: 'pending' },
    { id: '3', name: 'OCR Processing', status: 'pending' },
    { id: '4', name: 'Medical Entity Extraction', status: 'pending' },
    { id: '5', name: 'Data Validation', status: 'pending' },
    { id: '6', name: 'Database Storage', status: 'pending' },
    { id: '7', name: 'Notification Trigger', status: 'pending' },
  ];

  const checkAuthentication = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      toast.error('Please sign in to access document pipeline monitoring');
      return null;
    }
    return user;
  };

  const simulateDocumentProcessing = async (documentType: string) => {
    try {
      setIsLoading(true);
      
      const user = await checkAuthentication();
      if (!user) {
        return;
      }

      const newJob: DocumentProcessingJob = {
        id: `job-${Date.now()}`,
        documentId: `doc-${Date.now()}`,
        documentType,
        fileName: `sample-${documentType}-${Date.now()}.pdf`,
        status: 'processing',
        progress: 0,
        steps: [...defaultPipelineSteps],
        startTime: new Date().toISOString(),
      };

      setProcessingJobs(prev => [newJob, ...prev]);
      setSelectedJob(newJob);

      // Simulate processing steps
      for (let i = 0; i < defaultPipelineSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const shouldFail = Math.random() < 0.1; // 10% chance of failure
        const stepStatus = shouldFail ? 'failed' : 'completed';
        const stepError = shouldFail ? `Error in ${defaultPipelineSteps[i].name}: Network timeout` : undefined;
        
        setProcessingJobs(prev => 
          prev.map(job => 
            job.id === newJob.id 
              ? {
                  ...job,
                  progress: ((i + 1) / defaultPipelineSteps.length) * 100,
                  status: shouldFail ? 'failed' : (i === defaultPipelineSteps.length - 1 ? 'completed' : 'processing'),
                  steps: job.steps.map(step => 
                    step.id === (i + 1).toString() 
                      ? { ...step, status: stepStatus, error: stepError, duration: Math.round(Math.random() * 3000) }
                      : step
                  ),
                  endTime: shouldFail || i === defaultPipelineSteps.length - 1 ? new Date().toISOString() : undefined,
                  extractedData: !shouldFail && i === defaultPipelineSteps.length - 1 ? generateMockExtractedData(documentType) : undefined
                }
              : job
          )
        );

        if (shouldFail) {
          toast.error(`Document processing failed at step: ${defaultPipelineSteps[i].name}`);
          break;
        }
      }

      if (processingJobs.find(job => job.id === newJob.id)?.status === 'completed') {
        toast.success('Document processing completed successfully');
      }

    } catch (error: any) {
      console.error('Error simulating document processing:', error);
      toast.error(`Failed to process document: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockExtractedData = (documentType: string) => {
    const baseData = {
      patientName: 'John Doe',
      documentDate: new Date().toISOString().split('T')[0],
      provider: 'Dr. Smith',
      extractedAt: new Date().toISOString(),
    };

    switch (documentType) {
      case 'lab-report':
        return {
          ...baseData,
          testResults: [
            { test: 'Lithium Level', value: '0.8', unit: 'mEq/L', normalRange: '0.6-1.2' },
            { test: 'TSH', value: '2.1', unit: 'mIU/L', normalRange: '0.4-4.0' },
            { test: 'ALT', value: '28', unit: 'U/L', normalRange: '10-40' },
          ],
        };
      case 'prescription':
        return {
          ...baseData,
          medications: [
            { name: 'Lithium Carbonate', dosage: '300mg', frequency: 'TID', quantity: '90' },
            { name: 'Lamotrigine', dosage: '25mg', frequency: 'Daily', quantity: '30' },
          ],
        };
      case 'psychiatrist-note':
        return {
          ...baseData,
          currentMedications: ['Lithium 900mg daily', 'Lamotrigine 200mg daily'],
          mentalStatus: 'Stable, euthymic mood',
          assessment: 'Bipolar I disorder, stable',
          plan: 'Continue current medications, follow-up in 3 months',
        };
      default:
        return baseData;
    }
  };

  const getStatusIcon = (status: PipelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: DocumentProcessingJob['status']) => {
    const variants = {
      queued: 'secondary',
      processing: 'default',
      completed: 'secondary',
      failed: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const clearJobs = () => {
    setProcessingJobs([]);
    setSelectedJob(null);
    toast.success('Processing history cleared');
  };

  const retryJob = async (jobId: string) => {
    const job = processingJobs.find(j => j.id === jobId);
    if (job) {
      await simulateDocumentProcessing(job.documentType);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Document Pipeline Monitor</h3>
        <p className="text-xs text-gray-500">Monitor and debug medical document processing workflows</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Start Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  onClick={() => simulateDocumentProcessing('lab-report')}
                  disabled={isLoading}
                  size="sm"
                >
                  Process Lab Report
                </Button>
                <Button 
                  onClick={() => simulateDocumentProcessing('prescription')}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                >
                  Process Prescription
                </Button>
                <Button 
                  onClick={() => simulateDocumentProcessing('psychiatrist-note')}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                >
                  Process Psychiatrist Note
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Processing Queue ({processingJobs.length})</CardTitle>
              <Button onClick={clearJobs} variant="outline" size="sm">
                Clear All
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {processingJobs.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-8">No processing jobs</p>
                  ) : (
                    processingJobs.map((job) => (
                      <div 
                        key={job.id} 
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedJob?.id === job.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedJob(job)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-medium">{job.fileName}</span>
                          </div>
                          {getStatusBadge(job.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={job.progress} className="flex-1 h-2" />
                          <span className="text-xs text-gray-500">{Math.round(job.progress)}%</span>
                        </div>
                        {job.status === 'failed' && (
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              retryJob(job.id);
                            }}
                            size="sm"
                            variant="outline"
                            className="mt-2"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {selectedJob && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Job Details: {selectedJob.fileName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-3">Pipeline Steps</h4>
                  <div className="space-y-2">
                    {selectedJob.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3 p-2 border rounded">
                        {getStatusIcon(step.status)}
                        <div className="flex-1">
                          <div className="text-sm font-medium">{step.name}</div>
                          {step.duration && (
                            <div className="text-xs text-gray-500">{step.duration}ms</div>
                          )}
                          {step.error && (
                            <div className="text-xs text-red-500 mt-1">{step.error}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-3">Extracted Data</h4>
                  {selectedJob.extractedData ? (
                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-[300px]">
                      {JSON.stringify(selectedJob.extractedData, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-500">No data extracted yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />
    </>
  );
};

export default DocumentPipelineMonitor;