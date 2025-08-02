
export interface SecurityMetrics {
  totalEvents: number;
  securityScore: number;
  threatCount: number;
  successfulLogins: number;
  failedLogins: number;
  suspiciousActivity: number;
  deviceCount: number;
  lastActivity: string;
  eventsByType: Record<string, number>;
  eventsByDay: Record<string, number>;
  uniqueIPs: number;
  loginSuccessRate: number;
  twoFactorEnabled: boolean;
}

export interface SecurityMetricsChartsProps {
  refreshKey?: number;
}

export interface DailyEvent {
  date: string;
  events: number;
  percentage: number;
  displayDate: string;
}

export interface EventTypeData {
  type: string;
  count: number;
  percentage: number;
  label: string;
}

export interface SecurityInsight {
  type: 'critical' | 'warning' | 'positive' | 'info';
  title: string;
  description: string;
  icon: any;
  color: 'red' | 'orange' | 'green' | 'blue';
}
