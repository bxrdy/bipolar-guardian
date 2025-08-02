
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Heart, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface OnboardingStep2Props {
  onNext: (data: { email: string }) => void;
  userData: { firstName: string };
}

const OnboardingStep2 = ({ onNext, userData }: OnboardingStep2Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: userData.firstName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    setLoading(false);

    if (error) {
      toast.error("Sign up failed", {
        description: error.message,
      });
    } else {
      toast.success("Success!", {
        description: "Please check your email to confirm your account.",
      });
      onNext({ email: email.trim() });
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      toast.error("Sign in failed", {
        description: error.message,
      });
    } else {
      toast.success("Welcome back!", {
        description: "You have successfully signed in.",
      });
      onNext({ email: email.trim() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@') && password.length >= 6) {
      if (isSignUp) {
        await handleSignUp();
      } else {
        await handleSignIn();
      }
    }
  };

  const isFormValid = email.trim() && email.includes('@') && password.length >= 6;

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-6 bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-md mx-auto w-full">
        <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-6 space-y-5">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-105">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                {isSignUp ? `Create your account, ${userData.firstName}!` : `Welcome back, ${userData.firstName}!`}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                {isSignUp 
                  ? "Set up your email and a secure password to protect your account."
                  : "Sign in to your account to continue your wellness journey."
                }
              </p>
            </div>
          </div>

          {/* Toggle between Sign Up and Sign In */}
          <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 px-4 rounded-xl transition-all duration-300 font-medium text-sm ${
                isSignUp 
                  ? 'bg-white text-gray-900 shadow-md transform scale-[0.98]' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 px-4 rounded-xl transition-all duration-300 font-medium text-sm ${
                !isSignUp 
                  ? 'bg-white text-gray-900 shadow-md transform scale-[0.98]' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Account Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                required
                minLength={6}
                disabled={loading}
              />
              {isSignUp && (
                <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full h-12 text-base font-medium rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Please wait...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              )}
            </Button>
          </form>

          {/* Progress indicator */}
          <div className="flex justify-center space-x-2 pt-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full transition-colors"></div>
            <div className="w-6 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-sm"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full transition-colors"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep2;
