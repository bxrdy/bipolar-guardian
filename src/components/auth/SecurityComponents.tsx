import React from 'react';
import { Session } from '@supabase/supabase-js';
import SessionTimeoutWarning from './SessionTimeoutWarning';
import SuspiciousActivityAlert from './SuspiciousActivityAlert';
import RealTimeSecurityMonitor from '../security/RealTimeSecurityMonitor';

interface SecurityComponentsProps {
  session: Session | null;
  sessionSecurity: {
    showWarning: boolean;
    showFinalWarning: boolean;
    timeRemaining: number;
    isSensitiveMode: boolean;
    extendSession: () => void;
    forceLogout: () => void;
  };
  suspiciousActivity: {
    show: boolean;
    onDismiss: () => void;
  };
}

/**
 * Component that manages all security-related UI elements
 * Only renders when user is authenticated
 */
export const SecurityComponents: React.FC<SecurityComponentsProps> = ({
  session,
  sessionSecurity,
  suspiciousActivity
}) => {
  // Only render security components when user is authenticated
  if (!session) {
    return null;
  }

  return (
    <>
      {/* Real-time Security Monitor */}
      <RealTimeSecurityMonitor 
        userId={session.user.id}
        showAlerts={true}
      />
      
      {/* Session Timeout Warning */}
      <SessionTimeoutWarning
        isOpen={sessionSecurity.showWarning || sessionSecurity.showFinalWarning}
        onExtend={sessionSecurity.extendSession}
        onLogout={sessionSecurity.forceLogout}
        timeRemaining={sessionSecurity.timeRemaining}
        isFinalWarning={sessionSecurity.showFinalWarning}
        isSensitiveMode={sessionSecurity.isSensitiveMode}
      />
      
      {/* Suspicious Activity Alert */}
      {suspiciousActivity.show && (
        <SuspiciousActivityAlert
          onDismiss={suspiciousActivity.onDismiss}
          autoCheck={true}
          checkInterval={60000} // Check every minute
        />
      )}
    </>
  );
};

export default SecurityComponents;