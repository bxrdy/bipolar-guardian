
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Trash2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ConfirmationDialog from './ConfirmationDialog';

const TableManagementSection = () => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const availableTables = [
    { value: 'sensor_samples', label: 'Sensor Samples', description: 'All sensor data (steps, sleep, screen time)' },
    { value: 'daily_summary', label: 'Daily Summary', description: 'Aggregated daily metrics and risk levels' },
    { value: 'baseline_metrics', label: 'Baseline Metrics', description: 'User baseline calculations' },
    { value: 'bug_reports', label: 'Bug Reports', description: 'Error tracking and debugging data' },
    { value: 'alert_settings', label: 'Alert Settings', description: 'User notification preferences' }
  ];

  const handleTruncateTable = async () => {
    if (!selectedTable) {
      toast.error('Please select a table to truncate');
      return;
    }

    setIsLoading(true);
    console.log(`Starting truncation of table: ${selectedTable}`);

    try {
      // Use RPC call to truncate table safely
      const { error } = await supabase.rpc('truncate_table', { 
        table_name: selectedTable 
      });

      if (error) {
        console.error('Truncation error:', error);
        throw error;
      }

      console.log(`Successfully truncated table: ${selectedTable}`);
      toast.success(`Successfully truncated ${selectedTable} table`);
      setSelectedTable('');
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Failed to truncate table:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to truncate table: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTableInfo = availableTables.find(table => table.value === selectedTable);

  return (
    <>
      <Card className="border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Database className="w-5 h-5" />
            Table Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Table to Truncate
            </label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a table..." />
              </SelectTrigger>
              <SelectContent>
                {availableTables.map((table) => (
                  <SelectItem key={table.value} value={table.value}>
                    <div>
                      <div className="font-medium">{table.label}</div>
                      <div className="text-xs text-gray-500">{table.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTableInfo && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                <strong>Warning:</strong> This will permanently delete all data from the{' '}
                <code className="bg-yellow-200 px-1 rounded">{selectedTableInfo.label}</code> table.
                This action cannot be undone.
              </div>
            </div>
          )}

          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={!selectedTable || isLoading}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isLoading ? 'Truncating...' : 'Truncate Table'}
          </Button>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Table Truncation"
        description={`Are you sure you want to truncate the ${selectedTableInfo?.label} table? This will permanently delete all data and cannot be undone.`}
        onConfirm={handleTruncateTable}
        confirmText="Yes, Truncate"
        isDestructive={true}
      />
    </>
  );
};

export default TableManagementSection;
