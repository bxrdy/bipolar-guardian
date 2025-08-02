
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useBiometricAuth = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkBiometricSupport();
    
    // Check if biometric is enabled
    const enabled = localStorage.getItem('biometric_enabled') === 'true';
    setIsBiometricEnabled(enabled);
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Check if Web Authentication API is supported
      if (!window.PublicKeyCredential) {
        setIsBiometricSupported(false);
        return;
      }

      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsBiometricSupported(available);
    } catch (error) {
      console.log('Biometric check failed:', error);
      setIsBiometricSupported(false);
    }
  };

  const enableBiometric = async (): Promise<boolean> => {
    if (!isBiometricSupported) {
      toast({
        title: "Not Supported",
        description: "Biometric authentication is not available on this device",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Create a simple credential for biometric setup
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Bipolar Guardian" },
          user: {
            id: new Uint8Array(16),
            name: "user@example.com",
            displayName: "User"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });

      if (credential) {
        localStorage.setItem('biometric_enabled', 'true');
        setIsBiometricEnabled(true);
        
        toast({
          title: "Biometric Enabled",
          description: "Biometric authentication has been set up successfully",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric setup failed:', error);
      toast({
        title: "Setup Failed",
        description: "Failed to set up biometric authentication",
        variant: "destructive"
      });
      return false;
    }
  };

  const disableBiometric = () => {
    localStorage.removeItem('biometric_enabled');
    setIsBiometricEnabled(false);
    
    toast({
      title: "Biometric Disabled",
      description: "Biometric authentication has been disabled",
    });
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    if (!isBiometricSupported || !isBiometricEnabled) {
      return false;
    }

    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          userVerification: "required"
        }
      });

      if (assertion) {
        toast({
          title: "Authentication Successful",
          description: "Biometric authentication completed",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric auth failed:', error);
      toast({
        title: "Authentication Failed",
        description: "Biometric authentication was not successful",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isBiometricSupported,
    isBiometricEnabled,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric
  };
};
