
// Device fingerprinting types
export interface DeviceFingerprint {
  id: string;
  timestamp: number;
  userAgent: string;
  language: string;
  languages: string;
  platform: string;
  screen: ScreenInfo;
  timezone: string;
  canvas: string;
  webgl: string;
  cookieEnabled: boolean;
  doNotTrack: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  plugins: string;
  mimeTypes: string;
  localStorage: boolean;
  sessionStorage: boolean;
  geolocation?: GeolocationInfo;
  components: FingerprintComponents;
}

export interface FingerprintComponents {
  userAgent: string;
  language: string;
  platform: string;
  screen: ScreenInfo;
  timezone: TimezoneInfo;
  canvas: string;
  webgl: string;
  audio: string;
  plugins: string[];
  fonts: string[];
  storage: StorageInfo;
  features: FeatureInfo;
  hardware: HardwareInfo;
  network: NetworkInfo;
  geolocation?: GeolocationInfo;
  webrtc?: string[];
}

export interface ScreenInfo {
  width: number;
  height: number;
  colorDepth: number;
  pixelDepth?: number;
  pixelRatio?: number;
  availWidth?: number;
  availHeight?: number;
}

export interface TimezoneInfo {
  name: string;
  offset: number;
  offsetString: string;
}

export interface StorageInfo {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
}

export interface FeatureInfo {
  touchSupport: boolean;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  onLine: boolean;
}

export interface HardwareInfo {
  cores: number;
  memory?: number;
  battery?: BatteryInfo;
}

export interface BatteryInfo {
  level: number;
  charging: boolean;
}

export interface NetworkInfo {
  connection?: string;
  effectiveType?: string;
}

export interface GeolocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface FingerprintConfig {
  includeCanvas: boolean;
  includeWebGL: boolean;
  includeAudio: boolean;
  includeGeolocation: boolean;
  includeWebRTC: boolean;
  timeout: number;
  fallbackValues: boolean;
}

export interface FingerprintResult {
  fingerprint: DeviceFingerprint;
  hash: string;
  confidence: number;
  timestamp: number;
  generationTime: number;
}

export interface CollectorResult<T = any> {
  data: T;
  success: boolean;
  error?: string;
  collectionTime: number;
}
