
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ScreenRouter from '@/components/ScreenRouter';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from "@/integrations/supabase/client";

type Screen = 'login' | 'onboarding-step1' | 'onboarding-step2' | 'onboarding-step3' | 'dashboard' | 'data-streams' | 'health-data' | 'settings' | 'medications' | 'guardian' | 'trusted-circle' | 'support' | 'documents' | 'testing';

interface UserData {
  firstName: string;
  email: string;
  biometricConsent: boolean;
}

interface AuthenticatedAppProps {
  session: Session;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  userData: UserData;
  setUserData: (data: UserData | ((prev: UserData) => UserData)) => void;
  handleSignOut: () => Promise<void>;
}

const AuthenticatedApp = ({ 
  session, 
  currentScreen, 
  setCurrentScreen, 
  userData, 
  setUserData, 
  handleSignOut 
}: AuthenticatedAppProps) => {
  const isMobile = useIsMobile();
  const [userProfile, setUserProfile] = useState<{ firstName?: string; email?: string }>({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user) {
        // Get user data from the session and user metadata
        const email = session.user.email || '';
        const firstName = userData.firstName || session.user.user_metadata?.firstName || '';
        
        setUserProfile({
          firstName,
          email
        });
      }
    };

    fetchUserProfile();
  }, [session, userData]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Only render sidebar on desktop */}
        {!isMobile && (
          <AppSidebar 
            currentScreen={currentScreen}
            onScreenChange={setCurrentScreen}
            userData={userProfile}
          />
        )}
        <main className="flex-1">
          <ScreenRouter
            currentScreen={currentScreen}
            userData={userData}
            onSignOut={handleSignOut}
            onNavigate={setCurrentScreen}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AuthenticatedApp;
