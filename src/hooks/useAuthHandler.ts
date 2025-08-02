
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthResult {
  success: boolean;
  error: string | null;
}

export const useAuthHandler = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { toast } = useToast();

  const performAuth = useCallback(async (
    email: string,
    password: string,
    isSignUp: boolean
  ): Promise<AuthResult> => {
    try {
      let res;
      if (isSignUp) {
        res = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      } else {
        res = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (res.error) {
        toast({
          title: isSignUp ? "Sign Up Failed" : "Sign In Failed",
          description: res.error.message,
          variant: "destructive",
        });
        return { success: false, error: res.error.message };
      }

      toast({
        title: isSignUp ? "Sign Up Successful" : "Sign In Successful",
        description: isSignUp
          ? "Check your email to confirm your account."
          : "You are now signed in.",
      });

      // Removed hard-coded redirect - let useSessionAuth handle screen transitions
      return { success: true, error: null };
    } catch (error: any) {
      console.error(isSignUp ? 'Sign up error:' : 'Sign in error:', error);
      toast({
        title: isSignUp ? "Sign Up Error" : "Sign In Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      return { success: false, error: error.message || "An unexpected error occurred." };
    }
  }, [toast]);

  const handleEmailPasswordAuth = async (
    email: string,
    password: string,
    isSignUp: boolean,
    allowRetry: boolean = true
  ): Promise<void> => {
    if (isSigningIn || isSigningUp) return;

    try {
      setIsSigningIn(!isSignUp);
      setIsSigningUp(isSignUp);

      const authResult = await performAuth(email, password, isSignUp);
      
      if (!authResult.success && allowRetry) {
        // Handle retry logic but don't return the result
        console.log('Auth failed, but handling internally:', authResult.error);
      }
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    } finally {
      setIsSigningIn(false);
      setIsSigningUp(false);
    }
  };

  return {
    isSigningIn,
    isSigningUp,
    handleEmailPasswordAuth,
  };
};
