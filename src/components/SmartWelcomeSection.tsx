
import { useSmartWelcome } from '@/hooks/useSmartWelcome';
import { useDailySummary } from '@/hooks/useDailySummary';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SmartWelcomeSectionProps {
  firstName: string;
}

const SmartWelcomeSection = ({ firstName }: SmartWelcomeSectionProps) => {
  const isMobile = useIsMobile();
  const welcomeMessage = useSmartWelcome(firstName);
  const { data: dailySummary } = useDailySummary();

  if (!welcomeMessage) {
    // Fallback while loading
    return (
      <div className="py-4">
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl p-6 text-slate-800 relative overflow-hidden">
        {/* Static background to prevent animation flicker during load */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-blue-100/50" />
          <div className="relative z-10">
            <h2 className="text-xl font-semibold mb-2">
              Welcome back, {firstName}! 🌟
            </h2>
            <p className="text-slate-700">
              How are you feeling today?
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className={cn(
        "rounded-2xl p-6 relative overflow-hidden transition-all duration-300",
        `bg-gradient-to-r ${welcomeMessage.statusColor}`,
        "text-slate-800"
      )}>
        {/* Static background to prevent micro-refreshes */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-slate-100/15" />
        
        {/* Minimal decorative elements without animation during initial load */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-200/15 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-slate-300/10 rounded-full translate-y-6 -translate-x-6" />
        
        <div className="relative z-10">
          <h2 className={cn(
            "font-semibold mb-3 text-slate-800",
            isMobile ? "text-lg" : "text-xl"
          )}>
            {welcomeMessage.greeting}
          </h2>
          
          <p className={cn(
            "mb-0 text-slate-700",
            isMobile ? "text-sm" : "text-base"
          )}>
            {welcomeMessage.question}
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default SmartWelcomeSection;
