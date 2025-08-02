
import { Heart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BrandHeaderProps {
  isSignUp: boolean;
}

const BrandHeader = ({ isSignUp }: BrandHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="text-center space-y-3">
      <div className="flex justify-center">
        <div className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} bg-primary rounded-3xl flex items-center justify-center shadow-elevation-2 transition-all duration-250 ease-gentle hover:scale-105 active:scale-95`}>
          <Heart className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-white`} />
        </div>
      </div>
      <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
        <h1 className={`${isMobile ? 'text-xl' : 'text-headline-large'} font-semibold text-foreground tracking-tight`}>
          Bipolar Guardian
        </h1>
        <p className={`${isMobile ? 'text-sm' : 'text-body-large'} text-muted-foreground leading-relaxed ${isMobile ? 'max-w-xs' : 'max-w-md'} mx-auto`}>
          {isSignUp 
            ? 'Create your account to start your wellness journey' 
            : 'Welcome back to your wellness companion'
          }
        </p>
      </div>
    </div>
  );
};

export default BrandHeader;
