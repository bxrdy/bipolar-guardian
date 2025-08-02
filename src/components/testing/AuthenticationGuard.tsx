
import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogIn } from 'lucide-react';

interface AuthenticationGuardProps {
  children: ReactNode;
  fallbackMessage?: string;
}

const AuthenticationGuard = ({ 
  children, 
  fallbackMessage = "Please sign in to access testing features" 
}: AuthenticationGuardProps) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    retry: false,
    refetchInterval: 30000, // Check auth status every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Checking authentication...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Authentication Required</h3>
            <p className="text-gray-600">{fallbackMessage}</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Go to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default AuthenticationGuard;
