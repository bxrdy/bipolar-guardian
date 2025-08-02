
import { useIsMobile } from '@/hooks/use-mobile';

interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: (isSignUp: boolean) => void;
  disabled: boolean;
}

const AuthToggle = ({ isSignUp, onToggle, disabled }: AuthToggleProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
      <button
        type="button"
        onClick={() => onToggle(true)}
        disabled={disabled}
        className={`flex-1 ${isMobile ? 'py-2.5 px-3' : 'py-3 px-6'} rounded-xl transition-all duration-300 font-medium ${isMobile ? 'text-xs' : 'text-sm'} ${
          isSignUp 
            ? 'bg-white text-gray-900 shadow-md transform scale-[0.98]' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        Create Account
      </button>
      <button
        type="button"
        onClick={() => onToggle(false)}
        disabled={disabled}
        className={`flex-1 ${isMobile ? 'py-2.5 px-3' : 'py-3 px-6'} rounded-xl transition-all duration-300 font-medium ${isMobile ? 'text-xs' : 'text-sm'} ${
          !isSignUp 
            ? 'bg-white text-gray-900 shadow-md transform scale-[0.98]' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        Sign In
      </button>
    </div>
  );
};

export default AuthToggle;
