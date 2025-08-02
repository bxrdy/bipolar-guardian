import { 
  DeviceFingerprint, 
  FingerprintResult,
  GeolocationInfo,
  FingerprintComponents,
  ScreenInfo,
  TimezoneInfo,
  StorageInfo,
  FeatureInfo,
  HardwareInfo,
  NetworkInfo
} from './types';

/**
 * Generate a comprehensive device fingerprint
 */
export async function generateFingerprint(options: Record<string, any> = {}): Promise<FingerprintResult> {
  const startTime = performance.now();

  try {
    const components: FingerprintComponents = {
      userAgent: navigator.userAgent || 'unknown',
      language: navigator.language || 'unknown',
      platform: navigator.platform || 'unknown',
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        pixelRatio: window.devicePixelRatio || 1,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight
      },
      timezone: {
        name: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
        offset: new Date().getTimezoneOffset(),
        offsetString: new Date().toString().match(/([A-Z]{3,4}[+-]\d{4})/)?.[1] || 'unknown'
      },
      canvas: await getCanvasFingerprint(),
      webgl: getWebGLFingerprint(),
      audio: 'not-implemented',
      plugins: getPluginsArray(),
      fonts: [],
      storage: {
        localStorage: isLocalStorageSupported(),
        sessionStorage: isSessionStorageSupported(),
        indexedDB: isIndexedDBSupported()
      },
      features: {
        touchSupport: navigator.maxTouchPoints > 0,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack || null,
        onLine: navigator.onLine
      },
      hardware: {
        cores: navigator.hardwareConcurrency || 0,
        memory: (navigator as any).deviceMemory,
        battery: undefined
      },
      network: {
        connection: (navigator as any).connection?.type,
        effectiveType: (navigator as any).connection?.effectiveType
      }
    };

    // Collect geolocation (if permitted)
    if (options.includeGeolocation && navigator.geolocation) {
      try {
        components.geolocation = await getGeolocation();
      } catch (error) {
        console.warn('Geolocation collection failed:', error);
      }
    }

    const fingerprint: DeviceFingerprint = {
      id: generateFingerprintId(),
      timestamp: Date.now(),
      userAgent: components.userAgent,
      language: components.language,
      languages: navigator.languages ? navigator.languages.join(',') : 'unknown',
      platform: components.platform,
      screen: components.screen,
      timezone: components.timezone.name,
      canvas: components.canvas,
      webgl: components.webgl,
      cookieEnabled: components.features.cookieEnabled,
      doNotTrack: components.features.doNotTrack || 'unknown',
      hardwareConcurrency: components.hardware.cores,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      plugins: getPluginsInfo(),
      mimeTypes: getMimeTypesInfo(),
      localStorage: components.storage.localStorage,
      sessionStorage: components.storage.sessionStorage,
      geolocation: components.geolocation,
      components
    };

    // Generate hash from all components
    const hash = await hashFingerprint(fingerprint);
    
    const endTime = performance.now();
    const confidence = calculateConfidence(fingerprint);

    return {
      fingerprint,
      hash,
      confidence,
      timestamp: Date.now(),
      generationTime: Math.round(endTime - startTime)
    };

  } catch (error) {
    console.error('Error generating fingerprint:', error);
    
    // Return a minimal fingerprint on error
    const fallbackFingerprint: DeviceFingerprint = {
      id: 'error_' + Date.now(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent || 'unknown',
      language: navigator.language || 'unknown',
      languages: 'unknown',
      platform: navigator.platform || 'unknown',
      screen: { width: 0, height: 0, colorDepth: 0, pixelDepth: 0 },
      timezone: 'unknown',
      canvas: 'error',
      webgl: 'error',
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      plugins: 'error',
      mimeTypes: 'error',
      localStorage: false,
      sessionStorage: false,
      components: {
        userAgent: 'error',
        language: 'error',
        platform: 'error',
        screen: { width: 0, height: 0, colorDepth: 0 },
        timezone: { name: 'error', offset: 0, offsetString: 'error' },
        canvas: 'error',
        webgl: 'error',
        audio: 'error',
        plugins: [],
        fonts: [],
        storage: { localStorage: false, sessionStorage: false, indexedDB: false },
        features: { touchSupport: false, cookieEnabled: false, doNotTrack: null, onLine: false },
        hardware: { cores: 0 },
        network: {}
      }
    };

    return {
      fingerprint: fallbackFingerprint,
      hash: 'error_' + Date.now(),
      confidence: 0.1,
      timestamp: Date.now(),
      generationTime: 0
    };
  }
}

function generateFingerprintId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2);
  return `fp_${timestamp}_${randomPart}`;
}

/**
 * Get geolocation information
 */
function getGeolocation(): Promise<GeolocationInfo> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    const options = {
      timeout: 5000,
      maximumAge: 300000, // 5 minutes
      enableHighAccuracy: false
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: Math.round(position.coords.latitude * 100) / 100,
          longitude: Math.round(position.coords.longitude * 100) / 100,
          accuracy: Math.round(position.coords.accuracy)
        });
      },
      (error) => {
        reject(error);
      },
      options
    );
  });
}

