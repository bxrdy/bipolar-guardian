
export const getEventTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'login_success': 'bg-green-500',
    'login_failure': 'bg-red-500',
    'session_timeout': 'bg-orange-500',
    'suspicious_activity': 'bg-red-400',
    'account_locked': 'bg-red-600',
    'session_created': 'bg-blue-500',
    'session_terminated': 'bg-orange-400',
    'two_factor_enabled': 'bg-green-400',
    'device_registered': 'bg-blue-400'
  };
  return colorMap[type] || 'bg-gray-400';
};
