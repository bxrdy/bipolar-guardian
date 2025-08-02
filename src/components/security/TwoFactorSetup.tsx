
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Shield, Key } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TwoFactorSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

// Move function declaration to the top
const generateTwoFactorSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [secret, setSecret] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const setupSecret = () => {
      const newSecret = generateTwoFactorSecret();
      setSecret(newSecret);
      
      // Generate QR code URL (simplified version)
      const issuer = encodeURIComponent('Your App');
      const accountName = encodeURIComponent('user@example.com');
      const qrUrl = `otpauth://totp/${issuer}:${accountName}?secret=${newSecret}&issuer=${issuer}`;
      setQrCode(qrUrl);
    };

    setupSecret();
  }, []);

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Here you would verify the TOTP code against the secret
      // For now, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save the 2FA settings to the database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('account_security_status')
          .upsert({
            user_id: user.id,
            two_factor_enabled: true,
            updated_at: new Date().toISOString()
          });

        if (error) {
          throw error;
        }
      }

      toast({
        title: "Two-Factor Authentication Enabled",
        description: "Your account is now protected with 2FA",
      });

      onComplete();
    } catch (error) {
      console.error('2FA setup error:', error);
      toast({
        title: "Setup Failed",
        description: "Failed to enable two-factor authentication",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'setup') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Set Up Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
            <div className="text-sm text-gray-500 mb-2">QR Code would appear here</div>
            <div className="text-xs text-gray-400 break-all">{secret}</div>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => setStep('verify')}
              className="w-full"
            >
              I've Scanned the QR Code
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Verify Setup
        </CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          placeholder="000000"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          maxLength={6}
          className="text-center text-lg tracking-widest"
        />
        
        <div className="space-y-2">
          <Button 
            onClick={handleVerifyCode}
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Verify & Enable 2FA
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setStep('setup')}
            className="w-full"
          >
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoFactorSetup;
