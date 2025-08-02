
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface PipelineDebugSectionProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const PipelineDebugSection = ({ isLoading, setIsLoading }: PipelineDebugSectionProps) => {
  const checkAuthentication = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      toast.error('Please sign in to use pipeline debug features');
      return null;
    }
    return user;
  };

  const triggerEdgeFunction = async (functionName: string, description: string, body?: Record<string, any>) => {
    try {
      setIsLoading(true);
      
      const user = await checkAuthentication();
      if (!user) {
        return;
      }

      console.log(`Triggering edge function: ${functionName} with body:`, body);
      
      const { data: result, error } = await supabase.functions.invoke(functionName, {
        body,
      });

      if (error) {
        toast.error(`${description} failed: ${error.message}`);
        console.error(`${functionName} error:`, error);
        return;
      }
      
      console.log(`${functionName} response:`, result);
      toast.success(`${description} completed successfully`);

    } catch (error: any) {
      console.error(`Error calling ${functionName}:`, error);
      toast.error(`Failed to trigger ${description}: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Pipeline Debug Controls</h3>
        <p className="text-xs text-gray-500">Individual pipeline steps for debugging</p>
        
        <div className="space-y-2">
          <Button
            onClick={() => triggerEdgeFunction('calculate-baseline', 'Calculate Baseline')}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Step 2: Calculate Baseline
          </Button>
          
          <Button
            onClick={() => {
              const todayStr = new Date().toISOString().split('T')[0];
              triggerEdgeFunction(
                'aggregate-daily-summary',
                'Aggregate Daily Summary',
                { date: todayStr }
              );
            }}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Step 4: Aggregate Daily Summary (Today)
          </Button>
          
          <Button
            onClick={() => triggerEdgeFunction('send-risk-notification', 'Send Risk Notification')}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Step 5: Send Risk Notification
          </Button>
        </div>
      </div>

      <Separator />
    </>
  );
};

export default PipelineDebugSection;
