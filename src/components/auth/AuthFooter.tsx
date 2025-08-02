
import { useIsMobile } from '@/hooks/use-mobile';

interface AuthFooterProps {
  isSignUp: boolean;
}

const AuthFooter = ({ isSignUp }: AuthFooterProps) => {
  const isMobile = useIsMobile();

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('/terms', '_blank');
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('/privacy', '_blank');
  };

  return (
    <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
      {/* Testing credentials section - Mobile optimized */}
      <div className="bg-apple-blue-50/80 dark:bg-apple-blue-900/20 backdrop-blur-sm border border-apple-blue-200/50 dark:border-apple-blue-700/50 rounded-xl shadow-elevation-1">
        <div className={isMobile ? 'p-3' : 'p-4'}>
          <h3 className={`${isMobile ? 'text-xs' : 'text-label-medium'} font-semibold text-apple-blue-800 dark:text-apple-blue-300 ${isMobile ? 'mb-2' : 'mb-3'} flex items-center`}>
            <div className="w-2 h-2 bg-apple-blue-500 rounded-full mr-2"></div>
            Testing Credentials
          </h3>
          <div className={`text-apple-blue-700 dark:text-apple-blue-300 bg-white/60 dark:bg-apple-gray-800/60 rounded-lg ${isMobile ? 'p-2 space-y-1.5' : 'p-3 space-y-2'}`}>
            <div className={`flex ${isMobile ? 'flex-col space-y-1' : 'justify-between items-center'}`}>
              <span className={`font-medium ${isMobile ? 'text-xs' : 'text-label-medium'}`}>Email:</span>
              <span className={`font-mono ${isMobile ? 'text-xs break-all' : 'text-label-small'} ${isMobile ? 'text-apple-blue-600' : ''}`}>
                tester01@bipolar-guardian.dev
              </span>
            </div>
            <div className={`flex ${isMobile ? 'flex-col space-y-1' : 'justify-between items-center'}`}>
              <span className={`font-medium ${isMobile ? 'text-xs' : 'text-label-medium'}`}>Password:</span>
              <span className={`font-mono ${isMobile ? 'text-xs' : 'text-label-small'} ${isMobile ? 'text-apple-blue-600' : ''}`}>
                Test1234!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer text - Mobile optimized */}
      <div className={`text-center ${isMobile ? 'text-xs' : 'text-label-small'} text-apple-gray-500 dark:text-apple-gray-400 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
        <p className="flex items-center justify-center">
          <div className="w-1 h-1 bg-apple-gray-400 rounded-full mr-2"></div>
          Secure access to your wellness data
          <div className="w-1 h-1 bg-apple-gray-400 rounded-full ml-2"></div>
        </p>
        {isSignUp && (
          <p className={`${isMobile ? 'text-xs leading-relaxed max-w-xs' : 'text-label-small leading-relaxed max-w-sm'} mx-auto`}>
            By creating an account, you agree to our{' '}
            <button 
              onClick={handleTermsClick}
              className={`text-apple-blue-600 dark:text-apple-blue-400 hover:text-apple-blue-700 dark:hover:text-apple-blue-300 hover:underline transition-all duration-250 ease-apple-ease cursor-pointer underline ${isMobile ? 'touch-manipulation' : ''}`}
            >
              Terms
            </button>
            {' '}and{' '}
            <button 
              onClick={handlePrivacyClick}
              className={`text-apple-blue-600 dark:text-apple-blue-400 hover:text-apple-blue-700 dark:hover:text-apple-blue-300 hover:underline transition-all duration-250 ease-apple-ease cursor-pointer underline ${isMobile ? 'touch-manipulation' : ''}`}
            >
              Privacy Policy
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthFooter;
