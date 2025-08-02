import { useState, useEffect, useCallback } from 'react';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Moon, Activity, Smartphone, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';

interface DataStreamSettingsProps {
  onBack: () => void;
}

interface DataStreamPreferences {
  collect_sleep: boolean;
  collect_activity: boolean;
  collect_screen: boolean;
}

const DataStreamSettings = ({ onBack }: DataStreamSettingsProps) => {
  const isMobile = useIsMobile();
  const [preferences, setPreferences] = useState<DataStreamPreferences>({
    collect_sleep: true,
    collect_activity: true,
    collect_screen: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchPreferences = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profile')
        .select('collect_sleep, collect_activity, collect_screen')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching preferences:', error);
        toast({
          title: "Error",
          description: "Failed to load data stream preferences",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setPreferences({
          collect_sleep: data.collect_sleep ?? true,
          collect_activity: data.collect_activity ?? true,
          collect_screen: data.collect_screen ?? true
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = async (key: keyof DataStreamPreferences, value: boolean) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_profile')
        .update({ [key]: value })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating preference:', error);
        toast({
          title: "Error",
          description: "Failed to update data stream preference",
          variant: "destructive"
        });
        return;
      }

      setPreferences(prev => ({ ...prev, [key]: value }));
      
      const streamName = key.replace('collect_', '').replace('_', ' ');
      toast({
        title: "Settings Updated",
        description: `${streamName} data collection ${value ? 'enabled' : 'disabled'}`,
      });

      console.log(`Data collection ${value ? 'enabled' : 'disabled'} for ${streamName}`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-4 p-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {!isMobile && "Back"}
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Data Streams</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Manage Data Collection
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Control which data streams are used for mood insights. Disabling a stream will pause background data collection immediately.
          </p>

          <div className="space-y-6">
            {/* Sleep Data Toggle */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Moon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Sleep Data</h3>
                  <p className="text-sm text-gray-600">Track sleep patterns and quality</p>
                </div>
              </div>
              <Switch
                checked={preferences.collect_sleep}
                onCheckedChange={(checked) => updatePreference('collect_sleep', checked)}
                disabled={isSaving}
              />
            </div>

            {/* Activity Data Toggle */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Activity Data</h3>
                  <p className="text-sm text-gray-600">Monitor step count and physical activity</p>
                </div>
              </div>
              <Switch
                checked={preferences.collect_activity}
                onCheckedChange={(checked) => updatePreference('collect_activity', checked)}
                disabled={isSaving}
              />
            </div>

            {/* Screen-Time Data Toggle */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Screen-Time Data</h3>
                  <p className="text-sm text-gray-600">Track device usage patterns</p>
                </div>
              </div>
              <Switch
                checked={preferences.collect_screen}
                onCheckedChange={(checked) => updatePreference('collect_screen', checked)}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-medium text-gray-900 mb-2">How it works</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Enabled streams collect data in the background</li>
            <li>• Data is stored locally when offline and synced when online</li>
            <li>• Disabling a stream immediately stops data collection</li>
            <li>• You can re-enable streams at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataStreamSettings;
