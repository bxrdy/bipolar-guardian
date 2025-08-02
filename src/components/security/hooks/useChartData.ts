
import { useMemo } from 'react';
import type { DailyEvent, EventTypeData } from '../types';

export const useDailyEventsChart = (metrics: any): DailyEvent[] => {
  return useMemo(() => {
    if (!metrics?.eventsByDay) return [];

    const days = Object.keys(metrics.eventsByDay).sort();
    const eventCounts = Object.values(metrics.eventsByDay).map(v => Number(v) || 0);
    const maxEvents = Math.max(...eventCounts, 1); // Ensure maxEvents is at least 1
    
    return days.map(day => {
      const eventCount = Number(metrics.eventsByDay[day]) || 0;
      return {
        date: day,
        events: eventCount,
        percentage: maxEvents > 0 ? (eventCount / maxEvents) * 100 : 0,
        displayDate: new Date(day).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      };
    });
  }, [metrics?.eventsByDay]);
};

export const useEventTypesChart = (metrics: any): EventTypeData[] => {
  return useMemo(() => {
    if (!metrics?.eventsByType) return[];

    const entries = Object.entries(metrics.eventsByType);
    const totalEvents = entries.reduce((sum, [, count]) => {
      const numCount = Number(count) || 0;
      return sum + numCount;
    }, 0);
    
    return entries
      .map(([type, count]) => {
        const numCount = Number(count) || 0;
        return {
          type,
          count: numCount,
          percentage: totalEvents > 0 ? (numCount / totalEvents) * 100 : 0,
          label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [metrics?.eventsByType]);
};
