import React from 'react';
import { Loader2 } from 'lucide-react';

interface SessionLoadingScreenProps {
  message?: string;
  subMessage?: string;
}

/**
 * Loading screen displayed while session is being initialized
 */
export const SessionLoadingScreen: React.FC<SessionLoadingScreenProps> = ({
  message = "Loading your mental health dashboard...",
  subMessage = "Setting up secure session"
}) => {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
        <div className="text-sm text-gray-600">{message}</div>
        <div className="text-xs text-gray-500">{subMessage}</div>
      </div>
    </div>
  );
};

export default SessionLoadingScreen;