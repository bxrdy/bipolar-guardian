
import { useState } from 'react';
import BrandHeader from './auth/BrandHeader';
import AuthToggle from './auth/AuthToggle';
import EmailInput from './auth/EmailInput';
import PasswordInput from './auth/PasswordInput';
import AuthSubmitButton from './auth/AuthSubmitButton';
import AuthFooter from './auth/AuthFooter';
import { useIsMobile } from '@/hooks/use-mobile';

interface LoginFormProps {
  onEmailPasswordAuth: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  isSigningIn: boolean;
  isSigningUp: boolean;
}

const LoginForm = ({ 
  onEmailPasswordAuth, 
  isSigningIn, 
  isSigningUp 
}: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const isMobile = useIsMobile();

  const isLoading = isSigningIn || isSigningUp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onEmailPasswordAuth(email, password, isSignUp);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}`}>
      {/* Background decoration - optimized for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${isMobile ? 'w-32 h-32' : 'w-64 h-64'}`}></div>
        <div className={`absolute top-3/4 right-1/4 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${isMobile ? 'w-32 h-32' : 'w-64 h-64'}`} style={{ animationDelay: '1s' }}></div>
      </div>

      <div className={`relative w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} mx-auto`}>
        <div className={`bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 ${isMobile ? 'p-4 space-y-4' : 'p-6 space-y-5'}`}>
          <BrandHeader isSignUp={isSignUp} />

          <AuthToggle 
            isSignUp={isSignUp} 
            onToggle={setIsSignUp} 
            disabled={isLoading}
          />

          <form onSubmit={handleSubmit} className={isMobile ? 'space-y-3' : 'space-y-4'}>
            <EmailInput 
              email={email}
              onChange={setEmail}
              disabled={isLoading}
            />

            <PasswordInput
              password={password}
              onChange={setPassword}
              isSignUp={isSignUp}
              disabled={isLoading}
            />

            <AuthSubmitButton
              isSignUp={isSignUp}
              isLoading={isLoading}
            />
          </form>

          <AuthFooter isSignUp={isSignUp} />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
