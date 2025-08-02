
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthenticationGuard from './testing/AuthenticationGuard';
import DataGenerationControls from './testing/DataGenerationControls';
import ErrorReportsViewer from './ErrorReportsViewer';
import DataOverviewSection from './testing/DataOverviewSection';
import TableManagementSection from './testing/TableManagementSection';
import { ValidationFramework } from './testing/ValidationFramework';
import { AccuracyMetricsDashboard } from './testing/AccuracyMetricsDashboard';
import { GuardianChatValidator } from './testing/GuardianChatValidator';
import MedicalDocumentTestingTab from './testing/MedicalDocumentTestingTab';

const TestingPanel = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-6">
      <DataOverviewSection />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Testing Controls
            <Badge variant="outline">Development</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="validation" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
              <TabsTrigger value="guardian">Guardian</TabsTrigger>
              <TabsTrigger value="medical-docs">Documents</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="management">Tables</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="validation" className="space-y-4">
              <AuthenticationGuard fallbackMessage="Sign in to access validation framework features">
                <ValidationFramework />
              </AuthenticationGuard>
            </TabsContent>

            <TabsContent value="accuracy" className="space-y-4">
              <AuthenticationGuard fallbackMessage="Sign in to access accuracy metrics dashboard">
                <AccuracyMetricsDashboard />
              </AuthenticationGuard>
            </TabsContent>

            <TabsContent value="guardian" className="space-y-4">
              <AuthenticationGuard fallbackMessage="Sign in to access Guardian Chat validation features">
                <GuardianChatValidator />
              </AuthenticationGuard>
            </TabsContent>
            
            <TabsContent value="controls" className="space-y-4">
              <AuthenticationGuard fallbackMessage="Sign in to access data generation and pipeline testing features">
                <DataGenerationControls isLoading={isLoading} setIsLoading={setIsLoading} />
              </AuthenticationGuard>
            </TabsContent>
            
            <TabsContent value="management" className="space-y-4">
              <AuthenticationGuard fallbackMessage="Sign in to access table management features">
                <TableManagementSection />
              </AuthenticationGuard>
            </TabsContent>
            
            <TabsContent value="medical-docs" className="space-y-4">
              <AuthenticationGuard fallbackMessage="Sign in to access medical document testing features">
                <MedicalDocumentTestingTab isLoading={isLoading} setIsLoading={setIsLoading} />
              </AuthenticationGuard>
            </TabsContent>
            
            <TabsContent value="errors">
              <ErrorReportsViewer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingPanel;
