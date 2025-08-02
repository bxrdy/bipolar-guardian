
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventTypeColor } from '../utils/colorUtils';
import type { EventTypeData } from '../types';

interface EventTypesChartProps {
  data: EventTypeData[];
}

const EventTypesChart: React.FC<EventTypesChartProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Event Types Distribution</CardTitle>
        <CardDescription>
          Breakdown of security events by type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((eventType, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-16 text-right text-sm font-medium">
                {eventType.count}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getEventTypeColor(eventType.type)}`}
                  style={{ width: `${Math.max(eventType.percentage, 2)}%` }}
                />
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-sm font-medium text-white drop-shadow">
                    {eventType.label}
                  </span>
                </div>
              </div>
              <div className="w-12 text-right text-sm text-gray-500">
                {eventType.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventTypesChart;
