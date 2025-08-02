
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bug, Clock, User } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

interface BugReport {
  id: string;
  error_message: string;
  stack_trace?: string;
  os?: string;
  app_version?: string;
  user_agent?: string;
  url?: string;
  user_id?: string;
  timestamp: string;
  created_at: string;
}

const ErrorReportsViewer = () => {
  const { data: bugReports, isLoading, refetch } = useQuery({
    queryKey: ['bug-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bug_reports')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as BugReport[];
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateMessage = (message: string, maxLength: number = 100) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Error Reports
            <Badge variant="outline" className="ml-auto">
              {bugReports?.length || 0} reports
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading error reports...</div>
          ) : !bugReports || bugReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No error reports found</p>
              <p className="text-sm">Error tracking is active and ready to capture issues</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bugReports.map((report) => (
                <Card key={report.id} className="border-l-4 border-l-red-400">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-red-700">
                        {truncateMessage(report.error_message)}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {report.os}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(report.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {report.user_id ? 'Authenticated' : 'Anonymous'}
                      </div>
                    </div>
                    
                    {report.url && (
                      <div className="text-xs text-gray-500 mb-2">
                        URL: {report.url}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        v{report.app_version}
                      </Badge>
                      {report.user_agent && (
                        <Badge variant="outline" className="text-xs">
                          {report.user_agent.includes('Chrome') ? 'Chrome' : 
                           report.user_agent.includes('Firefox') ? 'Firefox' : 
                           report.user_agent.includes('Safari') ? 'Safari' : 'Other'}
                        </Badge>
                      )}
                    </div>
                    
                    {report.stack_trace && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                          Stack trace
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                          {report.stack_trace}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorReportsViewer;
