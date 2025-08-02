import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Smartphone, 
  Monitor, 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Edit3, 
  Check, 
  X, 
  Calendar,
  Activity,
  RefreshCw,
  AlertTriangle,
  Fingerprint,
  Eye,
  EyeOff,
  Hash
} from 'lucide-react';
import { useDeviceFingerprints, type DeviceFingerprint } from '@/hooks/useSecurityData';
import { useToast } from '@/hooks/use-toast';

interface DeviceSecurityOverviewProps {
  refreshKey?: number;
}

const DeviceSecurityOverview: React.FC<DeviceSecurityOverviewProps> = ({ refreshKey }) => {
  const { devices, isLoading, error, refetch, updateDeviceTrust, updateDeviceName } = useDeviceFingerprints();
  const { toast } = useToast();
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [showFingerprints, setShowFingerprints] = useState(false);
  const [updatingDevice, setUpdatingDevice] = useState<string | null>(null);

  const handleEditDeviceName = (device: DeviceFingerprint) => {
    setEditingDevice(device.id);
    setNewDeviceName(device.device_name || '');
  };

  const handleSaveDeviceName = async (deviceId: string) => {
    if (!newDeviceName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Device name cannot be empty.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    setUpdatingDevice(deviceId);
    
    try {
      await updateDeviceName(deviceId, newDeviceName.trim());
      setEditingDevice(null);
      setNewDeviceName('');
      
      toast({
        title: "Device Updated",
        description: "Device name has been updated successfully.",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update device name. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setUpdatingDevice(null);
    }
  };

  const handleToggleTrust = async (deviceId: string, currentTrust: boolean) => {
    setUpdatingDevice(deviceId);
    
    try {
      await updateDeviceTrust(deviceId, !currentTrust);
      
      toast({
        title: currentTrust ? "Device Untrusted" : "Device Trusted",
        description: currentTrust ? 
          "Device has been removed from trusted list." : 
          "Device has been added to trusted list.",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update device trust status. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setUpdatingDevice(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getDeviceIcon = (browserInfo: any) => {
    if (!browserInfo) return Monitor;
    
    const userAgent = browserInfo.userAgent || '';
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return Smartphone;
    }
    return Monitor;
  };

  const getBrowserName = (browserInfo: any) => {
    if (!browserInfo || !browserInfo.userAgent) return 'Unknown Browser';
    
    const userAgent = browserInfo.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other Browser';
  };

  const getOperatingSystem = (browserInfo: any) => {
    if (!browserInfo || !browserInfo.userAgent) return 'Unknown OS';
    
    const userAgent = browserInfo.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown OS';
  };

  const getScreenResolution = (screenInfo: any) => {
    if (!screenInfo) return 'Unknown';
    
    const { width, height } = screenInfo;
    if (width && height) {
      return `${width}×${height}`;
    }
    return 'Unknown';
  };

  const getDeviceRiskLevel = (device: DeviceFingerprint) => {
    let riskScore = 0;
    
    // Recent device (higher risk)
    const daysSinceFirstSeen = Math.floor(
      (new Date().getTime() - new Date(device.first_seen).getTime()) / 86400000
    );
    if (daysSinceFirstSeen < 1) riskScore += 30;
    else if (daysSinceFirstSeen < 7) riskScore += 15;
    
    // Low usage count (higher risk)
    if (device.use_count < 5) riskScore += 20;
    else if (device.use_count < 20) riskScore += 10;
    
    // No device name set (slightly higher risk)
    if (!device.device_name) riskScore += 5;
    
    // Not trusted (higher risk)
    if (!device.is_trusted) riskScore += 25;
    
    if (riskScore >= 50) return { level: 'High', color: 'red' };
    if (riskScore >= 25) return { level: 'Medium', color: 'orange' };
    return { level: 'Low', color: 'green' };
  };

  const truncateFingerprint = (fingerprint: string, length: number = 16) => {
    return fingerprint.length > length ? fingerprint.substring(0, length) + '...' : fingerprint;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load device information</p>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-blue-600" />
              Device Security Overview
            </CardTitle>
            <CardDescription>
              Monitor and manage known devices and their security status
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {devices.filter(d => d.is_trusted).length} Trusted
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFingerprints(!showFingerprints)}
            >
              {showFingerprints ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Security Overview */}
          {devices.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{devices.length}</div>
                <div className="text-xs text-blue-700">Total Devices</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {devices.filter(d => d.is_trusted).length}
                </div>
                <div className="text-xs text-green-700">Trusted</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {devices.filter(d => getDeviceRiskLevel(d).level === 'Medium').length}
                </div>
                <div className="text-xs text-orange-700">Medium Risk</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {devices.filter(d => getDeviceRiskLevel(d).level === 'High').length}
                </div>
                <div className="text-xs text-red-700">High Risk</div>
              </div>
            </div>
          )}

          {/* High Risk Alert */}
          {devices.filter(d => getDeviceRiskLevel(d).level === 'High').length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                You have {devices.filter(d => getDeviceRiskLevel(d).level === 'High').length} high-risk device(s). 
                Review these devices and mark them as trusted if you recognize them.
              </AlertDescription>
            </Alert>
          )}

          {/* Devices List */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading devices...
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No registered devices found</p>
              <p className="text-sm">Devices will appear here after you log in from them</p>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => {
                const DeviceIcon = getDeviceIcon(device.browser_info);
                const riskLevel = getDeviceRiskLevel(device);
                const browserName = getBrowserName(device.browser_info);
                const operatingSystem = getOperatingSystem(device.browser_info);
                const screenResolution = getScreenResolution(device.screen_info);
                const isEditing = editingDevice === device.id;
                const isUpdating = updatingDevice === device.id;
                
                return (
                  <div key={device.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          device.is_trusted ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <DeviceIcon className={`h-5 w-5 ${
                            device.is_trusted ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          {/* Device Name */}
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={newDeviceName}
                                  onChange={(e) => setNewDeviceName(e.target.value)}
                                  placeholder="Device name"
                                  className="h-8 text-sm"
                                  disabled={isUpdating}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveDeviceName(device.id)}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingDevice(null)}
                                  disabled={isUpdating}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <h3 className="font-medium">
                                  {device.device_name || `${browserName} on ${operatingSystem}`}
                                </h3>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditDeviceName(device)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                          
                          {/* Device Info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium">{browserName}</span>
                              <span className="text-gray-600">{operatingSystem}</span>
                              <span className="text-gray-500">{screenResolution}</span>
                            </div>
                            
                            {device.timezone_info && (
                              <div className="text-sm text-gray-600">
                                Timezone: {device.timezone_info}
                              </div>
                            )}
                          </div>
                          
                          {/* Usage Stats */}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              <span>{device.use_count} login{device.use_count !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>First seen: {formatTimestamp(device.first_seen)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Last seen: {formatTimestamp(device.last_seen)}</span>
                            </div>
                          </div>
                          
                          {/* Fingerprint Hash */}
                          {showFingerprints && (
                            <div className="text-xs text-gray-500 font-mono">
                              <div className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                <span>Fingerprint: {truncateFingerprint(device.fingerprint_hash)}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Badges */}
                          <div className="flex items-center gap-2">
                            <Badge variant={device.is_trusted ? 'default' : 'secondary'}>
                              {device.is_trusted ? (
                                <>
                                  <ShieldCheck className="h-3 w-3 mr-1" />
                                  Trusted
                                </>
                              ) : (
                                <>
                                  <ShieldX className="h-3 w-3 mr-1" />
                                  Untrusted
                                </>
                              )}
                            </Badge>
                            <Badge variant={
                              riskLevel.color === 'red' ? 'destructive' :
                              riskLevel.color === 'orange' ? 'secondary' : 'outline'
                            }>
                              {riskLevel.level} Risk
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Trust Toggle */}
                      <Button
                        variant={device.is_trusted ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleTrust(device.id, device.is_trusted)}
                        disabled={isUpdating}
                        className={device.is_trusted ? 
                          'border-red-200 text-red-600 hover:bg-red-50' : 
                          'bg-green-600 hover:bg-green-700'
                        }
                      >
                        {isUpdating ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-2" />
                            {device.is_trusted ? 'Untrust' : 'Trust'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Device Security Tips */}
          {devices.length > 0 && (
            <div className="border-t pt-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2">Device Security Best Practices</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Only trust devices you own and control</li>
                  <li>• Regularly review your device list for unfamiliar entries</li>
                  <li>• Use unique, descriptive names for your devices</li>
                  <li>• Report any suspicious or unrecognized devices immediately</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceSecurityOverview;