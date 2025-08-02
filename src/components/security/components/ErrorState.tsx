
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  refetch: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ refetch }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Failed to load security metrics</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorState;
