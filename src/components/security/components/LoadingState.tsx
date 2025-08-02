
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, BarChart3 } from 'lucide-react';

interface LoadingStateProps {
  isLoading: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading security analytics...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No security data available for the selected time range</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
