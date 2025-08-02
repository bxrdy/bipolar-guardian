import { DeviceFingerprint } from './types';

/**
 * Generate a unique fingerprint ID
 */
export function generateFingerprintId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2);
  return `fp_${timestamp}_${randomPart}`;
}

/**
 * Hash a fingerprint object to create a consistent identifier
 */
export async function hashFingerprint(fingerprint: DeviceFingerprint): Promise<string> {
  // Create a deterministic string representation
  const fingerprintString = [
    fingerprint.userAgent,
    fingerprint.language,
    fingerprint.platform,
    `${fingerprint.screen.width}x${fingerprint.screen.height}`,
    fingerprint.screen.colorDepth.toString(),
    fingerprint.screen.pixelRatio?.toString() || '',
    fingerprint.timezone,
    fingerprint.canvas,
    fingerprint.webgl,
    fingerprint.plugins,
    fingerprint.localStorage.toString(),
    fingerprint.sessionStorage.toString(),
    fingerprint.cookieEnabled.toString(),
    fingerprint.hardwareConcurrency.toString(),
    fingerprint.geolocation ? `${fingerprint.geolocation.latitude},${fingerprint.geolocation.longitude}` : ''
  ].join('|');
  
  return await hashString(fingerprintString);
}

/**
 * Hash a string using the Web Crypto API
 */
export async function hashString(str: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    // Fallback to a simple hash if crypto API is not available
    return simpleHash(str);
  }
}

/**
 * Simple hash function as fallback
 */
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Compare two fingerprints and return a similarity score (0-1)
 */
export function compareFingerprints(fp1: DeviceFingerprint, fp2: DeviceFingerprint): number {
  let score = 0;
  let totalChecks = 0;
  
  // Compare basic browser info (high weight)
  if (fp1.userAgent === fp2.userAgent) score += 3;
  totalChecks += 3;
  
  if (fp1.language === fp2.language) score += 1;
  totalChecks += 1;
  
  if (fp1.platform === fp2.platform) score += 2;
  totalChecks += 2;
  
  // Compare screen info (high weight)
  if (fp1.screen.width === fp2.screen.width && fp1.screen.height === fp2.screen.height) score += 3;
  totalChecks += 3;
  
  if (fp1.screen.colorDepth === fp2.screen.colorDepth) score += 1;
  totalChecks += 1;
  
  // Compare fingerprinting techniques (high weight)
  if (fp1.canvas === fp2.canvas && fp1.canvas !== 'error' && fp1.canvas !== 'canvas-error') score += 4;
  totalChecks += 4;
  
  if (fp1.webgl === fp2.webgl && fp1.webgl !== 'error' && fp1.webgl !== 'webgl-error') score += 3;
  totalChecks += 3;
  
  // Compare storage capabilities (low weight)
  if (fp1.localStorage === fp2.localStorage) score += 0.5;
  if (fp1.sessionStorage === fp2.sessionStorage) score += 0.5;
  totalChecks += 1;
  
  // Compare hardware (medium weight)
  if (fp1.hardwareConcurrency === fp2.hardwareConcurrency) score += 1;
  totalChecks += 1;
  
  return Math.min(score / totalChecks, 1);
}

/**
 * Calculate Jaccard similarity between two arrays
 */
function arrayJaccardSimilarity(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 && arr2.length === 0) return 1;
  if (arr1.length === 0 || arr2.length === 0) return 0;
  
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Validate fingerprint data integrity
 */
export function validateFingerprint(fingerprint: DeviceFingerprint): boolean {
  try {
    // Check required fields
    if (!fingerprint.id || !fingerprint.timestamp) {
      return false;
    }
    
    // Check screen dimensions are reasonable
    if (fingerprint.screen.width <= 0 || fingerprint.screen.height <= 0 || 
        fingerprint.screen.width > 10000 || fingerprint.screen.height > 10000) {
      return false;
    }
    
    // Check timestamp is reasonable (not too old or in the future)
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneHourFuture = now + (60 * 60 * 1000);
    
    if (fingerprint.timestamp < oneWeekAgo || fingerprint.timestamp > oneHourFuture) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Sanitize fingerprint data for safe storage/transmission
 */
export function sanitizeFingerprint(fingerprint: DeviceFingerprint): DeviceFingerprint {
  // Create a deep copy and sanitize sensitive data
  const sanitized = JSON.parse(JSON.stringify(fingerprint));
  
  // Remove precise geolocation if present
  if (sanitized.geolocation) {
    // Round to reduce precision for privacy
    sanitized.geolocation.latitude = Math.round(sanitized.geolocation.latitude * 100) / 100;
    sanitized.geolocation.longitude = Math.round(sanitized.geolocation.longitude * 100) / 100;
    sanitized.geolocation.accuracy = Math.round(sanitized.geolocation.accuracy);
  }
  
  // Sanitize user agent to remove potentially identifying information
  if (sanitized.userAgent) {
    sanitized.userAgent = sanitized.userAgent.replace(/\d+\.\d+\.\d+\.\d+/g, 'x.x.x.x');
  }
  
  return sanitized;
}

/**
 * Generate a privacy-focused fingerprint hash that excludes sensitive data
 */
export async function generatePrivacyHash(fingerprint: DeviceFingerprint): Promise<string> {
  // Only use non-sensitive components for privacy hash
  const privacyString = [
    fingerprint.screen.width.toString(),
    fingerprint.screen.height.toString(),
    fingerprint.screen.colorDepth.toString(),
    fingerprint.hardwareConcurrency.toString(),
    fingerprint.localStorage.toString(),
    fingerprint.sessionStorage.toString()
  ].join('|');
  
  return await hashString(privacyString);
}
