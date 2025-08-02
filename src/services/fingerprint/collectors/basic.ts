import { ScreenInfo, TimezoneInfo, FeatureInfo, CollectorResult } from '../types';

/**
 * Collect basic browser and system information
 */
export function collectBrowserInfo(): CollectorResult<{
  userAgent: string;
  language: string;
  platform: string;
}> {
  const startTime = performance.now();
  
  try {
    const data = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    };
    
    return {
      data,
      success: true,
      collectionTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      data: {
        userAgent: 'unknown',
        language: 'unknown', 
        platform: 'unknown'
      },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      collectionTime: performance.now() - startTime
    };
  }
}

/**
 * Collect screen and display information
 */
export function collectScreenInfo(): CollectorResult<ScreenInfo> {
  const startTime = performance.now();
  
  try {
    const data: ScreenInfo = {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight
    };
    
    return {
      data,
      success: true,
      collectionTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      data: {
        width: 0,
        height: 0,
        colorDepth: 0,
        pixelRatio: 1,
        availWidth: 0,
        availHeight: 0
      },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      collectionTime: performance.now() - startTime
    };
  }
}

/**
 * Collect timezone information
 */
export function collectTimezoneInfo(): CollectorResult<TimezoneInfo> {
  const startTime = performance.now();
  
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    
    const data: TimezoneInfo = {
      name: timezone,
      offset: offset,
      offsetString: `UTC${offset > 0 ? '-' : '+'}${Math.abs(offset / 60)}`
    };
    
    return {
      data,
      success: true,
      collectionTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      data: {
        name: 'UTC',
        offset: 0,
        offsetString: 'UTC+0'
      },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      collectionTime: performance.now() - startTime
    };
  }
}

/**
 * Collect browser feature information
 */
export function collectFeatureInfo(): CollectorResult<FeatureInfo> {
  const startTime = performance.now();
  
  try {
    const data: FeatureInfo = {
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      onLine: navigator.onLine
    };
    
    return {
      data,
      success: true,
      collectionTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      data: {
        touchSupport: false,
        cookieEnabled: false,
        doNotTrack: null,
        onLine: true
      },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      collectionTime: performance.now() - startTime
    };
  }
}