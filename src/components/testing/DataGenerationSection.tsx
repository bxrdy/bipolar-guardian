
import { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import ProgressIndicator from './ProgressIndicator';
import ConfirmationDialog from './ConfirmationDialog';
import DataGenerationActions from './DataGenerationActions';
import { 
  ProgressStep,
  generateSensorData,
  generateHistoricalData,
  generate30DaysRealisticData,
  generateOutlierData
} from './DataGenerationLogic';
import {
  processBasicDataPipeline,
  processHistoricalDataPipeline,
  processFullPipeline,
  processOutlierDataPipeline
} from './PipelineProcessor';

interface DataGenerationSectionProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DataGenerationSection = ({ isLoading, setIsLoading }: DataGenerationSectionProps) => {
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [showProgress, setShowProgress] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    isDestructive: false
  });

  const updateProgress = (stepId: string, status: ProgressStep['status'], message?: string) => {
    setProgressSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message } : step
    ));
  };

  const handleGenerateSensorData = (metricType: string, value: number) => {
    generateSensorData(metricType, value, setIsLoading, processBasicDataPipeline);
  };

  const handleGenerateHistoricalData = () => {
    generateHistoricalData(
      setIsLoading,
      setShowProgress,
      setProgressSteps,
      updateProgress,
      processHistoricalDataPipeline
    );
  };

  const handleGenerate30DaysData = () => {
    generate30DaysRealisticData(
      setIsLoading,
      setShowProgress,
      setProgressSteps,
      updateProgress,
      () => processFullPipeline(updateProgress)
    );
  };

  const handleGenerateOutlierData = () => {
    generateOutlierData(setIsLoading, processOutlierDataPipeline);
  };

  const handleRealisticDataClick = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Generate 30 Days of Realistic Data',
      description: 'This will clear existing data from the last 30 days and generate new realistic patterns. This action cannot be undone.',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        handleGenerate30DaysData();
      },
      isDestructive: true
    });
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Data Generation (Auto-processes Pipeline)</h3>
        
        <ProgressIndicator steps={progressSteps} isVisible={showProgress} />
        
        <DataGenerationActions
          isLoading={isLoading}
          onGenerateSensorData={handleGenerateSensorData}
          onGenerateHistoricalData={handleGenerateHistoricalData}
          onGenerate30DaysData={handleRealisticDataClick}
          onGenerateOutlierData={handleGenerateOutlierData}
        />
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        confirmText="Generate Data"
        isDestructive={confirmDialog.isDestructive}
      />

      <Separator />
    </>
  );
};

export default DataGenerationSection;
