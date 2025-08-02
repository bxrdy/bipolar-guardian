
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertTriangle, Shield } from "lucide-react";
import { formatTimeRemaining } from "@/hooks/useSessionSecurity";

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  onExtend: () => void;
  onLogout: () => void;
  timeRemaining: number;
  isFinalWarning?: boolean;
  isSensitiveMode?: boolean;
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  isOpen,
  onExtend,
  onLogout,
  timeRemaining,
  isFinalWarning = false,
  isSensitiveMode = false
}) => {
  const totalTime = isSensitiveMode ? 5 * 60 : 15 * 60; // 5 or 15 minutes in seconds
  const progressPercentage = Math.max(0, (timeRemaining / totalTime) * 100);
  
  const getAlertIcon = () => {
    if (isFinalWarning) return <AlertTriangle className="h-6 w-6 text-red-500" />;
    if (isSensitiveMode) return <Shield className="h-6 w-6 text-orange-500" />;
    return <Clock className="h-6 w-6 text-yellow-500" />;
  };

  const getAlertTitle = () => {
    if (isFinalWarning) return "Session Expiring Soon!";
    if (isSensitiveMode) return "Sensitive Session Warning";
    return "Session Timeout Warning";
  };

  const getAlertDescription = () => {
    const timeString = formatTimeRemaining(timeRemaining);
    
    if (isFinalWarning) {
      return `Your session will expire in ${timeString}. All unsaved work will be lost. Please extend your session or save your work now.`;
    }
    
    if (isSensitiveMode) {
      return `You are in sensitive mode with enhanced security. Your session will timeout in ${timeString} due to inactivity.`;
    }
    
    return `Your session will expire in ${timeString} due to inactivity. Click "Stay Signed In" to extend your session.`;
  };

  const getProgressColor = () => {
    if (isFinalWarning) return "bg-red-500";
    if (isSensitiveMode) return "bg-orange-500";
    return "bg-yellow-500";
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {getAlertIcon()}
            <AlertDialogTitle className="text-lg">
              {getAlertTitle()}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 mt-2">
            {getAlertDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Time Remaining
            </span>
            <span className={`text-sm font-mono font-bold ${
              isFinalWarning 
                ? 'text-red-600' 
                : isSensitiveMode 
                ? 'text-orange-600' 
                : 'text-yellow-600'
            }`}>
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
          
          {isSensitiveMode && (
            <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-md">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-800">
                  Enhanced Security Mode Active
                </span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                Shorter timeout for sensitive operations
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel 
            onClick={onLogout}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300"
          >
            Sign Out Now
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onExtend}
            className={`${
              isFinalWarning 
                ? 'bg-red-600 hover:bg-red-700' 
                : isSensitiveMode 
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            Stay Signed In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionTimeoutWarning;
