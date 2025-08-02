
import { Shield } from 'lucide-react';
import { MobileDialogHeader, MobileDialogTitle } from "@/components/ui/mobile-dialog";

interface GuardianHeaderProps {
  isModal?: boolean;
}

const GuardianHeader = ({ isModal = false }: GuardianHeaderProps) => {
  const content = (
    <>
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-green-100/30" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full -translate-y-16 translate-x-16 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/25 rounded-full translate-y-12 -translate-x-12" style={{ animation: 'float 6s ease-in-out infinite' }} />
      
      <div className="flex items-center space-x-4 relative z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center shadow-lg border border-green-200/50 transition-transform duration-300 hover:scale-105">
          <Shield className="w-6 h-6 text-green-600 drop-shadow-sm" />
        </div>
        <div className="flex-1">
          <span className="text-xl font-bold text-green-800 drop-shadow-sm">Your Guardian</span>
          <p className="text-sm text-green-600 font-medium mt-0.5">AI Therapist & Personal Assistant</p>
        </div>
      </div>
      
      {/* Custom animation keyframes */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(3rem) translateX(-3rem) scale(1); }
            50% { transform: translateY(2rem) translateX(-4rem) scale(1.1); }
          }
        `
      }} />
    </>
  );

  if (isModal) {
    return (
      <MobileDialogHeader className="flex-shrink-0 border-b border-gray-200/30 bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 relative overflow-hidden px-6 py-4">
        <MobileDialogTitle className="w-full">
          {content}
        </MobileDialogTitle>
      </MobileDialogHeader>
    );
  }

  return (
    <div className="flex-shrink-0 border-b border-gray-200/30 bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 relative overflow-hidden px-6 py-4">
      {content}
    </div>
  );
};

export default GuardianHeader;
