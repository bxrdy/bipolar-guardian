import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoginAttemptResult {
  success: boolean;
  isLocked: boolean;
  lockoutRemaining?: number;
  attemptsRemaining?: number;
  requiresCaptcha: boolean;
  suspiciousActivity: boolean;
  message: string;
}

interface AuthSecurityState {
  failedAttempts: number;
  isLocked: boolean;
  lockoutExpires: Date | null;
  requiresCaptcha: boolean;
  suspiciousActivity: boolean;
  lastAttemptTime: Date | null;
}

interface UseAuthSecurityReturn extends AuthSecurityState {
  checkLoginSecurity: (email: string) => Promise<LoginAttemptResult>;
  recordLoginAttempt: (email: string, success: boolean, errorMessage?: string) => Promise<void>;
  resetFailedAttempts: (email: string) => Promise<void>;
  getProgressiveDelay: () => number;
  canAttemptLogin: () => boolean;
}

const PROGRESSIVE_DELAYS = [0, 1000, 2000, 5000, 10000, 30000]; // Delays in milliseconds
const CAPTCHA_THRESHOLD = 3;
const LOCKOUT_THRESHOLD = 5;
const SUSPICIOUS_ACTIVITY_THRESHOLD = 7;

/**
 * Hook for managing authentication security including failed login attempts,
 * progressive delays, account lockouts, and suspicious activity detection
 */
