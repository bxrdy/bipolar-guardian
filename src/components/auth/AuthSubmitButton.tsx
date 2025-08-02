
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AuthSubmitButtonProps {
  isSignUp: boolean;
  isLoading: boolean;
}

const AuthSubmitButton = ({ isSignUp, isLoading }: AuthSubmitButtonProps) => {
  const isMobile = useIsMobile();

  return (
    <Button
      type="submit"
      disabled={isLoading}
      size={isMobile ? "default" : "lg"}
      className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-250 ease-apple-ease ${isMobile ? 'h-11 text-sm' : ''} touch-manipulation`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} animate-spin mr-2`} />
          <span className={isMobile ? 'text-sm' : ''}>Please wait...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <span className={isMobile ? 'text-sm' : ''}>{isSignUp ? 'Create Account' : 'Sign In'}</span>
          <ArrowRight className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} ml-2`} />
        </div>
      )}
    </Button>
  );
};

export default AuthSubmitButton;
