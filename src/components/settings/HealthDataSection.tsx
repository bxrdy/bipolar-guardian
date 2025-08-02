
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, FileText, ChevronRight } from 'lucide-react';

interface HealthDataSectionProps {
  onNavigateToMedications?: () => void;
  onNavigateToDocuments?: () => void;
}

const HealthDataSection = ({ onNavigateToMedications, onNavigateToDocuments }: HealthDataSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Health Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Health Data</CardTitle>
          <CardDescription>
            Manage your medication schedules and medical documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto"
          onClick={onNavigateToMedications}
        >
          <div className="flex items-center min-w-0 flex-1 mr-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Pill className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">Medications</div>
              <div className="text-sm text-gray-500 whitespace-normal leading-relaxed">Manage your medication schedule and reminders</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto"
          onClick={onNavigateToDocuments}
        >
          <div className="flex items-center min-w-0 flex-1 mr-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">Medical Documents</div>
              <div className="text-sm text-gray-500 whitespace-normal leading-relaxed">Upload and manage medical documents and lab results</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDataSection;