export const useAuthSecurity = (): UseAuthSecurityReturn => {
  const { toast } = useToast();
  
  const [state, setState] = useState<AuthSecurityState>({
    failedAttempts: 0,
    isLocked: false,
    lockoutExpires: null,
    requiresCaptcha: false,
    suspiciousActivity: false,
    lastAttemptTime: null
  });

  const getClientFingerprint = useCallback(async (): Promise<string> => {
    // Simple client-side fingerprinting for security purposes
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Security Check', 10, 10);
    const canvasFingerprint = canvas.toDataURL();
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasFingerprint.slice(-50) // Last 50 chars for brevity
    };
    
    return btoa(JSON.stringify(fingerprint));
  }, []);

  const logAuthEvent = useCallback(async (
    eventType: string, 
    email?: string,
    metadata: any = {}
  ) => {
    try {
      const fingerprint = await getClientFingerprint();
      
      await supabase.functions.invoke('log-auth-event', {
        body: {
          event_type: eventType,
          email: email,
          device_fingerprint: fingerprint,
          ip_address: null, // Will be captured server-side
          additional_metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            failed_attempts: state.failedAttempts
          }
        }
      });
    } catch (error) {
      console.warn('Failed to log auth event:', error);
    }
  }, [state.failedAttempts, getClientFingerprint]);

  const checkLoginSecurity = useCallback(async (email: string): Promise<LoginAttemptResult> => {
    try {
      // Check with backend security service
      const { data, error } = await supabase.functions.invoke('check-login-security', {
        body: { 
          email,
          device_fingerprint: await getClientFingerprint()
        }
      });

      if (error) {
        console.error('Security check failed:', error);
        return {
          success: false,
          isLocked: false,
          requiresCaptcha: state.failedAttempts >= CAPTCHA_THRESHOLD,
          suspiciousActivity: false,
          message: 'Security check failed. Please try again.'
        };
      }

      const securityResult = data as LoginAttemptResult;
      
      // Update local state
      setState(prev => ({
        ...prev,
        isLocked: securityResult.isLocked,
        lockoutExpires: securityResult.lockoutRemaining 
          ? new Date(Date.now() + securityResult.lockoutRemaining * 1000)
          : null,
        requiresCaptcha: securityResult.requiresCaptcha,
        suspiciousActivity: securityResult.suspiciousActivity
      }));

      return securityResult;
      
    } catch (error) {
      console.error('Security check error:', error);
      return {
        success: false,
        isLocked: false,
        requiresCaptcha: state.failedAttempts >= CAPTCHA_THRESHOLD,
        suspiciousActivity: false,
        message: 'Unable to verify login security. Please try again.'
      };
    }
  }, [state.failedAttempts, getClientFingerprint]);

  const recordLoginAttempt = useCallback(async (
    email: string, 
    success: boolean, 
    errorMessage?: string
  ) => {
    const now = new Date();
    
    if (success) {
      // Reset state on successful login
      setState({
        failedAttempts: 0,
        isLocked: false,
        lockoutExpires: null,
        requiresCaptcha: false,
        suspiciousActivity: false,
        lastAttemptTime: now
      });
      
      await logAuthEvent('login_success', email, {
        reset_failed_attempts: true
      });
      
    } else {
      // Handle failed login
      const newFailedAttempts = state.failedAttempts + 1;
      const newRequiresCaptcha = newFailedAttempts >= CAPTCHA_THRESHOLD;
      const newIsLocked = newFailedAttempts >= LOCKOUT_THRESHOLD;
      const newSuspiciousActivity = newFailedAttempts >= SUSPICIOUS_ACTIVITY_THRESHOLD;
      
      setState(prev => ({
        ...prev,
        failedAttempts: newFailedAttempts,
        requiresCaptcha: newRequiresCaptcha,
        isLocked: newIsLocked,
        suspiciousActivity: newSuspiciousActivity,
        lastAttemptTime: now,
        lockoutExpires: newIsLocked 
          ? new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
          : prev.lockoutExpires
      }));
      
      await logAuthEvent('login_failure', email, {
        failure_reason: errorMessage || 'Invalid credentials',
        attempts_count: newFailedAttempts,
        captcha_required: newRequiresCaptcha,
        account_locked: newIsLocked,
        suspicious_activity: newSuspiciousActivity
      });

      // Show appropriate user feedback
      if (newIsLocked) {
        toast({
          title: "Account Temporarily Locked",
          description: "Too many failed login attempts. Please try again in 30 minutes.",
          variant: "destructive",
          duration: 8000
        });
      } else if (newSuspiciousActivity) {
        toast({
          title: "Suspicious Activity Detected",
          description: "Multiple failed login attempts detected. Please verify your credentials.",
          variant: "destructive",
          duration: 6000
        });
      } else if (newRequiresCaptcha) {
        toast({
          title: "Additional Verification Required",
          description: "Please complete the security verification.",
          duration: 5000
        });
      }
    }
  }, [state.failedAttempts, logAuthEvent, toast]);

  const resetFailedAttempts = useCallback(async (email: string) => {
    setState({
      failedAttempts: 0,
      isLocked: false,
      lockoutExpires: null,
      requiresCaptcha: false,
      suspiciousActivity: false,
      lastAttemptTime: null
    });
    
    await logAuthEvent('failed_attempts_reset', email, {
      reason: 'Manual reset or successful recovery'
    });
  }, [logAuthEvent]);

  const getProgressiveDelay = useCallback((): number => {
    const delayIndex = Math.min(state.failedAttempts, PROGRESSIVE_DELAYS.length - 1);
    return PROGRESSIVE_DELAYS[delayIndex];
  }, [state.failedAttempts]);

  const canAttemptLogin = useCallback((): boolean => {
    if (state.isLocked && state.lockoutExpires) {
      return new Date() > state.lockoutExpires;
    }
    return !state.isLocked;
  }, [state.isLocked, state.lockoutExpires]);

  // Check for expired lockouts
  useEffect(() => {
    if (state.isLocked && state.lockoutExpires && new Date() > state.lockoutExpires) {
      setState(prev => ({
        ...prev,
        isLocked: false,
        lockoutExpires: null
      }));
    }
  }, [state.isLocked, state.lockoutExpires]);

  return {
    ...state,
    checkLoginSecurity,
    recordLoginAttempt,
    resetFailedAttempts,
    getProgressiveDelay,
    canAttemptLogin
  };
};

/**
 * Utility function to validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isStrong: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Password should be at least 8 characters long");
  }

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Include uppercase letters");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Include numbers");

  if (/[^a-zA-Z\d]/.test(password)) score += 1;
  else feedback.push("Include special characters");

  // Common pattern checks
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push("Avoid repeating characters");

  return {
    isStrong: score >= 4,
    score,
    feedback
  };
};

/**
 * Generate secure random password
 */
export const generateSecurePassword = (length: number = 16): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

/**
 * Format lockout time remaining
 */
export const formatLockoutTime = (lockoutExpires: Date | null): string => {
  if (!lockoutExpires) return "";
  
  const now = new Date();
  const remaining = lockoutExpires.getTime() - now.getTime();
  
  if (remaining <= 0) return "Lockout expired";
  
  const minutes = Math.floor(remaining / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};