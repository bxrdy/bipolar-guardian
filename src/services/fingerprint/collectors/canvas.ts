import { CollectorResult } from '../types';
import { CANVAS_CONFIG } from '../config';

/**
 * Generate canvas fingerprint by drawing shapes and text
 */
export function collectCanvasFingerprint(): CollectorResult<string> {
  const startTime = performance.now();
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return {
        data: 'canvas-unavailable',
        success: false,
        error: 'Canvas context unavailable',
        collectionTime: performance.now() - startTime
      };
    }
    
    canvas.width = CANVAS_CONFIG.width;
    canvas.height = CANVAS_CONFIG.height;
    
    // Draw text with various styles
    ctx.textBaseline = 'top';
    ctx.font = `${CANVAS_CONFIG.fontSize} ${CANVAS_CONFIG.fontFamily}`;
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText(CANVAS_CONFIG.text, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(CANVAS_CONFIG.text, 4, 17);
    
    // Draw some shapes to increase entropy
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(50, 25, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    
    // Add gradient for more uniqueness
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.5, 'yellow');
    gradient.addColorStop(1, 'blue');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 30, canvas.width, 10);
    
    const dataURL = canvas.toDataURL();
    
    return {
      data: dataURL,
      success: true,
      collectionTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      data: 'canvas-error',
      success: false,
      error: error instanceof Error ? error.message : 'Canvas fingerprinting failed',
      collectionTime: performance.now() - startTime
    };
  }
}

/**
 * Generate a more complex canvas fingerprint with additional techniques
 */
export function collectEnhancedCanvasFingerprint(): CollectorResult<string> {
  const startTime = performance.now();
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return {
        data: 'canvas-unavailable',
        success: false,
        error: 'Canvas context unavailable',
        collectionTime: performance.now() - startTime
      };
    }
    
    canvas.width = 300;
    canvas.height = 100;
    
    // Test different text rendering
    const testTexts = [
      'Device Fingerprint 🔒',
      'Ævölütion',
      '私の指紋',
      'مرحبا'
    ];
    
    const fonts = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'];
    
    testTexts.forEach((text, i) => {
      ctx.font = `${12 + i * 2}px ${fonts[i % fonts.length]}`;
      ctx.fillStyle = `hsl(${i * 60}, 70%, 50%)`;
      ctx.fillText(text, 10, 20 + i * 15);
    });
    
    // Test line rendering
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      ctx.moveTo(200 + i * 5, 10);
      ctx.lineTo(200 + i * 5 + 5, 80);
      ctx.strokeStyle = `hsl(${i * 36}, 50%, 50%)`;
      ctx.stroke();
    }
    
    // Test curves and arcs
    ctx.beginPath();
    ctx.arc(150, 50, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fill();
    
    const dataURL = canvas.toDataURL();
    
    return {
      data: dataURL,
      success: true,
      collectionTime: performance.now() - startTime
    };
  } catch (error) {
    return {
      data: 'enhanced-canvas-error',
      success: false,
      error: error instanceof Error ? error.message : 'Enhanced canvas fingerprinting failed',
      collectionTime: performance.now() - startTime
    };
  }
}