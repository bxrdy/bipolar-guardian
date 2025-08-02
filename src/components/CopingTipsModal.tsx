
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogBody, MobileDialogFooter } from "@/components/ui/mobile-dialog";
import { CheckCircle, Lightbulb } from 'lucide-react';
import { useDailySummary } from '@/hooks/useDailySummary';
import { useRiskAnalysis } from '@/hooks/useHealthAnalytics';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface CopingTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CopingTip {
  id: string;
  text: string;
  priority: number;
}

const CopingTipsModal = ({ isOpen, onClose }: CopingTipsModalProps) => {
  const { data: dailyData } = useDailySummary();
  const { fetchRealMetricDeltas } = useRiskAnalysis();
  const [personalizedTips, setPersonalizedTips] = useState<CopingTip[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const generatePersonalizedTips = async () => {
      const baseTips: CopingTip[] = [
        { id: 'sleep', text: 'Maintain a regular sleep schedule', priority: 1 },
        { id: 'caffeine', text: 'Avoid excess caffeine or alcohol', priority: 2 },
        { id: 'activity', text: 'Schedule a calm activity (reading, walk)', priority: 3 },
        { id: 'social', text: 'Reach out to a trusted friend', priority: 4 },
        { id: 'breathing', text: 'Practice a 5‑minute breathing exercise', priority: 5 }
      ];

      const tips = [...baseTips];

      // Analyze user's data patterns if available
      if (dailyData?.riskLevel && (dailyData.riskLevel === 'amber' || dailyData.riskLevel === 'red')) {
        try {
          const { deltas } = await fetchRealMetricDeltas(dailyData.riskLevel);
          
          // Prioritize tips based on data patterns
          deltas.forEach(delta => {
            if (delta.type === 'sleep' && delta.direction === 'down') {
              // Prioritize sleep-related tip
              const sleepTip = tips.find(tip => tip.id === 'sleep');
              if (sleepTip) sleepTip.priority = 0;
              
              // Add specific sleep tip
              tips.push({
                id: 'sleep-specific',
                text: 'Focus on getting 7-9 hours of sleep tonight',
                priority: 0.5
              });
            }
            
            if (delta.type === 'steps' && delta.direction === 'down') {
              // Prioritize physical activity
              const activityTip = tips.find(tip => tip.id === 'activity');
              if (activityTip) {
                activityTip.text = 'Take a 10-minute walk or do gentle stretching';
                activityTip.priority = 0.8;
              }
            }
            
            if (delta.type === 'screen' && delta.direction === 'up') {
              // Add screen time management tip
              tips.push({
                id: 'screen-break',
                text: 'Take regular breaks from screens',
                priority: 1.5
              });
              
              // Prioritize breathing exercise
              const breathingTip = tips.find(tip => tip.id === 'breathing');
              if (breathingTip) breathingTip.priority = 1.2;
            }
          });
        } catch (error) {
          console.error('Error fetching metric deltas:', error);
        }
      }

      // Sort by priority and take top 5-6 tips
      tips.sort((a, b) => a.priority - b.priority);
      setPersonalizedTips(tips.slice(0, 6));
    };

    if (isOpen) {
      generatePersonalizedTips();
    }
  }, [dailyData, fetchRealMetricDeltas, isOpen]);

  return (
    <MobileDialog open={isOpen} onOpenChange={onClose}>
      <MobileDialogContent className="max-w-lg">
        <MobileDialogHeader>
          <MobileDialogTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span>Coping Tips</span>
          </MobileDialogTitle>
        </MobileDialogHeader>
        
        <MobileDialogBody>
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Evidence-based strategies to help you manage your wellbeing
              {dailyData?.riskLevel && (dailyData.riskLevel === 'amber' || dailyData.riskLevel === 'red') 
                ? ', personalized based on your recent patterns' 
                : ' for daily mental health maintenance'}:
            </p>
            
            <div className={cn("space-y-4", isMobile && "max-h-80 overflow-y-auto")}>
              {personalizedTips.map((tip, index) => (
                <div key={tip.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 leading-relaxed font-medium">
                      {tip.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {dailyData?.riskLevel === 'red' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Remember:</strong> If you're experiencing persistent distress or thoughts of self-harm, 
                  please reach out to a mental health professional or crisis helpline immediately.
                </p>
              </div>
            )}
          </div>
        </MobileDialogBody>
        
        <MobileDialogFooter>
          <Button 
            onClick={onClose}
            className={cn(isMobile ? "w-full min-h-[48px]" : "")}
          >
            Got it
          </Button>
        </MobileDialogFooter>
      </MobileDialogContent>
    </MobileDialog>
  );
};

export default CopingTipsModal;
