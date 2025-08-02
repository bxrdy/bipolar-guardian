
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Moon, Activity, Smartphone, Info } from 'lucide-react';

interface DataStreamPreferences {
  collect_sleep: boolean;
  collect_activity: boolean;
  collect_screen: boolean;
}

interface DataStreamsSectionProps {
  preferences: DataStreamPreferences;
  isSaving: boolean;
  onUpdatePreference: (key: keyof DataStreamPreferences, value: boolean) => void;
}

const DataStreamsSection = ({ preferences, isSaving, onUpdatePreference }: DataStreamsSectionProps) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-gray-900">Data Streams</CardTitle>
        <CardDescription>
          Control which data streams are used for mood insights. Disabling a stream will pause background data collection immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sleep Data Toggle */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Moon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 text-sm">Sleep Data</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>We monitor your sleep patterns to understand how rest affects your mood and well-being.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-gray-600 leading-tight">Track sleep patterns and quality</p>
            </div>
          </div>
          <div className="flex-shrink-0 ml-3">
            <Switch
              checked={preferences.collect_sleep}
              onCheckedChange={(checked) => onUpdatePreference('collect_sleep', checked)}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Activity Data Toggle */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 text-sm">Activity Data</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>We track your physical activity to see how movement and exercise influence your daily mood.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-gray-600 leading-tight">Monitor step count and physical activity</p>
            </div>
          </div>
          <div className="flex-shrink-0 ml-3">
            <Switch
              checked={preferences.collect_activity}
              onCheckedChange={(checked) => onUpdatePreference('collect_activity', checked)}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Screen-Time Data Toggle */}
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 text-sm">Screen-Time Data</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>We observe your device usage to understand how screen time relates to your mental health patterns.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-gray-600 leading-tight">Track device usage patterns</p>
            </div>
          </div>
          <div className="flex-shrink-0 ml-3">
            <Switch
              checked={preferences.collect_screen}
              onCheckedChange={(checked) => onUpdatePreference('collect_screen', checked)}
              disabled={isSaving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataStreamsSection;
