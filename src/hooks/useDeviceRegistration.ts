
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateLightweightFingerprint, generateDeviceFingerprint } from '@/utils/deviceFingerprint';

export interface DeviceRegistration {
  id: string;
  fingerprint_hash: string;
  device_name: string | null;
  is_trusted: boolean;
  first_seen: string;
  last_seen: string;
  use_count: number;
  risk_score?: number;
}

export const useDeviceRegistration = () => {
  const [currentDevice, setCurrentDevice] = useState<DeviceRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const registerCurrentDevice = useCallback(async (deviceName?: string, useLightweight = true) => {
    setIsLoading(true);
    try {
      const fingerprint = useLightweight 
        ? await generateLightweightFingerprint() 
        : await generateDeviceFingerprint();
      
      const { data, error } = await supabase.functions.invoke('register-device', {
        body: {
          action: 'register',
          fingerprint_data: {
            hash: fingerprint.id,
            device_name: deviceName || 'Unknown Device',
            browser_info: {
              userAgent: fingerprint.components.userAgent,
              language: fingerprint.components.language,
              platform: fingerprint.components.platform
            },
            screen_info: {
              resolution: `${fingerprint.components.screen.width}x${fingerprint.components.screen.height}`,
              colorDepth: fingerprint.components.screen.colorDepth
            },
            timezone_info: fingerprint.components.timezone
          }
        }
      });

      if (error) throw error;
      
      setCurrentDevice(data.device);
      
      if (data.is_new_device) {
        toast({
          title: "New Device Registered",
          description: "This device has been registered for enhanced security",
          duration: 5000
        });
      }
      
      return { success: true, device: data.device, isNew: data.is_new_device };
    } catch (error) {
      console.error('Failed to register device:', error);
      toast({
        title: "Device Registration Failed",
        description: "Could not register this device for security monitoring",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateDeviceTrust = useCallback(async (deviceId: string, trusted: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('register-device', {
        body: {
          action: 'update_trust',
          device_id: deviceId,
          is_trusted: trusted
        }
      });

      if (error) throw error;
      
      toast({
        title: "Device Updated",
        description: `Device ${trusted ? 'trusted' : 'untrusted'} successfully`
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update device trust:', error);
      toast({
        title: "Error",
        description: "Failed to update device trust status",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const analyzeDeviceRisk = useCallback(async () => {
    try {
      const fingerprint = await generateLightweightFingerprint();
      
      const { data, error } = await supabase.functions.invoke('register-device', {
        body: {
          action: 'analyze_risk',
          fingerprint_data: {
            hash: fingerprint.id,
            browser_info: {
              userAgent: fingerprint.components.userAgent,
              language: fingerprint.components.language
            }
          }
        }
      });

      if (error) throw error;
      return { success: true, riskScore: data.risk_score, factors: data.risk_factors };
    } catch (error) {
      console.error('Failed to analyze device risk:', error);
      return { success: false, error };
    }
  }, []);

  // Auto-register device on hook initialization
  useEffect(() => {
    const autoRegister = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !currentDevice) {
        await registerCurrentDevice();
      }
    };
    
    autoRegister();
  }, [currentDevice, registerCurrentDevice]);

  return {
    currentDevice,
    registerCurrentDevice,
    updateDeviceTrust,
    analyzeDeviceRisk,
    isLoading
  };
};
