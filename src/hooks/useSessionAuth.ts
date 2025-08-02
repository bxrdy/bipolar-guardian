
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';

export type Screen = 'login' | 'onboarding-step1' | 'onboarding-step2' | 'onboarding-step3' | 'dashboard' | 'data-streams' | 'health-data' | 'settings';

export interface UserData {
  firstName: string;
  email: string;
  biometricConsent: boolean;
}

export interface UseSessionAuthResult {
  session: Session | null;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  userData: UserData;
  setUserData: (data: UserData | ((prev: UserData) => UserData)) => void;
  isLoading: boolean;
  handleSignOut: () => Promise<void>;
}

/**
 * Hook for managing authentication state and user session
 */
export function useSessionAuth(): UseSessionAuthResult {
  const [session, setSession] = useState<Session | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    email: '',
    biometricConsent: false
  });

  // Fetch user profile data
  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Process authentication state changes
  const processAuthStateChange = async (session: Session | null) => {
    if (session) {
      // Fetch user profile
      const profile = await fetchUserProfile(session.user.id, session.user.email || '');
      
      if (profile && profile.first_name) {
        // User has completed onboarding and has profile data
        setUserData({
          firstName: profile.first_name || '',
          email: profile.email || session.user.email || '',
          biometricConsent: false // Note: biometric_consent doesn't exist in current schema
        });
        setCurrentScreen('dashboard');
      } else {
        // User exists but no profile data - needs onboarding
        setCurrentScreen('onboarding-step1');
      }
    } else {
      // User signed out - reset state
      setUserData({
        firstName: '',
        email: '',
        biometricConsent: false
      });
      setCurrentScreen('login');
    }
    setIsLoading(false);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Reset all local state
      setSession(null);
      setCurrentScreen('login');
      setUserData({
        firstName: '',
        email: '',
        biometricConsent: false
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error; // Let the caller handle the error display
    }
  };

  // Set up authentication listeners
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      // Process the session
      await processAuthStateChange(session);
    };

    getSession();

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      setSession(session);
      
      // Use setTimeout to defer the async profile fetching to prevent deadlocks
      setTimeout(() => {
        processAuthStateChange(session);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    currentScreen,
    setCurrentScreen,
    userData,
    setUserData,
    isLoading,
    handleSignOut
  };
}