/**
 * Generate canvas fingerprint
 */
async function getCanvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas-support';

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Canvas fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Canvas fingerprint', 4, 17);

    return canvas.toDataURL();
  } catch (error) {
    return 'canvas-error';
  }
}

/**
 * Generate WebGL fingerprint
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) return 'no-webgl-support';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'no-debug-info';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}~${renderer}`;
  } catch (error) {
    return 'webgl-error';
  }
}

/**
 * Get plugins information
 */
function getPluginsInfo(): string {
  try {
    if (!navigator.plugins) return 'no-plugins-support';
    const plugins = Array.from(navigator.plugins).map(p => p.name).sort();
    return plugins.join(',');
  } catch (error) {
    return 'plugins-error';
  }
}

function getPluginsArray(): string[] {
  try {
    if (!navigator.plugins) return [];
    return Array.from(navigator.plugins).map(p => p.name).sort();
  } catch (error) {
    return [];
  }
}

/**
 * Get MIME types information
 */
function getMimeTypesInfo(): string {
  try {
    if (!navigator.mimeTypes) return 'no-mimetypes-support';
    const mimeTypes = Array.from(navigator.mimeTypes).map(m => m.type).sort();
    return mimeTypes.join(',');
  } catch (error) {
    return 'mimetypes-error';
  }
}

/**
 * Check localStorage support
 */
function isLocalStorageSupported(): boolean {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check sessionStorage support
 */
function isSessionStorageSupported(): boolean {
  try {
    sessionStorage.setItem('test', 'test');
    sessionStorage.removeItem('test');
    return true;
  } catch (error) {
    return false;
  }
}

function isIndexedDBSupported(): boolean {
  try {
    return !!window.indexedDB;
  } catch (error) {
    return false;
  }
}

/**
 * Calculate confidence score based on available components
 */
function calculateConfidence(fingerprint: DeviceFingerprint): number {
  let score = 0;
  let maxScore = 0;

  // Basic info (weight: 0.3)
  maxScore += 0.3;
  if (fingerprint.userAgent && fingerprint.userAgent !== 'unknown') {
    score += 0.3;
  }

  // Canvas (weight: 0.25)
  maxScore += 0.25;
  if (fingerprint.canvas && !fingerprint.canvas.includes('error')) {
    score += 0.25;
  }

  // WebGL (weight: 0.25)
  maxScore += 0.25;
  if (fingerprint.webgl && !fingerprint.webgl.includes('error')) {
    score += 0.25;
  }

  // Geolocation (weight: 0.2)
  maxScore += 0.2;
  if (fingerprint.geolocation && fingerprint.geolocation.latitude !== 0) {
    score += 0.2;
  }

  return Math.round((score / maxScore) * 100) / 100;
}

/**
 * Hash fingerprint components
 */
async function hashFingerprint(fingerprint: DeviceFingerprint): Promise<string> {
  try {
    const str = JSON.stringify(fingerprint);
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    // Fallback hash
    let hash = 0;
    const str = JSON.stringify(fingerprint);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * Compare two fingerprints and return similarity score
 */
export function compareFingerprints(fp1: FingerprintResult, fp2: FingerprintResult): number {
  if (fp1.hash === fp2.hash) {
    return 1.0;
  }

  let similarities = 0;
  let totalChecks = 0;

  // Compare basic info
  const basic1 = fp1.fingerprint;
  const basic2 = fp2.fingerprint;
  
  totalChecks += 4;
  if (basic1.userAgent === basic2.userAgent) similarities++;
  if (basic1.language === basic2.language) similarities++;
  if (basic1.platform === basic2.platform) similarities++;
  if (basic1.hardwareConcurrency === basic2.hardwareConcurrency) similarities++;

  // Compare canvas
  totalChecks += 1;
  if (basic1.canvas === basic2.canvas) {
    similarities++;
  }

  // Compare WebGL
  totalChecks += 1;
  if (basic1.webgl === basic2.webgl) {
    similarities++;
  }

  return totalChecks > 0 ? similarities / totalChecks : 0;
}

/**
 * Validate fingerprint integrity
 */
export function validateFingerprint(fingerprint: FingerprintResult): boolean {
  try {
    // Check required fields
    if (!fingerprint.hash || !fingerprint.fingerprint || !fingerprint.timestamp) {
      return false;
    }

    // Check confidence is within valid range
    if (fingerprint.confidence < 0 || fingerprint.confidence > 1) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating fingerprint:', error);
    return false;
  }
}

// Alias functions for backwards compatibility
export const compareDeviceFingerprints = compareFingerprints;
export const isSameDevice = (fp1: FingerprintResult, fp2: FingerprintResult, threshold: number = 0.8): boolean => {
  return compareFingerprints(fp1, fp2) >= threshold;
};
