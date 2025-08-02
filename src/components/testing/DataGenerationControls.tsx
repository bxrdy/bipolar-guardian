
import { Separator } from "@/components/ui/separator";
import DataGenerationSection from './DataGenerationSection';
import PipelineDebugSection from './PipelineDebugSection';
import PipelineIntegrationTester from './PipelineIntegrationTester';

interface DataGenerationControlsProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const DataGenerationControls = ({ isLoading, setIsLoading }: DataGenerationControlsProps) => {
  return (
    <>
      <DataGenerationSection isLoading={isLoading} setIsLoading={setIsLoading} />
      <PipelineDebugSection isLoading={isLoading} setIsLoading={setIsLoading} />
      <Separator />
      <PipelineIntegrationTester isLoading={isLoading} setIsLoading={setIsLoading} />
    </>
  );
};

export default DataGenerationControls;
