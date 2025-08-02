
// Main fingerprint service exports
export * from './types';
export * from './config';

// Core functions - avoid duplicate exports
export {
  generateFingerprint,
  compareFingerprints,
  validateFingerprint,
  compareDeviceFingerprints,
  isSameDevice
} from './core';

export {
  generateFingerprintId,
  hashFingerprint,
  sanitizeFingerprint,
  generatePrivacyHash
} from './utils';

// Configuration presets
export {
  DEFAULT_CONFIG,
  PRIVACY_CONFIG,
  SECURITY_CONFIG
} from './config';

// Types for easy importing
export type {
  DeviceFingerprint,
  FingerprintComponents,
  FingerprintConfig,
  FingerprintResult,
  CollectorResult
} from './types';
