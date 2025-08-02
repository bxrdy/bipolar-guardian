import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Settings, 
  Shield, 
  Clock, 
  Lock, 
  Eye, 
  EyeOff, 
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Info,
  Zap
} from 'lucide-react';
import { useSecurityConfig, type SecurityConfig } from '@/hooks/useSecurityData';

interface SecurityConfigViewerProps {
  refreshKey?: number;
}

const SecurityConfigViewer: React.FC<SecurityConfigViewerProps> = ({ refreshKey }) => {
  const { data: configs, isLoading, error, refetch } = useSecurityConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [showValues, setShowValues] = useState(false);

  // Group configurations by category
  const configCategories = {
    session: {
      title: 'Session Management',
      icon: Clock,
      color: 'blue',
      keys: ['session_timeout_minutes', 'session_timeout_sensitive_minutes', 'max_concurrent_sessions']
    },
    authentication: {
      title: 'Authentication Security',
      icon: Lock,
      color: 'green',
      keys: ['failed_login_threshold', 'account_lockout_minutes', 'progressive_delay_enabled']
    },
    monitoring: {
      title: 'Security Monitoring',
      icon: Eye,
      color: 'purple',
      keys: ['suspicious_activity_threshold', 'device_fingerprinting_enabled', 'geolocation_tracking_enabled']
    },
    'two-factor': {
      title: 'Two-Factor Authentication',
      icon: Shield,
      color: 'orange',
      keys: ['two_factor_required_for_sensitive']
    }
  };

  const filteredConfigs = configs?.filter(config => 
    config.config_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getConfigByKey = (key: string) => {
    return configs?.find(config => config.config_key === key);
  };

  const formatConfigValue = (config: SecurityConfig) => {
    const value = config.config_value;
    
    // Handle different value types
    if (typeof value === 'boolean') {
      return value ? 'Enabled' : 'Disabled';
    }
    
    if (typeof value === 'string') {
      // Handle numeric strings
      if (!isNaN(Number(value))) {
        const num = Number(value);
        if (config.config_key.includes('minutes')) {
          return `${num} minute${num !== 1 ? 's' : ''}`;
        }
        if (config.config_key.includes('threshold') || config.config_key.includes('limit')) {
          return `${num}`;
        }
        return value;
      }
      
      // Handle boolean strings
      if (value === 'true') return 'Enabled';
      if (value === 'false') return 'Disabled';
      
      return value;
    }
    
    if (typeof value === 'number') {
      if (config.config_key.includes('minutes')) {
        return `${value} minute${value !== 1 ? 's' : ''}`;
      }
      return value.toString();
    }
    
    return JSON.stringify(value);
  };

  const getConfigStatus = (config: SecurityConfig) => {
    const value = config.config_value;
    
    // Determine if this is a security-positive configuration
    const securityPositiveKeys = [
      'device_fingerprinting_enabled',
      'geolocation_tracking_enabled',
      'progressive_delay_enabled',
      'two_factor_required_for_sensitive'
    ];
    
    const isSecurityPositive = securityPositiveKeys.includes(config.config_key);
    
    if (typeof value === 'boolean') {
      return {
        status: (isSecurityPositive && value) || (!isSecurityPositive && !value) ? 'good' : 'warning',
        color: (isSecurityPositive && value) || (!isSecurityPositive && !value) ? 'green' : 'orange'
      };
    }
    
    if (typeof value === 'string') {
      if (value === 'true') {
        return {
          status: isSecurityPositive ? 'good' : 'warning',
          color: isSecurityPositive ? 'green' : 'orange'
        };
      }
      if (value === 'false') {
        return {
          status: isSecurityPositive ? 'warning' : 'good',
          color: isSecurityPositive ? 'orange' : 'green'
        };
      }
    }
    
    return { status: 'neutral', color: 'gray' };
  };

  const getRecommendation = (config: SecurityConfig) => {
    const key = config.config_key;
    const value = config.config_value;
    
    const recommendations: Record<string, string> = {
      'session_timeout_minutes': Number(value) > 30 ? 'Consider reducing for better security' : 'Good timeout duration',
      'failed_login_threshold': Number(value) > 10 ? 'Consider reducing to prevent brute force attacks' : 'Good threshold setting',
      'account_lockout_minutes': Number(value) < 15 ? 'Consider increasing for better protection' : 'Adequate lockout duration',
      'device_fingerprinting_enabled': value === 'true' || value === true ? 'Excellent for device tracking' : 'Enable for better device security',
      'geolocation_tracking_enabled': value === 'true' || value === true ? 'Good for detecting unusual locations' : 'Enable for location-based security',
      'two_factor_required_for_sensitive': value === 'true' || value === true ? 'Excellent security practice' : 'Consider enabling for sensitive operations'
    };
    
    return recommendations[key] || 'Configuration appears normal';
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load security configuration</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Current security settings and policy configurations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowValues(!showValues)}
              >
                {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading security configuration...
            </div>
          </CardContent>
        </Card>
      ) : !configs || configs.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-gray-500">
              <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No security configuration found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search configuration settings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration Categories */}
          {Object.entries(configCategories).map(([categoryKey, category]) => {
            const categoryConfigs = category.keys
              .map(key => getConfigByKey(key))
              .filter(Boolean) as SecurityConfig[];
            
            if (categoryConfigs.length === 0) return null;
            
            const IconComponent = category.icon;
            
            return (
              <Card key={categoryKey}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 text-${category.color}-600`} />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryConfigs.map((config) => {
                      const status = getConfigStatus(config);
                      const recommendation = getRecommendation(config);
                      
                      return (
                        <div key={config.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">
                                  {config.config_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </h4>
                                <Badge variant={
                                  status.color === 'green' ? 'default' :
                                  status.color === 'orange' ? 'secondary' :
                                  'outline'
                                }>
                                  {status.status === 'good' ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : status.status === 'warning' ? (
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Info className="h-3 w-3 mr-1" />
                                  )}
                                  {status.status}
                                </Badge>
                              </div>
                              
                              {config.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {config.description}
                                </p>
                              )}
                              
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">Recommendation:</span> {recommendation}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {showValues ? formatConfigValue(config) : '••••••'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {config.is_active ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Additional Configurations */}
          {filteredConfigs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gray-600" />
                  {searchTerm ? 'Search Results' : 'All Configurations'}
                </CardTitle>
                <CardDescription>
                  {searchTerm ? 
                    `${filteredConfigs.length} configuration(s) matching "${searchTerm}"` :
                    'Complete list of security configuration settings'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredConfigs.map((config) => {
                    const status = getConfigStatus(config);
                    
                    return (
                      <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {config.config_key}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {config.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {config.description && (
                            <p className="text-sm text-gray-600">
                              {config.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {showValues ? formatConfigValue(config) : '••••••'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Updated: {new Date(config.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {status.status === 'good' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {status.status === 'warning' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                          {status.status === 'neutral' && <Info className="h-4 w-4 text-gray-400" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration Summary</CardTitle>
              <CardDescription>
                Overview of your security configuration status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{configs.length}</div>
                  <div className="text-sm text-gray-500">Total Settings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {configs.filter(c => getConfigStatus(c).status === 'good').length}
                  </div>
                  <div className="text-sm text-gray-500">Optimal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {configs.filter(c => getConfigStatus(c).status === 'warning').length}
                  </div>
                  <div className="text-sm text-gray-500">Need Review</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {configs.filter(c => c.is_active).length}
                  </div>
                  <div className="text-sm text-gray-500">Active</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Configuration Notes</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Configuration changes require administrator privileges</li>
                  <li>• Some settings may require application restart to take effect</li>
                  <li>• Security settings are periodically audited for compliance</li>
                  <li>• Contact support for assistance with configuration changes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SecurityConfigViewer;