
import { Separator } from "@/components/ui/separator";
import { useDocuments } from '@/hooks/useDocuments';
import DummyDocumentGenerator from './DummyDocumentGenerator';
import DocumentPipelineMonitor from './DocumentPipelineMonitor';
import MedicalDocumentGenerationSection from './MedicalDocumentGenerationSection';

interface MedicalDocumentTestingTabProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const MedicalDocumentTestingTab = ({ isLoading, setIsLoading }: MedicalDocumentTestingTabProps) => {
  const { refetch: refreshDocuments } = useDocuments();

  return (
    <>
      <MedicalDocumentGenerationSection isLoading={isLoading} setIsLoading={setIsLoading} />
      <Separator />
      <DummyDocumentGenerator isLoading={isLoading} setIsLoading={setIsLoading} />
      <DocumentPipelineMonitor isLoading={isLoading} setIsLoading={setIsLoading} />
    </>
  );
};

export default MedicalDocumentTestingTab;
