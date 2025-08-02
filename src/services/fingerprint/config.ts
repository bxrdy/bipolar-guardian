import { FingerprintConfig } from './types';

// Default fingerprinting configuration
export const DEFAULT_CONFIG: FingerprintConfig = {
  includeCanvas: true,
  includeWebGL: true,
  includeAudio: true,
  includeGeolocation: false, // Privacy-first default
  includeWebRTC: true,
  timeout: 5000, // 5 second timeout for async operations
  fallbackValues: true // Use fallback values if collection fails
};

// Privacy-focused configuration (minimal data collection)
export const PRIVACY_CONFIG: FingerprintConfig = {
  includeCanvas: false,
  includeWebGL: false,
  includeAudio: false,
  includeGeolocation: false,
  includeWebRTC: false,
  timeout: 3000,
  fallbackValues: true
};

// Security-focused configuration (maximum data collection)
export const SECURITY_CONFIG: FingerprintConfig = {
  includeCanvas: true,
  includeWebGL: true,
  includeAudio: true,
  includeGeolocation: true,
  includeWebRTC: true,
  timeout: 10000,
  fallbackValues: false // Fail if data cannot be collected
};

// Font list for font detection
export const COMMON_FONTS = [
  // Windows fonts
  'Arial', 'Arial Black', 'Arial Narrow', 'Arial Unicode MS',
  'Calibri', 'Cambria', 'Candara', 'Comic Sans MS', 'Consolas',
  'Constantia', 'Corbel', 'Courier New', 'Georgia', 'Impact',
  'Lucida Console', 'Lucida Grande', 'Lucida Sans Unicode',
  'Microsoft Sans Serif', 'Palatino Linotype', 'Segoe UI',
  'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana',
  
  // Mac fonts
  'American Typewriter', 'Andale Mono', 'Apple Chancery',
  'Apple Color Emoji', 'Apple SD Gothic Neo', 'Avenir',
  'Avenir Next', 'Avenir Next Condensed', 'Baskerville',
  'Big Caslon', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE',
  'Chalkduster', 'Charter', 'Cochin', 'Copperplate', 'Courier',
  'Futura', 'Geneva', 'Gill Sans', 'Helvetica', 'Helvetica Neue',
  'Herculanum', 'Hoefler Text', 'Monaco', 'Noteworthy', 'Optima',
  'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter',
  'Skia', 'Snell Roundhand', 'System Font', 'Trattatello',
  'VT100', 'Zapfino',
  
  // Linux fonts
  'DejaVu Sans', 'DejaVu Sans Mono', 'DejaVu Serif',
  'Droid Sans', 'Droid Sans Mono', 'Droid Serif',
  'Liberation Sans', 'Liberation Sans Narrow', 'Liberation Serif',
  'Ubuntu', 'Ubuntu Condensed', 'Ubuntu Light', 'Ubuntu Mono'
];

// WebRTC configuration for fingerprinting
export const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 0
};

// Canvas fingerprinting configuration
export const CANVAS_CONFIG = {
  width: 200,
  height: 50,
  text: 'Device fingerprint',
  fontSize: '14px',
  fontFamily: 'Arial'
};

// Audio fingerprinting configuration
export const AUDIO_CONFIG = {
  oscillatorType: 'triangle' as OscillatorType,
  frequency: 10000,
  bufferSize: 4096,
  sampleRate: 44100
};

// Timeout values for different operations
export const TIMEOUTS = {
  geolocation: 10000,
  webrtc: 5000,
  audio: 3000,
  general: 2000
} as const;