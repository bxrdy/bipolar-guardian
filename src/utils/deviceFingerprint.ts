
// Re-export the fingerprint service for backwards compatibility
// This file maintains the existing API while using the new modular structure

// Export types and configs
export type { 
  DeviceFingerprint,
  FingerprintComponents,
  FingerprintConfig,
  FingerprintResult
} from '../services/fingerprint/types';

export {
  DEFAULT_CONFIG,
  PRIVACY_CONFIG,
  SECURITY_CONFIG
} from '../services/fingerprint/config';

// Export main functions with original names for backwards compatibility
export {
  generateFingerprint,
  compareFingerprints as compareDeviceFingerprints,
  validateFingerprint
} from '../services/fingerprint/core';

export {
  generateFingerprintId,
  hashFingerprint,
  sanitizeFingerprint
} from '../services/fingerprint/utils';

// Import the main functions to create legacy aliases
import { generateFingerprint, compareFingerprints, validateFingerprint as coreValidateFingerprint } from '../services/fingerprint/core';
import { hashFingerprint } from '../services/fingerprint/utils';

// Legacy function aliases that may be used in existing code
export async function getDeviceFingerprint() {
  const result = await generateFingerprint();
  return result.fingerprint;
}

export async function createDeviceFingerprint() {
  const result = await generateFingerprint();
  return result.fingerprint;
}

export async function generateDeviceFingerprint() {
  const result = await generateFingerprint();
  return result.fingerprint;
}

export async function generateLightweightFingerprint() {
  const result = await generateFingerprint({
    includeCanvas: false,
    includeWebGL: false,
    includeAudio: false,
    includeGeolocation: false,
    includeWebRTC: false,
    timeout: 1000
  });
  return result.fingerprint;
}

export function isSameDevice(fp1: any, fp2: any, threshold: number = 0.8): boolean {
  return compareFingerprints(fp1, fp2) >= threshold;
}

export async function hashString(str: string): Promise<string> {
  // Simple hash for backwards compatibility
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    // Fallback for environments without crypto.subtle
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}
