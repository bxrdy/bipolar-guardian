
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyEvent } from '../types';

interface DailyActivityChartProps {
  data: DailyEvent[];
}

const DailyActivityChart: React.FC<DailyActivityChartProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Daily Security Events</CardTitle>
        <CardDescription>
          Security event activity over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-2 h-32">
            {data.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-gray-600 font-medium">
                  {day.events}
                </div>
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                  style={{ 
                    height: `${Math.max(day.percentage, 5)}%`,
                    minHeight: day.events > 0 ? '8px' : '2px'
                  }}
                  title={`${day.displayDate}: ${day.events} events`}
                />
                <div className="text-xs text-gray-500 text-center">
                  {day.displayDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyActivityChart;
